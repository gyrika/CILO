import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-foreground/70">
        Sign in to access the admin panel.
      </p>
      <LoginForm />
    </div>
  );
}
