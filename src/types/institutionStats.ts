import type {
  AdminStatusBreakdown,
  AdminPriorityBreakdown,
  AdminDepartmentBreakdown,
  AdminStatsTrendPoint,
} from "./adminStats";

export type { AdminStatusBreakdown, AdminPriorityBreakdown, AdminDepartmentBreakdown };

export interface InstitutionWarehouseBreakdown {
  id: number;
  name: string;
  count: number;
}

export interface InstitutionStatsResponse {
  requests: {
    total: number;
    byStatus: AdminStatusBreakdown;
    byPriority: AdminPriorityBreakdown[];
    byDepartment: AdminDepartmentBreakdown[];
    byWarehouse: InstitutionWarehouseBreakdown[];
    avgResolutionDays: number | null;
    totalStudentsAffected: number;
    totalQuantity: number;
    pendingCount: number;
    readyForPickupCount: number;
    highPriorityCount: number;
  };
}

export type InstitutionStatsTrendPoint = AdminStatsTrendPoint;
