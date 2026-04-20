import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type Tone = "default" | "primary" | "success" | "warning" | "danger" | "info" | "tertiary";

const toneStyles: Record<Tone, { bg: string; text: string }> = {
  default: { bg: "bg-gradient-to-br from-muted/80 to-muted/20", text: "text-muted-foreground" },
  primary: { bg: "bg-gradient-to-br from-primary/15 to-primary/[0.03]", text: "text-primary" },
  success: { bg: "bg-gradient-to-br from-success/15 to-success/[0.03]", text: "text-success" },
  warning: { bg: "bg-gradient-to-br from-warning/20 to-warning/[0.03]", text: "text-warning-foreground" },
  danger: { bg: "bg-gradient-to-br from-danger/15 to-danger/[0.03]", text: "text-danger" },
  info: { bg: "bg-gradient-to-br from-info/15 to-info/[0.03]", text: "text-info" },
  tertiary: { bg: "bg-gradient-to-br from-tertiary/15 to-tertiary/[0.03]", text: "text-tertiary" },
};

interface Props {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  hint?: string;
  trend?: { value: number; label?: string };
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  label, value, icon: Icon, tone = "primary", hint, trend, onClick, className,
}: Props) {
  const interactive = !!onClick;
  const styles = toneStyles[tone];

  return (
    <Card
      onClick={onClick}
      className={cn(
        "border-border/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-[box-shadow,transform]",
        interactive && "cursor-pointer",
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-xl",
              styles.bg,
            )}>
              <Icon className={cn("size-7", styles.text)} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-normal text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
            {hint && <p className="mt-1 text-xs text-muted-foreground truncate">{hint}</p>}
            {trend && (
              <p className={cn(
                "mt-1 text-xs font-medium",
                trend.value >= 0 ? "text-success" : "text-danger",
              )}>
                {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label ?? ""}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
