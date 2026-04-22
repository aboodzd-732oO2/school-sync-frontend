import { useMemo } from "react";
import RequestsList from "@/components/dashboard/RequestsList";
import RequestDetailsModal from "@/components/RequestDetailsModal";
import EditRequestModal from "@/components/EditRequestModal";
import RejectRequestDialog from "@/components/RejectRequestDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";
import type { DashboardProps } from "@/types/dashboard";

const ACTIVE_STATUSES = ["draft", "pending", "in-progress", "ready-for-pickup", "undelivered"];

const InstitutionActiveRequestsPage = ({
  requests,
  onUpdateStatus,
  onDeleteRequest,
  onUpdateRequest,
  user,
}: DashboardProps) => {
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
    handleDelete,
    handleViewDetails,
    handleEditRequest,
    handleUpdateRequest,
    handleStartRequest,
    handleStatusUpdate,
    handleReportUndelivered,
    handleCancelRequest,
    handleConfirmCancel,
  } = useDashboardHandlers(requests, onUpdateStatus, onDeleteRequest, onUpdateRequest);

  const activeRequests = useMemo(
    () => requests.filter((r) => ACTIVE_STATUSES.includes(r.status)),
    [requests],
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="الطلبات النشطة"
        description="الطلبات التي تحتاج متابعة أو اتخاذ إجراء"
      />

      <RequestsList
        requests={activeRequests}
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
    </div>
  );
};

export default InstitutionActiveRequestsPage;
