import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { AlertTriangle, Package, ArrowLeft, CheckCircle2 } from "lucide-react";
import type { WarehouseCriticalStockItem } from "@/types/warehouseStats";

interface Props {
  items: WarehouseCriticalStockItem[];
  lowStockCount: number;
}

export function CriticalStockCard({ items, lowStockCount }: Props) {
  const severity = (item: WarehouseCriticalStockItem) => {
    if (item.quantity === 0) return { label: "نافد", tone: "bg-danger/15 text-danger border-danger/30" };
    if (item.quantity <= Math.max(1, Math.floor(item.minThreshold / 2))) {
      return { label: "حرج", tone: "bg-danger/10 text-danger border-danger/30" };
    }
    return { label: "منخفض", tone: "bg-warning/15 text-warning-foreground border-warning/30" };
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="size-5 text-danger" />
            تنبيهات المخزون
          </CardTitle>
          <CardDescription>
            {lowStockCount === 0
              ? "كل عناصر المخزون بكميات كافية"
              : `${lowStockCount} عنصر تحت الحد الأدنى`}
          </CardDescription>
        </div>
        <Button asChild size="sm" variant="outline" className="shrink-0">
          <Link to="/inventory">
            <ArrowLeft className="size-4 me-1" />
            المخزون
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="لا توجد تنبيهات"
            description="المخزون في حالة جيدة"
          />
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const sev = severity(item);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/50 p-3"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Package className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.category}</div>
                  </div>
                  <div className="text-end">
                    <div className="text-sm font-semibold tabular-nums">
                      {item.quantity}
                      <span className="text-muted-foreground"> / {item.minThreshold}</span>
                    </div>
                    <Badge variant="outline" className={`${sev.tone} text-[10px] mt-0.5`}>
                      {sev.label}
                    </Badge>
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
