import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList, Package, Clock, RefreshCw, CheckCircle, X, Ban, PackageX,
  Flame, Users as UsersRound, AlertCircle, CalendarRange, Warehouse as WarehouseIcon,
  Layers, FileEdit,
} from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StatsDetailsModal from "@/components/StatsDetailsModal";
import { StatusDistributionChart } from "@/components/admin/stats/StatusDistributionChart";
import { PriorityBreakdownList } from "@/components/admin/stats/PriorityBreakdownList";
import { RequestsTrendChart } from "@/components/admin/stats/RequestsTrendChart";
import { RequestsByDepartmentChart } from "@/components/admin/stats/RequestsByDepartmentChart";
import { institution as institutionApi } from "@/services/api";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";
import type { DashboardProps } from "@/types/dashboard";
import type { InstitutionStatsResponse } from "@/types/institutionStats";

const RANGE_OPTIONS = [
  { days: 0, label: "كل الوقت" },
  { days: 7, label: "7 أيام" },
  { days: 30, label: "30 يوم" },
  { days: 90, label: "90 يوم" },
  { days: 365, label: "سنة" },
] as const;

const fmt = (n: number) => n.toLocaleString("en-US");

const InstitutionDashboardPage = ({
  requests,
  onUpdateStatus,
  onDeleteRequest,
  onUpdateRequest,
  user,
}: DashboardProps) => {
  const [days, setDays] = useState<number>(0);
  const [backendStats, setBackendStats] = useState<InstitutionStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { statsModal, setStatsModal, openStatsModal } = useDashboardHandlers(
    requests,
    onUpdateStatus,
    onDeleteRequest,
    onUpdateRequest,
  );

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setBackendStats(null);
    institutionApi
      .stats(days)
      .then((data) => {
        if (!cancelled) setBackendStats(data);
      })
      .catch((err: any) => {
        if (!cancelled) setError(err?.message ?? "فشل تحميل الإحصائيات");
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const b = backendStats;

  const rangeSelector = (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-card/50 p-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarRange className="size-4" />
        <span>النطاق الزمني:</span>
      </div>
      <div className="flex flex-wrap gap-1 rounded-md border border-border/60 p-0.5">
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
    </div>
  );

  // Values prefer backend (filtered by date); fall back to 0 until loaded
  const v = useMemo(() => ({
    total: b?.requests.total ?? 0,
    draft: b?.requests.byStatus.draft ?? 0,
    pending: b?.requests.byStatus.pending ?? 0,
    inProgress: b?.requests.byStatus.in_progress ?? 0,
    readyForPickup: b?.requests.byStatus.ready_for_pickup ?? 0,
    completed: b?.requests.byStatus.completed ?? 0,
    rejected: b?.requests.byStatus.rejected ?? 0,
    cancelled: b?.requests.byStatus.cancelled ?? 0,
    undelivered: b?.requests.byStatus.undelivered ?? 0,
    highPriority: b?.requests.highPriorityCount ?? 0,
    totalStudents: b?.requests.totalStudentsAffected ?? 0,
    totalQuantity: b?.requests.totalQuantity ?? 0,
    avgResolutionDays: b?.requests.avgResolutionDays ?? null,
  }), [b]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="لوحة التحكم"
        description={`نظرة شاملة على طلبات ${user?.institutionName ?? ""}`}
      />

      <div className="space-y-6">
        {rangeSelector}

        {error && (
          <EmptyState
            icon={AlertCircle}
            title="تعذر تحميل الإحصائيات"
            description={error}
          />
        )}

        {/* صف 1: أولويات المؤسسة */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            ما يحتاج انتباهك الآن
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="جاهز للاستلام"
              value={fmt(v.readyForPickup)}
              icon={Package}
              tone={v.readyForPickup > 0 ? "danger" : "default"}
              hint="يلزم تأكيد الاستلام"
              onClick={() => openStatsModal("ready-for-pickup", "الطلبات الجاهزة للاستلام")}
            />
            <StatCard
              label="قيد الانتظار"
              value={fmt(v.pending)}
              icon={Clock}
              tone="warning"
              hint="في انتظار المستودع"
              onClick={() => openStatsModal("pending", "الطلبات قيد الانتظار")}
            />
            <StatCard
              label="قيد التنفيذ"
              value={fmt(v.inProgress)}
              icon={RefreshCw}
              tone="info"
              onClick={() => openStatsModal("in-progress", "الطلبات قيد التنفيذ")}
            />
            <StatCard
              label="أولوية عالية"
              value={fmt(v.highPriority)}
              icon={Flame}
              tone="danger"
              onClick={() => openStatsModal("high-priority", "الطلبات عالية الأولوية")}
            />
          </div>
        </section>

        {/* صف 2: النظرة التشغيلية */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">نظرة تشغيلية</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="إجمالي الطلبات"
              value={fmt(v.total)}
              icon={ClipboardList}
              tone="primary"
              onClick={() => openStatsModal("total", "إجمالي الطلبات")}
            />
            <StatCard
              label="متوسط زمن المعالجة"
              value={v.avgResolutionDays ?? "—"}
              icon={RefreshCw}
              tone="info"
              hint={v.avgResolutionDays !== null ? "أيام للطلبات المكتملة" : "لا توجد طلبات مكتملة بعد"}
            />
            <StatCard
              label="إجمالي الطلاب المتأثرين"
              value={fmt(v.totalStudents)}
              icon={UsersRound}
              tone="tertiary"
            />
            <StatCard
              label="إجمالي العناصر المطلوبة"
              value={fmt(v.totalQuantity)}
              icon={Package}
              tone="warning"
            />
          </div>
        </section>

        {/* صف 3: توزيع الحالات */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">توزيع الحالات</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <StatCard
              label="مسودات"
              value={fmt(v.draft)}
              icon={FileEdit}
              tone="default"
            />
            <StatCard
              label="مكتمل"
              value={fmt(v.completed)}
              icon={CheckCircle}
              tone="success"
              onClick={() => openStatsModal("completed", "الطلبات المكتملة")}
            />
            <StatCard
              label="غير مستلم"
              value={fmt(v.undelivered)}
              icon={PackageX}
              tone="warning"
              onClick={() => openStatsModal("undelivered", "الطلبات غير المستلمة")}
            />
            <StatCard
              label="مرفوض"
              value={fmt(v.rejected)}
              icon={X}
              tone="danger"
              onClick={() => openStatsModal("rejected", "الطلبات المرفوضة")}
            />
            <StatCard
              label="ملغى"
              value={fmt(v.cancelled)}
              icon={Ban}
              tone="default"
              onClick={() => openStatsModal("cancelled", "الطلبات الملغاة")}
            />
            <StatCard
              label="المجموع النشط"
              value={fmt(v.pending + v.inProgress + v.readyForPickup + v.undelivered)}
              icon={Layers}
              tone="primary"
              hint="طلبات تتطلب انتباه"
            />
          </div>
        </section>

        {/* صف 4: رسومات الحالات والأولويات */}
        {b ? (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <StatusDistributionChart data={b.requests.byStatus} total={b.requests.total} />
            <PriorityBreakdownList data={b.requests.byPriority} total={b.requests.total} />
          </section>
        ) : (
          <LoadingSkeleton variant="stats" />
        )}

        {/* صف 5: اتجاه الطلبات */}
        <section>
          <RequestsTrendChart fetchTrends={institutionApi.statsTrends} />
        </section>

        {/* صف 6: حسب القسم + أعلى المستودعات */}
        {b ? (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RequestsByDepartmentChart data={b.requests.byDepartment} />
            <TopWarehousesCard data={b.requests.byWarehouse} />
          </section>
        ) : null}
      </div>

      <StatsDetailsModal
        isOpen={statsModal.isOpen}
        onClose={() => setStatsModal((prev) => ({ ...prev, isOpen: false }))}
        title={statsModal.title}
        type={statsModal.type}
        requests={statsModal.requests}
        data={statsModal.data}
      />
    </div>
  );
};

// Small list card — similar to TopInstitutionsList but for warehouses (institution perspective)
function TopWarehousesCard({ data }: { data: { id: number; name: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <WarehouseIcon className="size-5 text-primary" />
          المستودعات الأكثر استلاماً
        </CardTitle>
        <CardDescription>المستودعات التي أرسلت إليها أكثر الطلبات</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState icon={WarehouseIcon} title="لا توجد بيانات" />
        ) : (
          <div className="space-y-3">
            {data.map((wh, idx) => {
              const pct = Math.round((wh.count / max) * 100);
              return (
                <div key={wh.id} className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="flex-1 truncate font-medium">{wh.name}</span>
                    <span className="tabular-nums text-muted-foreground">{wh.count}</span>
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

export default InstitutionDashboardPage;
