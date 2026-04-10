import { inventory as inventoryApi } from './api';
import { ItemMatchingService } from './inventory/ItemMatchingService';

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
  // جلب المخزون من API
  static async getWarehouseInventory(_warehouseName?: string): Promise<InventoryItem[]> {
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
        warehouseName: _warehouseName || '',
      }));
    } catch {
      return [];
    }
  }

  // حفظ المخزون — لم يعد مطلوباً (API يتولى)
  static saveWarehouseInventory(_warehouseName: string, _inventory: InventoryItem[]): void {
    // No-op: handled by API
  }

  static cleanupDuplicates(_warehouseName: string): void {
    // No-op: handled by API
  }

  // فحص المخزون
  static async checkStockAvailability(
    _warehouseName: string,
    _department: string,
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

  static async consumeStock(
    _warehouseName: string,
    _department: string,
    _requestedItem: string,
    _requestedQuantity: number
  ): Promise<boolean> {
    // يتم من خلال الباك اند تلقائياً عند إكمال الطلب
    return true;
  }

  static async getLowStockItems(_warehouseName?: string, _department?: string): Promise<InventoryItem[]> {
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
        warehouseName: _warehouseName || '',
      }));
    } catch {
      return [];
    }
  }

  static getInstitutionalItemTypes(department: string): string[] {
    return ItemMatchingService.getInstitutionalItemTypes(department);
  }

  static async addInventoryItem(_warehouseName: string, item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
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
      warehouseName: _warehouseName,
    };
  }

  static async updateInventoryItem(_warehouseName: string, itemId: string, updates: Partial<InventoryItem>): Promise<boolean> {
    try {
      await inventoryApi.update(parseInt(itemId), updates);
      return true;
    } catch {
      return false;
    }
  }

  static async deleteInventoryItem(_warehouseName: string, itemId: string): Promise<boolean> {
    try {
      await inventoryApi.remove(parseInt(itemId));
      return true;
    } catch {
      return false;
    }
  }
}
