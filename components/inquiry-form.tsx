"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  submitInquiry,
  type InquiryFormState,
} from "@/app/properties/[slug]/actions";

const initialState: InquiryFormState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
    >
      {pending ? "Sending..." : "Send inquiry"}
    </button>
  );
}

export function InquiryForm({ propertyId }: { propertyId: string }) {
  const submitWithProperty = submitInquiry.bind(null, propertyId);
  const [state, formAction] = useActionState(submitWithProperty, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  if (state.status === "success") {
    return (
      <div className="mt-8 rounded-xl border border-black/10 p-6 dark:border-white/10">
        <p className="text-foreground">
          Thanks — your message has been sent. We&apos;ll be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-8 space-y-4 rounded-xl border border-black/10 p-6 dark:border-white/10"
    >
      <h2 className="text-lg font-medium text-foreground">
        Interested in this property?
      </h2>

      {/* Honeypot: only bots that blindly fill every field populate it. Uses
          display:none (browsers skip autofilling truly hidden elements) and
          a name browser autofill won't recognize — "company" matched saved
          autofill data and got filled even with autocomplete="off". */}
      <div style={{ display: "none" }} aria-hidden="true">
        <label htmlFor="hp_field">Leave this field empty</label>
        <input
          type="text"
          id="hp_field"
          name="hp_field"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-foreground"
        >
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-foreground dark:border-white/10"
        />
      </div>

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
          className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-foreground dark:border-white/10"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-foreground"
        >
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-foreground dark:border-white/10"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-foreground"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-foreground dark:border-white/10"
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}

      <SubmitButton />
    </form>
  );
}
