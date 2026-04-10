
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InstitutionsSummaryViewProps {
  requestsData: any[];
}

const InstitutionsSummaryView = ({ requestsData }: InstitutionsSummaryViewProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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
          type: request.institutionType === 'school' ? 'مدرسة' : 'جامعة',
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
      <div className="text-sm text-gray-600 mb-4">
        إجمالي المؤسسات: {institutionsSummary.length} مؤسسة
      </div>
      
      {institutionsSummary.map((institution, index) => (
        <Card key={index} className="border-r-4 border-r-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{institution.institutionName}</CardTitle>
                <CardDescription className="mt-1">
                  {institution.type} - {institution.governorate}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <Badge className="bg-purple-100 text-purple-800">
                  {institution.requestsCount} طلب
                </Badge>
                <Badge className="bg-orange-100 text-orange-800">
                  {institution.totalItems} عنصر
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">حالات الطلبات:</p>
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
