import { useState } from "react";
import {
  ClipboardList, Package, Clock, RefreshCw, CheckCircle, Undo2, X,
  Flame, School, GraduationCap,
} from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { WarehouseHeader } from "@/components/warehouse/WarehouseHeader";
import StatsDetailsModal from "@/components/StatsDetailsModal";
import { useWarehouseRequests } from "@/hooks/useWarehouseRequests";

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
  rejectionReason?: string;
  rejectionDate?: string;
  cancellationReason?: string;
  cancellationDate?: string;
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

const WarehouseDashboardPage = ({ requests, user }: Props) => {
  const {
    warehouseDepartmentDisplay,
    warehouseRequests,
    stats,
    getDetailedItemsData,
    getInstitutionsData,
  } = useWarehouseRequests(requests, user);

  const [statsModal, setStatsModal] = useState<{
    isOpen: boolean;
    title: string;
    type: ModalType;
    requests: Request[];
    data?: any;
  }>({
    isOpen: false,
    title: "",
    type: "total",
    requests: [],
    data: null,
  });

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
        filtered = warehouseRequests.filter(
          (r) => r.priority === "high" || r.priority === "urgent",
        );
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

  return (
    <div className="space-y-6">
      <WarehouseHeader
        warehouseName={user.warehouseName}
        departmentDisplay={warehouseDepartmentDisplay}
      />

      {/* ملخص سريع: الإجمالي + الكمية */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard
          label="إجمالي الطلبات"
          value={stats.total}
          icon={ClipboardList}
          tone="primary"
          onClick={() => openModal("total", "إجمالي الطلبات")}
        />
        <StatCard
          label="إجمالي العناصر المطلوبة"
          value={stats.totalQuantity}
          icon={Package}
          tone="warning"
          hint="انقر لرؤية تفاصيل العناصر"
          onClick={() =>
            openModal("detailed-items", "تفاصيل إجمالي العناصر المطلوبة", getDetailedItemsData())
          }
        />
      </section>

      {/* توزيع الحالات */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="قيد الانتظار"
          value={stats.pending}
          icon={Clock}
          tone="warning"
          onClick={() => openModal("pending", "الطلبات قيد الانتظار")}
        />
        <StatCard
          label="قيد التنفيذ"
          value={stats.inProgress}
          icon={RefreshCw}
          tone="info"
          onClick={() => openModal("inProgress", "الطلبات قيد التنفيذ")}
        />
        <StatCard
          label="مكتمل"
          value={stats.completed}
          icon={CheckCircle}
          tone="success"
          onClick={() => openModal("completed", "الطلبات المكتملة")}
        />
        <StatCard
          label="غير مستلم"
          value={stats.undelivered}
          icon={Undo2}
          tone="warning"
          onClick={() => openModal("undelivered", "الطلبات غير المستلمة")}
        />
        <StatCard
          label="مرفوض"
          value={stats.rejected}
          icon={X}
          tone="danger"
          onClick={() => openModal("rejected", "الطلبات المرفوضة")}
        />
        <StatCard
          label="أولوية عالية"
          value={stats.highPriority}
          icon={Flame}
          tone="danger"
          onClick={() => openModal("highPriority", "الطلبات عالية الأولوية")}
        />
      </section>

      {/* تصنيف المؤسسات */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard
          label="طلبات من المدارس"
          value={stats.schools}
          icon={School}
          tone="success"
          hint="انقر لرؤية تفاصيل المدارس"
          onClick={() =>
            openModal("schools", "تفاصيل طلبات المدارس", getInstitutionsData("school"))
          }
        />
        <StatCard
          label="طلبات من الجامعات"
          value={stats.universities}
          icon={GraduationCap}
          tone="info"
          hint="انقر لرؤية تفاصيل الجامعات"
          onClick={() =>
            openModal("universities", "تفاصيل طلبات الجامعات", getInstitutionsData("university"))
          }
        />
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
