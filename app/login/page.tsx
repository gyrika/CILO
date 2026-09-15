import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-foreground/70">
        Sign in to access the admin panel.
      </p>
      <LoginForm />
    </div>
  );
}
