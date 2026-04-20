import { School } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import type { AdminInstitutionBreakdown } from "@/types/adminStats";

interface Props {
  data: AdminInstitutionBreakdown[];
}

export function TopInstitutionsList({ data }: Props) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <School className="size-5 text-primary" />
          أعلى 5 مؤسسات
        </CardTitle>
        <CardDescription>المؤسسات الأكثر نشاطاً في تقديم الطلبات</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState icon={School} title="لا توجد طلبات" />
        ) : (
          <div className="space-y-3">
            {data.map((inst, idx) => {
              const pct = Math.round((inst.count / max) * 100);
              return (
                <div key={inst.id} className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="flex-1 truncate font-medium">{inst.name}</span>
                    <span className="tabular-nums text-muted-foreground">{inst.count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
