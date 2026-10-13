#!/usr/bin/env node
/**
 * Read-only report: lists every file in the "property-images" storage bucket
 * with its size, then prints the total, average, and largest files.
 *
 * Usage: node --env-file=.env.local scripts/report-image-sizes.mjs
 */
import { createClient } from "@supabase/supabase-js";

const BUCKET = "property-images";
const PAGE_SIZE = 1000;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

// Storage "folders" are listed as entries with no id; recurse into them.
async function listAll(prefix = "") {
  const files = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix, { limit: PAGE_SIZE, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw error;

    for (const entry of data) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id === null) {
        files.push(...(await listAll(path)));
      } else {
        files.push({ path, size: entry.metadata?.size ?? 0, type: entry.metadata?.mimetype });
      }
    }
    if (data.length < PAGE_SIZE) break;
  }
  return files;
}

function formatBytes(bytes) {
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

const files = await listAll();

if (files.length === 0) {
  console.log(`No files found in "${BUCKET}" (or the key can't list it).`);
  process.exit(0);
}

files.sort((a, b) => b.size - a.size);
for (const file of files) {
  console.log(`${formatBytes(file.size).padStart(10)}  ${file.type ?? "?"}  ${file.path}`);
}

const total = files.reduce((sum, file) => sum + file.size, 0);
const bands = [
  ["< 500 KB", (s) => s < 500 * 1024],
  ["500 KB – 1 MB", (s) => s >= 500 * 1024 && s < 1024 ** 2],
  ["1 – 3 MB", (s) => s >= 1024 ** 2 && s < 3 * 1024 ** 2],
  ["≥ 3 MB", (s) => s >= 3 * 1024 ** 2],
];

console.log("\n--- Summary ---");
console.log(`Files:   ${files.length}`);
console.log(`Total:   ${formatBytes(total)}`);
console.log(`Average: ${formatBytes(total / files.length)}`);
console.log(`Median:  ${formatBytes(files[Math.floor(files.length / 2)].size)}`);
console.log(`Largest: ${formatBytes(files[0].size)}  (${files[0].path})`);
for (const [label, test] of bands) {
  console.log(`  ${label.padEnd(14)} ${files.filter((f) => test(f.size)).length}`);
}
