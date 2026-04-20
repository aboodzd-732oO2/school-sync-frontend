import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import PrioritiesList from "@/components/admin/PrioritiesList";

export default function AdminPrioritiesPage() {
  return (
    <div>
      <PageHeader title="الأولويات" description="مستويات أولوية الطلبات" />
      <Card><CardContent className="p-6"><PrioritiesList /></CardContent></Card>
    </div>
  );
}
