import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { formatLeadLabel } from "@/lib/leads";
import { LeadEditForm } from "@/components/lead-edit-form";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lead, error } = await supabase
    .from("leads")
    .select(
      "id, name, email, phone, message, source, status, notes, next_follow_up, created_at, property_id",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[LeadDetailPage] Failed to load lead:", error.message);
  }

  if (error || !lead) {
    notFound();
  }

  let property: { id: string; title: string; slug: string } | null = null;
  if (lead.property_id) {
    const { data: propertyData } = await supabase
      .from("properties")
      .select("id, title, slug")
      .eq("id", lead.property_id)
      .maybeSingle();
    property = propertyData ?? null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/admin/leads"
        className="text-sm text-foreground/60 hover:text-foreground"
      >
        ← Back to leads
      </Link>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
        {lead.name}
      </h1>
      <p className="mt-1 text-sm text-foreground/60">
        Submitted {formatDate(lead.created_at)}
      </p>

      <dl className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-black/10 p-4 sm:grid-cols-2 dark:border-white/10">
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Email
          </dt>
          <dd className="mt-1 text-foreground">{lead.email ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Phone
          </dt>
          <dd className="mt-1 text-foreground">{lead.phone ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Source
          </dt>
          <dd className="mt-1 text-foreground">
            {lead.source ? formatLeadLabel(lead.source) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Property
          </dt>
          <dd className="mt-1 text-foreground">
            {property ? (
              <Link
                href={`/admin/properties/${property.id}/edit`}
                className="hover:underline"
              >
                {property.title}
              </Link>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Message
          </dt>
          <dd className="mt-1 whitespace-pre-line text-foreground">
            {lead.message ?? "—"}
          </dd>
        </div>
      </dl>

      <h2 className="mt-8 text-lg font-medium text-foreground">
        Manage this lead
      </h2>
      <LeadEditForm
        lead={{
          id: lead.id,
          status: lead.status,
          notes: lead.notes,
          next_follow_up: lead.next_follow_up,
        }}
      />
    </div>
  );
}
