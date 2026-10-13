import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-info";

// AI search/assistant crawlers we explicitly welcome on the public site.
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    // A crawler that matches a named group ignores the "*" group entirely,
    // so the AI crawlers' group must repeat the /admin/ disallow.
    rules: [
      { userAgent: "*", allow: "/", disallow: "/admin/" },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: "/admin/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
