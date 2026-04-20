import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { admin as adminApi } from "@/services/api";
import Pagination from "./Pagination";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Eye, ScrollText } from "lucide-react";

interface AuditLog {
  id: number;
  userId: number | null;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  payload: any;
  createdAt: string;
}

const PAGE_SIZE = 30;

const actionLabel = (a: string) => {
  const map: Record<string, string> = {
    create: "إنشاء",
    update: "تعديل",
    delete: "حذف",
    "approve-password-reset": "موافقة على استعادة كلمة مرور",
    "reject-password-reset": "رفض استعادة كلمة مرور",
  };
  return map[a] || a;
};

const entityLabel = (e: string) => {
  const map: Record<string, string> = {
    user: "مستخدم",
    institution: "مؤسسة",
    warehouse: "مستودع",
    passwordReset: "طلب استعادة",
  };
  return map[e] || e;
};

const actionClass = (a: string) => {
  if (a === "create") return "bg-success/15 text-success";
  if (a === "delete" || a === "reject-password-reset") return "bg-danger/15 text-danger";
  if (a === "update" || a === "approve-password-reset") return "bg-info/15 text-info";
  return "bg-muted/50 text-foreground";
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

const FIELD_LABELS: Record<string, string> = {
  email: "البريد",
  userType: "النوع",
  isActive: "التفعيل",
  name: "الاسم",
  institutionType: "نوع المؤسسة",
  governorate: "المحافظة",
  departmentKey: "القسم",
  labelAr: "العنوان",
  fields: "حقول معدّلة",
  password: "كلمة المرور",
};

const truncate = (s: string, max = 40) =>
  s.length > max ? `${s.slice(0, max)}…` : s;

const summarizePayload = (payload: any, action: string): string => {
  if (payload === null || payload === undefined) return "—";
  if (typeof payload === "string") return truncate(payload);

  if (action === "update" && Array.isArray(payload?.fields)) {
    return `حقول معدّلة: ${payload.fields.join("، ")}`;
  }

  if (typeof payload === "object") {
    const entries = Object.entries(payload);
    if (entries.length === 0) return "—";

    const parts: string[] = [];
    for (const [key, val] of entries.slice(0, 2)) {
      const label = FIELD_LABELS[key] ?? key;
      if (val === null || val === undefined) continue;
      if (Array.isArray(val)) {
        parts.push(`${label}: ${val.join("، ")}`);
      } else if (typeof val === "object") {
        parts.push(`${label}: …`);
      } else {
        parts.push(`${label}: ${String(val)}`);
      }
    }
    const suffix = entries.length > 2 ? ` +${entries.length - 2}` : "";
    return truncate(parts.join(" · ") + suffix);
  }

  return String(payload);
};

const AuditLogsList = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AuditLog | null>(null);

  useEffect(() => {
    setLoading(true);
    const query: Record<string, string> = { page: String(page), pageSize: String(PAGE_SIZE) };
    if (entityFilter !== "all") query.entityType = entityFilter;
    adminApi
      .auditLogs(query)
      .then((res: any) => {
        setLogs(res.data || []);
        setTotal(res.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, entityFilter]);

  useEffect(() => {
    setPage(1);
  }, [entityFilter]);

  const prettyPayload = useMemo(() => {
    if (!selected?.payload) return "";
    try {
      return JSON.stringify(selected.payload, null, 2);
    } catch {
      return String(selected.payload);
    }
  }, [selected]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">فلترة:</span>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            <SelectItem value="user">مستخدمين</SelectItem>
            <SelectItem value="institution">مؤسسات</SelectItem>
            <SelectItem value="warehouse">مستودعات</SelectItem>
            <SelectItem value="passwordReset">طلبات استعادة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <LoadingSkeleton variant="table" rows={8} columns={6} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="لا توجد سجلات"
          description={entityFilter !== "all" ? "جرّب تغيير الفلترة" : "لم يتم تسجيل أي إجراءات بعد"}
        />
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-start">الوقت</th>
                <th className="px-4 py-3 text-start">المستخدم</th>
                <th className="px-4 py-3 text-start">الإجراء</th>
                <th className="px-4 py-3 text-start">النوع</th>
                <th className="px-4 py-3 text-start">المعرّف</th>
                <th className="px-4 py-3 text-start">تفاصيل</th>
                <th className="px-4 py-3 text-start w-16"></th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => {
                const hasPayload = l.payload !== null && l.payload !== undefined;
                return (
                  <tr key={l.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 text-xs tabular-nums text-muted-foreground whitespace-nowrap">
                      {formatDate(l.createdAt)}
                    </td>
                    <td className="px-4 py-3">{l.userEmail}</td>
                    <td className="px-4 py-3">
                      <Badge className={actionClass(l.action)}>{actionLabel(l.action)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{entityLabel(l.entityType)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs">{l.entityId || "—"}</code>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-md truncate">
                      {summarizePayload(l.payload, l.action)}
                    </td>
                    <td className="px-4 py-3">
                      {hasPayload && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => setSelected(l)}
                        >
                          <Eye className="size-4" />
                          <span className="ms-1.5 text-xs">عرض</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الحدث</DialogTitle>
            <DialogDescription>
              {selected && (
                <>
                  {actionLabel(selected.action)} · {entityLabel(selected.entityType)}
                  {selected.entityId && <> · ID: {selected.entityId}</>}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">الوقت</dt>
                <dd className="tabular-nums">{formatDate(selected.createdAt)}</dd>

                <dt className="text-muted-foreground">المستخدم</dt>
                <dd>{selected.userEmail}</dd>

                <dt className="text-muted-foreground">الإجراء</dt>
                <dd>
                  <Badge className={actionClass(selected.action)}>{actionLabel(selected.action)}</Badge>
                </dd>

                <dt className="text-muted-foreground">النوع</dt>
                <dd>
                  <Badge variant="outline">{entityLabel(selected.entityType)}</Badge>
                </dd>
              </dl>

              <div>
                <div className="mb-2 text-sm font-medium text-muted-foreground">الـ Payload</div>
                <pre
                  dir="ltr"
                  className="max-h-80 overflow-auto rounded-md border border-border/60 bg-muted/30 p-3 text-xs leading-relaxed"
                >
                  <code>{prettyPayload}</code>
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLogsList;
