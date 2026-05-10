import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { CatchEditForm } from "@/components/forms/CatchEditForm";

export const metadata = { title: "Edycja połowu" };

export default async function EditCatchPage({
  params,
}: {
  params: { id: string; catchId: string };
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("catches")
    .select("*, trips(name)")
    .eq("id", params.catchId)
    .eq("trip_id", params.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) notFound();

  const { trips, ...catchRow } = data as typeof data & {
    trips?: { name: string } | null;
  };

  return (
    <>
      <PageHeader
        title="Edytuj połów"
        description={
          trips?.name ? `Wyjazd: ${trips.name}` : "Aktualizuj informacje."
        }
      />
      <div className="mx-auto max-w-2xl">
        <CatchEditForm existing={catchRow} />
      </div>
    </>
  );
}
