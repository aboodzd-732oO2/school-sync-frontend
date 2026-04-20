import { PageHeader } from "@/components/layout/PageHeader";
import RoutingMap from "@/components/admin/RoutingMap";

export default function AdminRoutingPage() {
  return (
    <div>
      <PageHeader title="خريطة التوجيه" description="ربط المحافظات بالمستودعات حسب القسم" />
      <RoutingMap />
    </div>
  );
}
