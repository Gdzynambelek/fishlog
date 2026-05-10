"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Error boundary for all authenticated pages. Logs to console for now
 * (swap for Sentry / similar in production).
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md space-y-3 p-6 text-center">
        <h2 className="text-lg font-semibold">Coś poszło nie tak</h2>
        <p className="text-sm text-muted-foreground">
          Nie udało się załadować tej strony. Spróbuj ponownie.
        </p>
        {error.digest ? (
          <p className="font-mono text-xs text-muted-foreground/60">
            #{error.digest}
          </p>
        ) : null}
        <Button onClick={reset} className="mt-2">
          <RefreshCw className="mr-1.5 h-4 w-4" />
          Spróbuj ponownie
        </Button>
      </Card>
    </div>
  );
}
