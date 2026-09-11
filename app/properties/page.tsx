import { createClient } from "@/lib/supabase/server";
import { PropertyCard } from "@/components/property-card";

export default async function PropertiesPage() {
  const supabase = await createClient();
  const { data: properties, error } = await supabase
    .from("properties")
    .select(
      "id, slug, title, price, currency, city, bedrooms, bathrooms, images",
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Properties
      </h1>

      {error && (
        <p className="mt-6 text-red-600 dark:text-red-400">{error.message}</p>
      )}

      {!error && properties?.length === 0 && (
        <p className="mt-6 text-foreground/60">
          No properties available right now.
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
