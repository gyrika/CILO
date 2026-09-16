export const LEAD_STATUSES = [
  "new",
  "contacted",
  "viewing_scheduled",
  "negotiating",
  "won",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export function formatLeadLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  contacted: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  viewing_scheduled: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  negotiating: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  won: "bg-green-500/10 text-green-600 dark:text-green-400",
  lost: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export function leadStatusClass(status: string) {
  return STATUS_STYLES[status] ?? "bg-foreground/10 text-foreground/60";
}
