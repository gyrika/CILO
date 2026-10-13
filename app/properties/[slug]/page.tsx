import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  describeProperty,
  formatDisplayTitle,
  formatPlainPrice,
  formatPrice,
} from "@/lib/format";
import { pageMetadata, truncateDescription } from "@/lib/seo";
import { SITE_URL } from "@/lib/site-info";
import { InquiryForm } from "@/components/inquiry-form";
import { JsonLd } from "@/components/json-ld";
import { ListingTypeBadge } from "@/components/listing-type-badge";
import {
  PropertyCard,
  type PropertyCardData,
} from "@/components/property-card";
import {
  isRecentlyAdded,
  RecentlyAddedBadge,
} from "@/components/recently-added-badge";
import { recordPropertyView } from "@/lib/property-views";

// Below this, "N people viewed this" reads as a weakness, not social proof.
const MIN_WEEKLY_VIEWS_TO_SHOW = 3;
const SIMILAR_PRICE_RANGE = 0.2;
const SIMILAR_LIMIT = 3;

type Property = {
  id: string;
  slug: string;
  title: string;
  property_type: string | null;
  description: string | null;
  price: number;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  land_size: number | null;
  floor_area: number | null;
  address: string | null;
  city: string | null;
  district: string | null;
  images: string[] | null;
  created_at: string;
  listing_type: string;
};

type PageProps = { params: Promise<{ slug: string }> };

// cache() lets generateMetadata and the page share one query per request.
const getProperty = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, slug, title, property_type, description, price, currency, bedrooms, bathrooms, land_size, floor_area, address, city, district, images, created_at, listing_type",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  return error ? null : (data as Property | null);
});

// e.g. "2 Bedroom Apartment in Colombo 1 - LKR 250,000"
function seoTitle(property: Property) {
  const location = property.city ? ` in ${property.city}` : "";
  return `${formatDisplayTitle(property)}${location} - ${formatPlainPrice(property.price, property.currency)}`;
}

function seoDescription(property: Property) {
  const listing = property.listing_type === "sale" ? "for sale" : "for rent";
  const location = [property.city, property.district]
    .filter(Boolean)
    .join(", ");
  const specs = [
    property.bedrooms != null && `${property.bedrooms} bedrooms`,
    property.bathrooms != null && `${property.bathrooms} bathrooms`,
    property.floor_area != null && `${property.floor_area} sq ft`,
  ]
    .filter(Boolean)
    .join(", ");

  const summary = [
    `${formatDisplayTitle(property)} ${listing}${location ? ` in ${location}` : ""} - ${formatPlainPrice(property.price, property.currency)}.`,
    specs && `${specs}.`,
    property.description,
  ]
    .filter(Boolean)
    .join(" ");

  return truncateDescription(summary);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) return { title: "Property not found" };

  const photo = property.images?.[0];
  return pageMetadata({
    title: seoTitle(property),
    description: seoDescription(property),
    path: `/properties/${property.slug}`,
    image: photo
      ? { url: photo, alt: `${describeProperty(property)} - photo 1` }
      : undefined,
  });
}

// schema.org RealEstateListing so search engines can show price, location
// and size in rich results.
function structuredData(property: Property) {
  const url = `${SITE_URL}/properties/${property.slug}`;
  const residenceType =
    property.property_type === "apartment"
      ? "Apartment"
      : property.property_type === "house"
        ? "SingleFamilyResidence"
        : "Accommodation";

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: seoDescription(property),
    url,
    datePosted: property.created_at,
    image: property.images ?? undefined,
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: property.currency,
      businessFunction:
        property.listing_type === "sale"
          ? "http://purl.org/goodrelations/v1#Sell"
          : "http://purl.org/goodrelations/v1#LeaseOut",
      url,
    },
    about: {
      "@type": residenceType,
      numberOfBedrooms: property.bedrooms ?? undefined,
      numberOfBathroomsTotal: property.bathrooms ?? undefined,
      floorSize:
        property.floor_area != null
          ? { "@type": "QuantitativeValue", value: property.floor_area, unitCode: "FTK" }
          : undefined,
      address: {
        "@type": "PostalAddress",
        streetAddress: property.address ?? undefined,
        addressLocality: property.city ?? undefined,
        addressRegion: property.district ?? undefined,
        addressCountry: "LK",
      },
    },
  };
}

