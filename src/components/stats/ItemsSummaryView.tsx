
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ItemsSummaryViewProps {
  requestsData: any[];
}

const ItemsSummaryView = ({ requestsData }: ItemsSummaryViewProps) => {
  const getItemsSummary = () => {
    const itemsMap = new Map<string, { 
      totalQuantity: number; 
      requestingInstitutions: Set<string>;
      requestsByStatus: { [key: string]: Array<{ institutionName: string; quantity: number; status: string; id: string; date: string }> };
    }>();
    
    requestsData.forEach((request: any) => {
      if (request.items && Array.isArray(request.items)) {
        request.items.forEach((item: any) => {
          const existing = itemsMap.get(item.itemName);
          const requestInfo = {
            institutionName: request.institutionName || request.location,
            quantity: item.quantity,
            status: request.status,
            id: request.id,
            date: request.createdAt || request.dateSubmitted
          };

          if (existing) {
            existing.totalQuantity += item.quantity;
            existing.requestingInstitutions.add(request.institutionName || request.location);
            
            if (!existing.requestsByStatus[request.status]) {
              existing.requestsByStatus[request.status] = [];
            }
            existing.requestsByStatus[request.status].push(requestInfo);
          } else {
            itemsMap.set(item.itemName, {
              totalQuantity: item.quantity,
              requestingInstitutions: new Set([request.institutionName || request.location]),
              requestsByStatus: {
                [request.status]: [requestInfo]
              }
            });
          }
        });
      }
    });

    return Array.from(itemsMap.entries()).map(([itemName, data]) => ({
      itemName,
      totalQuantity: data.totalQuantity,
      institutionCount: data.requestingInstitutions.size,
      institutions: Array.from(data.requestingInstitutions),
      requestsByStatus: data.requestsByStatus
    }));
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'in-progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      case 'rejected': return 'مرفوض';
      case 'cancelled': return 'ملغي';
      case 'draft': return 'مسودة';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/15 text-warning-foreground';
      case 'in-progress': return 'bg-info/15 text-info';
      case 'completed': return 'bg-success/15 text-success';
      case 'rejected': return 'bg-danger/15 text-danger';
      case 'cancelled': return 'bg-warning/15 text-warning-foreground';
      case 'draft': return 'bg-muted/50 text-foreground';
      default: return 'bg-muted/50 text-foreground';
    }
  };

  const itemsSummary = getItemsSummary();

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        إجمالي أنواع العناصر: {itemsSummary.length} نوع
      </div>
      
      {itemsSummary.map((item, index) => (
        <Card key={index} className="border-s-4 border-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{item.itemName}</CardTitle>
              <Badge className="bg-info/15 text-info">
                {item.totalQuantity} قطعة
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">عدد المؤسسات الطالبة:</span>
                <Badge className="bg-success/15 text-success">
                  {item.institutionCount} مؤسسة
                </Badge>
              </div>
              
              {/* عرض الطلبات حسب الحالة */}
              <div className="mt-4">
                <p className="text-sm font-medium text-foreground mb-3">تفاصيل الطلبات حسب الحالة:</p>
                <div className="space-y-3">
                  {Object.entries(item.requestsByStatus).map(([status, requests]) => (
                    <div key={status} className="bg-muted/30 p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getStatusColor(status)}>
                          {getStatusText(status)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {requests.length} طلب - {requests.reduce((sum, req) => sum + req.quantity, 0)} قطعة
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {requests.map((req, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-card p-2 rounded border">
                            <div>
                              <span className="font-medium">{req.institutionName}</span>
                              <span className="text-muted-foreground ms-2">#{req.id.slice(-6)}</span>
                            </div>
                            <div className="text-end">
                              <div className="text-muted-foreground">{req.quantity} قطعة</div>
                              <div className="text-muted-foreground">{new Date(req.date).toLocaleDateString('ar-SA')}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-3">
                <p className="text-sm font-medium text-foreground mb-2">المؤسسات الطالبة:</p>
                <div className="flex flex-wrap gap-2">
                  {item.institutions.map((institution, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {institution}
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

export default ItemsSummaryView;
