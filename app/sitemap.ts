import type { MetadataRoute } from "next";
import { getLandingPages } from "@/lib/landing-pages";
import { SITE_URL } from "@/lib/site-info";
import { createPublicClient } from "@/lib/supabase/public";

// Rebuild at most hourly so newly published listings show up without a deploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();
  const [{ data: properties }, landingPages] = await Promise.all([
    supabase
      .from("properties")
      .select("slug, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false }),
    getLandingPages(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/properties`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const propertyPages: MetadataRoute.Sitemap = (properties ?? []).map(
    (property) => ({
      url: `${SITE_URL}/properties/${property.slug}`,
      lastModified: property.created_at,
      changeFrequency: "weekly",
      priority: 0.8,
    }),
  );

  // Only combinations with listings exist (see lib/landing-pages.ts).
  const landingPageEntries: MetadataRoute.Sitemap = landingPages.map(
    (page) => ({
      url: `${SITE_URL}${page.path}`,
      changeFrequency: "daily",
      priority: 0.7,
    }),
  );

  return [...staticPages, ...landingPageEntries, ...propertyPages];
}
