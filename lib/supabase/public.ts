import { createClient } from "@supabase/supabase-js";

// Cookie-free client for reading public data (published listings) from code
// that runs outside a request — statically generated pages and the sitemap.
// Using the cookie-based server client there would force dynamic rendering.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
