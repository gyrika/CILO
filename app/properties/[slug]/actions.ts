"use server";

import { createClient } from "@/lib/supabase/server";
import { getClientIp } from "@/lib/client-ip";

export type InquiryFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function submitInquiry(
  propertyId: string,
  _prevState: InquiryFormState,
  formData: FormData,
): Promise<InquiryFormState> {
  // Honeypot: real visitors never see or fill this field. If it's filled,
  // the submission came from a bot — pretend it worked and drop it.
  if (formData.get("hp_field")) {
    return { status: "success" };
  }

  const supabase = await createClient();
  const ip = await getClientIp();

  const { data: allowed, error: rateLimitError } = await supabase.rpc(
    "check_inquiry_rate_limit",
    { p_ip: ip },
  );

  if (rateLimitError) {
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }

  if (!allowed) {
    return {
      status: "error",
      message: "Too many submissions, please try again later.",
    };
  }

  const name = (formData.get("name") as string | null)?.trim();
  const email = (formData.get("email") as string | null)?.trim();
  const phone = (formData.get("phone") as string | null)?.trim();
  const message = (formData.get("message") as string | null)?.trim();

  if (!name) {
    return { status: "error", message: "Please enter your name." };
  }

  const { error } = await supabase.from("leads").insert({
    property_id: propertyId,
    source: "website_form",
    name,
    email: email || null,
    phone: phone || null,
    message: message || null,
  });

  if (error) {
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }

  return { status: "success" };
}
