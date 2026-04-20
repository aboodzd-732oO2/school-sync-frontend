import { PageHeader } from "@/components/layout/PageHeader";
import AdminStats from "@/components/admin/AdminStats";

export default function AdminStatsPage() {
  return (
    <div>
      <PageHeader title="الإحصائيات" description="نظرة شاملة على بيانات النظام" />
      <AdminStats />
    </div>
  );
}
