import { notFound } from "next/navigation";
import { getTripById } from "@/lib/queries/trips";
import { PageHeader } from "@/components/layout/PageHeader";
import { TripEditForm } from "@/components/forms/TripEditForm";

export const metadata = { title: "Edycja wyjazdu" };

export default async function EditTripPage({
  params,
}: {
  params: { id: string };
}) {
  const trip = await getTripById(params.id);
  if (!trip) notFound();

  return (
    <>
      <PageHeader
        title="Edytuj wyjazd"
        description={`Aktualizuj informacje o wyjeździe „${trip.name}".`}
      />
      <div className="mx-auto max-w-2xl">
        <TripEditForm trip={trip} />
      </div>
    </>
  );
}
