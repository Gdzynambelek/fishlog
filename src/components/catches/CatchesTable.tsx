"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, Fish } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatLength, formatWeight } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CatchWithTripName } from "@/lib/queries/catches";

type Sort = "caught_at" | "weight_kg" | "length_cm";

export function CatchesTable({ items }: { items: CatchWithTripName[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const sort = (params.get("sort") as Sort) ?? "caught_at";
  const ascending = params.get("dir") === "asc";

  function setSort(next: Sort) {
    const usp = new URLSearchParams(params);
    if (sort === next) {
      usp.set("dir", ascending ? "desc" : "asc");
    } else {
      usp.set("sort", next);
      usp.set("dir", "desc");
    }
    router.replace(`?${usp.toString()}`);
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">{t("catches.sort.photo")}</TableHead>
          <TableHead>{t("catches.table.species")}</TableHead>
          <SortableHead
            label={t("catches.sort.weight")}
            field="weight_kg"
            current={sort}
            ascending={ascending}
            onClick={setSort}
            className="text-right"
          />
          <SortableHead
            label={t("catches.sort.length")}
            field="length_cm"
            current={sort}
            ascending={ascending}
            onClick={setSort}
            className="text-right"
          />
          <SortableHead
            label={t("catches.sort.date")}
            field="caught_at"
            current={sort}
            ascending={ascending}
            onClick={setSort}
          />
          <TableHead>{t("catches.sort.trip")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id} className="hover:bg-muted/50">
            <TableCell>
              <Link href={`/trips/${item.trip_id}`} className="block">
                <div className="relative h-12 w-16 overflow-hidden rounded-md bg-muted">
                  {item.photo_url ? (
                    <Image
                      src={item.photo_url}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-muted-foreground">
                      <Fish className="h-5 w-5" />
                    </span>
                  )}
                </div>
              </Link>
            </TableCell>
            <TableCell className="font-medium">{item.species}</TableCell>
            <TableCell className="text-right tabular-nums">
              {formatWeight(item.weight_kg)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatLength(item.length_cm)}
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {formatDateTime(item.caught_at, locale)}
            </TableCell>
            <TableCell>
              {item.trip_name ? (
                <Link
                  href={`/trips/${item.trip_id}`}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {item.trip_name}
                </Link>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SortableHead({
  label,
  field,
  current,
  ascending,
  onClick,
  className,
}: {
  label: string;
  field: Sort;
  current: Sort;
  ascending: boolean;
  onClick: (s: Sort) => void;
  className?: string;
}) {
  const active = current === field;
  return (
    <TableHead
      className={cn("cursor-pointer select-none", className)}
      aria-sort={active ? (ascending ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={() => onClick(field)}
        className={cn(
          "inline-flex items-center gap-1",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        {active ? (
          ascending ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : null}
      </button>
    </TableHead>
  );
}
