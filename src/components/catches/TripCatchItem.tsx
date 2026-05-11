"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Edit, Fish, Loader2, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { deleteCatchPhotoByUrl } from "@/lib/storage";
import { formatDateTime, formatLength, formatWeight } from "@/lib/format";
import type { Catch } from "@/types/database.types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function TripCatchItem({
  item,
  tripId,
}: {
  item: Catch;
  tripId: string;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    setDeleting(true);
    const photoUrl = item.photo_url;
    const { error } = await supabase
      .from("catches")
      .delete()
      .eq("id", item.id);
    if (error) {
      setDeleting(false);
      toast.error(t("catches.deleteFailed"), { description: error.message });
      return;
    }
    if (photoUrl) await deleteCatchPhotoByUrl(photoUrl);
    setDeleting(false);
    setConfirmOpen(false);
    toast.success(t("catches.deleted"));
    router.refresh();
  }

  return (
    <>
      <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-border/70">
        <div className="relative aspect-video w-full bg-muted">
          {item.photo_url ? (
            <Image
              src={item.photo_url}
              alt={item.species}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground/70">
              <Fish className="h-10 w-10" aria-hidden />
            </div>
          )}
          {item.released ? (
            <Badge
              variant="secondary"
              className="absolute right-2 top-2 bg-background/90 backdrop-blur"
            >
              {t("catches.released")}
            </Badge>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-2 h-8 w-8 bg-background/90 backdrop-blur"
                aria-label={t("common.moreActions")}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link
                  href={`/trips/${tripId}/catch/${item.id}/edit`}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {t("common.edit")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setConfirmOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="truncate text-base font-semibold">{item.species}</h3>
            <span className="shrink-0 text-sm font-semibold tabular-nums">
              {formatWeight(item.weight_kg)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatLength(item.length_cm)}</span>
            <time dateTime={item.caught_at}>
              {formatDateTime(item.caught_at, locale)}
            </time>
          </div>
          {item.notes ? (
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
              {item.notes}
            </p>
          ) : null}
        </div>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("catches.deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("catches.deleteDescription", { species: item.species })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-1.5 h-4 w-4" />
              )}
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
