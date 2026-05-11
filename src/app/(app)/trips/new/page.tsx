import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { TripStepper } from "@/components/forms/TripStepper";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("trips.newTitle") };
}

export default async function NewTripPage() {
  const t = await getTranslations();
  return (
    <>
      <PageHeader
        title={t("trips.newTitle")}
        description={t("trips.newDescription")}
      />
      <div className="mx-auto max-w-2xl">
        <TripStepper />
      </div>
    </>
  );
}
