import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PropertyCard } from "@/components/property-card";
import { getLandingPages } from "@/lib/landing-pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Cilo | Apartments & Houses for Sale and Rent in Sri Lanka",
  description:
    "Find apartments, houses, land and commercial properties for sale and rent across Sri Lanka, from Colombo to Rajagiriya. Browse Cilo's latest listings.",
  path: "/",
});

// Landing pages with the most listings, linked from the homepage so visitors
// and crawlers can reach them without the sitemap.
const POPULAR_SEARCH_COUNT = 4;

export default async function Home() {
  const supabase = await createClient();
  const popularSearches = (await getLandingPages()).slice(
    0,
    POPULAR_SEARCH_COUNT,
  );
  const { data: featuredProperties } = await supabase
    .from("properties")
    .select(
      "id, slug, title, property_type, listing_type, price, currency, city, bedrooms, bathrooms, images, created_at",
    )
    .eq("is_published", true)
    .eq("featured", true)
    .order("created_at", { ascending: false });

  return (
    <div>
      <section className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          Find Your Perfect Property in Sri Lanka
        </h1>
        <p className="mt-4 max-w-xl text-lg text-foreground/60">
          Browse houses, apartments, land, and commercial spaces for sale and
          rent — all in one place.
        </p>
        <Link
          href="/properties"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Browse Properties
        </Link>
      </section>

      {featuredProperties && featuredProperties.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Featured Properties
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      )}

      {popularSearches.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Popular searches
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {popularSearches.map((search) => (
              <li key={search.path}>
                <Link
                  href={search.path}
                  className="block rounded-xl border border-border p-4 hover:border-foreground/30"
                >
                  <span className="block font-semibold text-accent">
                    {search.title}
                  </span>
                  <span className="mt-1 block text-sm text-foreground/60">
                    {search.count} listings
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
