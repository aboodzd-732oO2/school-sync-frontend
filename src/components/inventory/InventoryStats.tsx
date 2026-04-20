import { Package, PackageCheck, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";

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
      <StatCard
        label="إجمالي العناصر"
        value={inventory.length}
        icon={Package}
        tone="primary"
      />
      <StatCard
        label="عناصر متوفرة"
        value={availableItems}
        icon={PackageCheck}
        tone="success"
      />
      <StatCard
        label="عناصر منخفضة"
        value={lowStockItems.length}
        icon={AlertTriangle}
        tone="warning"
      />
    </div>
  );
};

export default InventoryStats;
