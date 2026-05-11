import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/utils/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { CatchEditForm } from "@/components/forms/CatchEditForm";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("catches.editTitle") };
}

export default async function EditCatchPage({
  params,
}: {
  params: { id: string; catchId: string };
}) {
  const t = await getTranslations();
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
        title={t("catches.editTitle")}
        description={
          trips?.name
            ? t("catches.tripLabel", { name: trips.name })
            : undefined
        }
      />
      <div className="mx-auto max-w-2xl">
        <CatchEditForm existing={catchRow} />
      </div>
    </>
  );
}
