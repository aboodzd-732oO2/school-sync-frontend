import MainStats from "@/components/dashboard/MainStats";
import StatusStats from "@/components/dashboard/StatusStats";
import ClosedRequestsStats from "@/components/dashboard/ClosedRequestsStats";
import DepartmentStats from "@/components/dashboard/DepartmentStats";
import StatsDetailsModal from "@/components/StatsDetailsModal";
import { PageHeader } from "@/components/layout/PageHeader";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";
import type { DashboardProps } from "@/types/dashboard";

const InstitutionDashboardPage = ({
  requests,
  onUpdateStatus,
  onDeleteRequest,
  onUpdateRequest,
  user,
}: DashboardProps) => {
  const {
    statsModal,
    setStatsModal,
    openStatsModal,
  } = useDashboardHandlers(requests, onUpdateStatus, onDeleteRequest, onUpdateRequest);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="لوحة التحكم"
        description={`نظرة شاملة على طلبات ${user?.institutionName ?? ""}`}
      />

      <div className="space-y-6">
        <MainStats requests={requests} onStatsClick={openStatsModal} />
        <StatusStats requests={requests} onStatsClick={openStatsModal} />
        <ClosedRequestsStats requests={requests} onStatsClick={openStatsModal} />
        <DepartmentStats requests={requests} />
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

export default InstitutionDashboardPage;
