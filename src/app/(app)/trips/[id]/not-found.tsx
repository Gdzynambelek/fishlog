import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function TripNotFound() {
  const t = await getTranslations();
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md space-y-3 p-6 text-center">
        <h2 className="text-lg font-semibold">{t("trips.notFoundTitle")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("trips.notFoundDescription")}
        </p>
        <Button asChild className="mt-2">
          <Link href="/trips">{t("trips.backToList")}</Link>
        </Button>
      </Card>
    </div>
  );
}
