import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getTripById } from "@/lib/queries/trips";
import { PageHeader } from "@/components/layout/PageHeader";
import { TripEditForm } from "@/components/forms/TripEditForm";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("trips.editTitle") };
}

export default async function EditTripPage({
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
        title={t("trips.editTitle")}
        description={t("trips.editDescription", { name: trip.name })}
      />
      <div className="mx-auto max-w-2xl">
        <TripEditForm trip={trip} />
      </div>
    </>
  );
}