export default async function PropertyPage({ params }: PageProps) {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) {
    notFound();
  }

  const supabase = await createClient();

  const [weeklyViews, { data: similarCandidates }] = await Promise.all([
    recordPropertyView(property.id),
    // Same district, listing type and currency, within ±20% of the price.
    // Fetch a few extra and keep the closest prices.
    property.district
      ? supabase
          .from("properties")
          .select(
            "id, slug, title, property_type, listing_type, price, currency, city, bedrooms, bathrooms, images, created_at",
          )
          .eq("is_published", true)
          .eq("district", property.district)
          .eq("listing_type", property.listing_type)
          .eq("currency", property.currency)
          .neq("id", property.id)
          .gte("price", property.price * (1 - SIMILAR_PRICE_RANGE))
          .lte("price", property.price * (1 + SIMILAR_PRICE_RANGE))
          .limit(12)
      : Promise.resolve({ data: null }),
  ]);

  const similarProperties = ((similarCandidates ?? []) as PropertyCardData[])
    .sort(
      (a, b) =>
        Math.abs(a.price - property.price) - Math.abs(b.price - property.price),
    )
    .slice(0, SIMILAR_LIMIT);
  const images = property.images?.length ? property.images : null;
  const location = [property.address, property.city, property.district]
    .filter(Boolean)
    .join(", ");

  const specs = [
    { label: "Bedrooms", value: property.bedrooms },
    { label: "Bathrooms", value: property.bathrooms },
    { label: "Land size", value: property.land_size },
    { label: "Floor area", value: property.floor_area },
  ].filter((spec) => spec.value != null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd data={structuredData(property)} />
      <Link
        href="/properties"
        className="text-sm font-medium text-accent hover:underline"
      >
        ← Back to properties
      </Link>

      {images ? (
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {images.map((src, index) => (
            // eslint-disable-next-line @next/next/no-img-element -- images come from arbitrary, un-configured external hosts
            <img
              key={src}
              src={src}
              alt={`${describeProperty(property)} - photo ${index + 1}`}
              className={`h-48 w-full rounded-xl object-cover ${
                index === 0 ? "col-span-2 row-span-2 h-full sm:col-span-2" : ""
              }`}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 flex h-64 w-full items-center justify-center rounded-xl bg-black/5 text-foreground/40">
          No images available
        </div>
      )}

      {isRecentlyAdded(property.created_at) && (
        <RecentlyAddedBadge className="mt-8" />
      )}
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        {property.title}
      </h1>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <p className="text-2xl font-semibold text-foreground">
          {formatPrice(property.price, property.currency)}
        </p>
        <ListingTypeBadge
          listingType={property.listing_type}
          size="md"
        />
      </div>
      {location && <p className="mt-1 text-foreground/60">{location}</p>}
      {weeklyViews != null && weeklyViews >= MIN_WEEKLY_VIEWS_TO_SHOW && (
        <p className="mt-2 text-sm font-medium text-foreground/70">
          {weeklyViews} people viewed this property this week
        </p>
      )}

      {specs.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-border p-4 sm:grid-cols-4">
          {specs.map((spec) => (
            <div key={spec.label}>
              <dt className="text-xs uppercase tracking-wide text-foreground/50">
                {spec.label}
              </dt>
              <dd className="mt-1 text-lg font-medium text-foreground">
                {spec.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {property.description && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Description
          </h2>
          <p className="mt-2 whitespace-pre-line text-foreground/80">
            {property.description}
          </p>
        </div>
      )}

      <InquiryForm propertyId={property.id} />

      {similarProperties.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Similar properties
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similarProperties.map((similar) => (
              <PropertyCard key={similar.id} property={similar} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
