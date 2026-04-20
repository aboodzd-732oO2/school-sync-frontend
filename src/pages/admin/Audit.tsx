import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import AuditLogsList from "@/components/admin/AuditLogsList";

export default function AdminAuditPage() {
  return (
    <div>
      <PageHeader title="سجل الأحداث" description="تتبّع جميع العمليات الحساسة" />
      <Card><CardContent className="p-6"><AuditLogsList /></CardContent></Card>
    </div>
  );
}
