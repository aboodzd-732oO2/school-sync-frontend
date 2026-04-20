import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, MapPin, AlertCircle, CheckCircle, Clock, Package, Hash, Eye, Play, Search, Building, Warehouse, Filter, AlertTriangle, List, Undo2, RefreshCw, X, ClipboardList, FileText, School, GraduationCap, Info, Circle, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RequestDetailsModal from "@/components/RequestDetailsModal";
import StatsDetailsModal from "@/components/StatsDetailsModal";
import RejectRequestDialog from "@/components/RejectRequestDialog";
import InventoryManagement from "@/components/InventoryManagement";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { InventoryService } from "@/services/inventoryService";
import { useDepartments, usePriorities, useInstitutionTypes } from "@/hooks/useLookups";
import { getStatusLabel, getStatusClass, getStatusIcon as getStatusIconFromConfig } from "@/lib/statusConfig";

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
  itemsBreakdown?: Array<{
    name: string;
    key: string;
    quantity: number;
    unit: string;
  }>;
  rejectionReason?: string;
  rejectionDate?: string;
  cancellationReason?: string;
  cancellationDate?: string;
  cancellationType?: string;
}

type UserData = {
  email: string;
  loginTime: string;
  userType: 'warehouse';
  warehouseName: string;
  departmentKey?: string;
  institutionType?: never;
  institutionName?: never;
};

interface WarehouseDashboardProps {
  requests: Request[];
  onUpdateStatus: (id: string, status: string) => void;
  onUpdateRequest?: (updatedRequest: Request) => void;
  user: UserData;
}

