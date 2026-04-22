import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";

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

  const criticalCount = lowStockItems.filter(
    (i) => i.quantity === 0 || i.quantity <= Math.max(1, Math.floor(i.minThreshold / 2)),
  ).length;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-warning/20">
          <AlertTriangle className="size-4 text-warning-foreground" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">
            {lowStockItems.length} عنصر يحتاج إعادة طلب
          </div>
          {criticalCount > 0 && (
            <div className="text-xs text-danger">
              {criticalCount} منها {criticalCount === 1 ? "حرج" : "حرجة"}
            </div>
          )}
        </div>
      </div>

      <Button asChild size="sm" variant="outline" className="shrink-0 self-start sm:self-auto">
        <Link to="/inventory/alerts">
          عرض التنبيهات
          <ArrowLeft className="size-4 ms-1" />
        </Link>
      </Button>
    </div>
  );
};

export default LowStockAlert;
