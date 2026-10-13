// "For Sale" uses the accent red so the less common sale listings stand out;
// "For Rent" is near-black. Both read on any photo.
const STYLES: Record<string, { label: string; className: string }> = {
  sale: { label: "For Sale", className: "bg-accent text-white" },
  rent: { label: "For Rent", className: "bg-foreground text-white" },
};

const SIZES = {
  sm: "px-2.5 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

export function ListingTypeBadge({
  listingType,
  size = "sm",
  className = "",
}: {
  listingType: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const style = listingType ? STYLES[listingType] : undefined;
  if (!style) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold tracking-wide uppercase shadow-sm ${SIZES[size]} ${style.className} ${className}`}
    >
      {style.label}
    </span>
  );
}
