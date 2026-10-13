#!/usr/bin/env node
/**
 * One-time script: shrinks existing images in the "property-images" bucket
 * and re-uploads each one at the same path, so the URLs stored on
 * properties keep working. Settings match the admin upload form
 * (components/property-form.tsx): longest side ≤ 1920px, JPEG quality 80.
 *
 * - Skips files that are already small (≤ 500 KB and ≤ 1920px).
 * - Only replaces a file if the new version is at least 10% smaller.
 * - Saves every original it replaces to a local backup folder first.
 *
 * Usage:
 *   Dry run (downloads + compresses, uploads nothing):
 *     node --env-file=.env.local scripts/compress-images.mjs --dry-run [--limit N]
 *   Real run (needs write access — the service role key from the Supabase
 *   dashboard, passed inline so it never gets saved to a file):
 *     SUPABASE_SERVICE_ROLE_KEY=... node --env-file=.env.local scripts/compress-images.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const BUCKET = "property-images";
const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 80;
const SKIP_UNDER_BYTES = 500 * 1024;
const MIN_SAVING = 0.1;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const limitIndex = args.indexOf("--limit");
const limit = limitIndex === -1 ? Infinity : Number(args[limitIndex + 1]);

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!dryRun && !serviceKey) {
  console.error("A real run needs SUPABASE_SERVICE_ROLE_KEY (or use --dry-run).");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  serviceKey ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

const backupDir = path.resolve(
  "..",
  "image-backups",
  new Date().toISOString().replace(/[:.]/g, "-"),
);

async function listAll(prefix = "") {
  const files = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix, { limit: 1000, offset });
    if (error) throw error;
    for (const entry of data) {
      const full = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id === null) files.push(...(await listAll(full)));
      else files.push({ path: full, size: entry.metadata?.size ?? 0, type: entry.metadata?.mimetype });
    }
    if (data.length < 1000) break;
  }
  return files;
}

async function compress(buffer, type) {
  // rotate() applies the EXIF orientation before metadata is stripped, so
  // portrait phone photos don't end up sideways.
  const pipeline = sharp(buffer)
    .rotate()
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true });

  // Keep each file's format so its path/extension and Content-Type still match.
  return type === "image/png"
    ? pipeline.png({ compressionLevel: 9, palette: true }).toBuffer()
    : pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
}

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

const files = (await listAll()).sort((a, b) => b.size - a.size).slice(0, limit);
const totals = { before: 0, after: 0, replaced: 0, skipped: 0, failed: 0 };

for (const [i, file] of files.entries()) {
  const tag = `[${i + 1}/${files.length}] ${file.path}`;
  try {
    const { data: blob, error } = await supabase.storage.from(BUCKET).download(file.path);
    if (error) throw error;
    const original = Buffer.from(await blob.arrayBuffer());
    const { width = 0, height = 0 } = await sharp(original).metadata();

    if (original.length <= SKIP_UNDER_BYTES && Math.max(width, height) <= MAX_DIMENSION) {
      totals.skipped++;
      continue;
    }

    const compressed = await compress(original, file.type);
    if (compressed.length > original.length * (1 - MIN_SAVING)) {
      console.log(`${tag}: skipped, only ${kb(original.length)} → ${kb(compressed.length)}`);
      totals.skipped++;
      continue;
    }

    if (!dryRun) {
      const backupPath = path.join(backupDir, file.path);
      await mkdir(path.dirname(backupPath), { recursive: true });
      await writeFile(backupPath, original);

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(file.path, compressed, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
    }

    totals.before += original.length;
    totals.after += compressed.length;
    totals.replaced++;
    console.log(`${tag}: ${width}×${height} ${kb(original.length)} → ${kb(compressed.length)}`);
  } catch (err) {
    totals.failed++;
    console.error(`${tag}: FAILED — ${err.message ?? err}`);
  }
}

const mb = (bytes) => `${(bytes / 1024 ** 2).toFixed(1)} MB`;
console.log(`\n${dryRun ? "DRY RUN — nothing was uploaded." : `Originals backed up to ${backupDir}`}`);
console.log(`${dryRun ? "Would replace" : "Replaced"}: ${totals.replaced}, skipped: ${totals.skipped}, failed: ${totals.failed}`);
console.log(`Those files: ${mb(totals.before)} → ${mb(totals.after)}`);
