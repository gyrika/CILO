"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { status: "error", message: "Invalid email or password." };
  }

  redirect("/admin");
}
