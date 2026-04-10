
import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertTriangle } from "lucide-react";

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

interface InventoryStatsProps {
  inventory: InventoryItem[];
  lowStockItems: InventoryItem[];
}

const InventoryStats = ({ inventory, lowStockItems }: InventoryStatsProps) => {
  const availableItems = inventory.filter(i => i.quantity > i.minThreshold).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="card-hover border-2 border-[hsl(142,50%,30%)] bg-gradient-to-br from-white to-[hsl(142,30%,96%)] shadow-md hover:shadow-xl hover:border-[hsl(142,50%,25%)] transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="icon-container-primary">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-[hsl(142,60%,25%)]">{inventory.length}</p>
              <p className="text-sm font-semibold text-[hsl(142,60%,20%)]">إجمالي العناصر</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="card-hover border-2 border-[hsl(142,50%,30%)] bg-gradient-to-br from-white to-[hsl(142,30%,96%)] shadow-md hover:shadow-xl hover:border-[hsl(142,50%,25%)] transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="icon-container-green">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-[hsl(142,60%,25%)]">{availableItems}</p>
              <p className="text-sm font-semibold text-[hsl(142,60%,20%)]">عناصر متوفرة</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="card-hover border-2 border-[hsl(38,70%,50%)] bg-gradient-to-br from-white to-[hsl(38,30%,96%)] shadow-md hover:shadow-xl hover:border-[hsl(38,85%,60%)] transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="icon-container-golden">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-[hsl(38,85%,60%)]">{lowStockItems.length}</p>
              <p className="text-sm font-semibold text-[hsl(38,80%,50%)]">عناصر منخفضة</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryStats;
