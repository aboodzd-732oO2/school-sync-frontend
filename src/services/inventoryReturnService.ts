
import { InventoryService } from "@/services/inventoryService";
import { Request } from "@/types/dashboard";

export class InventoryReturnService {
  static async returnItemsToInventory(request: Request): Promise<void> {
    const warehouseName = request.routedTo || '';

    if (request.requestedItems && request.requestedItems.length > 0) {
      for (const item of request.requestedItems) {
        await this.returnSingleItem(warehouseName, request.department, item.itemName, item.quantity, item.unitType);
      }
    } else if (request.quantity > 0) {
      await this.returnSingleItem(warehouseName, request.department, request.title, request.quantity, request.unitType);
    }
  }

  private static async returnSingleItem(
    warehouseName: string,
    department: string,
    itemName: string,
    quantity: number,
    unitType: string
  ): Promise<void> {
    const inventory = await InventoryService.getWarehouseInventory(warehouseName);

    const existingItem = inventory.find(invItem =>
      invItem.name === itemName && invItem.department === department
    );

    if (existingItem) {
      await InventoryService.updateInventoryItem(warehouseName, existingItem.id, {
        quantity: existingItem.quantity + quantity
      });
    } else {
      await InventoryService.addInventoryItem(warehouseName, {
        name: itemName,
        category: 'مُرجع من طلب غير مستلم',
        quantity: quantity,
        unitType: unitType || 'قطعة',
        minThreshold: 5,
        department: department,
        warehouseName: warehouseName
      });
    }
  }
}
