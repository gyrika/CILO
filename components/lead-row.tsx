"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/format";
import { formatLeadLabel, leadStatusClass } from "@/lib/leads";

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

export function LeadTableRow({
  lead,
  propertyTitle,
}: {
  lead: LeadRow;
  propertyTitle: string | null;
}) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(`/admin/leads/${lead.id}`)}
      className="cursor-pointer border-b border-black/5 last:border-0 hover:bg-black/[0.02] dark:border-white/5 dark:hover:bg-white/[0.02]"
    >
      <td className="px-4 py-3 font-medium text-foreground">
        <Link
          href={`/admin/leads/${lead.id}`}
          onClick={(event) => event.stopPropagation()}
          className="hover:underline"
        >
          {lead.name}
        </Link>
      </td>
      <td className="px-4 py-3 text-foreground/70">{lead.email ?? "—"}</td>
      <td className="px-4 py-3 text-foreground/70">{lead.phone ?? "—"}</td>
      <td className="px-4 py-3 text-foreground/70">
        {lead.property_id ? (
          <div className="flex items-center gap-2">
            <span>{propertyTitle ?? "Untitled"}</span>
            <Link
              href={`/admin/properties/${lead.property_id}/edit`}
              onClick={(event) => event.stopPropagation()}
              className="text-xs text-foreground/50 hover:text-foreground hover:underline"
            >
              View property
            </Link>
          </div>
        ) : (
          "—"
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${leadStatusClass(lead.status)}`}
        >
          {formatLeadLabel(lead.status)}
        </span>
      </td>
      <td className="px-4 py-3 text-foreground/70">
        {lead.source ? formatLeadLabel(lead.source) : "—"}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-foreground/70">
        {formatDate(lead.created_at)}
      </td>
    </tr>
  );
}
