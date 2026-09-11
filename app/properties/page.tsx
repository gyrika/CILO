import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PropertyCard } from "@/components/property-card";

type SearchParams = {
  type?: string;
  property_type?: string;
  city?: string;
  min_price?: string;
  max_price?: string;
};

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
      "id, slug, title, price, currency, city, bedrooms, bathrooms, images",
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
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Properties
      </h1>

      <form
        method="get"
        className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border border-black/10 p-4 dark:border-white/10"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="type" className="text-xs text-foreground/60">
            Listing type
          </label>
          <select
            id="type"
            name="type"
            defaultValue={type ?? ""}
            className="rounded-md border border-black/10 bg-background px-3 py-2 text-sm dark:border-white/10"
          >
            <option value="">Any</option>
            <option value="sale">For sale</option>
            <option value="rent">For rent</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="property_type"
            className="text-xs text-foreground/60"
          >
            Property type
          </label>
          <select
            id="property_type"
            name="property_type"
            defaultValue={property_type ?? ""}
            className="rounded-md border border-black/10 bg-background px-3 py-2 text-sm dark:border-white/10"
          >
            <option value="">Any</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="city" className="text-xs text-foreground/60">
            City
          </label>
          <input
            id="city"
            name="city"
            type="text"
            defaultValue={city ?? ""}
            placeholder="e.g. Nugegoda"
            className="w-40 rounded-md border border-black/10 bg-background px-3 py-2 text-sm dark:border-white/10"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="min_price" className="text-xs text-foreground/60">
            Min price
          </label>
          <input
            id="min_price"
            name="min_price"
            type="number"
            min="0"
            defaultValue={min_price ?? ""}
            placeholder="0"
            className="w-32 rounded-md border border-black/10 bg-background px-3 py-2 text-sm dark:border-white/10"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="max_price" className="text-xs text-foreground/60">
            Max price
          </label>
          <input
            id="max_price"
            name="max_price"
            type="number"
            min="0"
            defaultValue={max_price ?? ""}
            placeholder="Any"
            className="w-32 rounded-md border border-black/10 bg-background px-3 py-2 text-sm dark:border-white/10"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Apply filters
        </button>

        {hasActiveFilters && (
          <Link
            href="/properties"
            className="text-sm text-foreground/60 hover:text-foreground"
          >
            Clear filters
          </Link>
        )}
      </form>

      {error && (
        <p className="mt-6 text-red-600 dark:text-red-400">{error.message}</p>
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
