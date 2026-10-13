export function formatPrice(price: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${price.toLocaleString("en-US")}`;
  }
}

// "LKR 250,000" — plain text for titles and descriptions, where Intl's
// locale-dependent currency symbols and spacing are unwanted.
export function formatPlainPrice(price: number, currency: string) {
  return `${currency} ${price.toLocaleString("en-US")}`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    date,
  );
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  house: "House",
  apartment: "Apartment",
  land: "Land",
  commercial: "Commercial Property",
};

// Short card title built from structured fields, e.g. "2 Bedroom Apartment".
// Imported titles are long and inconsistent, so cards use this instead; the
// detail page still shows the original title.
export function formatDisplayTitle(property: {
  property_type: string | null;
  bedrooms: number | null;
}) {
  const type = property.property_type
    ? (PROPERTY_TYPE_LABELS[property.property_type] ??
      property.property_type.charAt(0).toUpperCase() +
        property.property_type.slice(1))
    : "Property";

  if (!property.bedrooms || property.property_type === "land") return type;
  return `${property.bedrooms} Bedroom ${type}`;
}

// Plain-language summary for alt text, e.g. "2 bedroom apartment in Colombo 1".
export function describeProperty(property: {
  property_type: string | null;
  bedrooms: number | null;
  city: string | null;
}) {
  const base = formatDisplayTitle(property).toLowerCase();
  return property.city ? `${base} in ${property.city}` : base;
}
