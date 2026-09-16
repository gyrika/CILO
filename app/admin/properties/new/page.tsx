import { PropertyForm } from "@/components/property-form";

export default function NewPropertyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        New Property
      </h1>
      <PropertyForm />
    </div>
  );
}
