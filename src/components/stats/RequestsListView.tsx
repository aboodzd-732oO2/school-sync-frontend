
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, XCircle, Ban } from "lucide-react";
import { usePriorities, useInstitutionTypes } from "@/hooks/useLookups";
import { getStatusLabel, getStatusClass, getStatusIcon as getStatusEmoji } from "@/lib/statusConfig";

interface RequestsListViewProps {
  requestsData: any[];
}

const RequestsListView = ({ requestsData }: RequestsListViewProps) => {
  const getStatusIcon = (status: string) => {
    const Icon = getStatusEmoji(status);
    return <Icon className="size-4" />;
  };

  const { getLabel: getPriorityLabel, getColor: getPriorityHexColor, isHighPriority } = usePriorities();
  const { getLabel: getInstitutionTypeLabel } = useInstitutionTypes();

  const getPriorityStyle = (priority: string) => ({
    backgroundColor: `${getPriorityHexColor(priority)}20`,
    color: getPriorityHexColor(priority),
  });
  const getPriorityText = (priority: string) => getPriorityLabel(priority);

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
                    {getInstitutionTypeLabel(request.institutionType)} - {request.department} - {request.governorate || request.location}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <Badge className={getStatusClass(request.status)}>
                  {getStatusLabel(request.status)}
                </Badge>
                {request.priority && (
                  <Badge style={getPriorityStyle(request.priority)}>
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
                  <div className="flex items-center space-x-2 space-x-reverse text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>تاريخ الطلب: {new Date(request.createdAt || request.dateSubmitted).toLocaleDateString('ar-SA')}</span>
                  </div>
                  {request.id && (
                    <div className="text-muted-foreground">
                      رقم الطلب: #{request.id.slice(-8)}
                    </div>
                  )}
                </div>
                
                {/* معلومات إضافية للطلبات المكتملة/المرفوضة/الملغية */}
                {(request.status === 'completed' || request.status === 'rejected' || request.status === 'cancelled') && (
                  <div className="space-y-2">
                    {request.status === 'completed' && (
                      <div className="text-success text-sm font-medium flex items-center gap-1.5">
                        <CheckCircle className="size-4" />
                        تم إكمال الطلب بنجاح
                      </div>
                    )}
                    {request.status === 'rejected' && (
                      <div className="text-danger text-sm flex items-center gap-1.5">
                        <XCircle className="size-4" />
                        سبب الرفض: {request.rejectionReason || 'غير محدد'}
                      </div>
                    )}
                    {request.status === 'cancelled' && (
                      <div className="text-warning-foreground text-sm flex items-center gap-1.5">
                        <Ban className="size-4" />
                        سبب الإلغاء: {request.cancellationReason || 'تم الإلغاء من قبل المؤسسة'}
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
                      <div key={idx} className="flex justify-between items-center text-sm bg-muted/30 p-2 rounded">
                        <span>{item.itemName}</span>
                        <Badge variant="outline">{item.quantity} قطعة</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    إجمالي العناصر: {request.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} قطعة
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  الكمية: {request.quantity} {request.unitType}
                </div>
              )}

              {/* عرض الوصف للطلبات المهمة */}
              {request.description && (request.status === 'rejected' || request.status === 'cancelled' || isHighPriority(request.priority)) && (
                <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-foreground">
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
