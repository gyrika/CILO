import Link from "next/link";
import {
  describeProperty,
  formatDisplayTitle,
  formatPrice,
} from "@/lib/format";
import { ListingTypeBadge } from "@/components/listing-type-badge";
import {
  isRecentlyAdded,
  RecentlyAddedBadge,
} from "@/components/recently-added-badge";

export type PropertyCardData = {
  id: string;
  slug: string;
  title: string;
  property_type: string | null;
  listing_type: string | null;
  price: number;
  currency: string;
  city: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  images: string[] | null;
  created_at?: string | null;
};

export function PropertyCard({ property }: { property: PropertyCardData }) {
  const image = property.images?.[0];

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="relative block overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element -- images come from arbitrary, un-configured external hosts
        <img
          src={image}
          alt={`${describeProperty(property)} - photo 1`}
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-black/5 text-sm text-foreground/40">
          No image available
        </div>
      )}
      {isRecentlyAdded(property.created_at) && (
        <RecentlyAddedBadge className="absolute top-3 left-3" />
      )}
      <ListingTypeBadge
        listingType={property.listing_type}
        className="absolute top-3 right-3"
      />

      <div className="p-4">
        <h2 className="line-clamp-2 text-lg font-semibold tracking-tight text-foreground">
          {formatDisplayTitle(property)}
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
