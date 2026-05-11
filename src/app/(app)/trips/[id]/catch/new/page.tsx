import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getTripById } from "@/lib/queries/trips";
import { PageHeader } from "@/components/layout/PageHeader";
import { CatchForm } from "@/components/forms/CatchForm";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("catches.newTitle") };
}

export default async function NewCatchPage({
  params,
}: {
  params: { id: string };
}) {
  const t = await getTranslations();
  const trip = await getTripById(params.id);
  if (!trip) notFound();

  return (
    <>
      <PageHeader
        title={t("catches.newTitle")}
        description={t("catches.newDescription", { name: trip.name })}
      />
      <div className="mx-auto max-w-2xl">
        <CatchForm tripId={trip.id} />
      </div>
    </>
  );
}
