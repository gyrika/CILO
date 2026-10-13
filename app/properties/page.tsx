import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PropertyCard } from "@/components/property-card";
import {
  PropertyFilters,
  type PropertyFilterValues,
} from "@/components/property-filters";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Properties for Sale and Rent in Sri Lanka",
  description:
    "Browse all Cilo listings: apartments, houses, land and commercial properties for sale and rent in Colombo, Rajagiriya and across Sri Lanka. Filter by type, city and price.",
  path: "/properties",
});

type SearchParams = PropertyFilterValues;

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { type, property_type, city, min_price, max_price } =
    await searchParams;

  const minPrice = min_price ? Number(min_price) : undefined;
  const maxPrice = max_price ? Number(max_price) : undefined;

  const supabase = await createClient();
  let query = supabase
    .from("properties")
    .select(
      "id, slug, title, property_type, listing_type, price, currency, city, bedrooms, bathrooms, images, created_at",
    )
    .eq("is_published", true);

  if (type) query = query.eq("listing_type", type);
  if (property_type) query = query.eq("property_type", property_type);
  if (city) query = query.ilike("city", `%${city}%`);
  if (minPrice != null && !Number.isNaN(minPrice))
    query = query.gte("price", minPrice);
  if (maxPrice != null && !Number.isNaN(maxPrice))
    query = query.lte("price", maxPrice);

  const { data: properties, error } = await query.order("created_at", {
    ascending: false,
  });

  const hasActiveFilters = Boolean(
    type || property_type || city || min_price || max_price,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Properties
      </h1>

      <PropertyFilters
        values={{ type, property_type, city, min_price, max_price }}
        showClear={hasActiveFilters}
      />

      {error && (
        <p className="mt-6 text-red-600">{error.message}</p>
      )}

      {!error && properties?.length === 0 && (
        <p className="mt-6 text-foreground/60">
          {hasActiveFilters
            ? "No properties match your filters."
            : "No properties available right now."}
        </p>
      )}

      {!error && properties && properties.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
