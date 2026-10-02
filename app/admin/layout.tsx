import Link from "next/link";
import { InstallAppButton } from "@/components/install-app-button";
import { logout } from "./actions";

const ADMIN_NAV_LINKS = [
  { href: "/admin/properties", label: "Properties" },
  { href: "/admin/leads", label: "Leads" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-background/95 backdrop-blur dark:border-white/10">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-14 items-center justify-between gap-3">
            <Link
              href="/admin"
              className="text-base font-semibold tracking-tight text-foreground"
            >
              Cilo <span className="text-foreground/60">Admin</span>
            </Link>
            <div className="flex items-center gap-1">
              <InstallAppButton />
              <form action={logout}>
                <button
                  type="submit"
                  className="min-h-11 rounded-lg px-3 text-sm font-medium text-foreground/70 hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                >
                  Log out
                </button>
              </form>
            </div>
          </div>
          <div className="-mx-1 grid grid-cols-2 gap-1 pb-2 sm:mx-0 sm:flex sm:gap-2 sm:pb-3">
            {ADMIN_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-medium text-foreground/70 hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5 sm:min-h-0"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      {children}
    </div>
  );
}
