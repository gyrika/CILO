import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LEAD_STATUSES, formatLeadLabel } from "@/lib/leads";
import { LeadTableRow } from "@/components/lead-row";

export const dynamic = "force-dynamic";

type LeadRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  source: string | null;
  created_at: string;
  property_id: string | null;
};

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("leads")
    .select("id, name, email, phone, status, source, created_at, property_id")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: leads, error } = await query;

  const propertyIds = Array.from(
    new Set((leads ?? []).map((lead: LeadRow) => lead.property_id).filter(Boolean)),
  ) as string[];

  let propertyTitles = new Map<string, string>();
  if (propertyIds.length > 0) {
    const { data: properties } = await supabase
      .from("properties")
      .select("id, title")
      .in("id", propertyIds);
    propertyTitles = new Map(
      (properties ?? []).map((p: { id: string; title: string }) => [
        p.id,
        p.title,
      ]),
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Leads
        </h1>
      </div>

      <form
        method="get"
        className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border border-black/10 p-4 dark:border-white/10"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-xs text-foreground/60">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="w-48 rounded-md border border-black/10 bg-background px-3 py-2 text-sm dark:border-white/10"
          >
            <option value="">Any</option>
            {LEAD_STATUSES.map((value) => (
              <option key={value} value={value}>
                {formatLeadLabel(value)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Apply filter
        </button>

        {status && (
          <Link
            href="/admin/leads"
            className="text-sm text-foreground/60 hover:text-foreground"
          >
            Clear filter
          </Link>
        )}
      </form>

      {error && (
        <p className="mt-6 text-red-600 dark:text-red-400">{error.message}</p>
      )}

      {!error && leads?.length === 0 && (
        <p className="mt-6 text-foreground/60">No leads found.</p>
      )}

      {!error && leads && leads.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/10 text-xs uppercase tracking-wide text-foreground/50 dark:border-white/10">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead: LeadRow) => (
                <LeadTableRow
                  key={lead.id}
                  lead={lead}
                  propertyTitle={
                    lead.property_id
                      ? (propertyTitles.get(lead.property_id) ?? null)
                      : null
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
