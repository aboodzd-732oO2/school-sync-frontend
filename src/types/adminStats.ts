export type AdminStatusKey =
  | "draft"
  | "pending"
  | "in_progress"
  | "ready_for_pickup"
  | "completed"
  | "rejected"
  | "cancelled"
  | "undelivered";

export type AdminStatusBreakdown = Record<AdminStatusKey, number>;

export interface AdminPriorityBreakdown {
  key: string;
  labelAr: string;
  color: string;
  level: number;
  count: number;
}

export interface AdminDepartmentBreakdown {
  key: string;
  labelAr: string;
  icon: string;
  color: string;
  count: number;
}

export interface AdminInstitutionBreakdown {
  id: number;
  name: string;
  count: number;
}

export interface AdminWarehouseBreakdown {
  id: number;
  name: string;
  count: number;
}

export interface AdminStatsResponse {
  users: {
    institutions: number;
    warehouses: number;
    total: number;
  };
  requests: {
    total: number;
    byStatus: AdminStatusBreakdown;
    byPriority: AdminPriorityBreakdown[];
    byDepartment: AdminDepartmentBreakdown[];
    byInstitution: AdminInstitutionBreakdown[];
    byWarehouse: AdminWarehouseBreakdown[];
    avgResolutionDays: number | null;
    totalStudentsAffected: number;
  };
  inventory: {
    totalItems: number;
  };
}

export interface AdminStatsTrendPoint {
  date: string;
  submitted: number;
  completed: number;
}

export const STATUS_KEY_TO_UI: Record<AdminStatusKey, string> = {
  draft: "draft",
  pending: "pending",
  in_progress: "in-progress",
  ready_for_pickup: "ready-for-pickup",
  completed: "completed",
  rejected: "rejected",
  cancelled: "cancelled",
  undelivered: "undelivered",
};
