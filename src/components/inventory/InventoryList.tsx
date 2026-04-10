
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import InventoryItem from "./InventoryItem";

interface InventoryItemType {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitType: string;
  minThreshold: number;
  department: string;
  warehouseName: string;
}

interface InventoryListProps {
  inventory: InventoryItemType[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSaveThreshold: (itemId: string, threshold: number) => void;
  onAddQuantity: (itemId: string, quantity: number) => void;
  onUpdateItem: (itemId: string, quantity: number, threshold: number) => void;
  onDeleteItem: (itemId: string) => void;
}

const InventoryList = ({ 
  inventory, 
  searchTerm, 
  onSearchChange, 
  onSaveThreshold, 
  onAddQuantity,
  onUpdateItem,
  onDeleteItem
}: InventoryListProps) => {
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Search */}
      <div className="flex items-center space-x-2 space-x-reverse">
        <Input
          placeholder="🔍 ابحث في المخزون..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Inventory List */}
      <Card className="border-[hsl(142,30%,85%)]">
        <CardHeader className="bg-gradient-to-r from-[hsl(142,60%,25%)] to-[hsl(142,50%,20%)] text-white">
          <CardTitle className="text-white">قائمة المخزون</CardTitle>
          <CardDescription className="text-white/90">
            جميع العناصر المتوفرة في مخزون القسم
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInventory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-500 text-lg">لا توجد عناصر في المخزون</p>
              <p className="text-gray-400 text-sm mt-2">ابدأ بإضافة عناصر جديدة للمخزون</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInventory.map((item) => (
                <InventoryItem
                  key={item.id}
                  item={item}
                  onSaveThreshold={onSaveThreshold}
                  onAddQuantity={onAddQuantity}
                  onUpdateItem={onUpdateItem}
                  onDeleteItem={onDeleteItem}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default InventoryList;
