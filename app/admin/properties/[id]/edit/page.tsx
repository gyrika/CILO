import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PropertyForm } from "@/components/property-form";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property, error } = await supabase
    .from("properties")
    .select(
      "id, title, slug, description, price, currency, listing_type, status, property_type, bedrooms, bathrooms, land_size, floor_area, address, city, district, images, featured, is_published",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !property) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Edit Property
      </h1>
      <PropertyForm property={property} />
    </div>
  );
}
