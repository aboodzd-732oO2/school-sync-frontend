export type InventoryMovementReason =
  | "create"
  | "manual-increase"
  | "manual-decrease"
  | "consume"
  | "return"
  | "delete"
  | "edit-meta";

export interface InventoryMovement {
  id: number;
  inventoryItemId: number | null;
  warehouseId: number;
  itemName: string;
  category: string;
  department: string;
  unitType: string;
  reason: InventoryMovementReason;
  quantityBefore: number;
  quantityAfter: number;
  delta: number;
  requestId: number | null;
  userId: number | null;
  userEmail: string;
  note: string | null;
  createdAt: string;
}

export interface PaginatedMovements {
  data: InventoryMovement[];
  total: number;
  page: number;
  pageSize: number;
}

export const MOVEMENT_REASON_LABEL: Record<InventoryMovementReason, string> = {
  create: "إنشاء عنصر",
  "manual-increase": "زيادة يدوية",
  "manual-decrease": "نقصان يدوي",
  consume: "خصم لطلب",
  return: "إرجاع من طلب",
  delete: "حذف العنصر",
  "edit-meta": "تعديل بيانات",
};

export const MOVEMENT_REASON_TONE: Record<
  InventoryMovementReason,
  "success" | "warning" | "danger" | "info" | "default"
> = {
  create: "success",
  "manual-increase": "success",
  "manual-decrease": "warning",
  consume: "danger",
  return: "info",
  delete: "danger",
  "edit-meta": "default",
};
