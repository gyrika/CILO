"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type LoginFormState } from "@/app/login/actions";

const initialState: LoginFormState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <form
      action={formAction}
      className="mt-8 space-y-4 rounded-xl border border-border p-6"
    >
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-foreground"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-foreground"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-foreground"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-foreground"
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}

      <SubmitButton />
    </form>
  );
}
