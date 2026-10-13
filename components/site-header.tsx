"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_NAME } from "@/lib/site-info";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label={`${SITE_NAME} home`}>
          {/* logo-header.png is public/logo.png cropped to its lettering so
              it stays legible at navbar height. width/height are its real
              pixel size (~3.4x the displayed size, so crisp on retina). */}
          <Image
            src="/logo-header.png"
            alt={SITE_NAME}
            width={353}
            height={137}
            priority
            className="h-8 w-auto rounded-sm sm:h-10"
          />
        </Link>
        <nav className="flex gap-4 text-sm font-medium text-foreground/70 sm:gap-6">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "text-accent underline decoration-2 underline-offset-8"
                    : "hover:text-foreground"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
