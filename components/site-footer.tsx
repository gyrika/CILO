import { CONTACT_INFO, SITE_NAME } from "@/lib/site-info";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-foreground/60 sm:px-6 lg:px-8">
        <p className="font-medium text-foreground">{SITE_NAME}</p>
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
