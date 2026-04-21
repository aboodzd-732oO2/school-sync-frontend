import { useEffect, useState } from "react";
import {
  ClipboardList, Package, Clock, RefreshCw, CheckCircle, Undo2, X,
  Flame, School, GraduationCap, AlertTriangle, AlertCircle,
  Users as UsersRound, Layers, TrendingDown, PackageX, CalendarRange,
} from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { WarehouseHeader } from "@/components/warehouse/WarehouseHeader";
import { CriticalStockCard } from "@/components/warehouse/CriticalStockCard";
import StatsDetailsModal from "@/components/StatsDetailsModal";
import { StatusDistributionChart } from "@/components/admin/stats/StatusDistributionChart";
import { PriorityBreakdownList } from "@/components/admin/stats/PriorityBreakdownList";
import { RequestsTrendChart } from "@/components/admin/stats/RequestsTrendChart";
import { TopInstitutionsList } from "@/components/admin/stats/TopInstitutionsList";
import { warehouse as warehouseApi } from "@/services/api";
import { useWarehouseRequests } from "@/hooks/useWarehouseRequests";
import type { WarehouseStatsResponse } from "@/types/warehouseStats";

interface Request {
  id: string;
  title: string;
  department: string;
  subcategory: string;
  priority: string;
  status: string;
  location: string;
  schoolLocation?: string;
  dateSubmitted: string;
  routedTo: string;
  description: string;
  impact: string;
  quantity: number;
  studentsAffected: number;
  unitType: string;
  institutionType: string;
  requestedItems?: Array<{
    itemName: string;
    originalKey: string;
    quantity: number;
    unitType: string;
    displayText: string;
  }>;
}

interface Props {
  requests: Request[];
  user: {
    userType: "warehouse";
    warehouseName: string;
    departmentKey?: string;
  };
}

type ModalType =
  | "total" | "quantity" | "pending" | "inProgress" | "completed"
  | "highPriority" | "schools" | "universities" | "detailed-items"
  | "undelivered" | "rejected";

const fmt = (n: number) => n.toLocaleString("en-US");

const RANGE_OPTIONS = [
  { days: 0, label: "كل الوقت" },
  { days: 7, label: "7 أيام" },
  { days: 30, label: "30 يوم" },
  { days: 90, label: "90 يوم" },
  { days: 365, label: "سنة" },
] as const;

