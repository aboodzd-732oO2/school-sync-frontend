import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import WarehousesList from "@/components/admin/WarehousesList";

export default function AdminWarehousesPage() {
  return (
    <div>
      <PageHeader title="المستودعات" description="كل المستودعات مع الأقسام والمحافظات" />
      <Card>
        <CardContent className="p-6"><WarehousesList /></CardContent>
      </Card>
    </div>
  );
}
