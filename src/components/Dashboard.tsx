
import RequestDetailsModal from "./RequestDetailsModal";
import EditRequestModal from "./EditRequestModal";
import StatsDetailsModal from "./StatsDetailsModal";
import RejectRequestDialog from "./RejectRequestDialog";
import WarehouseDashboard from "./WarehouseDashboard";
import MainStats from "./dashboard/MainStats";
import StatusStats from "./dashboard/StatusStats";
import ClosedRequestsStats from "./dashboard/ClosedRequestsStats";
import DepartmentStats from "./dashboard/DepartmentStats";
import RequestsList from "./dashboard/RequestsList";
import { DashboardProps } from "@/types/dashboard";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";

const Dashboard = ({ requests, onUpdateStatus, onDeleteRequest, onUpdateRequest, user }: DashboardProps) => {
  // If user is warehouse, use the specialized warehouse dashboard
  if (user?.userType === 'warehouse') {
    return (
      <WarehouseDashboard 
        requests={requests}
        onUpdateStatus={onUpdateStatus}
        onUpdateRequest={onUpdateRequest}
        user={user as any}
      />
    );
  }

  const {
    selectedRequest,
    isModalOpen,
    setIsModalOpen,
    editingRequest,
    isEditModalOpen,
    setIsEditModalOpen,
    rejectingRequest,
    isRejectDialogOpen,
    setIsRejectDialogOpen,
    statsModal,
    setStatsModal,
    handleDelete,
    handleViewDetails,
    handleEditRequest,
    handleUpdateRequest,
    handleStartRequest,
    handleStatusUpdate,
    handleReportUndelivered,
    handleCancelRequest,
    handleConfirmCancel,
    openStatsModal
  } = useDashboardHandlers(requests, onUpdateStatus, onDeleteRequest, onUpdateRequest);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-2">
        <h1 className="text-xl font-bold text-foreground">لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground mt-1">
          نظرة شاملة على طلبات {user?.institutionName}
        </p>
      </div>

      {/* Main Stats */}
      <MainStats requests={requests} onStatsClick={openStatsModal} />

      {/* Status Overview - Active Requests Only */}
      <StatusStats requests={requests} onStatsClick={openStatsModal} />

      {/* Closed Requests (Rejected/Cancelled) - Separate Section */}
      <ClosedRequestsStats requests={requests} onStatsClick={openStatsModal} />

      {/* Department Breakdown */}
      <DepartmentStats requests={requests} />

      {/* Requests List */}
      <RequestsList 
        requests={requests}
        user={user}
        onViewDetails={handleViewDetails}
        onEditRequest={handleEditRequest}
        onStartRequest={handleStartRequest}
        onUpdateStatus={handleStatusUpdate}
        onDeleteRequest={handleDelete}
        onReportUndelivered={handleReportUndelivered}
        onCancelRequest={handleCancelRequest}
      />

      <RequestDetailsModal 
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EditRequestModal
        request={editingRequest}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleUpdateRequest}
      />

      <RejectRequestDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onReject={handleConfirmCancel}
        requestTitle={rejectingRequest?.title || ""}
        type="institution"
      />

      <StatsDetailsModal
        isOpen={statsModal.isOpen}
        onClose={() => setStatsModal(prev => ({ ...prev, isOpen: false }))}
        title={statsModal.title}
        type={statsModal.type}
        requests={statsModal.requests}
        data={statsModal.data}
      />
    </div>
  );
};

export default Dashboard;
