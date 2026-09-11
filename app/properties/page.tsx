import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

type Property = {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  city: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  images: string[] | null;
};

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

function PropertyCard({ property }: { property: Property }) {
  const image = property.images?.[0];

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="block overflow-hidden rounded-xl border border-black/10 bg-background shadow-sm transition-shadow hover:shadow-md dark:border-white/10"
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element -- images come from arbitrary, un-configured external hosts
        <img
          src={image}
          alt={property.title}
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-black/5 text-sm text-foreground/40 dark:bg-white/5">
          No image available
        </div>
      )}

      <div className="p-4">
        <h2 className="truncate text-lg font-medium text-foreground">
          {property.title}
        </h2>
        <p className="mt-1 text-xl font-semibold text-foreground">
          {formatPrice(property.price, property.currency)}
        </p>
        <p className="mt-1 text-sm text-foreground/60">
          {property.city ?? "Location not specified"}
        </p>

        <div className="mt-3 flex gap-4 text-sm text-foreground/70">
          {property.bedrooms != null && (
            <span>
              {property.bedrooms} bed{property.bedrooms === 1 ? "" : "s"}
            </span>
          )}
          {property.bathrooms != null && (
            <span>
              {property.bathrooms} bath{property.bathrooms === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
