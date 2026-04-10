
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, CheckCircle, XCircle, Ban } from "lucide-react";

interface RequestsListViewProps {
  requestsData: any[];
}

const RequestsListView = ({ requestsData }: RequestsListViewProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'approved': return 'مقبول';
      case 'rejected': return 'مرفوض';
      case 'cancelled': return 'ملغي';
      case 'completed': return 'مكتمل';
      case 'in-progress': return 'قيد التنفيذ';
      case 'draft': return 'مسودة';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled': return <Ban className="h-4 w-4 text-orange-600" />;
      case 'in-progress': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default: return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return priority;
    }
  };

  return (
    <div className="space-y-4">
      {requestsData.map((request: any) => (
        <Card key={request.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                {getStatusIcon(request.status)}
                <div>
                  <CardTitle className="text-lg">{request.institutionName || request.location || request.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {request.institutionType === 'school' ? 'مدرسة' : 'جامعة'} - {request.department} - {request.governorate || request.location}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <Badge className={getStatusColor(request.status)}>
                  {getStatusText(request.status)}
                </Badge>
                {request.priority && (
                  <Badge className={getPriorityColor(request.priority)}>
                    {getPriorityText(request.priority)}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>تاريخ الطلب: {new Date(request.createdAt || request.dateSubmitted).toLocaleDateString('ar-SA')}</span>
                  </div>
                  {request.id && (
                    <div className="text-gray-600">
                      رقم الطلب: #{request.id.slice(-8)}
                    </div>
                  )}
                </div>
                
                {/* معلومات إضافية للطلبات المكتملة/المرفوضة/الملغية */}
                {(request.status === 'completed' || request.status === 'rejected' || request.status === 'cancelled') && (
                  <div className="space-y-2">
                    {request.status === 'completed' && (
                      <div className="text-green-600 text-sm font-medium">
                        ✅ تم إكمال الطلب بنجاح
                      </div>
                    )}
                    {request.status === 'rejected' && (
                      <div className="text-red-600 text-sm">
                        ❌ سبب الرفض: {request.rejectionReason || 'غير محدد'}
                      </div>
                    )}
                    {request.status === 'cancelled' && (
                      <div className="text-orange-600 text-sm">
                        🚫 سبب الإلغاء: {request.cancellationReason || 'تم الإلغاء من قبل المؤسسة'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {request.items && Array.isArray(request.items) ? (
                <div>
                  <h4 className="font-semibold text-sm mb-2">العناصر المطلوبة:</h4>
                  <div className="space-y-1">
                    {request.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                        <span>{item.itemName}</span>
                        <Badge variant="outline">{item.quantity} قطعة</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    إجمالي العناصر: {request.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} قطعة
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  الكمية: {request.quantity} {request.unitType}
                </div>
              )}

              {/* عرض الوصف للطلبات المهمة */}
              {request.description && (request.status === 'rejected' || request.status === 'cancelled' || request.priority === 'high') && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">الوصف: </span>
                    {request.description}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RequestsListView;
