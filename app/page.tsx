import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("properties").select("*");

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <main className="flex flex-col gap-4 text-center font-mono">
        {error ? (
          <p className="text-red-600">{error.message}</p>
        ) : (
          <>
            <p>Supabase connected successfully</p>
            <p>Rows in &quot;properties&quot;: {data?.length ?? 0}</p>
          </>
        )}
      </main>
    </div>
  );
}
