"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type InquiryFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

async function getClientIp(): Promise<string> {
  const headerList = await headers();
  // Vercel (and most proxies) set x-forwarded-for as a comma-separated list
  // of "client, proxy1, proxy2, ...". The first entry is the original client.
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return headerList.get("x-real-ip") ?? "unknown";
}

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
    console.error(
      "[submitInquiry] check_inquiry_rate_limit RPC failed:",
      JSON.stringify(rateLimitError, null, 2),
      rateLimitError,
    );
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
