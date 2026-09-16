import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { DeletePropertyButton } from "@/components/delete-property-button";

export default async function AdminPropertiesPage() {
  const supabase = await createClient();
  const { data: properties, error } = await supabase
    .from("properties")
    .select("id, title, price, currency, status, city, is_published")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Properties
        </h1>
        <Link
          href="/admin/properties/new"
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          New Property
        </Link>
      </div>

      {error && (
        <p className="mt-6 text-red-600 dark:text-red-400">{error.message}</p>
      )}

      {!error && properties?.length === 0 && (
        <p className="mt-6 text-foreground/60">No properties yet.</p>
      )}

      {!error && properties && properties.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/10 text-xs uppercase tracking-wide text-foreground/50 dark:border-white/10">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Published</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr
                  key={property.id}
                  className="border-b border-black/5 last:border-0 dark:border-white/5"
                >
                  <td className="px-4 py-3 text-foreground">
                    {property.title}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-foreground">
                    {formatPrice(property.price, property.currency)}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {property.status}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {property.city ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        property.is_published
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : "bg-foreground/10 text-foreground/60"
                      }`}
                    >
                      {property.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/properties/${property.id}/edit`}
                        className="text-foreground/70 hover:text-foreground"
                      >
                        Edit
                      </Link>
                      <DeletePropertyButton
                        id={property.id}
                        title={property.title}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
