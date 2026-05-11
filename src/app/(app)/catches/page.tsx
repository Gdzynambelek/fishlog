import { getTranslations } from "next-intl/server";
import { Fish } from "lucide-react";
import { listCatchesForUser, type CatchSort } from "@/lib/queries/catches";
import { PageHeader } from "@/components/layout/PageHeader";
import { CatchesFilters } from "@/components/catches/CatchesFilters";
import { InfiniteCatches } from "@/components/catches/InfiniteCatches";
import { EmptyState } from "@/components/ui/empty-state";

export async function generateMetadata() {
  const t = await getTranslations();
  return { title: t("catches.title") };
}

interface PageProps {
  searchParams: {
    species?: string | string[];
    from?: string;
    to?: string;
    minw?: string;
    photo?: string;
    sort?: string;
    dir?: string;
  };
}

export default async function CatchesPage({ searchParams }: PageProps) {
  const t = await getTranslations();
  const sort = isSort(searchParams.sort) ? searchParams.sort : "caught_at";
  const ascending = searchParams.dir === "asc";
  const species = toArray(searchParams.species);
  const minWeight = searchParams.minw ? Number(searchParams.minw) : undefined;

  const { items, hasMore } = await listCatchesForUser(0, sort, ascending, {
    species: species.length > 0 ? species : undefined,
    fromDate: searchParams.from || undefined,
    toDate: searchParams.to || undefined,
    minWeight: Number.isFinite(minWeight) ? minWeight : undefined,
    withPhotoOnly: searchParams.photo === "1",
  });

  return (
    <>
      <PageHeader
        title={t("catches.title")}
        description={t("catches.description")}
      />
      <div className="mb-6">
        <CatchesFilters />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Fish}
          title={t("catches.emptyTitle")}
          description={t("catches.emptyDescription")}
        />
      ) : (
        <InfiniteCatches initial={items} initialHasMore={hasMore} />
      )}
    </>
  );
}

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function isSort(v: unknown): v is CatchSort {
  return v === "caught_at" || v === "weight_kg" || v === "length_cm";
}
