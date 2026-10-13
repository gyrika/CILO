import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getClientIp } from "@/lib/client-ip";
import { createClient } from "@/lib/supabase/server";

// Crawlers and link-preview fetchers would otherwise inflate the counts.
const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless|lighthouse/i;

/**
 * Records a view of a property (at most once per visitor per day, enforced
 * by the record_property_view database function) and returns how many
 * distinct visitors viewed it over the last 7 days. Returns null if the view
 * couldn't be recorded, so the page can simply skip the stat.
 */
export async function recordPropertyView(
  propertyId: string,
): Promise<number | null> {
  const headerList = await headers();
  const userAgent = headerList.get("user-agent") ?? "";
  if (BOT_PATTERN.test(userAgent)) return null;

  // Hash rather than store the raw IP; adding the user agent keeps people
  // sharing one office/home IP from collapsing into a single visitor.
  const ip = await getClientIp();
  const viewer = createHash("sha256")
    .update(`${ip}|${userAgent}`)
    .digest("hex");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("record_property_view", {
    p_property_id: propertyId,
    p_viewer: viewer,
  });

  return error ? null : (data as number);
}
