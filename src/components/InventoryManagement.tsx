
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import AddInventoryItemModal from "./AddInventoryItemModal";
import { InventoryService } from "@/services/inventoryService";
import InventoryHeader from "./inventory/InventoryHeader";
import LowStockAlert from "./inventory/LowStockAlert";
import InventoryStats from "./inventory/InventoryStats";
import InventoryList from "./inventory/InventoryList";

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

interface InventoryManagementProps {
  warehouseName: string;
  department: string;
}

const InventoryManagement = ({ warehouseName, department }: InventoryManagementProps) => {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadInventory = useCallback(async () => {
    const allItems = await InventoryService.getWarehouseInventory(warehouseName);
    const departmentItems = allItems.filter(item => item.department === department);
    setInventory(departmentItems);
  }, [warehouseName, department]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleAddItem = async (newItem: Omit<InventoryItem, 'id' | 'warehouseName' | 'department'>) => {
    const existingItem = inventory.find(item => item.name === newItem.name);
    try {
      const addedItem = await InventoryService.addInventoryItem(warehouseName, {
        ...newItem,
        warehouseName,
        department
      });
      await loadInventory();
      toast({
        title: existingItem ? "تم زيادة الكمية" : "تم إضافة العنصر",
        description: existingItem
          ? `تم زيادة كمية ${addedItem.name} بنجاح`
          : `تم إضافة ${addedItem.name} إلى المخزون بنجاح`,
      });
    } catch {
      toast({ title: "خطأ", description: "فشل في إضافة العنصر", variant: "destructive" });
    }
  };

  const handleSaveThreshold = async (itemId: string, threshold: number) => {
    await InventoryService.updateInventoryItem(warehouseName, itemId, { minThreshold: threshold });
    setInventory(prev => prev.map(item =>
      item.id === itemId ? { ...item, minThreshold: threshold } : item
    ));
    toast({ title: "تم تحديث حد التنبيه", description: "تم تحديث حد التنبيه للعنصر بنجاح" });
  };

  const handleAddQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      toast({ title: "خطأ", description: "يجب إدخال كمية أكبر من صفر", variant: "destructive" });
      return;
    }
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;
    await InventoryService.updateInventoryItem(warehouseName, itemId, { quantity: item.quantity + quantity });
    setInventory(prev => prev.map(i =>
      i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i
    ));
    toast({ title: "تم إضافة الكمية", description: `تم إضافة ${quantity} وحدة إلى ${item.name}` });
  };

  const handleUpdateItem = async (itemId: string, quantity: number, threshold: number) => {
    await InventoryService.updateInventoryItem(warehouseName, itemId, { quantity, minThreshold: threshold });
    const itemName = inventory.find(item => item.id === itemId)?.name;
    setInventory(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity, minThreshold: threshold } : item
    ));
    toast({ title: "تم تحديث العنصر", description: `تم تحديث ${itemName} بنجاح` });
  };

  const handleDeleteItem = async (itemId: string) => {
    const success = await InventoryService.deleteInventoryItem(warehouseName, itemId);
    if (success) {
      setInventory(prev => prev.filter(item => item.id !== itemId));
      toast({ title: "تم حذف العنصر", description: "تم حذف العنصر من المخزون بنجاح" });
    } else {
      toast({ title: "خطأ في الحذف", description: "لم يتم العثور على العنصر للحذف", variant: "destructive" });
    }
  };

  const lowStockItems = inventory.filter(item => item.quantity <= item.minThreshold);

  return (
    <div className="space-y-6">
      <InventoryHeader
        department={department}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <LowStockAlert lowStockItems={lowStockItems} />

      <InventoryStats
        inventory={inventory}
        lowStockItems={lowStockItems}
      />

      <InventoryList
        inventory={inventory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSaveThreshold={handleSaveThreshold}
        onAddQuantity={handleAddQuantity}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
      />

      <AddInventoryItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddItem}
        department={department}
        warehouseName={warehouseName}
      />
    </div>
  );
};

export default InventoryManagement;
