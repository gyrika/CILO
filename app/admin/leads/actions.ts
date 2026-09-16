"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type LeadFormState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function updateLead(
  id: string,
  _prevState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const status = formData.get("status") as string;
  const notes = (formData.get("notes") as string | null)?.trim() || null;
  const nextFollowUp =
    (formData.get("next_follow_up") as string | null) || null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({
      status,
      notes,
      next_follow_up: nextFollowUp,
    })
    .eq("id", id);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  return { status: "success" };
}
