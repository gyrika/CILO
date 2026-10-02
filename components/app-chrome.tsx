"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The CRM has its own navigation. Keeping the marketing-site header and
  // footer out of it leaves useful room for leads and forms on a phone.
  if (pathname.startsWith("/admin")) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
