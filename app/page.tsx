import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PropertyCard } from "@/components/property-card";
import { JsonLd } from "@/components/json-ld";
import { FAQ } from "@/lib/faq";
import { getLandingPages, getListingStats } from "@/lib/landing-pages";
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

// Hero background: this listing's first photo was picked by hand (wide,
// well lit, no people). If it's unpublished or loses its photos, the hero
// falls back to the first featured listing's photo, then to a plain dark
// background.
const HERO_PROPERTY_SLUG = "shangri-la-2-bedrooms-rent-colombo-1-ra-000097";

export default async function Home() {
  const supabase = await createClient();
  const [
    landingPages,
    stats,
    { data: featuredProperties },
    { data: heroProperty },
  ] = await Promise.all([
    getLandingPages(),
    getListingStats(),
    supabase
      .from("properties")
      .select(
        "id, slug, title, property_type, listing_type, price, currency, city, bedrooms, bathrooms, images, created_at",
      )
      .eq("is_published", true)
      .eq("featured", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("properties")
      .select("images")
      .eq("slug", HERO_PROPERTY_SLUG)
      .eq("is_published", true)
      .maybeSingle(),
  ]);

  const popularSearches = landingPages.slice(0, POPULAR_SEARCH_COUNT);
  const heroImage =
    heroProperty?.images?.[0] ??
    featuredProperties?.find((p) => p.images?.length)?.images?.[0];

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-neutral-900">
        {heroImage && (
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            quality={70}
            // Anchored low so the photo's watermark (top-left) is cropped out.
            className="-z-10 object-cover object-[center_75%]"
          />
        )}
        {/* Dark overlay keeps the white text readable on any photo. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-black/60"
        />

        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Find Your Perfect Property in Sri Lanka
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/80">
            Browse houses, apartments, land, and commercial spaces for sale and
            rent — all in one place.
          </p>

          {/* Plain GET form: submits the same city/type params the
              /properties filters use, so no JavaScript is needed. */}
          <form
            method="get"
            action="/properties"
            className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-3 rounded-2xl bg-white p-3 text-left shadow-lg sm:grid-cols-[1fr_1fr_auto]"
          >
            <label className="flex flex-col gap-1 rounded-xl px-3 py-2">
              <span className="text-xs font-semibold text-foreground/60">
                Location
              </span>
              <select
                name="city"
                defaultValue=""
                className="bg-transparent text-base text-foreground"
              >
                <option value="">Any location</option>
                {stats.cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 rounded-xl px-3 py-2 sm:border-l sm:border-border">
              <span className="text-xs font-semibold text-foreground/60">
                Listing type
              </span>
              <select
                name="type"
                defaultValue=""
                className="bg-transparent text-base text-foreground"
              >
                <option value="">Buy or rent</option>
                <option value="sale">Buy</option>
                <option value="rent">Rent</option>
              </select>
            </label>
            <button
              type="submit"
              className="rounded-xl bg-accent px-8 py-3 text-base font-semibold text-white hover:opacity-90"
            >
              Search
            </button>
          </form>

          <Link
            href="/properties"
            className="mt-6 text-sm font-medium text-white/80 underline-offset-4 hover:text-white hover:underline"
          >
            Or browse all properties →
          </Link>
        </div>
      </section>

      {/* Live counts from the database; nothing here is hard-coded. */}
      <section className="border-b border-border">
        <dl className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-border px-4 py-8 text-center sm:px-6 lg:px-8">
          <div>
            <dt className="text-sm text-foreground/60">Properties listed</dt>
            <dd className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              {stats.total}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-foreground/60">Locations</dt>
            <dd className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              {stats.cities.length}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-foreground/60">For rent / for sale</dt>
            <dd className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              {stats.forRent} / {stats.forSale}
            </dd>
          </div>
        </dl>
      </section>

      {featuredProperties && featuredProperties.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
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

      <section className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map(({ question, answer }) => ({
              "@type": "Question",
              name: question,
              acceptedAnswer: { "@type": "Answer", text: answer },
            })),
          }}
        />
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Frequently asked questions
        </h2>
        {/* <details> keeps answers in the server HTML (readable by crawlers)
            while staying collapsed for visitors, with no JavaScript. */}
        <div className="mt-6 divide-y divide-border border-y border-border">
          {FAQ.map(({ question, answer }) => (
            <details key={question} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground">
                {question}
                <span
                  aria-hidden="true"
                  className="text-xl text-foreground/40 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-foreground/70">{answer}</p>
            </details>
          ))}
        </div>
        <p className="mt-4 text-xs text-foreground/50">
          General information only, not legal advice. Laws and market practice
          change, so confirm details with a qualified lawyer.
        </p>
      </section>
    </div>
  );
}
