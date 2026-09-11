import { SITE_NAME } from "@/lib/site-info";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        About {SITE_NAME}
      </h1>
      <p className="mt-4 text-foreground/70">
        {SITE_NAME} is a real estate agency based in Sri Lanka, helping
        people find houses, apartments, land, and commercial properties to
        buy or rent.
      </p>
      <p className="mt-4 text-foreground/70">
        This is placeholder copy — the real story of {SITE_NAME} will go
        here soon.
      </p>
    </div>
  );
}
