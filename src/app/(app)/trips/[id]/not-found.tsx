import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TripNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md space-y-3 p-6 text-center">
        <h2 className="text-lg font-semibold">Wyjazd nie znaleziony</h2>
        <p className="text-sm text-muted-foreground">
          Ten wyjazd nie istnieje lub nie masz do niego dostępu.
        </p>
        <Button asChild className="mt-2">
          <Link href="/trips">Wróć do listy</Link>
        </Button>
      </Card>
    </div>
  );
}
