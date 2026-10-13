import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import {
  PropertyCard,
  type PropertyCardData,
} from "@/components/property-card";
import { PropertyFilters } from "@/components/property-filters";
import { formatPlainPrice } from "@/lib/format";
import {
  getLandingPage,
  getLandingPages,
  LANDING_CATEGORIES,
  type LandingPage,
} from "@/lib/landing-pages";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site-info";
import { createPublicClient } from "@/lib/supabase/public";

type Params = { params: Promise<{ city: string }> };

const RELATED_LIMIT = 6;

async function getListings(page: LandingPage) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("properties")
    .select(
      "id, slug, title, property_type, listing_type, price, currency, city, bedrooms, bathrooms, images, created_at",
    )
    .eq("is_published", true)
    .in("city", page.cityVariants)
    .eq(page.category.kind, page.category.value)
    .order("created_at", { ascending: false });

  return (data ?? []) as PropertyCardData[];
}

// Other landing pages for the same city first, then the same category in
// other cities, so visitors (and crawlers) can move between them.
function relatedPages(current: LandingPage, all: LandingPage[]) {
  const others = all.filter((p) => p.path !== current.path);
  return [
    ...others.filter((p) => p.citySlug === current.citySlug),
    ...others.filter(
      (p) =>
        p.citySlug !== current.citySlug &&
        p.category.slug === current.category.slug,
    ),
  ].slice(0, RELATED_LIMIT);
}

/**
 * Builds the route exports for one category folder, e.g.
 * app/properties/rent/[city]/page.tsx → landingRoute("rent").
 */
export function landingRoute(categorySlug: keyof typeof LANDING_CATEGORIES) {
  async function generateStaticParams() {
    const pages = await getLandingPages();
    return pages
      .filter((p) => p.category.slug === categorySlug)
      .map((p) => ({ city: p.citySlug }));
  }

  async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { city } = await params;
    const page = await getLandingPage(categorySlug, city);
    if (!page) return { title: "Page not found" };

    return pageMetadata({
      title: page.title,
      description: page.description,
      path: page.path,
    });
  }

  async function LandingRoutePage({ params }: Params) {
    const { city } = await params;
    const page = await getLandingPage(categorySlug, city);
    if (!page) notFound();

    const [properties, allPages] = await Promise.all([
      getListings(page),
      getLandingPages(),
    ]);
    if (properties.length === 0) notFound();

    const related = relatedPages(page, allPages);
    const { kind, value } = page.category;

    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: page.title,
            url: `${SITE_URL}${page.path}`,
            numberOfItems: properties.length,
            itemListElement: properties.map((property, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `${SITE_URL}/properties/${property.slug}`,
              name: property.title,
            })),
          }}
        />

        <Link
          href="/properties"
          className="text-sm font-medium text-accent hover:underline"
        >
          ← All properties
        </Link>

        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {page.title}
        </h1>
        <p className="mt-3 text-lg text-foreground/60">
          {properties.length}{" "}
          {properties.length === 1 ? "listing" : "listings"} in {page.city}
          {kind === "listing_type" && page.minPrice
            ? `, from ${formatPlainPrice(page.minPrice.amount, page.minPrice.currency)}`
            : ""}
        </p>

        <PropertyFilters
          values={{
            type: kind === "listing_type" ? value : undefined,
            property_type: kind === "property_type" ? value : undefined,
            city: page.city,
          }}
          showClear
        />

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {related.length > 0 && (
          <nav aria-label="Related searches" className="mt-16">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Related searches
            </h2>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {related.map((p) => (
                <li key={p.path}>
                  <Link
                    href={p.path}
                    className="font-medium text-accent hover:underline"
                  >
                    {p.title}
                  </Link>{" "}
                  <span className="text-foreground/50">({p.count})</span>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    );
  }

  return { generateStaticParams, generateMetadata, Page: LandingRoutePage };
}
