import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, FolderTree, Filter, X, CheckCircle, Eye, History,
  Package, Ban, Clock, Warehouse as WarehouseIcon, Copy,
} from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { requests as requestsApi } from "@/services/api";
import { usePriorities, useDepartments } from "@/hooks/useLookups";
import { getStatusLabel, getStatusClass, getStatusIcon as getStatusIconFromConfig } from "@/lib/statusConfig";
import type { DashboardProps } from "@/types/dashboard";

const HISTORY_STATUSES = ["completed", "rejected", "cancelled"];

const formatDateTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "—";

const InstitutionRequestsHistoryPage = ({ requests }: DashboardProps) => {
  const { getLabel: getPriorityLabel, getColor: getPriorityHexColor } = usePriorities();
  const { getLabel: getDeptLabel } = useDepartments();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [cloningId, setCloningId] = useState<string | null>(null);

  const handleClone = async (request: any) => {
    setCloningId(request.id);
    try {
      await requestsApi.create({
        title: `نسخة من: ${request.title}`,
        description: request.description,
        impact: request.impact,
        priority: request.priority,
        status: "draft",
        quantity: request.quantity,
        studentsAffected: request.studentsAffected,
        unitType: request.unitType,
        subcategory: request.subcategory,
        departmentKey: request.department,
        requestedItems: request.requestedItems ?? [],
      });
      toast({
        title: "تم إنشاء المسودة",
        description: "تم تكرار الطلب كمسودة — يمكنك تعديلها قبل الإرسال",
      });
      navigate("/drafts");
    } catch (err: any) {
      toast({
        title: "فشل التكرار",
        description: err?.message ?? "حدث خطأ أثناء إنشاء المسودة",
        variant: "destructive",
      });
    } finally {
      setCloningId(null);
    }
  };

  const historyRequests = useMemo(
    () => requests.filter((r) => HISTORY_STATUSES.includes(r.status)),
    [requests],
  );

  const departments = useMemo(() => {
    const keys = new Set(historyRequests.map((r) => r.department));
    return Array.from(keys).sort();
  }, [historyRequests]);

  const filteredRequests = useMemo(() => {
    let list = historyRequests;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") list = list.filter((r) => r.status === statusFilter);
    if (departmentFilter !== "all") list = list.filter((r) => r.department === departmentFilter);
    return [...list].sort(
      (a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime(),
    );
  }, [historyRequests, searchTerm, statusFilter, departmentFilter]);

  const hasFilters = !!searchTerm || statusFilter !== "all" || departmentFilter !== "all";
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDepartmentFilter("all");
  };

  const getPriorityStyle = (priority: string) => ({
    backgroundColor: `${getPriorityHexColor(priority)}20`,
    color: getPriorityHexColor(priority),
    borderColor: `${getPriorityHexColor(priority)}50`,
  });

  const getStatusIconComp = (status: string) => {
    const Icon = getStatusIconFromConfig(status);
    return <Icon className="size-3.5" />;
  };

  const closingInfo = (r: any) => {
    if (r.status === "rejected") {
      return { label: "تاريخ الرفض", iso: r.rejectionDate, icon: X, tone: "text-danger" };
    }
    if (r.status === "cancelled") {
      return { label: "تاريخ الإلغاء", iso: r.cancellationDate, icon: Ban, tone: "text-muted-foreground" };
    }
    return { label: "تاريخ الإغلاق", iso: undefined, icon: CheckCircle, tone: "text-success" };
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="سجل الطلبات"
        description="الطلبات المغلقة — مكتملة، مرفوضة، وملغاة"
      />

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            <span>سجل طلبات مؤسستك</span>
          </CardTitle>
          <CardDescription>
            {historyRequests.length === 0
              ? "لم تُغلق أي طلبات بعد"
              : `${historyRequests.length} طلب مغلق — استعمل الفلاتر لتضييق النطاق`}
          </CardDescription>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="ابحث بعنوان الطلب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-card">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent className="bg-card border shadow-lg z-50">
                  <SelectItem value="all">كل الحالات</SelectItem>
                  <SelectItem value="completed">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="size-3.5 text-success" />
                      مكتمل
                    </span>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <span className="flex items-center gap-2">
                      <X className="size-3.5 text-danger" />
                      مرفوض
                    </span>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <span className="flex items-center gap-2">
                      <Ban className="size-3.5 text-muted-foreground" />
                      ملغى
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <FolderTree className="size-4 text-muted-foreground" />
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-48 bg-card">
                  <SelectValue placeholder="القسم" />
                </SelectTrigger>
                <SelectContent className="bg-card border shadow-lg z-50 max-h-72">
                  <SelectItem value="all">كل الأقسام</SelectItem>
                  {departments.map((key) => (
                    <SelectItem key={key} value={key}>
                      {getDeptLabel(key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                مسح الفلاتر
              </Button>
            )}
          </div>

          {hasFilters && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              {filteredRequests.length === 0 ? (
                <>
                  <X className="size-4 text-danger" />
                  <span>لم يتم العثور على نتائج بالفلاتر المحددة</span>
                </>
              ) : (
                <>
                  <CheckCircle className="size-4 text-success" />
                  <span>{filteredRequests.length} نتيجة</span>
                </>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {filteredRequests.length === 0 ? (
            hasFilters ? (
              <EmptyState
                icon={Search}
                title="لم يتم العثور على طلبات بالفلاتر المحددة"
                description="جرّب مسح الفلاتر أو تغيير نطاقها"
              />
            ) : (
              <EmptyState
                icon={History}
                title="السجل فارغ"
                description="لم تُغلق أي طلبات بعد"
              />
            )
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const ci = closingInfo(request);
                const CIcon = ci.icon;
                return (
                  <div
                    key={request.id}
                    className="rounded-lg border border-border/60 bg-card/50 p-5 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold">{request.title}</h3>
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
                            {getDeptLabel(request.department)}
                          </Badge>
                        </div>

                        {request.routedTo && (
                          <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2.5">
                            <WarehouseIcon className="size-4 text-primary" />
                            <span className="text-sm text-muted-foreground">أُرسل إلى:</span>
                            <span className="text-sm font-medium text-primary">{request.routedTo}</span>
                          </div>
                        )}

                        {request.status === "rejected" && request.rejectionReason && (
                          <div className="mb-3 rounded-lg border border-danger/30 bg-danger/10 p-3">
                            <div className="mb-1 flex items-center gap-2">
                              <X className="size-4 text-danger" />
                              <span className="text-sm font-medium text-danger">سبب الرفض:</span>
                            </div>
                            <p className="text-sm text-danger">{request.rejectionReason}</p>
                          </div>
                        )}

                        {request.status === "cancelled" && request.cancellationReason && (
                          <div className="mb-3 rounded-lg border border-border bg-muted/30 p-3">
                            <div className="mb-1 flex items-center gap-2">
                              <Ban className="size-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-foreground">سبب الإلغاء:</span>
                            </div>
                            <p className="text-sm text-foreground">{request.cancellationReason}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                          <div className="flex items-center gap-2 rounded bg-muted/30 p-2">
                            <Clock className="size-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">تاريخ التقديم:</span>
                            <span className="tabular-nums">{formatDateTime(request.dateSubmitted)}</span>
                          </div>
                          <div className="flex items-center gap-2 rounded bg-muted/30 p-2">
                            <CIcon className={`size-3.5 ${ci.tone}`} />
                            <span className="text-muted-foreground">{ci.label}:</span>
                            <span className="tabular-nums">{formatDateTime(ci.iso)}</span>
                          </div>
                          {request.quantity > 0 && (
                            <div className="flex items-center gap-2 rounded bg-muted/30 p-2">
                              <Package className="size-3.5 text-primary" />
                              <span className="font-medium">
                                {request.quantity} {request.unitType}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                        >
                          <Link to={`/requests/${request.id}`}>
                            <Eye className="size-4 me-1" />
                            التفاصيل
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleClone(request)}
                          disabled={cloningId === request.id}
                          className="transition-colors hover:border-info hover:bg-info/10 hover:text-info"
                        >
                          <Copy className="size-4 me-1" />
                          {cloningId === request.id ? "..." : "تكرار"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstitutionRequestsHistoryPage;
