import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { EmptyState } from "@/components/common/EmptyState";
import { getDepartmentIcon } from "@/lib/departmentIcons";
import type { AdminDepartmentBreakdown } from "@/types/adminStats";

interface Props {
  data: AdminDepartmentBreakdown[];
}

export function RequestsByDepartmentChart({ data }: Props) {
  const { chartData, config } = useMemo(() => {
    const items = data.map((d) => ({
      name: d.labelAr,
      key: d.key,
      count: d.count,
      fill: d.color || "hsl(var(--primary))",
    }));
    const cfg: ChartConfig = {
      count: { label: "الطلبات" },
    };
    return { chartData: items, config: cfg };
  }, [data]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="size-5 text-primary" />
          الطلبات حسب القسم
        </CardTitle>
        <CardDescription>عدد الطلبات لكل قسم</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <EmptyState icon={Building2} title="لا توجد طلبات" />
        ) : (
          <>
            <ChartContainer config={config} className="h-[240px] w-full">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 8, right: 8, top: 4, bottom: 4 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" reversed allowDecimals={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  hide
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[6, 0, 0, 6]} />
              </BarChart>
            </ChartContainer>

            <div className="mt-4 space-y-2 border-t border-border/50 pt-3">
              {data.slice(0, 5).map((d) => {
                const Icon = getDepartmentIcon(d.icon);
                return (
                  <div key={d.key} className="flex items-center gap-2.5 text-sm">
                    <span
                      className="inline-block size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: d.color }}
                      aria-hidden
                    />
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">{d.labelAr}</span>
                    <span className="tabular-nums font-semibold">{d.count}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
