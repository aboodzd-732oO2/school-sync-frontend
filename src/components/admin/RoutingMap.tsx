import { useEffect, useState } from "react";
import {
  Grid3x3, CheckCircle2, ShieldCheck, Inbox,
  MapPin, Check, X, AlertCircle,
} from "lucide-react";
import { admin as adminApi } from "@/services/api";
import { StatCard } from "@/components/common/StatCard";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { getDepartmentIcon } from "@/lib/departmentIcons";
import { cn } from "@/lib/utils";

interface Cell {
  departmentKey: string;
  departmentLabelAr: string;
  exists: boolean;
  warehouseId?: number;
  warehouseName?: string;
  requestsCount: number;
  hasActiveAccount: boolean;
}

interface RowData {
  governorateId: number;
  governorateName: string;
  cells: Cell[];
}

interface MapData {
  governorates: { id: number; name: string }[];
  departments: { key: string; labelAr: string; icon?: string }[];
  map: RowData[];
}

const RoutingMap = () => {
  const [data, setData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .routingMap()
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="stats" />
        <LoadingSkeleton variant="table" rows={8} columns={6} />
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="فشل تحميل خريطة التوجيه"
        description="تعذر جلب بيانات المحافظات والأقسام. حاول تحديث الصفحة."
      />
    );
  }

  const totalCells = data.governorates.length * data.departments.length;
  const existingCells = data.map.reduce(
    (sum, row) => sum + row.cells.filter((c) => c.exists).length,
    0,
  );
  const activeAccounts = data.map.reduce(
    (sum, row) => sum + row.cells.filter((c) => c.hasActiveAccount).length,
    0,
  );
  const totalRequests = data.map.reduce(
    (sum, row) => sum + row.cells.reduce((s, c) => s + c.requestsCount, 0),
    0,
  );

  const coveragePct = totalCells > 0 ? Math.round((existingCells / totalCells) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="إجمالي الخلايا"
          value={totalCells}
          icon={Grid3x3}
          tone="info"
          hint={`${data.governorates.length} محافظة × ${data.departments.length} قسم`}
        />
        <StatCard
          label="مستودعات موجودة"
          value={`${existingCells}/${totalCells}`}
          icon={CheckCircle2}
          tone="success"
          hint={`نسبة التغطية ${coveragePct}%`}
        />
        <StatCard
          label="حسابات مفعّلة"
          value={activeAccounts}
          icon={ShieldCheck}
          tone="tertiary"
          hint="مستودعات لديها مستخدم فعّال"
        />
        <StatCard
          label="إجمالي الطلبات"
          value={totalRequests}
          icon={Inbox}
          tone="warning"
          hint="عبر كل المستودعات"
        />
      </section>

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col gap-1 border-b border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">مصفوفة التوجيه</h2>
              <p className="text-xs text-muted-foreground">
                الصفوف = المحافظات · الأعمدة = الأقسام · الرقم = عدد الطلبات في المستودع
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="sticky start-0 z-10 border-b border-border bg-muted/80 px-4 py-3 text-start font-semibold text-foreground backdrop-blur">
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="size-4 text-primary" />
                      المحافظة
                    </span>
                  </th>
                  {data.departments.map((d) => {
                    const Icon = getDepartmentIcon(d.icon);
                    return (
                      <th
                        key={d.key}
                        className="min-w-[140px] border-b border-border px-3 py-3 text-center font-semibold text-foreground"
                      >
                        <span className="inline-flex items-center justify-center gap-1.5">
                          <Icon className="size-4 text-muted-foreground" />
                          <span>{d.labelAr}</span>
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {data.map.map((row, idx) => (
                  <tr
                    key={row.governorateId}
                    className={cn(
                      "border-b border-border/60 transition-colors hover:bg-muted/30",
                      idx === data.map.length - 1 && "border-b-0",
                    )}
                  >
                    <td className="sticky start-0 z-10 bg-card/95 px-4 py-3 font-semibold text-foreground backdrop-blur">
                      {row.governorateName}
                    </td>
                    {row.cells.map((c) => (
                      <RoutingCell key={c.departmentKey} cell={c} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Legend />
    </div>
  );
};

function RoutingCell({ cell }: { cell: Cell }) {
  if (!cell.exists) {
    return (
      <td className="bg-danger/5 px-3 py-3 text-center" title="لا يوجد مستودع">
        <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-danger/10">
          <X className="size-4 text-danger" />
        </div>
        <div className="mt-1 text-[10px] text-danger/80">غير متوفر</div>
      </td>
    );
  }

  const accountOn = cell.hasActiveAccount;
  return (
    <td className="px-3 py-3 text-center" title={cell.warehouseName ?? ""}>
      <div className="flex flex-col items-center gap-1.5">
        <div
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-full ring-2",
            accountOn
              ? "bg-success/15 text-success ring-success/30"
              : "bg-muted text-muted-foreground ring-border",
          )}
        >
          <Check className="size-4" />
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-block size-2.5 rounded-full",
              accountOn ? "bg-success" : "bg-muted-foreground/40",
            )}
            aria-hidden
          />
          <span className="tabular-nums text-xs font-medium text-foreground">
            {cell.requestsCount}
          </span>
        </div>
      </div>
    </td>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-lg border border-border/60 bg-card/50 p-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-success/15 ring-2 ring-success/30">
          <Check className="size-3 text-success" />
        </span>
        <span>مستودع موجود</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-danger/10">
          <X className="size-3 text-danger" />
        </span>
        <span>مستودع غير متوفر</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block size-2.5 rounded-full bg-success" aria-hidden />
        <span>حساب مفعّل</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block size-2.5 rounded-full bg-muted-foreground/40" aria-hidden />
        <span>بدون حساب</span>
      </div>
    </div>
  );
}

export default RoutingMap;
