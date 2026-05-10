import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Single stat tile used on dashboard / profile. Numeric value + label,
 * optional icon. Designed to fit a 2-column mobile grid or 4-column desktop.
 */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-1 rounded-2xl border-border/70 bg-card p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
        {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
      </div>
      <p className="text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </Card>
  );
}
