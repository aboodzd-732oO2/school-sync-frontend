export type InventoryAlertSeverity = "out-of-stock" | "critical" | "low" | "healthy";

export interface InventoryAlertItem {
  id: number;
  name: string;
  category: string;
  department: string;
  unitType: string;
  quantity: number;
  minThreshold: number;
  consumed30d: number;
  avgDailyConsumption: number;
  suggestedReorder: number;
  severity: InventoryAlertSeverity;
}

export interface InventoryAlertsResponse {
  summary: {
    total: number;
    healthy: number;
    low: number;
    critical: number;
    outOfStock: number;
  };
  items: InventoryAlertItem[];
}

export const SEVERITY_LABEL: Record<InventoryAlertSeverity, string> = {
  "out-of-stock": "نافد",
  critical: "حرج",
  low: "منخفض",
  healthy: "سليم",
};

export const SEVERITY_TONE: Record<
  InventoryAlertSeverity,
  "success" | "warning" | "danger" | "default"
> = {
  "out-of-stock": "danger",
  critical: "danger",
  low: "warning",
  healthy: "success",
};
