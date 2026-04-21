import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { admin as adminApi } from "@/services/api";
import type { AdminStatsTrendPoint } from "@/types/adminStats";

const RANGE_OPTIONS = [
  { days: 7, label: "7 أيام" },
  { days: 30, label: "30 يوم" },
  { days: 90, label: "90 يوم" },
] as const;

const chartConfig: ChartConfig = {
  submitted: { label: "مقدّمة", color: "hsl(var(--primary))" },
  completed: { label: "مكتملة", color: "hsl(var(--success))" },
};

function formatDayLabel(iso: string) {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
}

interface Props {
  fetchTrends?: (days: number) => Promise<AdminStatsTrendPoint[]>;
}

export function RequestsTrendChart({ fetchTrends }: Props = {}) {
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<AdminStatsTrendPoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetcher = fetchTrends ?? adminApi.statsTrends;

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    fetcher(days)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "فشل تحميل البيانات");
      });
    return () => {
      cancelled = true;
    };
  }, [days, fetcher]);

  const hasActivity = useMemo(
    () => (data ?? []).some((d) => d.submitted > 0 || d.completed > 0),
    [data],
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-5 text-primary" />
            حركة الطلبات خلال الفترة
          </CardTitle>
          <CardDescription>مقارنة الطلبات المقدّمة والمكتملة يومياً</CardDescription>
        </div>
        <div className="flex gap-1 rounded-md border border-border/60 p-0.5">
          {RANGE_OPTIONS.map((opt) => (
            <Button
              key={opt.days}
              type="button"
              size="sm"
              variant={days === opt.days ? "default" : "ghost"}
              className="h-7 px-3 text-xs"
              onClick={() => setDays(opt.days)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <EmptyState icon={TrendingUp} title="تعذر تحميل البيانات" description={error} />
        ) : data === null ? (
          <Skeleton className="h-[280px] w-full" />
        ) : !hasActivity ? (
          <EmptyState icon={TrendingUp} title="لا توجد حركة في هذه الفترة" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <AreaChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 4 }}>
              <defs>
                <linearGradient id="fillSubmitted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-submitted)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--color-submitted)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-completed)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--color-completed)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                reversed
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={formatDayLabel}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                orientation="right"
                width={28}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent labelFormatter={(v) => String(v)} />}
              />
              <Area
                type="monotone"
                dataKey="submitted"
                stroke="var(--color-submitted)"
                fill="url(#fillSubmitted)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="var(--color-completed)"
                fill="url(#fillCompleted)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
