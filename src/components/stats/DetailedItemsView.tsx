
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DetailedItemsViewProps {
  data: any[];
}

const DetailedItemsView = ({ data }: DetailedItemsViewProps) => {
  // Add safety check for data
  if (!data || !Array.isArray(data)) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">لا توجد بيانات للعرض</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        إجمالي أنواع العناصر: {data.length} نوع
      </div>
      
      {data.map((item: any, index: number) => {
        // Add safety checks for item properties
        const institutions = Array.isArray(item.institutions) ? item.institutions : [];
        const requests = Array.isArray(item.requests) ? item.requests : [];
        const itemName = item.name || item.itemName || 'عنصر غير محدد';
        const totalQuantity = item.totalQuantity || item.quantity || 0;
        const unit = item.unit || item.unitType || 'وحدة';

        return (
          <Card key={index} className="border-r-4 border-r-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{String(itemName)}</CardTitle>
                <Badge className="bg-blue-100 text-blue-800">
                  {totalQuantity} {unit}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">عدد المؤسسات الطالبة:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {institutions.length} مؤسسة
                  </Badge>
                </div>
                
                {institutions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">المؤسسات الطالبة:</p>
                    <div className="flex flex-wrap gap-2">
                      {institutions.map((institution: any, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {String(institution)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {requests.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">الطلبات المرتبطة:</p>
                    <div className="flex flex-wrap gap-2">
                      {requests.map((request: any, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-gray-50">
                          {String(request)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DetailedItemsView;
