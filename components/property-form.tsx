"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  createProperty,
  updateProperty,
  type PropertyFormState,
} from "@/app/admin/properties/actions";

const BUCKET = "property-images";

type PropertyRecord = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  listing_type: string;
  status: string;
  property_type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  land_size: number | null;
  floor_area: number | null;
  address: string | null;
  city: string | null;
  district: string | null;
  images: string[] | null;
  featured: boolean;
  is_published: boolean;
};

type UploadedImage = { url: string; path: string };

const initialState: PropertyFormState = { status: "idle" };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function pathFromPublicUrl(url: string) {
  const marker = `/${BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? "" : url.slice(index + marker.length);
}

function inputClass() {
  return "mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-foreground dark:border-white/10";
}

function labelClass() {
  return "block text-sm font-medium text-foreground";
}

function SubmitButton({
  label,
  blocked,
}: {
  label: string;
  blocked: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || blocked}
      className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export function PropertyForm({ property }: { property?: PropertyRecord }) {
  const isEdit = Boolean(property);
  const action = isEdit
    ? updateProperty.bind(null, property!.id)
    : createProperty;
  const [state, formAction] = useActionState(action, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      router.push("/admin/properties");
      router.refresh();
    }
  }, [state, router]);

  const [slug, setSlug] = useState(property?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);

  const [images, setImages] = useState<UploadedImage[]>(() =>
    (property?.images ?? []).map((url) => ({
      url,
      path: pathFromPublicUrl(url),
    })),
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!slugTouched) {
      setSlug(slugify(event.target.value));
    }
  }

  function handleSlugChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSlugTouched(true);
    setSlug(event.target.value);
  }

  async function handleFilesSelected(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);
    const supabase = createClient();
    const uploaded: UploadedImage[] = [];

    for (const file of Array.from(files)) {
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `${crypto.randomUUID()}-${safeName}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file);

      if (error) {
        setUploadError(error.message);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path);
      uploaded.push({ url: publicUrl, path });
    }

    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleRemoveImage(index: number) {
    const image = images[index];
    setImages((prev) => prev.filter((_, i) => i !== index));

    if (image.path) {
      const supabase = createClient();
      await supabase.storage.from(BUCKET).remove([image.path]);
    }
  }

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <div>
        <label htmlFor="title" className={labelClass()}>
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={property?.title}
          onChange={handleTitleChange}
          className={inputClass()}
        />
      </div>

      <div>
        <label htmlFor="slug" className={labelClass()}>
          Slug <span className="text-red-500">*</span>
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          value={slug}
          onChange={handleSlugChange}
          className={inputClass()}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass()}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={property?.description ?? ""}
          className={inputClass()}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className={labelClass()}>
            Price <span className="text-red-500">*</span>
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            required
            defaultValue={property?.price}
            className={inputClass()}
          />
        </div>

        <div>
          <label htmlFor="currency" className={labelClass()}>
            Currency
          </label>
          <input
            id="currency"
            name="currency"
            type="text"
            defaultValue={property?.currency ?? "LKR"}
            className={inputClass()}
          />
        </div>

        <div>
          <label htmlFor="listing_type" className={labelClass()}>
            Listing type
          </label>
          <select
            id="listing_type"
            name="listing_type"
            defaultValue={property?.listing_type ?? "sale"}
            className={inputClass()}
          >
            <option value="sale">For sale</option>
            <option value="rent">For rent</option>
          </select>
        </div>

        <div>
          <label htmlFor="property_type" className={labelClass()}>
            Property type
          </label>
          <select
            id="property_type"
            name="property_type"
            defaultValue={property?.property_type ?? "house"}
            className={inputClass()}
          >
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className={labelClass()}>
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={property?.status ?? "available"}
            className={inputClass()}
          >
            <option value="available">Available</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
          </select>
        </div>

        <div>
          <label htmlFor="bedrooms" className={labelClass()}>
            Bedrooms
          </label>
          <input
            id="bedrooms"
            name="bedrooms"
            type="number"
            min="0"
            defaultValue={property?.bedrooms ?? ""}
            className={inputClass()}
          />
        </div>

        <div>
          <label htmlFor="bathrooms" className={labelClass()}>
            Bathrooms
          </label>
          <input
            id="bathrooms"
            name="bathrooms"
            type="number"
            min="0"
            defaultValue={property?.bathrooms ?? ""}
            className={inputClass()}
          />
        </div>

        <div>
          <label htmlFor="land_size" className={labelClass()}>
            Land size
          </label>
          <input
            id="land_size"
            name="land_size"
            type="number"
            min="0"
            defaultValue={property?.land_size ?? ""}
            className={inputClass()}
          />
        </div>

        <div>
          <label htmlFor="floor_area" className={labelClass()}>
            Floor area
          </label>
          <input
            id="floor_area"
            name="floor_area"
            type="number"
            min="0"
            defaultValue={property?.floor_area ?? ""}
            className={inputClass()}
          />
        </div>
      </div>

      <div>
        <label htmlFor="address" className={labelClass()}>
          Address
        </label>
        <input
          id="address"
          name="address"
          type="text"
          defaultValue={property?.address ?? ""}
          className={inputClass()}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className={labelClass()}>
            City
          </label>
          <input
            id="city"
            name="city"
            type="text"
            defaultValue={property?.city ?? ""}
            className={inputClass()}
          />
        </div>

        <div>
          <label htmlFor="district" className={labelClass()}>
            District
          </label>
          <input
            id="district"
            name="district"
            type="text"
            defaultValue={property?.district ?? ""}
            className={inputClass()}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={property?.featured ?? false}
          />
          Featured
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={property?.is_published ?? false}
          />
          Published
        </label>
      </div>

      <div>
        <label className={labelClass()}>Images</label>

        {images.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image, index) => (
              <div key={image.url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- images live on Supabase storage, not a configured next/image host */}
                <img
                  src={image.url}
                  alt=""
                  className="h-24 w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white"
                >
                  ×
                </button>
                <input type="hidden" name="images" value={image.url} />
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={handleFilesSelected}
          className="mt-3 block text-sm text-foreground"
        />
        {uploading && (
          <p className="mt-1 text-sm text-foreground/60">Uploading…</p>
        )}
        {uploadError && (
          <p className="mt-1 text-sm text-red-500">{uploadError}</p>
        )}
      </div>

      {state.status === "error" && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}

      <SubmitButton
        label={isEdit ? "Save changes" : "Create property"}
        blocked={uploading}
      />
    </form>
  );
}
