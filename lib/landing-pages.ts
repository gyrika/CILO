import { cache } from "react";
import { formatPlainPrice } from "@/lib/format";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * SEO landing pages: one page per city × category, e.g.
 * /properties/rent/colombo-1 or /properties/apartments/rajagiriya. A page
 * only exists while the combination has at least MIN_LISTINGS published
 * properties, so empty/thin pages are never generated or listed.
 */

export const MIN_LISTINGS = 1;

export type LandingCategory =
  | { slug: "rent" | "sale"; kind: "listing_type"; value: "rent" | "sale" }
  | {
      slug: "apartments" | "houses" | "land" | "commercial";
      kind: "property_type";
      value: string;
    };

export const LANDING_CATEGORIES: Record<string, LandingCategory> = {
  rent: { slug: "rent", kind: "listing_type", value: "rent" },
  sale: { slug: "sale", kind: "listing_type", value: "sale" },
  apartments: { slug: "apartments", kind: "property_type", value: "apartment" },
  houses: { slug: "houses", kind: "property_type", value: "house" },
  land: { slug: "land", kind: "property_type", value: "land" },
  commercial: { slug: "commercial", kind: "property_type", value: "commercial" },
};

const TYPE_LABELS: Record<string, { one: string; many: string }> = {
  apartment: { one: "apartment", many: "apartments" },
  house: { one: "house", many: "houses" },
  land: { one: "land plot", many: "land" },
  commercial: { one: "commercial property", many: "commercial properties" },
};
const GENERIC_LABEL = { one: "property", many: "properties" };

const capitalize = (text: string) =>
  text.replace(/\b\w/g, (char) => char.toUpperCase());

// Misspelled city values in the imported data, mapped to the real city so
// they join its page instead of getting a thin page of their own.
const CITY_ALIASES: Record<string, string> = {
  rajajgiriya: "Rajagiriya",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function canonicalCity(rawCity: string) {
  const trimmed = rawCity.trim();
  return CITY_ALIASES[slugify(trimmed)] ?? trimmed;
}

type ListingSummary = {
  city: string | null;
  listing_type: string;
  property_type: string;
  price: number;
  currency: string;
};

export type LandingPage = {
  category: LandingCategory;
  citySlug: string;
  city: string;
  /** Every raw `city` value that maps to this page (canonical + typos). */
  cityVariants: string[];
  path: string;
  count: number;
  /** Lowest price, only when all listings share one currency. */
  minPrice: { amount: number; currency: string } | null;
  title: string;
  description: string;
};

// Listing-type pages name the property type when every listing shares one
// ("Apartments for Rent in Colombo 1"). Type pages deliberately leave out
// rent/sale so their titles never duplicate a listing-type page.
function describeGroup(
  category: LandingCategory,
  city: string,
  rows: ListingSummary[],
  listingTypeCounts: Record<string, number>,
  minPrice: LandingPage["minPrice"],
) {
  const propertyTypes = new Set(rows.map((r) => r.property_type));
  const typeKey =
    category.kind === "property_type"
      ? category.value
      : propertyTypes.size === 1
        ? [...propertyTypes][0]
        : null;
  const label = (typeKey && TYPE_LABELS[typeKey]) || GENERIC_LABEL;
  const listing = category.kind === "listing_type" ? ` for ${category.value}` : "";

  // "Apartments for Rent in Colombo 1"
  const title = `${capitalize(label.many)}${capitalize(listing).replace(" For ", " for ")} in ${city}`;
  const counted = `${rows.length} ${rows.length === 1 ? label.one : label.many}${listing}`;

  let detail: string;
  if (category.kind === "listing_type") {
    detail = minPrice
      ? `, from ${formatPlainPrice(minPrice.amount, minPrice.currency)}`
      : "";
  } else {
    // Type pages mix sale and rent prices, so give the split instead.
    detail = ` (${(["rent", "sale"] as const)
      .filter((type) => listingTypeCounts[type])
      .map((type) => `${listingTypeCounts[type]} for ${type}`)
      .join(", ")})`;
  }

  return {
    title,
    description: `Browse ${counted} in ${city}, Sri Lanka${detail}. See photos, prices and details, and enquire with Cilo directly.`,
  };
}

/** All landing pages that currently have enough listings, most listings first. */
export const getLandingPages = cache(async (): Promise<LandingPage[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("properties")
    .select("city, listing_type, property_type, price, currency")
    .eq("is_published", true);
  if (error) throw error;

  const groups = new Map<string, { category: LandingCategory; city: string; variants: Set<string>; rows: ListingSummary[] }>();

  for (const row of (data ?? []) as ListingSummary[]) {
    // Some imported rows hold the literal text "NULL" instead of a real null.
    if (!row.city?.trim() || row.city.trim().toLowerCase() === "null") continue;
    const city = canonicalCity(row.city);

    for (const category of Object.values(LANDING_CATEGORIES)) {
      const value = category.kind === "listing_type" ? row.listing_type : row.property_type;
      if (value !== category.value) continue;

      const key = `${category.slug}/${slugify(city)}`;
      const group = groups.get(key) ?? { category, city, variants: new Set(), rows: [] };
      group.variants.add(row.city);
      group.rows.push(row);
      groups.set(key, group);
    }
  }

  const pages: LandingPage[] = [];
  for (const [key, { category, city, variants, rows }] of groups) {
    if (rows.length < MIN_LISTINGS) continue;

    const listingTypeCounts: Record<string, number> = {};
    for (const r of rows) {
      listingTypeCounts[r.listing_type] = (listingTypeCounts[r.listing_type] ?? 0) + 1;
    }
    const currencies = new Set(rows.map((r) => r.currency));
    const minPrice =
      currencies.size === 1
        ? { amount: Math.min(...rows.map((r) => r.price)), currency: rows[0].currency }
        : null;

    pages.push({
      category,
      citySlug: slugify(city),
      city,
      cityVariants: [...variants],
      path: `/properties/${key}`,
      count: rows.length,
      minPrice,
      ...describeGroup(category, city, rows, listingTypeCounts, minPrice),
    });
  }

  return pages.sort((a, b) => b.count - a.count || a.path.localeCompare(b.path));
});

export async function getLandingPage(categorySlug: string, citySlug: string) {
  const pages = await getLandingPages();
  return pages.find((p) => p.category.slug === categorySlug && p.citySlug === citySlug) ?? null;
}
