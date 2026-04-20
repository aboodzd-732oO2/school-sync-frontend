import { useMemo } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { EmptyState } from "@/components/common/EmptyState";
import { STATUS_CONFIG } from "@/lib/statusConfig";
import type { AdminStatusBreakdown, AdminStatusKey } from "@/types/adminStats";
import { STATUS_KEY_TO_UI } from "@/types/adminStats";

interface Props {
  data: AdminStatusBreakdown;
  total: number;
}

export function StatusDistributionChart({ data, total }: Props) {
  const { entries, config } = useMemo(() => {
    const keys = Object.keys(data) as AdminStatusKey[];
    const items = keys
      .map((k) => {
        const uiKey = STATUS_KEY_TO_UI[k];
        const cfg = STATUS_CONFIG[uiKey];
        return {
          key: k,
          uiKey,
          label: cfg?.label ?? k,
          color: cfg?.hexColor ?? "#6b7280",
          value: data[k],
        };
      })
      .filter((item) => item.value > 0);

    const cfg: ChartConfig = Object.fromEntries(
      items.map((i) => [i.key, { label: i.label, color: i.color }]),
    );

    return { entries: items, config: cfg };
  }, [data]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PieIcon className="size-5 text-primary" />
          توزيع حالات الطلبات
        </CardTitle>
        <CardDescription>
          الإجمالي: <span className="tabular-nums font-medium text-foreground">{total}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <EmptyState icon={PieIcon} title="لا توجد طلبات بعد" />
        ) : (
          <ChartContainer config={config} className="mx-auto aspect-square max-h-[280px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={entries}
                dataKey="value"
                nameKey="label"
                innerRadius={60}
                outerRadius={100}
                strokeWidth={2}
              >
                {entries.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        )}

        {entries.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            {entries.map((e) => (
              <div key={e.key} className="flex items-center gap-2">
                <span
                  className="inline-block size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: e.color }}
                  aria-hidden
                />
                <span className="flex-1 truncate text-muted-foreground">{e.label}</span>
                <span className="tabular-nums font-medium">{e.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
