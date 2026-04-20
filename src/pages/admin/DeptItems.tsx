import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import DepartmentItemsList from "@/components/admin/DepartmentItemsList";

export default function AdminDeptItemsPage() {
  return (
    <div>
      <PageHeader title="عناصر الأقسام" description="العناصر القابلة للطلب لكل قسم" />
      <Card><CardContent className="p-6"><DepartmentItemsList /></CardContent></Card>
    </div>
  );
}
