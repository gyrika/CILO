import { CONTACT_INFO, SITE_NAME } from "@/lib/site-info";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Contact {SITE_NAME}
      </h1>
      <p className="mt-4 text-foreground/70">
        Get in touch with our team — we&apos;re happy to help you find your
        next property.
      </p>

      <dl className="mt-8 space-y-4 text-foreground">
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Phone
          </dt>
          <dd className="mt-1">{CONTACT_INFO.phone}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Email
          </dt>
          <dd className="mt-1">{CONTACT_INFO.email}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/50">
            Address
          </dt>
          <dd className="mt-1">{CONTACT_INFO.address}</dd>
        </div>
      </dl>

      <p className="mt-8 rounded-xl border border-black/10 bg-black/5 p-4 text-sm text-foreground/60 dark:border-white/10 dark:bg-white/5">
        A contact form will be added here soon — for now, please reach out
        using the details above.
      </p>
    </div>
  );
}
