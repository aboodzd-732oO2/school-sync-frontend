
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

export class InventoryStorageService {
  static getWarehouseInventory(warehouseName: string): InventoryItem[] {
    const savedInventory = localStorage.getItem(`inventory_${warehouseName}`);
    const inventory: InventoryItem[] = savedInventory ? JSON.parse(savedInventory) : [];
    
    // دمج العناصر المكررة
    return this.mergeDuplicateItems(inventory);
  }

  static saveWarehouseInventory(warehouseName: string, inventory: InventoryItem[]): void {
    // دمج العناصر المكررة قبل الحفظ
    const mergedInventory = this.mergeDuplicateItems(inventory);
    localStorage.setItem(`inventory_${warehouseName}`, JSON.stringify(mergedInventory));
  }

  // دالة لدمج العناصر المكررة
  static mergeDuplicateItems(inventory: InventoryItem[]): InventoryItem[] {
    const merged: { [key: string]: InventoryItem } = {};
    
    inventory.forEach(item => {
      const key = `${item.name}_${item.department}_${item.warehouseName}`;
      
      if (merged[key]) {
        // دمج الكميات
        merged[key].quantity += item.quantity;
        // استخدام أعلى حد تنبيه
        merged[key].minThreshold = Math.max(merged[key].minThreshold, item.minThreshold);
      } else {
        merged[key] = { ...item };
      }
    });
    
    return Object.values(merged);
  }

  // دالة لتنظيف العناصر المكررة في المخزون الموجود
  static cleanupDuplicates(warehouseName: string): void {
    const inventory = this.getWarehouseInventory(warehouseName);
    this.saveWarehouseInventory(warehouseName, inventory);
  }
}
