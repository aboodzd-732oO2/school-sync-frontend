
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
    <Card className="border-warning/30 bg-warning/10">
      <CardHeader className="bg-warning text-warning-foreground">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span>تنبيه: عناصر على وشك النفاذ</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {lowStockItems.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-card p-3 rounded border border-warning/30">
              <span className="font-medium text-primary">{item.name}</span>
              <Badge className="bg-warning text-warning-foreground border-warning">
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
