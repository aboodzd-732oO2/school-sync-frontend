import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Warehouse as WarehouseIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { EmptyState } from "@/components/common/EmptyState";
import type { AdminWarehouseBreakdown } from "@/types/adminStats";

interface Props {
  data: AdminWarehouseBreakdown[];
}

const chartConfig: ChartConfig = {
  count: { label: "الطلبات", color: "hsl(var(--primary))" },
};

function shorten(name: string, max = 14) {
  return name.length > max ? `${name.slice(0, max)}…` : name;
}

export function TopWarehousesChart({ data }: Props) {
  const chartData = useMemo(
    () => data.map((w) => ({ name: shorten(w.name), fullName: w.name, count: w.count })),
    [data],
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <WarehouseIcon className="size-5 text-primary" />
          أعلى 5 مستودعات
        </CardTitle>
        <CardDescription>المستودعات الأكثر استقبالاً للطلبات</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <EmptyState icon={WarehouseIcon} title="لا توجد طلبات" />
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <BarChart data={chartData} margin={{ left: 4, right: 8, top: 8, bottom: 4 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  reversed
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  interval={0}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  orientation="right"
                  width={28}
                />
                <ChartTooltip
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, p) => p?.[0]?.payload?.fullName ?? ""}
                    />
                  }
                />
                <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>

            <div className="mt-4 space-y-1.5">
              {data.map((w, idx) => (
                <div key={w.id} className="flex items-center gap-2 text-xs">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary font-medium tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="flex-1 truncate text-muted-foreground">{w.name}</span>
                  <span className="tabular-nums font-medium">{w.count}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
