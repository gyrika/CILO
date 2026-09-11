import Link from "next/link";
import { formatPrice } from "@/lib/format";

export type PropertyCardData = {
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

export function PropertyCard({ property }: { property: PropertyCardData }) {
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
