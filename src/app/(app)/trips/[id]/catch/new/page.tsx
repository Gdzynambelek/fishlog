import { notFound } from "next/navigation";
import { getTripById } from "@/lib/queries/trips";
import { PageHeader } from "@/components/layout/PageHeader";
import { CatchForm } from "@/components/forms/CatchForm";

export const metadata = { title: "Nowy połów" };

export default async function NewCatchPage({
  params,
}: {
  params: { id: string };
}) {
  const trip = await getTripById(params.id);
  if (!trip) notFound();

  return (
    <>
      <PageHeader
        title="Dodaj połów"
        description={`Wyjazd: ${trip.name}`}
      />
      <div className="mx-auto max-w-2xl">
        <CatchForm tripId={trip.id} />
      </div>
    </>
  );
}
