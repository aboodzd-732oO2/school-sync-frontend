import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import {
  Bell, BellRing, Check, CheckCheck, ChevronLeft, ChevronRight,
  FilePlus, RefreshCw, Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { notifications as notificationsApi } from "@/services/api";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  linkType: string | null;
  linkId: string | null;
  createdAt: string;
}

const PAGE_SIZE = 20;

const TYPE_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  "request-new": {
    label: "طلب جديد",
    icon: FilePlus,
    tone: "bg-primary/15 text-primary border-primary/30",
  },
  "request-status": {
    label: "تحديث حالة طلب",
    icon: RefreshCw,
    tone: "bg-info/15 text-info border-info/30",
  },
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

const InstitutionNotificationsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [notifs, setNotifs] = useState<Notification[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setNotifs(null);
    setError(null);
    const filters: Record<string, string> = {
      page: String(page),
      pageSize: String(PAGE_SIZE),
    };
    if (unreadOnly === "unread") filters.unreadOnly = "true";

    notificationsApi
      .list(filters)
      .then((res: any) => {
        if (cancelled) return;
        setNotifs(res.data ?? res);
        setTotal(res.total ?? (Array.isArray(res) ? res.length : 0));
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "فشل تحميل الإشعارات");
      });
    return () => {
      cancelled = true;
    };
  }, [page, unreadOnly, refreshKey]);

  useEffect(() => {
    setPage(1);
  }, [unreadOnly]);

  const filtered = useMemo(() => {
    if (!notifs) return null;
    if (typeFilter === "all") return notifs;
    return notifs.filter((n) => n.type === typeFilter);
  }, [notifs, typeFilter]);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      setNotifs((prev) => prev?.map((n) => (n.id === id ? { ...n, read: true } : n)) ?? null);
    } catch (err: any) {
      toast({ title: "فشل", description: err.message, variant: "destructive" });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      toast({ title: "تم", description: "تم تعليم كل الإشعارات كمقروءة" });
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      toast({ title: "فشل", description: err.message, variant: "destructive" });
    }
  };

  const handleNotifClick = (n: Notification) => {
    if (!n.read) handleMarkRead(n.id);
    if (n.linkType === "request") {
      navigate("/requests/active");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const unreadCount = notifs?.filter((n) => !n.read).length ?? 0;

  return (
    <div>
      <PageHeader
        title="الإشعارات"
        description="كل الإشعارات الواردة لمؤسستك"
        actions={
          unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="size-4 me-1" />
              تعليم الكل كمقروءة
            </Button>
          )
        }
      />

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-5 text-primary" />
            الإشعارات
          </CardTitle>
          <CardDescription>
            {total === 0 ? "لا توجد إشعارات" : `${total} إشعار — ${unreadCount} غير مقروء`}
          </CardDescription>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <Select value={unreadOnly} onValueChange={setUnreadOnly}>
                <SelectTrigger className="w-40 bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border shadow-lg z-50">
                  <SelectItem value="all">كل الإشعارات</SelectItem>
                  <SelectItem value="unread">غير المقروءة فقط</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48 bg-card">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent className="bg-card border shadow-lg z-50">
                <SelectItem value="all">كل الأنواع</SelectItem>
                <SelectItem value="request-new">طلب جديد</SelectItem>
                <SelectItem value="request-status">تحديث حالة طلب</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {error ? (
            <EmptyState icon={Bell} title="تعذر تحميل الإشعارات" description={error} />
          ) : filtered === null ? (
            <LoadingSkeleton variant="list" rows={6} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={BellRing}
              title={unreadOnly === "unread" ? "لا إشعارات غير مقروءة" : "لا توجد إشعارات"}
              description={
                unreadOnly === "unread"
                  ? "كل إشعاراتك مقروءة"
                  : "ستظهر الإشعارات هنا عند تحديث حالة طلباتك"
              }
            />
          ) : (
            <div className="space-y-2">
              {filtered.map((n) => {
                const meta = TYPE_META[n.type] ?? {
                  label: n.type,
                  icon: Bell,
                  tone: "bg-muted text-muted-foreground border-border",
                };
                const Icon = meta.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotifClick(n)}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3 transition-colors cursor-pointer",
                      n.read
                        ? "border-border/60 bg-card/40 hover:bg-muted/30"
                        : "border-primary/30 bg-primary/5 hover:bg-primary/10",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-md",
                        meta.tone,
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={`${meta.tone} text-[11px]`}>
                          {meta.label}
                        </Badge>
                        {!n.read && (
                          <Badge className="bg-danger text-danger-foreground text-[10px]">
                            جديد
                          </Badge>
                        )}
                        <span className="text-sm font-medium truncate">{n.title}</span>
                      </div>
                      {n.body && (
                        <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>
                      )}
                      <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                        {formatDateTime(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkRead(n.id);
                        }}
                      >
                        <Check className="size-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                الصفحة {page} من {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronRight className="size-4 me-1" />
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  التالي
                  <ChevronLeft className="size-4 ms-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstitutionNotificationsPage;
