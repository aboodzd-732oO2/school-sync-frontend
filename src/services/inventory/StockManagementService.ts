
import { InventoryStorageService } from './InventoryStorageService';
import { ItemMatchingService } from './ItemMatchingService';

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

interface StockCheckResult {
  canFulfill: boolean;
  insufficientItems: Array<{
    requestedItem: string;
    requestedQuantity: number;
    availableQuantity: number;
  }>;
}

export class StockManagementService {
  static checkStockAvailability(
    warehouseName: string, 
    department: string, 
    requestedItem: string, 
    requestedQuantity: number
  ): StockCheckResult {
    const inventory = InventoryStorageService.getWarehouseInventory(warehouseName);
    const departmentInventory = inventory.filter(item => item.department === department);
    
    // استخدام الدالة المحسنة للبحث
    const availableItem = ItemMatchingService.findMatchingItem(departmentInventory, requestedItem);

    if (!availableItem || availableItem.quantity < requestedQuantity) {
      return {
        canFulfill: false,
        insufficientItems: [{
          requestedItem,
          requestedQuantity,
          availableQuantity: availableItem ? availableItem.quantity : 0
        }]
      };
    }

    return {
      canFulfill: true,
      insufficientItems: []
    };
  }

  static consumeStock(
    warehouseName: string, 
    department: string, 
    requestedItem: string, 
    requestedQuantity: number
  ): boolean {
    const inventory = InventoryStorageService.getWarehouseInventory(warehouseName);
    const departmentInventory = inventory.filter(item => item.department === department);
    
    // العثور على العنصر المطابق
    const matchedItem = ItemMatchingService.findMatchingItem(departmentInventory, requestedItem);
    
    if (!matchedItem) {
      return false;
    }

    // العثور على فهرس العنصر في المخزون الكامل
    const itemIndex = inventory.findIndex(item => item.id === matchedItem.id);

    if (itemIndex === -1 || inventory[itemIndex].quantity < requestedQuantity) {
      return false;
    }

    // استهلاك المخزون
    inventory[itemIndex].quantity -= requestedQuantity;
    
    // حفظ المخزون المحديث
    InventoryStorageService.saveWarehouseInventory(warehouseName, inventory);
    return true;
  }

  static getLowStockItems(warehouseName: string, department: string): InventoryItem[] {
    const inventory = InventoryStorageService.getWarehouseInventory(warehouseName);
    return inventory.filter(item => 
      item.department === department && 
      item.quantity <= item.minThreshold
    );
  }
}
