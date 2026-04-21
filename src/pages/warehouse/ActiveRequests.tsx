import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Calendar, MapPin, CheckCircle, Package, Eye, Play, Search, Building, Filter,
  Undo2, RefreshCw, X, ClipboardList, Info, Circle, List,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RequestDetailsModal from "@/components/RequestDetailsModal";
import RejectRequestDialog from "@/components/RejectRequestDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { WarehouseHeader } from "@/components/warehouse/WarehouseHeader";
import { InventoryService } from "@/services/inventoryService";
import { usePriorities, useInstitutionTypes } from "@/hooks/useLookups";
import { getStatusLabel, getStatusClass, getStatusIcon as getStatusIconFromConfig } from "@/lib/statusConfig";
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
  cancellationType?: string;
}

interface Props {
  requests: Request[];
  user: {
    userType: "warehouse";
    warehouseName: string;
    departmentKey?: string;
  };
  onUpdateStatus: (id: string, status: string) => void;
  onUpdateRequest?: (updatedRequest: Request) => void;
}

const ACTIVE_STATUSES = ["pending", "in-progress", "ready-for-pickup", "undelivered"];

const WarehouseActiveRequestsPage = ({ requests, user, onUpdateStatus, onUpdateRequest }: Props) => {
  const { toast } = useToast();
  const { warehouseDepartmentDisplay, warehouseRequests } = useWarehouseRequests(requests, user);
  const { getLabel: getPriorityLabel, getColor: getPriorityHexColor } = usePriorities();
  const { getLabel: getInstitutionTypeLabel } = useInstitutionTypes();

  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectingRequest, setRejectingRequest] = useState<Request | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const activeRequests = warehouseRequests.filter((r) => ACTIVE_STATUSES.includes(r.status));

  let filteredRequests = activeRequests.filter((r) =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  if (priorityFilter !== "all") {
    filteredRequests = filteredRequests.filter((r) => r.priority === priorityFilter);
  }

  const getPriorityStyle = (priority: string) => ({
    backgroundColor: `${getPriorityHexColor(priority)}20`,
    color: getPriorityHexColor(priority),
    borderColor: `${getPriorityHexColor(priority)}50`,
  });

  const getStatusIconComp = (status: string) => {
    const Icon = getStatusIconFromConfig(status);
    return <Icon className="size-3.5" />;
  };

  const handleViewDetails = (request: Request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleRejectRequest = (request: Request) => {
    setRejectingRequest(request);
    setIsRejectDialogOpen(true);
  };

  const handleConfirmReject = (reason: string) => {
    if (!rejectingRequest || !onUpdateRequest) return;
    const updatedRequest = {
      ...rejectingRequest,
      status: "rejected",
      rejectionReason: reason,
      rejectionDate: new Date().toISOString(),
    };
    onUpdateRequest(updatedRequest);
    toast({
      title: "تم رفض الطلب",
      description: `تم رفض الطلب "${rejectingRequest.title}" وإرسال السبب للمؤسسة`,
      variant: "destructive",
    });
    setRejectingRequest(null);
  };

  const handleStartProgress = async (id: string, title: string) => {
    const request = warehouseRequests.find((r) => r.id === id);
    if (!request) return;

    if (request.requestedItems && request.requestedItems.length > 0) {
      let canFulfillAll = true;
      const insufficient: string[] = [];
      for (const item of request.requestedItems) {
        const stockCheck = await InventoryService.checkStockAvailability(item.itemName, item.quantity);
        if (!stockCheck.canFulfill) {
          canFulfillAll = false;
          insufficient.push(
            `${item.itemName}: مطلوب ${item.quantity} ${item.unitType}, متوفر ${stockCheck.insufficientItems[0]?.availableQuantity || 0}`,
          );
        }
      }
      if (!canFulfillAll) {
        toast({
          title: "مخزون غير كافٍ",
          description: `عناصر غير متوفرة بالكمية المطلوبة:\n${insufficient.join("\n")}`,
          variant: "destructive",
        });
        return;
      }
    } else {
      const stockCheck = await InventoryService.checkStockAvailability(request.title, request.quantity);
      if (!stockCheck.canFulfill) {
        const insufficient = stockCheck.insufficientItems[0];
        toast({
          title: "مخزون غير كافٍ",
          description: `العنصر المطلوب: ${insufficient.requestedItem}, المطلوب: ${insufficient.requestedQuantity}, المتوفر: ${insufficient.availableQuantity}`,
          variant: "destructive",
        });
        return;
      }
    }

    onUpdateStatus(id, "in-progress");
    toast({
      title: "تم بدء التنفيذ",
      description: `تم بدء تنفيذ الطلب: ${title}. سيتم خصم المخزون عند الجاهزية للاستلام.`,
    });
  };

  const handleReadyForPickup = (id: string, title: string) => {
    onUpdateStatus(id, "ready-for-pickup");
    toast({
      title: "جاهز للاستلام",
      description: `الطلب "${title}" جاهز للاستلام وتم خصم العناصر من المخزون`,
    });
  };

  const handleReturnToInventory = (id: string, title: string) => {
    onUpdateStatus(id, "in-progress");
    toast({
      title: "تم إرجاع العناصر للمخزون",
      description: `تم إرجاع عناصر الطلب "${title}" للمخزون بنجاح`,
    });
  };

  const handleRetryUndelivered = (id: string, title: string) => {
    onUpdateStatus(id, "pending");
    toast({
      title: "تم إعادة إرسال الطلب",
      description: `تم إعادة إرسال الطلب "${title}" للتنفيذ مرة أخرى`,
    });
  };

  return (
    <div className="space-y-6">
      <WarehouseHeader
        warehouseName={user.warehouseName}
        departmentDisplay={warehouseDepartmentDisplay}
        subtitle="الطلبات التي تتطلب عملاً من المستودع"
      />

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="size-5 text-primary" />
            <span>الطلبات النشطة — قسم {warehouseDepartmentDisplay}</span>
          </CardTitle>
          <CardDescription>
            قيد الانتظار، قيد التنفيذ، جاهز للاستلام، غير مستلم
          </CardDescription>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={`ابحث في طلبات قسم ${warehouseDepartmentDisplay}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
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

          {(searchTerm || priorityFilter !== "all") && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              {filteredRequests.length === 0 ? (
                <>
                  <X className="size-4 text-danger" />
                  <span>لم يتم العثور على نتائج بالفلاتر المحددة</span>
                </>
              ) : (
                <>
                  <CheckCircle className="size-4 text-success" />
                  <span>
                    تم العثور على {filteredRequests.length} نتيجة
                    {searchTerm && ` للبحث عن "${searchTerm}"`}
                    {priorityFilter !== "all" && ` مع الأهمية: ${getPriorityLabel(priorityFilter)}`}
                  </span>
                </>
              )}
            </div>
          )}

          {activeRequests.length === 0 && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-info/30 bg-info/10 p-3">
              <Info className="size-5 shrink-0 text-info mt-0.5" />
              <p className="text-sm text-info">
                <strong>ملاحظة:</strong> لا توجد طلبات نشطة لقسم "{warehouseDepartmentDisplay}" حالياً.
                <br />
                تحقق من <strong>سجل الطلبات</strong> لمراجعة الطلبات المغلقة.
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
                title="لا توجد طلبات نشطة"
                description="كل الطلبات النشطة منجزة حالياً. راجع سجل الطلبات للمغلقة."
              />
            )
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-lg border p-6 transition-[background-color,box-shadow] hover:bg-muted/30 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold text-lg">{request.title}</h3>
                        <Badge className="border" style={getPriorityStyle(request.priority)}>
                          {getPriorityLabel(request.priority)}
                        </Badge>
                        <Badge className={`${getStatusClass(request.status)} border`}>
                          <div className="flex items-center gap-1">
                            {getStatusIconComp(request.status)}
                            <span>{getStatusLabel(request.status)}</span>
                          </div>
                        </Badge>
                        <Badge variant="outline" className="border-border">
                          {getInstitutionTypeLabel(request.institutionType)}
                        </Badge>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
                          <Building className="size-5 text-primary" />
                          <span className="font-medium text-primary">الجهة المرسلة:</span>
                          <span className="font-bold text-primary">{request.location}</span>
                        </div>
                      </div>

                      {request.status === "rejected" && request.rejectionReason && (
                        <div className="mb-3 rounded-lg border border-danger/30 bg-danger/10 p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <X className="size-5 text-danger" />
                            <span className="font-medium text-danger">سبب الرفض:</span>
                          </div>
                          <p className="text-sm text-danger">{request.rejectionReason}</p>
                          {request.rejectionDate && (
                            <p className="mt-1 text-xs text-danger">
                              تاريخ الرفض: {new Date(request.rejectionDate).toLocaleString("en-GB")}
                            </p>
                          )}
                        </div>
                      )}

                      {request.status === "cancelled" && request.cancellationReason && (
                        <div className="mb-3 rounded-lg border border-border bg-muted/30 p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <X className="size-5 text-muted-foreground" />
                            <span className="font-medium text-foreground">سبب الإلغاء من المؤسسة:</span>
                          </div>
                          <p className="text-sm text-foreground">{request.cancellationReason}</p>
                          {request.cancellationDate && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              تاريخ الإلغاء: {new Date(request.cancellationDate).toLocaleString("en-GB")}
                            </p>
                          )}
                        </div>
                      )}

                      {request.requestedItems && request.requestedItems.length > 0 && (
                        <div className="mb-4">
                          <div className="mb-2 flex items-center gap-2">
                            <List className="size-5 text-info" />
                            <span className="font-medium text-foreground">العناصر المطلوبة بالتفصيل:</span>
                          </div>
                          <div className="rounded-lg border border-border bg-muted/50 p-3">
                            <div className="grid gap-2">
                              {request.requestedItems.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between rounded border border-border bg-card p-2"
                                >
                                  <div className="flex items-center gap-2">
                                    <Package className="size-4 text-primary" />
                                    <span className="font-medium">{item.itemName}</span>
                                  </div>
                                  <Badge variant="outline" className="border-primary/30 bg-muted/50 text-primary">
                                    {item.quantity} {item.unitType}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 border-t border-border pt-2">
                              <span className="text-sm font-medium text-primary">
                                إجمالي العناصر:{" "}
                                {request.requestedItems.reduce((sum, item) => sum + item.quantity, 0)} عنصر
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{request.description}</p>

                      <div className="mb-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
                        {request.quantity > 0 && (
                          <div className="flex items-center gap-2 rounded bg-muted/50 p-2">
                            <Package className="size-4 text-primary" />
                            <span className="font-medium">
                              {request.quantity} {request.unitType}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 rounded bg-muted/30 p-2">
                          <Calendar className="size-4 text-muted-foreground" />
                          <span>{new Date(request.dateSubmitted).toLocaleDateString("en-GB")}</span>
                        </div>
                        {request.schoolLocation && (
                          <div className="flex items-center gap-2 rounded bg-warning/10 p-2">
                            <MapPin className="size-4 text-foreground" />
                            <span>{request.schoolLocation}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(request)}
                        className="transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                      >
                        <Eye className="size-4 ms-1" />
                        عرض التفاصيل
                      </Button>

                      {request.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStartProgress(request.id, request.title)}
                            className="bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                          >
                            <Play className="size-4 ms-1" />
                            بدء التنفيذ
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectRequest(request)}
                          >
                            <X className="size-4 ms-1" />
                            رفض الطلب
                          </Button>
                        </>
                      )}

                      {request.status === "in-progress" && (
                        <Button
                          size="sm"
                          onClick={() => handleReadyForPickup(request.id, request.title)}
                          className="bg-warning text-warning-foreground transition-colors hover:bg-warning/80"
                        >
                          <CheckCircle className="size-4 ms-1" />
                          جاهز للاستلام
                        </Button>
                      )}

                      {request.status === "ready-for-pickup" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-danger/40 bg-danger/10 text-danger hover:bg-danger/15"
                            >
                              <Undo2 className="size-4 ms-1" />
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
                                className="bg-danger hover:bg-danger/90"
                              >
                                إرجاع للمخزون
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {request.status === "undelivered" && (
                        <Button
                          size="sm"
                          onClick={() => handleRetryUndelivered(request.id, request.title)}
                          className="bg-warning text-warning-foreground transition-colors hover:bg-warning/80"
                        >
                          <RefreshCw className="size-4 ms-1" />
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
    </div>
  );
};

export default WarehouseActiveRequestsPage;
