import Image from "next/image";
import { CONTACT_INFO, SITE_NAME } from "@/lib/site-info";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-foreground/60 sm:px-6 lg:px-8">
        <Image
          src="/logo-header.png"
          alt={SITE_NAME}
          width={353}
          height={137}
          className="h-9 w-auto rounded-sm"
        />
        <p className="mt-2">{CONTACT_INFO.phone}</p>
        <p>{CONTACT_INFO.email}</p>
        <p>{CONTACT_INFO.address}</p>
        <p className="mt-4 text-xs">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
