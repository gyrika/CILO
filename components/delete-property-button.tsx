"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProperty } from "@/app/admin/properties/actions";

export function DeletePropertyButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) {
          return;
        }
        startTransition(async () => {
          try {
            await deleteProperty(id);
            router.refresh();
          } catch (err) {
            window.alert(
              err instanceof Error ? err.message : "Failed to delete property.",
            );
          }
        });
      }}
      className="text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
