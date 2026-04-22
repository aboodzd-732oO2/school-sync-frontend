import { useEffect, useMemo, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import {
  ArrowRight, Calendar, MapPin, Package, Users, Building, List,
  AlertCircle, Clock, History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  requests as requestsApi,
  warehouse as warehouseApi,
} from "@/services/api";
import { usePriorities, useDepartments, useInstitutionTypes } from "@/hooks/useLookups";
import { getStatusLabel, getStatusClass, getStatusIcon as getStatusIconFromConfig } from "@/lib/statusConfig";
import type { RequestTimelineEntry } from "@/types/requestTimeline";

interface RequestShape {
  id: string;
  title: string;
  department: string;
  priority: string;
  status: string;
  location: string;
  dateSubmitted: string;
  routedTo: string;
  description: string;
  impact?: string;
  quantity: number;
  studentsAffected: number;
  unitType: string;
  institutionType: string;
  institutionName?: string;
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
  requests: RequestShape[];
  user: { userType: "institution" | "warehouse" | "admin" };
}

const USER_TYPE_LABEL: Record<string, string> = {
  institution: "المؤسسة",
  warehouse: "المستودع",
  admin: "مدير النظام",
  system: "النظام",
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const backHrefForUser = (userType: string, status: string) => {
  if (status === "draft") return "/drafts";
  if (["completed", "rejected", "cancelled"].includes(status)) return "/requests/history";
  return "/requests/active";
};

const RequestDetailsPage = ({ requests, user }: Props) => {
  const { id } = useParams<{ id: string }>();
  const { getLabel: getPriorityLabel, getColor: getPriorityHexColor } = usePriorities();
  const { getLabel: getDeptLabel } = useDepartments();
  const { getLabel: getInstTypeLabel } = useInstitutionTypes();

  const request = useMemo(
    () => requests.find((r) => r.id === id),
    [requests, id],
  );

  const [timeline, setTimeline] = useState<RequestTimelineEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // fetch timeline; refetch when request status changes (triggered by socket → global state)
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setError(null);
    const fetcher = user.userType === "warehouse"
      ? warehouseApi.requestTimeline
      : requestsApi.timeline;
    fetcher(id)
      .then((data) => {
        if (!cancelled) setTimeline(data);
      })
      .catch((err: any) => {
        if (!cancelled) setError(err?.message ?? "فشل تحميل خط الزمن");
      });
    return () => {
      cancelled = true;
    };
  }, [id, user.userType, request?.status]);

  if (!id) return <Navigate to="/dashboard" replace />;
  if (!request) {
    return (
      <div>
        <PageHeader title="الطلب غير موجود" />
        <EmptyState
          icon={AlertCircle}
          title={`الطلب #${id} غير موجود`}
          description="ربما تم حذفه أو ليس لديك صلاحية عرضه"
          action={
            <Button asChild variant="outline">
              <Link to="/dashboard">العودة للوحة التحكم</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const priorityStyle = {
    backgroundColor: `${getPriorityHexColor(request.priority)}20`,
    color: getPriorityHexColor(request.priority),
    borderColor: `${getPriorityHexColor(request.priority)}50`,
  };

  const StatusIcon = getStatusIconFromConfig(request.status);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={request.title}
        description={`طلب رقم #${request.id} — ${getDeptLabel(request.department)}`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to={backHrefForUser(user.userType, request.status)}>
              <ArrowRight className="size-4 me-1" />
              رجوع للقائمة
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Right column (primary): Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border" style={priorityStyle}>
              {getPriorityLabel(request.priority)}
            </Badge>
            <Badge className={`${getStatusClass(request.status)} border`}>
              <span className="flex items-center gap-1">
                <StatusIcon className="size-3.5" />
                {getStatusLabel(request.status)}
              </span>
            </Badge>
            <Badge variant="outline">{getInstTypeLabel(request.institutionType)}</Badge>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="size-5 text-primary" />
                خط الزمن
              </CardTitle>
              <CardDescription>كل تغيير في حالة الطلب منذ إنشائه</CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <EmptyState icon={AlertCircle} title="تعذر تحميل خط الزمن" description={error} />
              ) : timeline === null ? (
                <LoadingSkeleton variant="list" rows={4} />
              ) : timeline.length === 0 ? (
                <EmptyState icon={Clock} title="لا توجد سجلات بعد" />
              ) : (
                <div className="relative space-y-6 ps-8 before:absolute before:start-3 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-border">
                  {timeline.map((entry, idx) => {
                    const Icon = getStatusIconFromConfig(entry.toStatus);
                    const isLast = idx === timeline.length - 1;
                    const statusTone = getStatusClass(entry.toStatus);
                    return (
                      <div key={entry.id} className="relative">
                        <div
                          className={cn(
                            "absolute -start-8 top-0 flex size-6 items-center justify-center rounded-full border-2 bg-background",
                            statusTone,
                          )}
                        >
                          <Icon className="size-3" />
                        </div>
                        <div className={cn("space-y-1", isLast && "pb-2")}>
                          <div className="flex flex-wrap items-center gap-2">
                            {entry.fromStatus ? (
                              <span className="text-sm text-muted-foreground">
                                من <Badge variant="outline" className={`${getStatusClass(entry.fromStatus)} text-[11px] border`}>
                                  {getStatusLabel(entry.fromStatus)}
                                </Badge> إلى
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">إنشاء بحالة</span>
                            )}
                            <Badge className={`${statusTone} text-[11px] border`}>
                              {getStatusLabel(entry.toStatus)}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span className="tabular-nums">{formatDateTime(entry.createdAt)}</span>
                            <span className="mx-1">·</span>
                            <span>بواسطة {USER_TYPE_LABEL[entry.userType] ?? entry.userType}</span>
                            {entry.userEmail !== "system" && (
                              <>
                                <span className="mx-1">·</span>
                                <span className="truncate">{entry.userEmail}</span>
                              </>
                            )}
                          </div>
                          {entry.note && (
                            <p className="rounded-md bg-muted/40 p-2 text-xs italic text-muted-foreground">
                              {entry.note}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">الوصف</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{request.description}</p>
              {request.impact && (
                <div className="mt-4 rounded-md border border-border/60 bg-muted/30 p-3">
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">الأثر:</p>
                  <p className="text-sm">{request.impact}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Requested items */}
          {request.requestedItems && request.requestedItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <List className="size-5 text-primary" />
                  العناصر المطلوبة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {request.requestedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-md border border-border/60 bg-card p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="size-4 text-primary" />
                        <span className="text-sm font-medium">{item.itemName}</span>
                      </div>
                      <Badge variant="outline" className="tabular-nums">
                        {item.quantity} {item.unitType}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-3 border-t border-border pt-3">
                  <span className="text-sm font-medium text-primary">
                    الإجمالي: {request.requestedItems.reduce((s, i) => s + i.quantity, 0)} عنصر
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rejection/cancellation */}
          {(request.rejectionReason || request.cancellationReason) && (
            <Card className="border-danger/30 bg-danger/5">
              <CardHeader>
                <CardTitle className="text-base text-danger">
                  {request.rejectionReason ? "سبب الرفض" : "سبب الإلغاء"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-danger">{request.rejectionReason || request.cancellationReason}</p>
                {(request.rejectionDate || request.cancellationDate) && (
                  <p className="mt-2 text-xs tabular-nums text-danger/80">
                    {formatDateTime(request.rejectionDate || request.cancellationDate!)}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Left column (meta): details sidebar */}
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">تفاصيل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">تاريخ التقديم:</span>
                <span className="tabular-nums font-medium">{formatDateTime(request.dateSubmitted)}</span>
              </div>

              {request.quantity > 0 && (
                <div className="flex items-center gap-2">
                  <Package className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">الكمية:</span>
                  <span className="font-medium">
                    {request.quantity} {request.unitType}
                  </span>
                </div>
              )}

              {request.studentsAffected > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">الطلاب المتأثرون:</span>
                  <span className="font-medium">{request.studentsAffected}</span>
                </div>
              )}

              {request.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">الموقع:</span>
                  <span className="font-medium">{request.location}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {user.userType === "warehouse" && request.institutionName && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building className="size-4 text-primary" />
                  المؤسسة المرسلة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-primary">{request.institutionName}</p>
              </CardContent>
            </Card>
          )}

          {user.userType === "institution" && request.routedTo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="size-4 text-primary" />
                  موجّه إلى
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-primary">{request.routedTo}</p>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
};

export default RequestDetailsPage;
