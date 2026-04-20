import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import PasswordResetRequestsList from "@/components/admin/PasswordResetRequestsList";

export default function AdminPasswordResetsPage() {
  return (
    <div>
      <PageHeader title="طلبات استعادة كلمة المرور" description="موافقة أو رفض طلبات المستخدمين" />
      <Card><CardContent className="p-6"><PasswordResetRequestsList /></CardContent></Card>
    </div>
  );
}
