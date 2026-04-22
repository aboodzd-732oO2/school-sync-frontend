import { useMemo } from "react";
import RequestsList from "@/components/dashboard/RequestsList";
import RequestDetailsModal from "@/components/RequestDetailsModal";
import EditRequestModal from "@/components/EditRequestModal";
import { PageHeader } from "@/components/layout/PageHeader";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";
import type { DashboardProps } from "@/types/dashboard";

const InstitutionDraftsPage = ({
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
    handleDelete,
    handleViewDetails,
    handleEditRequest,
    handleUpdateRequest,
    handleStartRequest,
    handleStatusUpdate,
    handleReportUndelivered,
    handleCancelRequest,
  } = useDashboardHandlers(requests, onUpdateStatus, onDeleteRequest, onUpdateRequest);

  const drafts = useMemo(
    () => requests.filter((r) => r.status === "draft"),
    [requests],
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="المسودات"
        description="الطلبات التي لم تُرسل بعد — يمكن تعديلها أو إرسالها أو حذفها"
      />

      <RequestsList
        requests={drafts}
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
    </div>
  );
};

export default InstitutionDraftsPage;