const WarehouseDashboard = ({ requests, onUpdateStatus, onUpdateRequest, user }: WarehouseDashboardProps) => {
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectingRequest, setRejectingRequest] = useState<Request | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("requests");
  const [statsModal, setStatsModal] = useState<{
    isOpen: boolean;
    title: string;
    type: 'total' | 'quantity' | 'pending' | 'inProgress' | 'completed' | 'highPriority' | 'schools' | 'universities' | 'detailed-items' | 'undelivered' | 'rejected';
    requests: Request[];
    data?: any;
  }>({
    isOpen: false,
    title: '',
    type: 'total',
    requests: [],
    data: null
  });

  // قسم المستودع يجي مباشرة من /auth/me (مخزّن في user.departmentKey)
  const warehouseDepartment = user.departmentKey || 'materials';
  const { getLabel: getDeptLabel } = useDepartments();
  const warehouseDepartmentDisplay = getDeptLabel(warehouseDepartment).replace(/^قسم\s*/, '');

  // hooks الديناميكية
  const { getLabel: getPriorityLabel, getColor: getPriorityHexColor, isHighPriority } = usePriorities();
  const { getLabel: getInstitutionTypeLabel } = useInstitutionTypes();

  // Filter requests - only show requests for this warehouse's department (excluding draft)
  const warehouseRequests = requests.filter(request => 
    request.department === warehouseDepartment && 
    request.status !== 'draft' // Don't show draft requests
  );
  
  // Apply search and priority filters
  let filteredRequests = warehouseRequests.filter(request =>
    request.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply priority filter
  if (priorityFilter !== "all") {
    filteredRequests = filteredRequests.filter(request => request.priority === priorityFilter);
  }

  const handleRejectRequest = (request: Request) => {
    setRejectingRequest(request);
    setIsRejectDialogOpen(true);
  };

  const handleConfirmReject = (reason: string) => {
    if (!rejectingRequest || !onUpdateRequest) return;

    // Update request with rejection reason and status
    const updatedRequest = {
      ...rejectingRequest,
      status: 'rejected',
      rejectionReason: reason,
      rejectionDate: new Date().toISOString()
    };

    onUpdateRequest(updatedRequest);

    toast({
      title: "تم رفض الطلب",
      description: `تم رفض الطلب "${rejectingRequest.title}" وإرسال السبب للمؤسسة`,
      variant: "destructive"
    });

    setRejectingRequest(null);
  };

  const getStatusColor = (status: string) => getStatusClass(status);
  const getStatusText = (status: string) => getStatusLabel(status);
  const getStatusIconEmoji = (status: string) => {
    const Icon = getStatusIconFromConfig(status);
    return <Icon className="size-3.5" />;
  };

  // inline styles باستخدام اللون من API
  const getPriorityStyle = (priority: string) => ({
    backgroundColor: `${getPriorityHexColor(priority)}20`,
    color: getPriorityHexColor(priority),
    borderColor: `${getPriorityHexColor(priority)}50`,
  });

  const getPriorityText = (priority: string) => getPriorityLabel(priority);

  const getInstitutionTypeText = (type: string) => getInstitutionTypeLabel(type);

  const handleViewDetails = (request: Request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  // تعديل دالة بدء التنفيذ - التحقق من التوفر فقط دون خصم
  const handleStartProgress = async (id: string, title: string) => {
    const request = warehouseRequests.find(r => r.id === id);
    if (!request) return;

    // التحقق من توفر المخزون فقط دون خصم
    if (request.requestedItems && request.requestedItems.length > 0) {
      let canFulfillAll = true;
      const insufficientItems: string[] = [];

      for (const item of request.requestedItems) {
        const stockCheck = await InventoryService.checkStockAvailability(
          item.itemName,
          item.quantity
        );

        if (!stockCheck.canFulfill) {
          canFulfillAll = false;
          insufficientItems.push(`${item.itemName}: مطلوب ${item.quantity} ${item.unitType}, متوفر ${stockCheck.insufficientItems[0]?.availableQuantity || 0}`);
        }
      }

      if (!canFulfillAll) {
        toast({
          title: "مخزون غير كافٍ",
          description: `عناصر غير متوفرة بالكمية المطلوبة:\n${insufficientItems.join('\n')}`,
          variant: "destructive"
        });
        return;
      }
    } else {
      const stockCheck = await InventoryService.checkStockAvailability(
        request.title,
        request.quantity
      );

      if (!stockCheck.canFulfill) {
        const insufficientItem = stockCheck.insufficientItems[0];
        toast({
          title: "مخزون غير كافٍ",
          description: `العنصر المطلوب: ${insufficientItem.requestedItem}, المطلوب: ${insufficientItem.requestedQuantity}, المتوفر: ${insufficientItem.availableQuantity}`,
          variant: "destructive"
        });
        return;
      }
    }

    onUpdateStatus(id, 'in-progress');
    toast({
      title: "تم بدء التنفيذ",
      description: `تم بدء تنفيذ الطلب: ${title}. سيتم خصم المخزون عند الجاهزية للاستلام.`,
    });
  };

  // جعل الطلب جاهز للاستلام — الباك اند يتولى خصم المخزون
  const handleReadyForPickup = async (id: string, title: string) => {
    onUpdateStatus(id, 'ready-for-pickup');
    toast({
      title: "جاهز للاستلام",
      description: `الطلب "${title}" جاهز للاستلام وتم خصم العناصر من المخزون`,
    });
  };

  // إرجاع العناصر للمخزون — الباك اند يتولى الإرجاع
  const handleReturnToInventory = async (id: string, title: string) => {
    onUpdateStatus(id, 'in-progress');
    toast({
      title: "تم إرجاع العناصر للمخزون",
      description: `تم إرجاع عناصر الطلب "${title}" للمخزون بنجاح`,
    });
  };

  // دالة جديدة لإعادة تنفيذ الطلبات غير المستلمة
  const handleRetryUndelivered = (id: string, title: string) => {
    onUpdateStatus(id, 'pending');
    toast({
      title: "تم إعادة إرسال الطلب",
      description: `تم إعادة إرسال الطلب "${title}" للتنفيذ مرة أخرى`,
    });
  };

  // Calculate total quantity with detailed breakdown
  const calculateTotalQuantity = () => {
    let total = 0;
    
    warehouseRequests.forEach(request => {
      if (request.requestedItems && request.requestedItems.length > 0) {
        request.requestedItems.forEach(item => {
          total += item.quantity;
        });
      } else if (request.itemsBreakdown && request.itemsBreakdown.length > 0) {
        request.itemsBreakdown.forEach(item => {
          total += item.quantity;
        });
      } else if (request.quantity > 0) {
        total += request.quantity;
      }
    });
    
    return total;
  };

  // Get detailed items breakdown for warehouse requests
  const getDetailedItemsData = () => {
    const itemsBreakdown: Record<string, { name: string; totalQuantity: number; unit: string; requests: string[]; institutions: string[] }> = {};
    
    warehouseRequests.forEach(request => {
      if (request.requestedItems && request.requestedItems.length > 0) {
        request.requestedItems.forEach(item => {
          const key = item.originalKey === 'other' ? `custom_${item.itemName}` : item.originalKey;
          const name = item.itemName;
          
          if (!itemsBreakdown[key]) {
            itemsBreakdown[key] = {
              name: name,
              totalQuantity: 0,
              unit: item.unitType,
              requests: [],
              institutions: []
            };
          }
          itemsBreakdown[key].totalQuantity += item.quantity;
          if (!itemsBreakdown[key].requests.includes(request.title)) {
            itemsBreakdown[key].requests.push(request.title);
          }
          if (!itemsBreakdown[key].institutions.includes(request.location)) {
            itemsBreakdown[key].institutions.push(request.location);
          }
        });
      } else if (request.itemsBreakdown && request.itemsBreakdown.length > 0) {
        request.itemsBreakdown.forEach(item => {
          const key = `breakdown_${item.key}`;
          
          if (!itemsBreakdown[key]) {
            itemsBreakdown[key] = {
              name: item.name,
              totalQuantity: 0,
              unit: item.unit,
              requests: [],
              institutions: []
            };
          }
          itemsBreakdown[key].totalQuantity += item.quantity;
          if (!itemsBreakdown[key].requests.includes(request.title)) {
            itemsBreakdown[key].requests.push(request.title);
          }
          if (!itemsBreakdown[key].institutions.includes(request.location)) {
            itemsBreakdown[key].institutions.push(request.location);
          }
        });
      } else if (request.quantity > 0 && request.title) {
        const key = `main_${request.title}`;
        if (!itemsBreakdown[key]) {
          itemsBreakdown[key] = {
            name: request.title,
            totalQuantity: 0,
            unit: request.unitType,
            requests: [],
            institutions: []
          };
        }
        itemsBreakdown[key].totalQuantity += request.quantity;
        if (!itemsBreakdown[key].requests.includes(request.title)) {
          itemsBreakdown[key].requests.push(request.title);
        }
        if (!itemsBreakdown[key].institutions.includes(request.location)) {
          itemsBreakdown[key].institutions.push(request.location);
        }
      }
    });

    return Object.entries(itemsBreakdown).map(([key, data]) => ({
      key,
      ...data
    }));
  };

  // Get institutions data
  const getInstitutionsData = (type: 'school' | 'university') => {
    const filteredRequests = warehouseRequests.filter(r => r.institutionType === type);
    const institutionGroups = filteredRequests.reduce((acc, request) => {
      if (!acc[request.location]) {
        acc[request.location] = {
          type: request.institutionType,
          requests: [],
          totalQuantity: 0,
          totalStudents: 0
        };
      }
      acc[request.location].requests.push(request);
      
      // Calculate quantity for this request
      let requestQuantity = 0;
      if (request.requestedItems && request.requestedItems.length > 0) {
        requestQuantity = request.requestedItems.reduce((sum, item) => sum + item.quantity, 0);
      } else if (request.itemsBreakdown && request.itemsBreakdown.length > 0) {
        requestQuantity = request.itemsBreakdown.reduce((sum, item) => sum + item.quantity, 0);
      } else {
        requestQuantity = request.quantity;
      }
      
      acc[request.location].totalQuantity += requestQuantity;
      acc[request.location].totalStudents += request.studentsAffected;
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(institutionGroups).map(([name, data]) => ({
      name,
      ...data
    }));
  };

  // Warehouse-specific stats (including undelivered and rejected)
  const stats = {
    total: warehouseRequests.length,
    pending: warehouseRequests.filter(r => r.status === 'pending').length,
    inProgress: warehouseRequests.filter(r => r.status === 'in-progress').length,
    completed: warehouseRequests.filter(r => r.status === 'completed').length,
    undelivered: warehouseRequests.filter(r => r.status === 'undelivered').length,
    rejected: warehouseRequests.filter(r => r.status === 'rejected').length,
    highPriority: warehouseRequests.filter(r => isHighPriority(r.priority)).length,
    totalQuantity: calculateTotalQuantity(),
    schools: warehouseRequests.filter(r => r.institutionType === 'school').length,
    universities: warehouseRequests.filter(r => r.institutionType === 'university').length
  };

  const openStatsModal = (type: 'total' | 'quantity' | 'pending' | 'inProgress' | 'completed' | 'highPriority' | 'schools' | 'universities' | 'detailed-items' | 'undelivered' | 'rejected', title: string, data?: any) => {
    let filteredRequestsForModal = warehouseRequests;
    
    switch (type) {
      case 'pending':
        filteredRequestsForModal = warehouseRequests.filter(r => r.status === 'pending');
        break;
      case 'inProgress':
        filteredRequestsForModal = warehouseRequests.filter(r => r.status === 'in-progress');
        break;
      case 'completed':
        filteredRequestsForModal = warehouseRequests.filter(r => r.status === 'completed');
        break;
      case 'undelivered':
        filteredRequestsForModal = warehouseRequests.filter(r => r.status === 'undelivered');
        break;
      case 'rejected':
        filteredRequestsForModal = warehouseRequests.filter(r => r.status === 'rejected');
        break;
      case 'highPriority':
        filteredRequestsForModal = warehouseRequests.filter(r => isHighPriority(r.priority));
        break;
      case 'schools':
        filteredRequestsForModal = warehouseRequests.filter(r => r.institutionType === 'school');
        break;
      case 'universities':
        filteredRequestsForModal = warehouseRequests.filter(r => r.institutionType === 'university');
        break;
      case 'detailed-items':
        filteredRequestsForModal = warehouseRequests;
        break;
      default:
        filteredRequestsForModal = warehouseRequests;
    }

    setStatsModal({
      isOpen: true,
      title,
      type,
      requests: filteredRequestsForModal,
      data
    });
  };

  return (
    <div className="space-y-6">
      {/* Warehouse Header */}
      <div className="mb-2 flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Warehouse className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{user.warehouseName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            معالجة طلبات <span className="font-medium text-foreground">{warehouseDepartmentDisplay}</span> من مؤسسات المحافظة
          </p>
        </div>
      </div>

      {/* Tabs for Requests and Inventory */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests" className="gap-2">
            <ClipboardList className="size-4" />
            إدارة الطلبات
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2">
            <Package className="size-4" />
            إدارة المخزون
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          {/* Warehouse Stats - including rejected */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              label="إجمالي الطلبات"
              value={stats.total}
              icon={ClipboardList}
              tone="primary"
              onClick={() => openStatsModal('total', 'إجمالي الطلبات')}
            />
            <StatCard
              label="إجمالي العناصر المطلوبة"
              value={stats.totalQuantity}
              icon={Package}
              tone="warning"
              hint="انقر لرؤية تفاصيل العناصر"
              onClick={() => {
                const detailedItemsData = getDetailedItemsData();
                openStatsModal('detailed-items', 'تفاصيل إجمالي العناصر المطلوبة', detailedItemsData);
              }}
            />
          </div>

          {/* Status Overview for Warehouse */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <StatCard
              label="قيد الانتظار"
              value={stats.pending}
              icon={Clock}
              tone="warning"
              onClick={() => openStatsModal('pending', 'الطلبات قيد الانتظار')}
            />
            <StatCard
              label="قيد التنفيذ"
              value={stats.inProgress}
              icon={RefreshCw}
              tone="primary"
              onClick={() => openStatsModal('inProgress', 'الطلبات قيد التنفيذ')}
            />
            <StatCard
              label="مكتمل"
              value={stats.completed}
              icon={CheckCircle}
              tone="success"
              onClick={() => openStatsModal('completed', 'الطلبات المكتملة')}
            />
            <StatCard
              label="غير مستلم"
              value={stats.undelivered}
              icon={Undo2}
              tone="warning"
              onClick={() => openStatsModal('undelivered', 'الطلبات غير المستلمة')}
            />
            <StatCard
              label="مرفوض"
              value={stats.rejected}
              icon={X}
              tone="danger"
              onClick={() => openStatsModal('rejected', 'الطلبات المرفوضة')}
            />
            <StatCard
              label="أولوية عالية"
              value={stats.highPriority}
              icon={Flame}
              tone="danger"
              onClick={() => openStatsModal('highPriority', 'الطلبات عالية الأولوية')}
            />
          </div>

          {/* Institution Types Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              label="طلبات من المدارس"
              value={stats.schools}
              icon={School}
              tone="success"
              hint="انقر لرؤية تفاصيل المدارس"
              onClick={() => {
                const schoolsData = getInstitutionsData('school');
                openStatsModal('schools', 'تفاصيل طلبات المدارس', schoolsData);
              }}
            />
            <StatCard
              label="طلبات من الجامعات"
              value={stats.universities}
              icon={GraduationCap}
              tone="info"
              hint="انقر لرؤية تفاصيل الجامعات"
              onClick={() => {
                const universitiesData = getInstitutionsData('university');
                openStatsModal('universities', 'تفاصيل طلبات الجامعات', universitiesData);
              }}
            />
          </div>

          {/* Requests List for Warehouse */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-5 text-primary" />
                <span>طلبات قسم {warehouseDepartmentDisplay}</span>
              </CardTitle>
              <CardDescription>
                الطلبات الواردة من المؤسسات التعليمية في المحافظة
              </CardDescription>

              {/* Search and Filter Bar */}
              <div className="flex items-center gap-2 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`ابحث في طلبات قسم ${warehouseDepartmentDisplay}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ps-10"
                  />
                </div>

                {/* Priority Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-48 bg-card">
                      <SelectValue placeholder="فلترة حسب الأهمية" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border shadow-lg z-50">
                      <SelectItem value="all">جميع المستويات</SelectItem>
                      <SelectItem value="high">
                        <span className="flex items-center gap-2">
                          <Circle className="size-3 fill-danger text-danger" />
                          عالية الأهمية
                        </span>
                      </SelectItem>
                      <SelectItem value="medium">
                        <span className="flex items-center gap-2">
                          <Circle className="size-3 fill-warning text-warning" />
                          متوسطة الأهمية
                        </span>
                      </SelectItem>
                      <SelectItem value="low">
                        <span className="flex items-center gap-2">
                          <Circle className="size-3 fill-success text-success" />
                          منخفضة الأهمية
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(searchTerm || priorityFilter !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setPriorityFilter("all");
                    }}
                  >
                    مسح الفلاتر
                  </Button>
                )}
              </div>

              {/* Search and Filter Results Summary */}
              {(searchTerm || priorityFilter !== "all") && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  {filteredRequests.length === 0 ? (
                    <>
                      <X className="size-4 text-danger" />
                      <span>لم يتم العثور على نتائج بالفلاتر المحددة</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="size-4 text-success" />
                      <span>تم العثور على {filteredRequests.length} نتيجة
                        {searchTerm && ` للبحث عن "${searchTerm}"`}
                        {priorityFilter !== "all" && ` مع الأهمية: ${getPriorityText(priorityFilter)}`}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Info message if no requests */}
              {warehouseRequests.length === 0 && (
                <div className="mt-4 p-3 bg-info/10 rounded-lg border border-info/30 flex items-start gap-2">
                  <Info className="size-5 text-info shrink-0 mt-0.5" />
                  <p className="text-sm text-info">
                    <strong>ملاحظة:</strong> لا توجد طلبات متخصصة لقسم "{warehouseDepartmentDisplay}" حالياً.
                    <br />
                    الطلبات تظهر هنا فقط بعد إرسالها من المؤسسات التعليمية (ليس المسودات).
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                searchTerm || priorityFilter !== "all" ? (
                  <EmptyState
                    icon={Search}
                    title="لم يتم العثور على طلبات بالفلاتر المحددة"
                    description="جرب تغيير الفلاتر أو امسحها لعرض جميع الطلبات"
                  />
                ) : (
                  <EmptyState
                    icon={Package}
                    title={`لا توجد طلبات متخصصة لقسم "${warehouseDepartmentDisplay}" بعد`}
                    description="ستظهر هنا الطلبات المتخصصة عند إرسالها من المؤسسات التعليمية"
                  />
                )
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-6 hover:bg-muted/30 hover:shadow-md transition-[background-color,box-shadow]">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-semibold text-lg">{request.title}</h3>
                            <Badge className="border" style={getPriorityStyle(request.priority)}>
                              {getPriorityText(request.priority)}
                            </Badge>
                            <Badge className={`${getStatusColor(request.status)} border`}>
                              <div className="flex items-center gap-1">
                                {getStatusIconEmoji(request.status)}
                                <span>{getStatusText(request.status)}</span>
                              </div>
                            </Badge>
                            <Badge variant="outline" className="border-border">
                              {getInstitutionTypeText(request.institutionType)}
                            </Badge>
                          </div>
                          
                          {/* Sender institution name */}
                          <div className="mb-3">
                            <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg border border-border">
                              <Building className="h-5 w-5 text-primary" />
                              <span className="font-medium text-primary">الجهة المرسلة:</span>
                              <span className="font-bold text-primary">{request.location}</span>
                            </div>
                          </div>

                          {/* Display rejection reason if rejected */}
                          {request.status === 'rejected' && request.rejectionReason && (
                            <div className="mb-3 p-3 bg-danger/10 rounded-lg border border-danger/30">
                              <div className="flex items-center gap-2 mb-2">
                                <X className="h-5 w-5 text-danger" />
                                <span className="font-medium text-danger">سبب الرفض:</span>
                              </div>
                              <p className="text-danger text-sm">{request.rejectionReason}</p>
                              {request.rejectionDate && (
                                <p className="text-danger text-xs mt-1">
                                  تاريخ الرفض: {new Date(request.rejectionDate).toLocaleString('ar-EG')}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Display cancellation reason if cancelled */}
                          {request.status === 'cancelled' && request.cancellationReason && (
                            <div className="mb-3 p-3 bg-muted/30 rounded-lg border border-border">
                              <div className="flex items-center gap-2 mb-2">
                                <X className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium text-foreground">سبب الإلغاء من المؤسسة:</span>
                              </div>
                              <p className="text-foreground text-sm">{request.cancellationReason}</p>
                              {request.cancellationDate && (
                                <p className="text-muted-foreground text-xs mt-1">
                                  تاريخ الإلغاء: {new Date(request.cancellationDate).toLocaleString('ar-EG')}
                                </p>
                              )}
                            </div>
                          )}

                          {/* تفاصيل العناصر المطلوبة */}
                          {request.requestedItems && request.requestedItems.length > 0 && (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <List className="h-5 w-5 text-info" />
                                <span className="font-medium text-foreground">العناصر المطلوبة بالتفصيل:</span>
                              </div>
                              <div className="bg-muted/50 p-3 rounded-lg border border-border">
                                <div className="grid gap-2">
                                  {request.requestedItems.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between bg-card p-2 rounded border border-border">
                                      <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-primary" />
                                        <span className="font-medium">{item.itemName}</span>
                                      </div>
                                      <Badge variant="outline" className="bg-muted/50 text-primary border-primary/30">
                                        {item.quantity} {item.unitType}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-2 pt-2 border-t border-border">
                                  <span className="text-sm text-primary font-medium">
                                    إجمالي العناصر: {request.requestedItems.reduce((sum, item) => sum + item.quantity, 0)} عنصر
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{request.description}</p>
                          
                          {/* Request Details */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                            {request.quantity > 0 && (
                              <div className="flex items-center gap-2 bg-muted/50 p-2 rounded">
                                <Package className="h-4 w-4 text-primary" />
                                <span className="font-medium">{request.quantity} {request.unitType}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 bg-muted/30 p-2 rounded">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{new Date(request.dateSubmitted).toLocaleDateString('ar-EG')}</span>
                            </div>
                            {request.schoolLocation && (
                              <div className="flex items-center gap-2 bg-warning/10 p-2 rounded">
                                <MapPin className="h-4 w-4 text-foreground" />
                                <span>{request.schoolLocation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewDetails(request)}
                            className="hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors"
                          >
                            <Eye className="h-4 w-4 ms-1" />
                            عرض التفاصيل
                          </Button>
                          
                          {request.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleStartProgress(request.id, request.title)}
                                className="bg-primary text-primary-foreground hover:bg-primary-700 transition-colors"
                              >
                                <Play className="h-4 w-4 ms-1" />
                                بدء التنفيذ
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleRejectRequest(request)}
                                className="hover:bg-danger transition-colors"
                              >
                                <X className="h-4 w-4 ms-1" />
                                رفض الطلب
                              </Button>
                            </>
                          )}
                          
                          {request.status === 'in-progress' && (
                            <Button 
                              size="sm"
                              onClick={() => handleReadyForPickup(request.id, request.title)}
                              className="bg-warning hover:bg-warning/80 text-warning-foreground transition-colors"
                            >
                              <CheckCircle className="h-4 w-4 ms-1" />
                              جاهز للاستلام
                            </Button>
                          )}

                          {request.status === 'ready-for-pickup' && (
                            <div className="flex gap-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    size="sm"
                                    variant="outline"
                                    className="bg-danger/10 hover:bg-danger/15 text-danger border-danger/40 hover:border-red-400"
                                  >
                                    <Undo2 className="h-4 w-4 ms-1" />
                                    إرجاع للمخزون
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>تأكيد إرجاع العناصر للمخزون</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هل أنت متأكد من إرجاع عناصر هذا الطلب للمخزون؟ سيتم إعادة الطلب لحالة "قيد التنفيذ".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleReturnToInventory(request.id, request.title)}
                                      className="bg-danger hover:bg-danger"
                                    >
                                      إرجاع للمخزون
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}

                          {request.status === 'undelivered' && (
                            <Button 
                              size="sm"
                              onClick={() => handleRetryUndelivered(request.id, request.title)}
                              className="bg-warning hover:bg-warning/80 text-warning-foreground transition-colors"
                            >
                              <RefreshCw className="h-4 w-4 ms-1" />
                              إعادة التنفيذ
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <InventoryManagement 
            warehouseName={user.warehouseName}
            department={warehouseDepartment}
          />
        </TabsContent>
      </Tabs>

      <RequestDetailsModal 
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <RejectRequestDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onReject={handleConfirmReject}
        requestTitle={rejectingRequest?.title || ""}
        type="warehouse"
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

export default WarehouseDashboard;
