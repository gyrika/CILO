import Link from "next/link";
import { InstallAppButton } from "@/components/install-app-button";

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
    <div>
      <div className="border-b border-black/10 dark:border-white/10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 text-sm sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {ADMIN_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground/70 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <InstallAppButton />
        </nav>
      </div>
      {children}
    </div>
  );
}
