import { PropertyForm } from "@/components/property-form";

export default function NewPropertyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        New Property
      </h1>
      <PropertyForm />
    </div>
  );
}
