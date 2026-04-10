
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InstitutionsViewProps {
  data: any[];
  type: 'schools' | 'universities';
}

const InstitutionsView = ({ data, type }: InstitutionsViewProps) => {
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

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        إجمالي المؤسسات: {data.length} مؤسسة
      </div>
      
      {data.map((institution: any, index: number) => (
        <Card key={index} className="border-r-4 border-r-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{institution.name}</CardTitle>
                <CardDescription className="mt-1">
                  {institution.type} - {institution.governorate}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <Badge className="bg-purple-100 text-purple-800">
                  {institution.requestsCount} طلب
                </Badge>
                <Badge className="bg-orange-100 text-orange-800">
                  {institution.totalQuantity} عنصر
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                إجمالي الطلاب المتأثرين: {institution.totalStudents || 0}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">حالات الطلبات:</p>
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
