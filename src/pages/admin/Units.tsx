import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import UnitsList from "@/components/admin/UnitsList";

export default function AdminUnitsPage() {
  return (
    <div>
      <PageHeader title="وحدات القياس" description="قطعة، خدمة، رزمة..." />
      <Card><CardContent className="p-6"><UnitsList /></CardContent></Card>
    </div>
  );
}
