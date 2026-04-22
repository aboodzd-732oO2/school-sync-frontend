import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle, PackageX, TrendingDown, CheckCircle2,
  Package, Search, Copy, Check, AlertCircle, ClipboardList,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { inventory as inventoryApi } from "@/services/api";
import { cn } from "@/lib/utils";
import type {
  InventoryAlertsResponse,
  InventoryAlertSeverity,
} from "@/types/inventoryAlerts";
import { SEVERITY_LABEL } from "@/types/inventoryAlerts";

const severityChipClasses: Record<InventoryAlertSeverity, string> = {
  "out-of-stock": "bg-danger/15 text-danger border-danger/40",
  critical: "bg-danger/10 text-danger border-danger/30",
  low: "bg-warning/15 text-warning-foreground border-warning/30",
  healthy: "bg-success/15 text-success border-success/30",
};

const fmt = (n: number) => n.toLocaleString("en-US");

const WarehouseInventoryAlertsPage = () => {
  const { toast } = useToast();
  const [data, setData] = useState<InventoryAlertsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<InventoryAlertSeverity | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setData(null);
    inventoryApi
      .alerts()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "فشل تحميل التنبيهات");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = data.items;
    if (severityFilter !== "all") list = list.filter((i) => i.severity === severityFilter);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q),
      );
    }
    return list;
  }, [data, severityFilter, searchTerm]);

  const copyReorderList = async () => {
    if (filtered.length === 0) return;
    const lines = filtered
      .filter((i) => i.suggestedReorder > 0)
      .map((i) => `${i.name} × ${i.suggestedReorder} ${i.unitType}`);
    const text = lines.length > 0 ? lines.join("\n") : "لا توجد عناصر تحتاج إعادة طلب";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "تم النسخ",
        description: `تم نسخ ${lines.length} عنصر إلى الحافظة`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "فشل النسخ", description: "تعذّر الوصول إلى الحافظة", variant: "destructive" });
    }
  };

  if (error) {
    return (
      <div>
        <PageHeader title="تنبيهات المخزون" />
        <EmptyState icon={AlertCircle} title="تعذر تحميل التنبيهات" description={error} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="تنبيهات المخزون"
        description="عناصر تحت الحد الأدنى مع اقتراح كمية إعادة الطلب بناءً على آخر 30 يوم"
      />

      {/* Summary cards — clickable filters */}
      {data ? (
        <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="سليم"
            value={fmt(data.summary.healthy)}
            icon={CheckCircle2}
            tone="success"
            hint={`من إجمالي ${data.summary.total}`}
          />
          <StatCard
            label="منخفض"
            value={fmt(data.summary.low)}
            icon={TrendingDown}
            tone="warning"
            hint="أقل من الحد الأدنى"
            onClick={() => setSeverityFilter(severityFilter === "low" ? "all" : "low")}
          />
          <StatCard
            label="حرج"
            value={fmt(data.summary.critical)}
            icon={AlertTriangle}
            tone="danger"
            hint="أقل من نصف الحد"
            onClick={() => setSeverityFilter(severityFilter === "critical" ? "all" : "critical")}
          />
          <StatCard
            label="نافد"
            value={fmt(data.summary.outOfStock)}
            icon={PackageX}
            tone="danger"
            hint="يحتاج طلباً عاجلاً"
            onClick={() =>
              setSeverityFilter(severityFilter === "out-of-stock" ? "all" : "out-of-stock")
            }
          />
        </section>
      ) : (
        <div className="mb-6">
          <LoadingSkeleton variant="stats" />
        </div>
      )}

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="size-5 text-primary" />
                قائمة العناصر التي تحتاج انتباه
              </CardTitle>
              <CardDescription>
                {!data
                  ? "جاري التحميل..."
                  : data.items.length === 0
                    ? "جميع العناصر بكميات كافية — لا توجد تنبيهات"
                    : `${data.items.length} عنصر يحتاج مراجعة${severityFilter !== "all" ? ` · فلتر: ${SEVERITY_LABEL[severityFilter]}` : ""}`}
              </CardDescription>
            </div>
            <Button
              onClick={copyReorderList}
              disabled={!data || filtered.filter((i) => i.suggestedReorder > 0).length === 0}
              variant="outline"
              size="sm"
              className="shrink-0"
            >
              {copied ? (
                <>
                  <Check className="size-4 me-1 text-success" />
                  تم النسخ
                </>
              ) : (
                <>
                  <Copy className="size-4 me-1" />
                  نسخ قائمة الطلب
                </>
              )}
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="ابحث بالعنصر أو الفئة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-10"
              />
            </div>
            {(searchTerm || severityFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSeverityFilter("all");
                }}
              >
                مسح الفلاتر
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {!data ? (
            <div className="p-6">
              <LoadingSkeleton variant="list" rows={6} />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title={data.items.length === 0 ? "المخزون سليم" : "لا توجد عناصر بالفلاتر الحالية"}
              description={
                data.items.length === 0
                  ? "كل عناصر المخزون فوق الحد الأدنى"
                  : "جرّب تغيير الفلاتر أو مسحها"
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-xs">
                  <tr>
                    <th className="px-4 py-3 text-start font-medium">العنصر</th>
                    <th className="px-4 py-3 text-start font-medium">الفئة</th>
                    <th className="px-4 py-3 text-start font-medium">الكمية / الحد</th>
                    <th className="px-4 py-3 text-start font-medium">الاستهلاك اليومي</th>
                    <th className="px-4 py-3 text-start font-medium">الكمية المقترحة للطلب</th>
                    <th className="px-4 py-3 text-start font-medium">الشدة</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-t border-border/50 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Package className="size-4 text-muted-foreground" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                      <td className="px-4 py-3 tabular-nums">
                        <span
                          dir="ltr"
                          className={cn(
                            "inline-flex items-baseline gap-1 font-semibold",
                            item.quantity === 0
                              ? "text-danger"
                              : item.quantity <= item.minThreshold
                                ? "text-warning-foreground"
                                : "text-foreground",
                          )}
                        >
                          {item.quantity}
                          <span className="text-xs text-muted-foreground font-normal">
                            / {item.minThreshold}
                          </span>
                        </span>
                        <span className="ms-1 text-xs text-muted-foreground">{item.unitType}</span>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        <span dir="ltr" className="font-medium">
                          {item.avgDailyConsumption}
                        </span>
                        <span className="ms-1 text-xs text-muted-foreground">
                          {item.unitType}/يوم
                        </span>
                        <div className="text-[10px] text-muted-foreground">
                          (30 يوم: {fmt(item.consumed30d)})
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {item.suggestedReorder > 0 ? (
                          <span
                            dir="ltr"
                            className="inline-flex items-baseline gap-1 rounded-md bg-primary/10 px-2 py-0.5 font-semibold text-primary tabular-nums"
                          >
                            {item.suggestedReorder}
                            <span className="text-xs font-normal">{item.unitType}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", severityChipClasses[item.severity])}
                        >
                          {SEVERITY_LABEL[item.severity]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WarehouseInventoryAlertsPage;
