import { logout } from "./actions";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Welcome to the Cilo admin panel
      </h1>

      <form action={logout} className="mt-8">
        <button
          type="submit"
          className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-foreground dark:border-white/10"
        >
          Log out
        </button>
      </form>
    </div>
  );
}
