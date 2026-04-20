
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInstitutionTypes } from "@/hooks/useLookups";

interface InstitutionsSummaryViewProps {
  requestsData: any[];
}

const InstitutionsSummaryView = ({ requestsData }: InstitutionsSummaryViewProps) => {
  const { getLabel: getInstitutionTypeLabel } = useInstitutionTypes();

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

  const getInstitutionsSummary = () => {
    const institutionsMap = new Map<string, {
      type: string;
      governorate: string;
      requestsCount: number;
      totalItems: number;
      statuses: string[];
    }>();

    requestsData.forEach((request: any) => {
      const institutionName = request.institutionName || request.location;
      const existing = institutionsMap.get(institutionName);
      let itemsCount = 0;
      
      if (request.items && Array.isArray(request.items)) {
        itemsCount = request.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      } else if (request.quantity) {
        itemsCount = request.quantity;
      }
      
      if (existing) {
        existing.requestsCount += 1;
        existing.totalItems += itemsCount;
        existing.statuses.push(request.status);
      } else {
        institutionsMap.set(institutionName, {
          type: getInstitutionTypeLabel(request.institutionType),
          governorate: request.governorate || request.location,
          requestsCount: 1,
          totalItems: itemsCount,
          statuses: [request.status]
        });
      }
    });

    return Array.from(institutionsMap.entries()).map(([institutionName, data]) => ({
      institutionName,
      ...data
    }));
  };

  const institutionsSummary = getInstitutionsSummary();

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        إجمالي المؤسسات: {institutionsSummary.length} مؤسسة
      </div>
      
      {institutionsSummary.map((institution, index) => (
        <Card key={index} className="border-s-4 border-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{institution.institutionName}</CardTitle>
                <CardDescription className="mt-1">
                  {institution.type} - {institution.governorate}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <Badge className="bg-tertiary/15 text-tertiary">
                  {institution.requestsCount} طلب
                </Badge>
                <Badge className="bg-warning/15 text-warning-foreground">
                  {institution.totalItems} عنصر
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">حالات الطلبات:</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(institution.statuses)).map((status, idx) => (
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

export default InstitutionsSummaryView;
