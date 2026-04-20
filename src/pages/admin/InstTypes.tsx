import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import InstitutionTypesList from "@/components/admin/InstitutionTypesList";

export default function AdminInstTypesPage() {
  return (
    <div>
      <PageHeader title="أنواع المؤسسات" description="مدرسة، جامعة، معهد..." />
      <Card><CardContent className="p-6"><InstitutionTypesList /></CardContent></Card>
    </div>
  );
}
