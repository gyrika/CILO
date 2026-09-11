import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PropertyCard } from "@/components/property-card";

export default async function Home() {
  const supabase = await createClient();
  const { data: featuredProperties } = await supabase
    .from("properties")
    .select(
      "id, slug, title, price, currency, city, bedrooms, bathrooms, images",
    )
    .eq("is_published", true)
    .eq("featured", true)
    .order("created_at", { ascending: false });

  return (
    <div>
      <section className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Find Your Perfect Property in Sri Lanka
        </h1>
        <p className="mt-4 max-w-xl text-lg text-foreground/60">
          Browse houses, apartments, land, and commercial spaces for sale and
          rent — all in one place.
        </p>
        <Link
          href="/properties"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Browse Properties
        </Link>
      </section>

      {featuredProperties && featuredProperties.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Featured Properties
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
