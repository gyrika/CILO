import { getLandingPages } from "@/lib/landing-pages";
import { SITE_NAME, SITE_URL } from "@/lib/site-info";

// llms.txt (https://llmstxt.org): a Markdown overview of the site for AI
// assistants. Served from a route rather than public/ so the landing-page
// list stays in sync with the listings, like sitemap.ts.
export const revalidate = 3600;

export async function GET() {
  const landingPages = await getLandingPages();

  const body = `# ${SITE_NAME}

> ${SITE_NAME} is a real estate agency in Sri Lanka. Its website lists apartments, houses, land and commercial properties for sale and rent, mainly in Colombo (Colombo 1–7) and Rajagiriya. Each listing shows the price in Sri Lankan rupees (LKR), bedrooms, bathrooms, floor area, location and photos, and visitors can send an inquiry to the ${SITE_NAME} team directly from the listing.

- Website: ${SITE_URL}

## Main pages

- [Home](${SITE_URL}/): Featured listings, popular searches and answers to common questions about buying and renting property in Sri Lanka
- [All properties](${SITE_URL}/properties): Every published listing, filterable by sale/rent, property type, city and price
- [About](${SITE_URL}/about): About ${SITE_NAME}
- [Contact](${SITE_URL}/contact): How to reach the ${SITE_NAME} team

## Properties by location

${landingPages.map((page) => `- [${page.title}](${SITE_URL}${page.path}): ${page.count} ${page.count === 1 ? "listing" : "listings"}`).join("\n")}

## Optional

- [Sitemap](${SITE_URL}/sitemap.xml): Every page, including each individual property listing
`;

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
