import { PageHeader } from "@/components/layout/PageHeader";
import { TripStepper } from "@/components/forms/TripStepper";

export const metadata = { title: "Nowy wyjazd" };

export default function NewTripPage() {
  return (
    <>
      <PageHeader
        title="Nowy wyjazd"
        description="Zarejestruj swój kolejny wypad nad wodę."
      />
      <div className="mx-auto max-w-2xl">
        <TripStepper />
      </div>
    </>
  );
}
