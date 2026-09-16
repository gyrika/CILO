"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type PropertyFormState = {
  status: "idle" | "error" | "success";
  message?: string;
};

function readPropertyFields(formData: FormData) {
  const toNumber = (value: FormDataEntryValue | null) => {
    if (value == null || value === "") return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const toText = (value: FormDataEntryValue | null) => {
    const trimmed = (value as string | null)?.trim();
    return trimmed || null;
  };

  return {
    title: (formData.get("title") as string)?.trim() ?? "",
    slug: (formData.get("slug") as string)?.trim() ?? "",
    description: toText(formData.get("description")),
    price: toNumber(formData.get("price")),
    currency: (formData.get("currency") as string)?.trim() || "LKR",
    listing_type: formData.get("listing_type") as string,
    status: formData.get("status") as string,
    property_type: formData.get("property_type") as string,
    bedrooms: toNumber(formData.get("bedrooms")),
    bathrooms: toNumber(formData.get("bathrooms")),
    land_size: toNumber(formData.get("land_size")),
    floor_area: toNumber(formData.get("floor_area")),
    address: toText(formData.get("address")),
    city: toText(formData.get("city")),
    district: toText(formData.get("district")),
    images: formData.getAll("images").map(String).filter(Boolean),
    featured: formData.get("featured") === "on",
    is_published: formData.get("is_published") === "on",
  };
}

export async function createProperty(
  _prevState: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  const fields = readPropertyFields(formData);

  if (!fields.title || !fields.slug || fields.price == null) {
    return {
      status: "error",
      message: "Title, slug, and price are required.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("properties").insert(fields);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/admin/properties");
  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath("/properties/[slug]", "page");
  return { status: "success" };
}

export async function updateProperty(
  id: string,
  _prevState: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  const fields = readPropertyFields(formData);

  if (!fields.title || !fields.slug || fields.price == null) {
    return {
      status: "error",
      message: "Title, slug, and price are required.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update(fields)
    .eq("id", id);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/admin/properties");
  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath("/properties/[slug]", "page");
  return { status: "success" };
}

export async function deleteProperty(id: string) {
  const supabase = await createClient();

  const {
    data: userData,
  } = await supabase.auth.getUser();
  console.log("[deleteProperty] auth.getUser() ->", userData?.user?.id ?? "NO USER");

  const { data, error, count } = await supabase
    .from("properties")
    .delete({ count: "exact" })
    .eq("id", id)
    .select();

  console.log("[deleteProperty] id:", id);
  console.log("[deleteProperty] error:", error);
  console.log("[deleteProperty] count (rows affected):", count);
  console.log("[deleteProperty] data (deleted rows):", data);

  if (error) {
    console.error("[deleteProperty] Supabase returned an error:", error.message);
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    console.warn(
      "[deleteProperty] No error, but no rows were deleted. This means the DELETE matched zero rows — almost certainly an RLS policy silently blocking the delete for this user/row.",
    );
  } else {
    console.log("[deleteProperty] Successfully deleted row(s):", data);
  }

  revalidatePath("/admin/properties");
}
