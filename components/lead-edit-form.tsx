"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { updateLead, type LeadFormState } from "@/app/admin/leads/actions";
import { LEAD_STATUSES, formatLeadLabel } from "@/lib/leads";

const initialState: LeadFormState = { status: "idle" };

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save changes"}
    </button>
  );
}

export function LeadEditForm({
  lead,
}: {
  lead: {
    id: string;
    status: string;
    notes: string | null;
    next_follow_up: string | null;
  };
}) {
  const action = updateLead.bind(null, lead.id);
  const [state, formAction] = useActionState(action, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      router.push("/admin/leads");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="mt-4 space-y-4 rounded-xl border border-black/10 p-4 dark:border-white/10"
    >
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-foreground">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={lead.status}
          className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-foreground dark:border-white/10"
        >
          {LEAD_STATUSES.map((value) => (
            <option key={value} value={value}>
              {formatLeadLabel(value)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="next_follow_up"
          className="block text-sm font-medium text-foreground"
        >
          Next follow-up date
        </label>
        <input
          id="next_follow_up"
          name="next_follow_up"
          type="date"
          defaultValue={lead.next_follow_up ?? ""}
          className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-foreground dark:border-white/10"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-foreground">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={5}
          defaultValue={lead.notes ?? ""}
          placeholder="Internal notes about this lead..."
          className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-foreground dark:border-white/10"
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}

      <SaveButton />
    </form>
  );
}
