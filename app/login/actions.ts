"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClientIp } from "@/lib/client-ip";

export type LoginFormState = {
  status: "idle" | "error";
  message?: string;
};

export async function login(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = (formData.get("email") as string | null)?.trim();
  const password = formData.get("password") as string | null;

  if (!email || !password) {
    return {
      status: "error",
      message: "Please enter your email and password.",
    };
  }

  const supabase = await createClient();
  const ip = await getClientIp();

  const { data: allowed, error: rateLimitError } = await supabase.rpc(
    "check_login_rate_limit",
    { p_ip: ip },
  );

  // Fail open on a rate-limit check error (e.g. the migration hasn't been
  // applied yet): unlike the public inquiry form, this is the admin's own
  // sign-in page, and locking every admin out because of an infrastructure
  // hiccup is worse than temporarily running without brute-force protection.
  if (!rateLimitError && allowed === false) {
    return {
      status: "error",
      message: "Too many failed attempts, please try again later.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    await supabase.rpc("record_login_failure", { p_ip: ip });
    return { status: "error", message: "Invalid email or password." };
  }

  redirect("/admin");
}
