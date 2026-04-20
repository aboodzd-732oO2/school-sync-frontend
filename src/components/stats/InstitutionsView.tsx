
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InstitutionsViewProps {
  data: any[];
  type: 'schools' | 'universities';
}

const InstitutionsView = ({ data, type }: InstitutionsViewProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/15 text-warning-foreground';
      case 'approved': return 'bg-success/15 text-success';
      case 'rejected': return 'bg-danger/15 text-danger';
      case 'completed': return 'bg-info/15 text-info';
      case 'in-progress': return 'bg-tertiary/15 text-tertiary';
      default: return 'bg-muted/50 text-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        إجمالي المؤسسات: {data.length} مؤسسة
      </div>
      
      {data.map((institution: any, index: number) => (
        <Card key={index} className="border-s-4 border-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{institution.name}</CardTitle>
                <CardDescription className="mt-1">
                  {institution.type} - {institution.governorate}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <Badge className="bg-tertiary/15 text-tertiary">
                  {institution.requestsCount} طلب
                </Badge>
                <Badge className="bg-warning/15 text-warning-foreground">
                  {institution.totalQuantity} عنصر
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                إجمالي الطلاب المتأثرين: {institution.totalStudents || 0}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">حالات الطلبات:</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(institution.statuses || [])).map((status: string, idx: number) => (
                    <Badge key={idx} className={getStatusColor(status)}>
                      {status === 'pending' ? 'قيد الانتظار' :
                       status === 'approved' ? 'مقبول' :
                       status === 'rejected' ? 'مرفوض' :
                       status === 'completed' ? 'مكتمل' :
                       status === 'in-progress' ? 'قيد التنفيذ' : status}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InstitutionsView;
