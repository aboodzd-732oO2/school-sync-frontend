import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import GovernoratesList from "@/components/admin/GovernoratesList";

export default function AdminGovernoratesPage() {
  return (
    <div>
      <PageHeader title="المحافظات" description="قائمة المحافظات في النظام" />
      <Card><CardContent className="p-6"><GovernoratesList /></CardContent></Card>
    </div>
  );
}
