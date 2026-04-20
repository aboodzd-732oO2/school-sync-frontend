import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import InstitutionsList from "@/components/admin/InstitutionsList";

export default function AdminInstitutionsPage() {
  return (
    <div>
      <PageHeader title="المؤسسات التعليمية" description="قائمة كل المدارس والجامعات" />
      <Card>
        <CardContent className="p-6"><InstitutionsList /></CardContent>
      </Card>
    </div>
  );
}
