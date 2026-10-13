import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { AppChrome } from "@/components/app-chrome";
import { RegisterServiceWorker } from "@/components/register-service-worker";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/site-info";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const defaultMetadata = pageMetadata({
  title: `${SITE_NAME} | Real Estate in Sri Lanka`,
  description:
    "Cilo is a real estate agency in Sri Lanka. Browse apartments, houses, land and commercial properties for sale and rent.",
  path: "/",
});

export const metadata: Metadata = {
  ...defaultMetadata,
  metadataBase: new URL(SITE_URL),
  // Pages set a short title like "Properties"; this appends the brand.
  title: {
    default: `${SITE_NAME} | Real Estate in Sri Lanka`,
    template: `%s | ${SITE_NAME}`,
  },
  // Each page sets its own canonical URL; don't let them all inherit "/".
  alternates: undefined,
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Cilo Admin",
    statusBarStyle: "black-translucent",
  },
  other: {
    // Older iOS Safari versions only honor the apple-prefixed tag;
    // Next's `appleWebApp.capable` alone only emits the newer
    // "mobile-web-app-capable" one, so add this explicitly too.
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <RegisterServiceWorker />
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
