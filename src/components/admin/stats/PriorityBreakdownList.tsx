import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import type { AdminPriorityBreakdown } from "@/types/adminStats";

interface Props {
  data: AdminPriorityBreakdown[];
  total: number;
}

export function PriorityBreakdownList({ data, total }: Props) {
  const safeTotal = total > 0 ? total : 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="size-5 text-danger" />
          توزيع الأولويات
        </CardTitle>
        <CardDescription>نسبة كل أولوية من إجمالي الطلبات</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState title="لا توجد بيانات أولويات" />
        ) : (
          <div className="space-y-4">
            {data.map((p) => {
              const pct = Math.round((p.count / safeTotal) * 100);
              return (
                <div key={p.key} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block size-2.5 rounded-full"
                        style={{ backgroundColor: p.color }}
                        aria-hidden
                      />
                      <span className="text-sm font-medium">{p.labelAr}</span>
                      <Badge variant="outline" className="text-xs">
                        {p.count}
                      </Badge>
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {pct}%
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
