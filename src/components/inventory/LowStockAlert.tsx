
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitType: string;
  minThreshold: number;
  department: string;
  warehouseName: string;
}

interface LowStockAlertProps {
  lowStockItems: InventoryItem[];
}

const LowStockAlert = ({ lowStockItems }: LowStockAlertProps) => {
  if (lowStockItems.length === 0) return null;

  return (
    <Card className="border-[hsl(38,70%,50%)] bg-gradient-to-br from-[hsl(38,30%,96%)] to-white">
      <CardHeader className="bg-gradient-to-r from-[hsl(38,85%,60%)] to-[hsl(38,90%,50%)] text-white">
        <CardTitle className="text-white flex items-center space-x-2 space-x-reverse">
          <AlertTriangle className="h-5 w-5" />
          <span>تنبيه: عناصر على وشك النفاذ</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {lowStockItems.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded border border-[hsl(38,30%,85%)]">
              <span className="font-medium text-[hsl(142,60%,20%)]">{item.name}</span>
              <Badge className="bg-[hsl(38,85%,60%)] text-white border-[hsl(38,90%,50%)]">
                {item.quantity} {item.unitType} متبقي
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LowStockAlert;
