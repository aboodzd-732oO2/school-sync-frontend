
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Request, StatsModalState } from "@/types/dashboard";
import { InventoryReturnService } from "@/services/inventoryReturnService";
import { usePriorities } from "@/hooks/useLookups";

export const useDashboardHandlers = (
  requests: Request[],
  onUpdateStatus: (id: string, status: string) => void,
  onDeleteRequest: (id: string) => void,
  onUpdateRequest?: (updatedRequest: Request) => void
) => {
  const { toast } = useToast();
  const { isHighPriority } = usePriorities();
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [rejectingRequest, setRejectingRequest] = useState<Request | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [statsModal, setStatsModal] = useState<StatsModalState>({
    isOpen: false,
    title: '',
    type: 'total',
    requests: [],
    data: null
  });

  const handleDelete = (id: string, title: string) => {
    onDeleteRequest(id);
    toast({
      title: "تم حذف الطلب",
      description: `تم حذف الطلب: ${title}`,
    });
  };

  const handleViewDetails = (request: Request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleEditRequest = (request: Request) => {
    setEditingRequest(request);
    setIsEditModalOpen(true);
  };

  const handleUpdateRequest = (updatedRequest: Request) => {
    if (onUpdateRequest) {
      onUpdateRequest(updatedRequest);
    }
  };

  const handleStartRequest = (id: string, title: string) => {
    onUpdateStatus(id, 'pending');
    toast({
      title: "تم إرسال الطلب",
      description: `تم إرسال الطلب "${title}" إلى المستودع`,
    });
  };

  const handleStatusUpdate = (id: string, status: string) => {
    onUpdateStatus(id, status);
    toast({
      title: "تم إكمال الطلب",
      description: `تم إكمال الطلب بنجاح`,
    });
  };

  const handleCancelRequest = (request: Request) => {
    setRejectingRequest(request);
    setIsRejectDialogOpen(true);
  };

  const handleConfirmCancel = (reason: string) => {
    if (!rejectingRequest) return;

    // Update request with cancellation reason and status
    const updatedRequest = {
      ...rejectingRequest,
      status: 'cancelled',
      cancellationReason: reason,
      cancellationDate: new Date().toISOString(),
      cancellationType: 'institution'
    };

    if (onUpdateRequest) {
      onUpdateRequest(updatedRequest);
    }

    toast({
      title: "تم إلغاء الطلب",
      description: `تم إلغاء الطلب "${rejectingRequest.title}" وإرسال السبب للمستودع`,
      variant: "destructive"
    });

    setRejectingRequest(null);
  };

  const handleReportUndelivered = async (id: string, title: string) => {
    const request = requests.find(r => r.id === id);
    if (!request) {
      console.error('لم يتم العثور على الطلب:', id);
      return;
    }

    try {
      await InventoryReturnService.returnItemsToInventory(request);

      // تغيير الحالة إلى "لم يتم الاستلام"
      onUpdateStatus(id, 'undelivered');
      
      toast({
        title: "تم الإبلاغ عن عدم الاستلام",
        description: `تم تسجيل عدم استلام الطلب "${title}" وتم إرجاع العناصر للمخزون`,
        variant: "destructive"
      });

      // جدولة إعادة الإرسال التلقائي بعد 5 ثوانٍ
      setTimeout(() => {
        onUpdateStatus(id, 'pending');
        
        toast({
          title: "إعادة الإرسال التلقائي",
          description: `تم إعادة إرسال الطلب "${title}" تلقائياً للمستودع`,
          duration: 5000,
        });
      }, 5000);

      // تنبيه للمستودع عن الطلب غير المستلم
      setTimeout(() => {
        toast({
          title: "تنبيه للمستودع",
          description: `طلب غير مستلم تم إعادة إرساله: "${title}"`,
          duration: 5000,
          variant: "destructive"
        });
      }, 7000);

    } catch (error) {
      console.error('خطأ في معالجة عدم الاستلام:', error);
      toast({
        title: "خطأ في المعالجة",
        description: "حدث خطأ أثناء معالجة عدم الاستلام",
        variant: "destructive"
      });
    }
  };

  const openStatsModal = (
    type: StatsModalState['type'], 
    title: string, 
    data?: any
  ) => {
    let filteredRequestsForModal = requests;
    
    switch (type) {
      case 'draft':
        filteredRequestsForModal = requests.filter(r => r.status === 'draft');
        break;
      case 'pending':
        filteredRequestsForModal = requests.filter(r => r.status === 'pending');
        break;
      case 'inProgress':
        filteredRequestsForModal = requests.filter(r => r.status === 'in-progress');
        break;
      case 'completed':
        filteredRequestsForModal = requests.filter(r => r.status === 'completed');
        break;
      case 'highPriority':
        filteredRequestsForModal = requests.filter(r => isHighPriority(r.priority));
        break;
      case 'undelivered':
        filteredRequestsForModal = requests.filter(r => r.status === 'undelivered');
        break;
      case 'rejected':
        filteredRequestsForModal = requests.filter(r => r.status === 'rejected');
        break;
      case 'cancelled':
        filteredRequestsForModal = requests.filter(r => r.status === 'cancelled');
        break;
      case 'detailed-requests':
      case 'detailed-items':
        filteredRequestsForModal = requests;
        break;
      default:
        filteredRequestsForModal = requests;
    }

    setStatsModal({
      isOpen: true,
      title,
      type,
      requests: filteredRequestsForModal,
      data
    });
  };

  return {
    selectedRequest,
    setSelectedRequest,
    isModalOpen,
    setIsModalOpen,
    editingRequest,
    setEditingRequest,
    isEditModalOpen,
    setIsEditModalOpen,
    rejectingRequest,
    setRejectingRequest,
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
  };
};
