import type { AdminStatusKey, AdminStatusBreakdown, AdminPriorityBreakdown, AdminStatsTrendPoint } from "./adminStats";

export type { AdminStatusKey, AdminStatusBreakdown, AdminPriorityBreakdown, AdminStatsTrendPoint };

export interface WarehouseInstitutionBreakdown {
  id: number;
  name: string;
  institutionType: string;
  count: number;
}

export interface WarehouseCriticalStockItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  minThreshold: number;
  unitType: string;
}

export interface WarehouseStatsResponse {
  requests: {
    total: number;
    byStatus: AdminStatusBreakdown;
    byPriority: AdminPriorityBreakdown[];
    byInstitution: WarehouseInstitutionBreakdown[];
    avgResolutionDays: number | null;
    totalStudentsAffected: number;
    totalQuantity: number;
    pendingCount: number;
    readyForPickupCount: number;
    highPriorityCount: number;
    schoolCount: number;
    universityCount: number;
  };
  inventory: {
    totalItems: number;
    totalQuantity: number;
    categories: number;
    lowStockCount: number;
    criticalStockCount: number;
    outOfStockCount: number;
    criticalStockList: WarehouseCriticalStockItem[];
  };
}

export type WarehouseStatsTrendPoint = AdminStatsTrendPoint;
