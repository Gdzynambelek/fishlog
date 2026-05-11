"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md space-y-3 p-6 text-center">
        <h2 className="text-lg font-semibold">{t("errors.title")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("errors.description")}
        </p>
        {error.digest ? (
          <p className="font-mono text-xs text-muted-foreground/60">
            #{error.digest}
          </p>
        ) : null}
        <Button onClick={reset} className="mt-2">
          <RefreshCw className="mr-1.5 h-4 w-4" />
          {t("common.tryAgain")}
        </Button>
      </Card>
    </div>
  );
}
