import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Package, Search } from "lucide-react";
import InventoryItem from "./InventoryItem";
import { EmptyState } from "@/components/common/EmptyState";

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
      <div className="relative max-w-md">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ابحث في المخزون..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="ps-10"
        />
      </div>

      {/* Inventory List */}
      <Card className="border-border">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Package className="size-5 text-primary" />
            <span>قائمة المخزون</span>
          </CardTitle>
          <CardDescription>
            جميع العناصر المتوفرة في مخزون القسم
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInventory.length === 0 ? (
            <EmptyState
              icon={Package}
              title={searchTerm ? 'لم يتم العثور على عناصر' : 'لا توجد عناصر في المخزون'}
              description={searchTerm ? 'جرّب البحث بكلمات أخرى' : 'ابدأ بإضافة عناصر جديدة للمخزون'}
            />
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
