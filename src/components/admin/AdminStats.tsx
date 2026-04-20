import { useEffect, useState } from "react";
import {
  Building, Warehouse, FileText, Package, Users, UsersRound,
  Clock, AlertCircle, CalendarRange,
} from "lucide-react";
import { admin as adminApi } from "@/services/api";
import { StatCard } from "@/components/common/StatCard";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { getStatusIcon, getStatusLabel } from "@/lib/statusConfig";
import { STATUS_KEY_TO_UI } from "@/types/adminStats";
import type { AdminStatsResponse, AdminStatusKey } from "@/types/adminStats";
import { StatusDistributionChart } from "./stats/StatusDistributionChart";
import { PriorityBreakdownList } from "./stats/PriorityBreakdownList";
import { RequestsTrendChart } from "./stats/RequestsTrendChart";
import { RequestsByDepartmentChart } from "./stats/RequestsByDepartmentChart";
import { TopWarehousesChart } from "./stats/TopWarehousesChart";
import { TopInstitutionsList } from "./stats/TopInstitutionsList";

const RANGE_OPTIONS = [
  { days: 0, label: "كل الوقت" },
  { days: 7, label: "7 أيام" },
  { days: 30, label: "30 يوم" },
  { days: 90, label: "90 يوم" },
  { days: 365, label: "سنة" },
] as const;

const fmt = (n: number) => n.toLocaleString("en-US");

type Tone = "default" | "primary" | "success" | "warning" | "danger" | "info" | "tertiary";

const STATUS_TONE: Record<AdminStatusKey, Tone> = {
  draft: "default",
  pending: "warning",
  in_progress: "info",
  ready_for_pickup: "tertiary",
  completed: "success",
  rejected: "danger",
  cancelled: "default",
  undelivered: "danger",
};

const STATUS_ORDER: AdminStatusKey[] = [
  "draft",
  "pending",
  "in_progress",
  "ready_for_pickup",
  "completed",
  "rejected",
  "cancelled",
  "undelivered",
];

const AdminStats = () => {
  const [days, setDays] = useState<number>(0);
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    adminApi
      .stats(days)
      .then((res) => {
        if (!cancelled) setStats(res);
      })
      .catch((err: any) => {
        if (!cancelled) setError(err?.message ?? "فشل تحميل الإحصائيات");
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

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

  if (error) {
    return (
      <div className="space-y-6">
        {rangeSelector}
        <EmptyState
          icon={AlertCircle}
          title="تعذر تحميل الإحصائيات"
          description={error}
        />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        {rangeSelector}
        <LoadingSkeleton variant="stats" />
        <LoadingSkeleton variant="stats" />
      </div>
    );
  }

  const { users, requests, inventory } = stats;

  return (
    <div className="space-y-6">
      {rangeSelector}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="إجمالي الحسابات"
          value={fmt(users.total)}
          icon={Users}
          tone="primary"
          hint="مؤسسات + مستودعات"
        />
        <StatCard
          label="المؤسسات التعليمية"
          value={fmt(users.institutions)}
          icon={Building}
          tone="info"
        />
        <StatCard
          label="المستودعات"
          value={fmt(users.warehouses)}
          icon={Warehouse}
          tone="success"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="إجمالي الطلبات"
          value={fmt(requests.total)}
          icon={FileText}
          tone="primary"
        />
        <StatCard
          label="متوسط زمن المعالجة"
          value={requests.avgResolutionDays ?? "—"}
          icon={Clock}
          tone="info"
          hint={requests.avgResolutionDays !== null ? "أيام للطلبات المكتملة" : "لا توجد طلبات مكتملة بعد"}
        />
        <StatCard
          label="إجمالي الطلاب المتأثرين"
          value={fmt(requests.totalStudentsAffected)}
          icon={UsersRound}
          tone="tertiary"
        />
        <StatCard
          label="عناصر المخزون"
          value={fmt(inventory.totalItems)}
          icon={Package}
          tone="warning"
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          تفصيل حسب الحالة
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STATUS_ORDER.map((key) => {
            const uiKey = STATUS_KEY_TO_UI[key];
            const Icon = getStatusIcon(uiKey);
            return (
              <StatCard
                key={key}
                label={getStatusLabel(uiKey)}
                value={fmt(requests.byStatus[key] ?? 0)}
                icon={Icon}
                tone={STATUS_TONE[key]}
              />
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatusDistributionChart data={requests.byStatus} total={requests.total} />
        <PriorityBreakdownList data={requests.byPriority} total={requests.total} />
      </section>

      <section>
        <RequestsTrendChart />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RequestsByDepartmentChart data={requests.byDepartment} />
        <TopWarehousesChart data={requests.byWarehouse} />
      </section>

      <section>
        <TopInstitutionsList data={requests.byInstitution} />
      </section>
    </div>
  );
};

export default AdminStats;
