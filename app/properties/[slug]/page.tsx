import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { InquiryForm } from "@/components/inquiry-form";

type Property = {
  id: string;
  title: string;
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
};

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select(
      "id, title, description, price, currency, bedrooms, bathrooms, land_size, floor_area, address, city, district, images",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const property = data as Property;
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
      <Link
        href="/properties"
        className="text-sm text-foreground/60 hover:text-foreground"
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
              alt={`${property.title} photo ${index + 1}`}
              className={`h-48 w-full rounded-xl object-cover ${
                index === 0 ? "col-span-2 row-span-2 h-full sm:col-span-2" : ""
              }`}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 flex h-64 w-full items-center justify-center rounded-xl bg-black/5 text-foreground/40 dark:bg-white/5">
          No images available
        </div>
      )}

      <h1 className="mt-8 text-3xl font-semibold tracking-tight text-foreground">
        {property.title}
      </h1>
      <p className="mt-2 text-2xl font-semibold text-foreground">
        {formatPrice(property.price, property.currency)}
      </p>
      {location && <p className="mt-1 text-foreground/60">{location}</p>}

      {specs.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-black/10 p-4 sm:grid-cols-4 dark:border-white/10">
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
          <h2 className="text-lg font-medium text-foreground">Description</h2>
          <p className="mt-2 whitespace-pre-line text-foreground/80">
            {property.description}
          </p>
        </div>
      )}

      <InquiryForm propertyId={property.id} />
    </div>
  );
}
