import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site-info";

// Shown when a page has no photo of its own. Social sites don't render SVG
// previews, so this uses the PNG app icon rather than logo.svg.
const DEFAULT_OG_IMAGE = {
  url: "/icons/icon-512.png",
  width: 512,
  height: 512,
  alt: `${SITE_NAME} logo`,
};

/**
 * Title, description, canonical URL and Open Graph/Twitter tags for a public
 * page. Next.js replaces (rather than merges) a parent's openGraph object,
 * so every page builds the full set here.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image?: { url: string; alt: string };
}): Metadata {
  const images = image ? [image] : [DEFAULT_OG_IMAGE];
  // The layout's title template only applies to <title>, so add the brand
  // to the share-card title here.
  const shareTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: shareTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_LK",
      type: "website",
      images,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: shareTitle,
      description,
      images: images.map((img) => img.url),
    },
  };
}

// Trims to roughly the length search engines show, on a word boundary.
export function truncateDescription(text: string, maxLength = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, clean.lastIndexOf(" ", maxLength - 1))}…`;
}
