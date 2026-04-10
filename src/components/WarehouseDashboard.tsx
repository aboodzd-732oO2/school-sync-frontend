import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, MapPin, AlertCircle, CheckCircle, Clock, Package, Hash, Eye, Play, Search, Building, Warehouse, Filter, AlertTriangle, List, Undo2, RefreshCw, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RequestDetailsModal from "@/components/RequestDetailsModal";
import StatsDetailsModal from "@/components/StatsDetailsModal";
import RejectRequestDialog from "@/components/RejectRequestDialog";
import InventoryManagement from "@/components/InventoryManagement";
import { InventoryService } from "@/services/inventoryService";

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

  // Warehouse specialization mapping
  const getWarehouseDepartment = (warehouseName: string): string => {
    // Extract the warehouse type from the full name (before the " - " separator)
    const warehouseType = warehouseName.split(' - ')[0];
    const warehouseMapping: Record<string, string> = {
      'مستودع المواد والأثاث التعليمي': 'materials',
      'مستودع الصيانة والإصلاح': 'maintenance',
      'مستودع المواد الأكاديمية والكتب': 'academic-materials',
      'مستودع التقنيات التعليمية': 'technology',
      'مستودع السلامة والأمان': 'safety'
    };
    return warehouseMapping[warehouseType] || 'materials';
  };

  const departmentTranslations: { [key: string]: string } = {
    'materials': 'المواد والأثاث',
    'maintenance': 'الصيانة والإصلاح',
    'academic-materials': 'المواد الأكاديمية والكتب',
    'technology': 'التقنيات التعليمية',
    'safety': 'السلامة والأمان'
  };

  const warehouseDepartment = getWarehouseDepartment(user.warehouseName);
  const warehouseDepartmentDisplay = departmentTranslations[warehouseDepartment];

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'undelivered': return 'bg-red-100 text-red-800 border-red-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '⏳ قيد الانتظار';
      case 'in-progress': return '🔄 قيد التنفيذ';
      case 'completed': return '✅ مكتمل';
      case 'undelivered': return '🔄 لم يتم الاستلام - مُرجع للمخزون';
      case 'rejected': return '❌ مرفوض';
      case 'cancelled': return '🚫 ملغي من المؤسسة';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in-progress': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'undelivered': return <Undo2 className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴 عالية';
      case 'medium': return '🟡 متوسطة';
      case 'low': return '🟢 منخفضة';
      default: return priority;
    }
  };

  const getInstitutionTypeText = (type: string) => {
    return type === 'school' ? '🏫 مدرسة' : '🎓 جامعة';
  };

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
          user.warehouseName,
          warehouseDepartment,
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
        user.warehouseName,
        warehouseDepartment,
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
    highPriority: warehouseRequests.filter(r => r.priority === 'high').length,
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
        filteredRequestsForModal = warehouseRequests.filter(r => r.priority === 'high');
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
      <div className="text-center mb-8 p-6 bg-gradient-to-r from-[hsl(142,60%,25%)] via-[hsl(142,50%,20%)] to-[hsl(142,60%,25%)] rounded-2xl shadow-lg border border-[hsl(142,50%,15%)]">
        <h1 className="text-3xl font-bold text-white mb-2">
          <Warehouse className="inline h-8 w-8 mr-2" />
          {user.warehouseName}
        </h1>
        <p className="text-white/90 font-medium">إدارة طلبات {warehouseDepartmentDisplay}</p>
        <div className="mt-2 p-3 bg-white/20 rounded-lg border border-white/30 backdrop-blur-sm">
          <p className="text-sm text-white">
            🎯 <strong>تخصصك:</strong> معالجة طلبات "{warehouseDepartmentDisplay}" من جميع المؤسسات التعليمية في نفس المحافظة
          </p>
        </div>
      </div>

      {/* Tabs for Requests and Inventory */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests">📋 إدارة الطلبات</TabsTrigger>
          <TabsTrigger value="inventory">📦 إدارة المخزون</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          {/* Warehouse Stats - including rejected */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="cursor-pointer card-hover border-2 border-[hsl(142,50%,30%)] bg-gradient-to-br from-white to-[hsl(142,30%,96%)] shadow-md hover:shadow-xl hover:border-[hsl(142,50%,25%)] transition-all duration-300" onClick={() => openStatsModal('total', 'إجمالي الطلبات')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="icon-container-primary">
                    <Hash className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[hsl(142,60%,25%)]">{stats.total}</p>
                    <p className="text-sm font-semibold text-[hsl(142,60%,20%)]">📋 إجمالي الطلبات</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer card-hover border-2 border-[hsl(38,70%,50%)] bg-gradient-to-br from-white to-[hsl(38,30%,96%)] shadow-md hover:shadow-xl hover:border-[hsl(38,85%,60%)] transition-all duration-300" onClick={() => {
              const detailedItemsData = getDetailedItemsData();
              openStatsModal('detailed-items', 'تفاصيل إجمالي العناصر المطلوبة', detailedItemsData);
            }}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="icon-container-golden">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[hsl(38,85%,60%)]">{stats.totalQuantity}</p>
                    <p className="text-sm font-semibold text-[hsl(38,80%,50%)]">📦 إجمالي العناصر المطلوبة</p>
                    <p className="text-xs text-gray-600 mt-1">انقر لرؤية تفاصيل العناصر</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Overview for Warehouse - including undelivered and rejected */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Card className="cursor-pointer card-hover border-2 border-[hsl(38,70%,50%)] bg-gradient-to-br from-white to-[hsl(38,30%,96%)] shadow-md hover:shadow-xl hover:border-[hsl(38,85%,60%)] transition-all duration-300" onClick={() => openStatsModal('pending', 'الطلبات قيد الانتظار')}>
              <CardContent className="p-5">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="p-2.5 bg-gradient-to-br from-[hsl(38,85%,60%)] to-[hsl(38,90%,50%)] rounded-xl shadow-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-[hsl(38,85%,60%)]">{stats.pending}</p>
                    <p className="text-sm font-semibold text-[hsl(38,80%,50%)]">⏳ قيد الانتظار</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer card-hover border-2 border-[hsl(142,50%,30%)] bg-gradient-to-br from-white to-[hsl(142,30%,96%)] shadow-md hover:shadow-xl hover:border-[hsl(142,50%,25%)] transition-all duration-300" onClick={() => openStatsModal('inProgress', 'الطلبات قيد التنفيذ')}>
              <CardContent className="p-5">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="p-2.5 bg-gradient-to-br from-[hsl(142,50%,35%)] to-[hsl(142,60%,25%)] rounded-xl shadow-lg">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-[hsl(142,60%,25%)]">{stats.inProgress}</p>
                    <p className="text-sm font-semibold text-[hsl(142,60%,20%)]">🔄 قيد التنفيذ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer card-hover border-2 border-[hsl(142,50%,30%)] bg-gradient-to-br from-white to-[hsl(142,30%,96%)] shadow-md hover:shadow-xl hover:border-[hsl(142,50%,25%)] transition-all duration-300" onClick={() => openStatsModal('completed', 'الطلبات المكتملة')}>
              <CardContent className="p-5">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="p-2.5 bg-gradient-to-br from-[hsl(142,50%,35%)] to-[hsl(142,60%,25%)] rounded-xl shadow-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-[hsl(142,60%,25%)]">{stats.completed}</p>
                    <p className="text-sm font-semibold text-[hsl(142,60%,20%)]">✅ مكتمل</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer card-hover border-2 border-[hsl(38,70%,50%)] bg-gradient-to-br from-white to-[hsl(38,30%,96%)] shadow-md hover:shadow-xl hover:border-[hsl(38,85%,60%)] transition-all duration-300" onClick={() => openStatsModal('undelivered', 'الطلبات غير المستلمة')}>
              <CardContent className="p-5">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="p-2.5 bg-gradient-to-br from-[hsl(38,85%,60%)] to-[hsl(38,90%,50%)] rounded-xl shadow-lg">
                    <Undo2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-[hsl(38,85%,60%)]">{stats.undelivered}</p>
                    <p className="text-sm font-semibold text-[hsl(38,80%,50%)]">🔄 غير مستلم</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer card-hover border-2 border-[hsl(38,70%,50%)] bg-gradient-to-br from-white to-[hsl(38,30%,96%)] shadow-md hover:shadow-xl hover:border-[hsl(38,85%,60%)] transition-all duration-300" onClick={() => openStatsModal('rejected', 'الطلبات المرفوضة')}>
              <CardContent className="p-5">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="p-2.5 bg-gradient-to-br from-[hsl(38,85%,60%)] to-[hsl(38,90%,50%)] rounded-xl shadow-lg">
                    <X className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-[hsl(38,85%,60%)]">{stats.rejected}</p>
                    <p className="text-sm font-semibold text-[hsl(38,80%,50%)]">❌ مرفوض</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer card-hover border-2 border-[hsl(38,70%,50%)] bg-gradient-to-br from-white to-[hsl(38,30%,96%)] shadow-md hover:shadow-xl hover:border-[hsl(38,85%,60%)] transition-all duration-300" onClick={() => openStatsModal('highPriority', 'الطلبات عالية الأولوية')}>
              <CardContent className="p-5">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="p-2.5 bg-gradient-to-br from-[hsl(38,85%,60%)] to-[hsl(38,90%,50%)] rounded-xl shadow-lg">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-[hsl(38,85%,60%)]">{stats.highPriority}</p>
                    <p className="text-sm font-semibold text-[hsl(38,80%,50%)]">🔴 أولوية عالية</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Institution Types Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="cursor-pointer card-hover border-2 border-[hsl(142,50%,30%)] bg-gradient-to-br from-white to-[hsl(142,30%,96%)] shadow-md hover:shadow-xl hover:border-[hsl(142,50%,25%)] transition-all duration-300" onClick={() => {
              const schoolsData = getInstitutionsData('school');
              openStatsModal('schools', 'تفاصيل طلبات المدارس', schoolsData);
            }}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="icon-container-green">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[hsl(142,60%,25%)]">{stats.schools}</p>
                    <p className="text-sm font-semibold text-[hsl(142,60%,20%)]">🏫 طلبات من المدارس</p>
                    <p className="text-xs text-gray-600 mt-1">انقر لرؤية تفاصيل المدارس</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer card-hover border-2 border-[hsl(142,50%,30%)] bg-gradient-to-br from-white to-[hsl(142,30%,96%)] shadow-md hover:shadow-xl hover:border-[hsl(142,50%,25%)] transition-all duration-300" onClick={() => {
              const universitiesData = getInstitutionsData('university');
              openStatsModal('universities', 'تفاصيل طلبات الجامعات', universitiesData);
            }}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="icon-container-primary">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[hsl(142,60%,25%)]">{stats.universities}</p>
                    <p className="text-sm font-semibold text-[hsl(142,60%,20%)]">🎓 طلبات من الجامعات</p>
                    <p className="text-xs text-gray-600 mt-1">انقر لرؤية تفاصيل الجامعات</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Requests List for Warehouse */}
          <Card className="border-[hsl(142,30%,85%)]">
            <CardHeader className="bg-gradient-to-r from-[hsl(142,60%,25%)] to-[hsl(142,50%,20%)] text-white">
              <CardTitle className="flex items-center space-x-2 space-x-reverse text-white">
                <span>📋</span>
                <span>طلبات قسم {warehouseDepartmentDisplay}</span>
              </CardTitle>
              <CardDescription className="text-white/90">
                جميع الطلبات الواردة من المؤسسات التعليمية لقسم {warehouseDepartmentDisplay} في نفس المحافظة
              </CardDescription>
              
              {/* Search and Filter Bar */}
              <div className="flex items-center space-x-2 space-x-reverse mt-4">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={`🔍 ابحث في طلبات قسم ${warehouseDepartmentDisplay}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
                
                {/* Priority Filter */}
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-48 bg-white">
                      <SelectValue placeholder="فلترة حسب الأهمية" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      <SelectItem value="all">جميع المستويات</SelectItem>
                      <SelectItem value="high">🔴 عالية الأهمية</SelectItem>
                      <SelectItem value="medium">🟡 متوسطة الأهمية</SelectItem>
                      <SelectItem value="low">🟢 منخفضة الأهمية</SelectItem>
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
                <div className="text-sm text-gray-600 mt-2">
                  {filteredRequests.length === 0 ? (
                    <span>❌ لم يتم العثور على نتائج بالفلاتر المحددة</span>
                  ) : (
                    <span>✅ تم العثور على {filteredRequests.length} نتيجة 
                      {searchTerm && ` للبحث عن "${searchTerm}"`}
                      {priorityFilter !== "all" && ` مع الأهمية: ${getPriorityText(priorityFilter)}`}
                    </span>
                  )}
                </div>
              )}

              {/* Info message if no requests */}
              {warehouseRequests.length === 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    ℹ️ <strong>ملاحظة:</strong> لا توجد طلبات متخصصة لقسم "{warehouseDepartmentDisplay}" حالياً.
                    <br />
                    الطلبات تظهر هنا فقط بعد إرسالها من المؤسسات التعليمية (ليس المسودات).
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  {searchTerm || priorityFilter !== "all" ? (
                    <>
                      <div className="text-6xl mb-4">🔍</div>
                      <p className="text-gray-500 text-lg">لم يتم العثور على طلبات بالفلاتر المحددة</p>
                      <p className="text-gray-400 text-sm mt-2">جرب تغيير الفلاتر أو امسحها لعرض جميع الطلبات</p>
                    </>
                  ) : (
                    <>
                      <div className="text-6xl mb-4">📦</div>
                      <p className="text-gray-500 text-lg">لا توجد طلبات متخصصة لقسم "{warehouseDepartmentDisplay}" بعد.</p>
                      <p className="text-gray-400 text-sm mt-2">ستظهر هنا الطلبات المتخصصة عند إرسالها من المؤسسات التعليمية.</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-all duration-200 hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 space-x-reverse mb-3">
                            <h3 className="font-semibold text-lg">{request.title}</h3>
                            <Badge className={`${getPriorityColor(request.priority)} border`}>
                              {getPriorityText(request.priority)}
                            </Badge>
                            <Badge className={`${getStatusColor(request.status)} border`}>
                              <div className="flex items-center space-x-1 space-x-reverse">
                                {getStatusIcon(request.status)}
                                <span>{getStatusText(request.status)}</span>
                              </div>
                            </Badge>
                            <Badge variant="outline" className="border-gray-300">
                              {getInstitutionTypeText(request.institutionType)}
                            </Badge>
                          </div>
                          
                          {/* Sender institution name */}
                          <div className="mb-3">
                            <div className="flex items-center space-x-2 space-x-reverse bg-[hsl(142,30%,96%)] p-3 rounded-lg border border-[hsl(142,30%,85%)]">
                              <Building className="h-5 w-5 text-[hsl(142,60%,25%)]" />
                              <span className="font-medium text-[hsl(142,60%,20%)]">الجهة المرسلة:</span>
                              <span className="font-bold text-[hsl(142,60%,25%)]">{request.location}</span>
                            </div>
                          </div>

                          {/* Display rejection reason if rejected */}
                          {request.status === 'rejected' && request.rejectionReason && (
                            <div className="mb-3 p-3 bg-red-50 rounded-lg border border-red-200">
                              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                                <X className="h-5 w-5 text-red-600" />
                                <span className="font-medium text-red-700">سبب الرفض:</span>
                              </div>
                              <p className="text-red-800 text-sm">{request.rejectionReason}</p>
                              {request.rejectionDate && (
                                <p className="text-red-600 text-xs mt-1">
                                  تاريخ الرفض: {new Date(request.rejectionDate).toLocaleString('ar-EG')}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Display cancellation reason if cancelled */}
                          {request.status === 'cancelled' && request.cancellationReason && (
                            <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                                <X className="h-5 w-5 text-gray-600" />
                                <span className="font-medium text-gray-700">سبب الإلغاء من المؤسسة:</span>
                              </div>
                              <p className="text-gray-800 text-sm">{request.cancellationReason}</p>
                              {request.cancellationDate && (
                                <p className="text-gray-600 text-xs mt-1">
                                  تاريخ الإلغاء: {new Date(request.cancellationDate).toLocaleString('ar-EG')}
                                </p>
                              )}
                            </div>
                          )}

                          {/* تفاصيل العناصر المطلوبة */}
                          {request.requestedItems && request.requestedItems.length > 0 && (
                            <div className="mb-4">
                              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                                <List className="h-5 w-5 text-blue-600" />
                                <span className="font-medium text-gray-700">العناصر المطلوبة بالتفصيل:</span>
                              </div>
                              <div className="bg-[hsl(142,30%,96%)] p-3 rounded-lg border border-[hsl(142,30%,85%)]">
                                <div className="grid gap-2">
                                  {request.requestedItems.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-[hsl(142,30%,85%)]">
                                      <div className="flex items-center space-x-2 space-x-reverse">
                                        <Package className="h-4 w-4 text-[hsl(142,60%,25%)]" />
                                        <span className="font-medium">{item.itemName}</span>
                                      </div>
                                      <Badge variant="outline" className="bg-[hsl(142,30%,96%)] text-[hsl(142,60%,25%)] border-[hsl(142,50%,30%)]">
                                        {item.quantity} {item.unitType}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-2 pt-2 border-t border-[hsl(142,30%,85%)]">
                                  <span className="text-sm text-[hsl(142,60%,25%)] font-medium">
                                    إجمالي العناصر: {request.requestedItems.reduce((sum, item) => sum + item.quantity, 0)} عنصر
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{request.description}</p>
                          
                          {/* Request Details */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                            {request.quantity > 0 && (
                              <div className="flex items-center space-x-2 space-x-reverse bg-[hsl(142,30%,96%)] p-2 rounded">
                                <Package className="h-4 w-4 text-[hsl(142,60%,25%)]" />
                                <span className="font-medium">{request.quantity} {request.unitType}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2 space-x-reverse bg-gray-50 p-2 rounded">
                              <Calendar className="h-4 w-4 text-gray-600" />
                              <span>{new Date(request.dateSubmitted).toLocaleDateString('ar-EG')}</span>
                            </div>
                            {request.schoolLocation && (
                              <div className="flex items-center space-x-2 space-x-reverse bg-[hsl(38,30%,96%)] p-2 rounded">
                                <MapPin className="h-4 w-4 text-[hsl(38,85%,60%)]" />
                                <span>{request.schoolLocation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 space-x-reverse">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewDetails(request)}
                            className="hover:bg-[hsl(142,30%,96%)] hover:border-[hsl(142,50%,30%)] hover:text-[hsl(142,60%,25%)] transition-all duration-200"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            عرض التفاصيل
                          </Button>
                          
                          {request.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleStartProgress(request.id, request.title)}
                                className="bg-gradient-to-r from-[hsl(142,60%,25%)] to-[hsl(142,50%,20%)] hover:from-[hsl(142,60%,30%)] hover:to-[hsl(142,50%,25%)] text-white transition-all duration-200"
                              >
                                <Play className="h-4 w-4 mr-1" />
                                بدء التنفيذ
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleRejectRequest(request)}
                                className="hover:bg-red-700 transition-all duration-200"
                              >
                                <X className="h-4 w-4 mr-1" />
                                رفض الطلب
                              </Button>
                            </>
                          )}
                          
                          {request.status === 'in-progress' && (
                            <Button 
                              size="sm"
                              onClick={() => handleReadyForPickup(request.id, request.title)}
                              className="bg-orange-600 hover:bg-orange-700 transition-all duration-200"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              جاهز للاستلام
                            </Button>
                          )}

                          {request.status === 'ready-for-pickup' && (
                            <div className="flex space-x-2 space-x-reverse">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    size="sm"
                                    variant="outline"
                                    className="bg-red-50 hover:bg-red-100 text-red-600 border-red-300 hover:border-red-400"
                                  >
                                    <Undo2 className="h-4 w-4 mr-1" />
                                    إرجاع للمخزون
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-white">
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
                                      className="bg-red-600 hover:bg-red-700"
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
                              className="bg-orange-600 hover:bg-orange-700 transition-all duration-200"
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
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
