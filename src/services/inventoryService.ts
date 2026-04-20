import { inventory as inventoryApi } from './api';

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

export class InventoryService {
  static async getWarehouseInventory(): Promise<InventoryItem[]> {
    try {
      const items = await inventoryApi.list();
      return items.map((item: any) => ({
        id: String(item.id),
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unitType: item.unitType,
        minThreshold: item.minThreshold,
        department: item.department,
        warehouseName: '',
      }));
    } catch {
      return [];
    }
  }

  static async checkStockAvailability(
    requestedItem: string,
    requestedQuantity: number
  ): Promise<StockCheckResult> {
    try {
      const items = await inventoryApi.list();
      const match = items.find((item: any) =>
        item.name.includes(requestedItem) || requestedItem.includes(item.name)
      );
      if (match && match.quantity >= requestedQuantity) {
        return { canFulfill: true, insufficientItems: [] };
      }
      return {
        canFulfill: false,
        insufficientItems: [{
          requestedItem,
          requestedQuantity,
          availableQuantity: match?.quantity || 0,
        }]
      };
    } catch {
      return { canFulfill: false, insufficientItems: [{ requestedItem, requestedQuantity, availableQuantity: 0 }] };
    }
  }

  static async getLowStockItems(): Promise<InventoryItem[]> {
    try {
      const items = await inventoryApi.lowStock();
      return items.map((item: any) => ({
        id: String(item.id),
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unitType: item.unitType,
        minThreshold: item.minThreshold,
        department: item.department,
        warehouseName: '',
      }));
    } catch {
      return [];
    }
  }

  static async addInventoryItem(item: Omit<InventoryItem, 'id' | 'warehouseName'>): Promise<InventoryItem> {
    const created = await inventoryApi.create({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unitType: item.unitType,
      minThreshold: item.minThreshold,
      department: item.department,
    });
    return {
      id: String(created.id),
      name: created.name,
      category: created.category,
      quantity: created.quantity,
      unitType: created.unitType,
      minThreshold: created.minThreshold,
      department: created.department,
      warehouseName: '',
    };
  }

  static async updateInventoryItem(itemId: string, updates: Partial<InventoryItem>): Promise<boolean> {
    try {
      await inventoryApi.update(parseInt(itemId), updates);
      return true;
    } catch {
      return false;
    }
  }

  static async deleteInventoryItem(itemId: string): Promise<boolean> {
    try {
      await inventoryApi.remove(parseInt(itemId));
      return true;
    } catch {
      return false;
    }
  }
}
