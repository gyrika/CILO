import Link from "next/link";

export type PropertyFilterValues = {
  type?: string;
  property_type?: string;
  city?: string;
  min_price?: string;
  max_price?: string;
};

// The /properties filter bar. It always submits to /properties, so landing
// pages can render it pre-filled and hand refinements to the main listing.
export function PropertyFilters({
  values,
  showClear,
}: {
  values: PropertyFilterValues;
  showClear: boolean;
}) {
  return (
    <form
      method="get"
      action="/properties"
      className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border border-border p-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="type" className="text-xs text-foreground/60">
          Listing type
        </label>
        <select
          id="type"
          name="type"
          defaultValue={values.type ?? ""}
          className="rounded-md border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="">Any</option>
          <option value="sale">For sale</option>
          <option value="rent">For rent</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="property_type" className="text-xs text-foreground/60">
          Property type
        </label>
        <select
          id="property_type"
          name="property_type"
          defaultValue={values.property_type ?? ""}
          className="rounded-md border border-border bg-white px-3 py-2 text-sm"
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
          defaultValue={values.city ?? ""}
          placeholder="e.g. Nugegoda"
          className="w-40 rounded-md border border-border bg-white px-3 py-2 text-sm"
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
          defaultValue={values.min_price ?? ""}
          placeholder="0"
          className="w-32 rounded-md border border-border bg-white px-3 py-2 text-sm"
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
          defaultValue={values.max_price ?? ""}
          placeholder="Any"
          className="w-32 rounded-md border border-border bg-white px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        Apply filters
      </button>

      {showClear && (
        <Link
          href="/properties"
          className="text-sm font-medium text-accent hover:underline"
        >
          Clear filters
        </Link>
      )}
    </form>
  );
}
