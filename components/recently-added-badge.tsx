const RECENT_DAYS = 14;

export function isRecentlyAdded(createdAt: string | null | undefined) {
  if (!createdAt) return false;
  const age = Date.now() - new Date(createdAt).getTime();
  return age >= 0 && age < RECENT_DAYS * 24 * 60 * 60 * 1000;
}

export function RecentlyAddedBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-border bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-foreground ${className}`}
    >
      Recently added
    </span>
  );
}
