import { headers } from "next/headers";

export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  // Vercel (and most proxies) set x-forwarded-for as a comma-separated list
  // of "client, proxy1, proxy2, ...". The first entry is the original client.
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return headerList.get("x-real-ip") ?? "unknown";
}
