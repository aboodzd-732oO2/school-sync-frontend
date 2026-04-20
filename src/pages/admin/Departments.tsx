import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import DepartmentsList from "@/components/admin/DepartmentsList";

export default function AdminDepartmentsPage() {
  return (
    <div>
      <PageHeader title="الأقسام" description="إدارة أقسام النظام" />
      <Card><CardContent className="p-6"><DepartmentsList /></CardContent></Card>
    </div>
  );
}