const WarehouseDashboardPage = ({ requests, user }: Props) => {
  const {
    warehouseDepartmentDisplay,
    warehouseRequests,
    stats: localStats,
    getDetailedItemsData,
    getInstitutionsData,
  } = useWarehouseRequests(requests, user);

  const [days, setDays] = useState<number>(0);
  const [backendStats, setBackendStats] = useState<WarehouseStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setBackendStats(null);
    warehouseApi
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

  const [statsModal, setStatsModal] = useState<{
    isOpen: boolean;
    title: string;
    type: ModalType;
    requests: Request[];
    data?: any;
  }>({ isOpen: false, title: "", type: "total", requests: [], data: null });

  const openModal = (type: ModalType, title: string, data?: any) => {
    let filtered = warehouseRequests;
    switch (type) {
      case "pending":
        filtered = warehouseRequests.filter((r) => r.status === "pending");
        break;
      case "inProgress":
        filtered = warehouseRequests.filter((r) => r.status === "in-progress");
        break;
      case "completed":
        filtered = warehouseRequests.filter((r) => r.status === "completed");
        break;
      case "undelivered":
        filtered = warehouseRequests.filter((r) => r.status === "undelivered");
        break;
      case "rejected":
        filtered = warehouseRequests.filter((r) => r.status === "rejected");
        break;
      case "highPriority":
        filtered = warehouseRequests.filter((r) => r.priority === "high" || r.priority === "urgent");
        break;
      case "schools":
        filtered = warehouseRequests.filter((r) => r.institutionType === "school");
        break;
      case "universities":
        filtered = warehouseRequests.filter((r) => r.institutionType === "university");
        break;
    }
    setStatsModal({ isOpen: true, title, type, requests: filtered, data });
  };

  const b = backendStats;

  // Prefer backend values (respect date range filter); fall back to local when not yet loaded
  const v = {
    total: b?.requests.total ?? localStats.total,
    pending: b?.requests.byStatus.pending ?? localStats.pending,
    inProgress: b?.requests.byStatus.in_progress ?? localStats.inProgress,
    completed: b?.requests.byStatus.completed ?? localStats.completed,
    readyForPickup: b?.requests.byStatus.ready_for_pickup ?? localStats.readyForPickup,
    undelivered: b?.requests.byStatus.undelivered ?? localStats.undelivered,
    rejected: b?.requests.byStatus.rejected ?? localStats.rejected,
    cancelled: b?.requests.byStatus.cancelled ?? localStats.cancelled,
    draft: b?.requests.byStatus.draft ?? 0,
    totalQuantity: b?.requests.totalQuantity ?? localStats.totalQuantity,
    highPriority: b?.requests.highPriorityCount ?? localStats.highPriority,
    schools: b?.requests.schoolCount ?? localStats.schools,
    universities: b?.requests.universityCount ?? localStats.universities,
  };

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

  return (
    <div className="space-y-6">
      <WarehouseHeader
        warehouseName={user.warehouseName}
        departmentDisplay={warehouseDepartmentDisplay}
      />

      {rangeSelector}

      {error && (
        <EmptyState
          icon={AlertCircle}
          title="تعذر تحميل الإحصائيات الكاملة"
          description={error}
        />
      )}

      {/* صف 1: أولويات اليوم */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          ما يحتاج انتباهك الآن
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="طلبات قيد الانتظار"
            value={fmt(v.pending)}
            icon={Clock}
            tone="warning"
            hint="تحتاج بدء تنفيذ"
            onClick={() => openModal("pending", "الطلبات قيد الانتظار")}
          />
          <StatCard
            label="جاهز للاستلام"
            value={fmt(v.readyForPickup)}
            icon={Package}
            tone="tertiary"
            hint="تنتظر المؤسسة لاستلامها"
          />
          <StatCard
            label="طلبات عالية الأولوية"
            value={fmt(v.highPriority)}
            icon={Flame}
            tone="danger"
            onClick={() => openModal("highPriority", "الطلبات عالية الأولوية")}
          />
          <StatCard
            label="عناصر تحت الحد الأدنى"
            value={fmt(b?.inventory.lowStockCount ?? 0)}
            icon={AlertTriangle}
            tone={b && b.inventory.criticalStockCount > 0 ? "danger" : "warning"}
            hint={b && b.inventory.criticalStockCount > 0
              ? `${b.inventory.criticalStockCount} منها حرجة`
              : "راجع المخزون"}
          />
        </div>
      </section>

      {/* صف 2: نظرة تشغيلية */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">نظرة تشغيلية</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="إجمالي الطلبات"
            value={fmt(v.total)}
            icon={ClipboardList}
            tone="primary"
            onClick={() => openModal("total", "إجمالي الطلبات")}
          />
          <StatCard
            label="متوسط زمن المعالجة"
            value={b?.requests.avgResolutionDays ?? "—"}
            icon={RefreshCw}
            tone="info"
            hint={b?.requests.avgResolutionDays !== null && b?.requests.avgResolutionDays !== undefined
              ? "أيام للطلبات المكتملة"
              : "لا توجد طلبات مكتملة بعد"}
          />
          <StatCard
            label="إجمالي الطلاب المتأثرين"
            value={fmt(b?.requests.totalStudentsAffected ?? 0)}
            icon={UsersRound}
            tone="tertiary"
          />
          <StatCard
            label="إجمالي العناصر المخرجة"
            value={fmt(v.totalQuantity)}
            icon={Package}
            tone="warning"
            hint="انقر للتفاصيل"
            onClick={() =>
              openModal("detailed-items", "تفاصيل إجمالي العناصر المطلوبة", getDetailedItemsData())
            }
          />
        </div>
      </section>

      {/* صف 3: توزيع الحالات */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">توزيع الحالات</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatCard
            label="قيد التنفيذ"
            value={fmt(v.inProgress)}
            icon={RefreshCw}
            tone="info"
            onClick={() => openModal("inProgress", "الطلبات قيد التنفيذ")}
          />
          <StatCard
            label="مكتمل"
            value={fmt(v.completed)}
            icon={CheckCircle}
            tone="success"
            onClick={() => openModal("completed", "الطلبات المكتملة")}
          />
          <StatCard
            label="غير مستلم"
            value={fmt(v.undelivered)}
            icon={Undo2}
            tone="warning"
            onClick={() => openModal("undelivered", "الطلبات غير المستلمة")}
          />
          <StatCard
            label="مرفوض"
            value={fmt(v.rejected)}
            icon={X}
            tone="danger"
            onClick={() => openModal("rejected", "الطلبات المرفوضة")}
          />
          <StatCard
            label="ملغى"
            value={fmt(v.cancelled)}
            icon={X}
            tone="default"
          />
          <StatCard
            label="مسودات"
            value={fmt(v.draft)}
            icon={Layers}
            tone="default"
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

      {/* صف 5: اتجاه الطلبات عبر الزمن */}
      <section>
        <RequestsTrendChart fetchTrends={warehouseApi.statsTrends} />
      </section>

      {/* صف 6: أعلى المؤسسات + تنبيهات المخزون */}
      {b ? (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TopInstitutionsList data={b.requests.byInstitution} />
          <CriticalStockCard
            items={b.inventory.criticalStockList}
            lowStockCount={b.inventory.lowStockCount}
          />
        </section>
      ) : null}

      {/* صف 7: ملخص المخزون */}
      {b && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">صحة المخزون</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              label="إجمالي الأصناف"
              value={fmt(b.inventory.totalItems)}
              icon={Package}
              tone="primary"
            />
            <StatCard
              label="الكمية الكلية"
              value={fmt(b.inventory.totalQuantity)}
              icon={Layers}
              tone="info"
              hint={`موزعة على ${b.inventory.categories} فئة`}
            />
            <StatCard
              label="منخفضة المخزون"
              value={fmt(b.inventory.lowStockCount)}
              icon={TrendingDown}
              tone="warning"
            />
            <StatCard
              label="نافدة"
              value={fmt(b.inventory.outOfStockCount)}
              icon={PackageX}
              tone="danger"
            />
          </div>
        </section>
      )}

      {/* صف 8: تصنيف المؤسسات (موروث) */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">تصنيف المؤسسات المرسلة</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <StatCard
            label="طلبات من المدارس"
            value={fmt(v.schools)}
            icon={School}
            tone="success"
            hint="انقر لرؤية تفاصيل المدارس"
            onClick={() =>
              openModal("schools", "تفاصيل طلبات المدارس", getInstitutionsData("school"))
            }
          />
          <StatCard
            label="طلبات من الجامعات"
            value={fmt(v.universities)}
            icon={GraduationCap}
            tone="info"
            hint="انقر لرؤية تفاصيل الجامعات"
            onClick={() =>
              openModal("universities", "تفاصيل طلبات الجامعات", getInstitutionsData("university"))
            }
          />
        </div>
      </section>

      <StatsDetailsModal
        isOpen={statsModal.isOpen}
        onClose={() => setStatsModal((p) => ({ ...p, isOpen: false }))}
        title={statsModal.title}
        type={statsModal.type}
        requests={statsModal.requests}
        data={statsModal.data}
      />
    </div>
  );
};

export default WarehouseDashboardPage;
