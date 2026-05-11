"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { SpeciesRankItem } from "@/lib/stats";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(168 30% 35%)",
  "hsl(41 60% 50%)",
  "hsl(195 35% 55%)",
];
const OTHER_COLOR = "hsl(var(--muted))";

const TOP_N = 8;

const OTHER_LABEL_BY_LOCALE: Record<string, string> = {
  pl: "Inne",
  en: "Other",
  de: "Andere",
};

export function SpeciesPieChart({ items }: { items: SpeciesRankItem[] }) {
  const t = useTranslations();
  const locale = useLocale();
  if (items.length === 0) return null;

  const otherLabel = OTHER_LABEL_BY_LOCALE[locale] ?? "Other";
  const top = items.slice(0, TOP_N);
  const rest = items.slice(TOP_N);
  const data = [
    ...top.map((it) => ({ name: it.species, value: it.count })),
    ...(rest.length > 0
      ? [
          {
            name: otherLabel,
            value: rest.reduce((sum, it) => sum + it.count, 0),
          },
        ]
      : []),
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={45}
            paddingAngle={2}
          >
            {data.map((entry, idx) => (
              <Cell
                key={entry.name}
                fill={
                  entry.name === otherLabel
                    ? OTHER_COLOR
                    : (COLORS[idx % COLORS.length] ?? OTHER_COLOR)
                }
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => {
              const n = typeof value === "number" ? value : Number(value);
              return [`${n} ${pluralFish(n, t)}`, String(name)];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
            iconType="circle"
            formatter={(value: string) => (
              <span className="text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function pluralFish(n: number, t: (key: string) => string): string {
  if (n === 1) return t("common.fish_one");
  if (n < 5) return t("common.fish_few");
  return t("common.fish_many");
}
