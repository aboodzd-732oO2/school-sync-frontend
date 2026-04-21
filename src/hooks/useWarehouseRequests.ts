import { useMemo } from "react";
import { useDepartments, usePriorities } from "@/hooks/useLookups";

interface Request {
  id: string;
  title: string;
  department: string;
  subcategory: string;
  priority: string;
  status: string;
  location: string;
  schoolLocation?: string;
  dateSubmitted: string;
  routedTo: string;
  description: string;
  impact: string;
  quantity: number;
  studentsAffected: number;
  unitType: string;
  institutionType: string;
  requestedItems?: Array<{
    itemName: string;
    originalKey: string;
    quantity: number;
    unitType: string;
    displayText: string;
  }>;
  itemsBreakdown?: Array<{
    name: string;
    key: string;
    quantity: number;
    unit: string;
  }>;
  rejectionReason?: string;
  rejectionDate?: string;
  cancellationReason?: string;
  cancellationDate?: string;
  cancellationType?: string;
}

interface WarehouseUser {
  userType: "warehouse";
  warehouseName: string;
  departmentKey?: string;
}

export interface WarehouseStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  readyForPickup: number;
  undelivered: number;
  rejected: number;
  cancelled: number;
  highPriority: number;
  totalQuantity: number;
  totalStudents: number;
  schools: number;
  universities: number;
}

export interface WarehouseItemBreakdown {
  key: string;
  name: string;
  totalQuantity: number;
  unit: string;
  requests: string[];
  institutions: string[];
}

export interface WarehouseInstitutionBreakdown {
  name: string;
  type: string;
  requests: Request[];
  totalQuantity: number;
  totalStudents: number;
}

function sumRequestQuantity(request: Request): number {
  if (request.requestedItems && request.requestedItems.length > 0) {
    return request.requestedItems.reduce((sum, item) => sum + item.quantity, 0);
  }
  if (request.itemsBreakdown && request.itemsBreakdown.length > 0) {
    return request.itemsBreakdown.reduce((sum, item) => sum + item.quantity, 0);
  }
  return request.quantity || 0;
}

export function useWarehouseRequests(requests: Request[], user: WarehouseUser) {
  const warehouseDepartment = user.departmentKey || "materials";
  const { getLabel: getDeptLabel } = useDepartments();
  const { isHighPriority } = usePriorities();
  const warehouseDepartmentDisplay = getDeptLabel(warehouseDepartment).replace(/^قسم\s*/, "");

  const warehouseRequests = useMemo(
    () => requests.filter((r) => r.department === warehouseDepartment && r.status !== "draft"),
    [requests, warehouseDepartment],
  );

  const stats: WarehouseStats = useMemo(() => {
    const totalQuantity = warehouseRequests.reduce((sum, r) => sum + sumRequestQuantity(r), 0);
    const totalStudents = warehouseRequests.reduce((sum, r) => sum + (r.studentsAffected || 0), 0);
    return {
      total: warehouseRequests.length,
      pending: warehouseRequests.filter((r) => r.status === "pending").length,
      inProgress: warehouseRequests.filter((r) => r.status === "in-progress").length,
      completed: warehouseRequests.filter((r) => r.status === "completed").length,
      readyForPickup: warehouseRequests.filter((r) => r.status === "ready-for-pickup").length,
      undelivered: warehouseRequests.filter((r) => r.status === "undelivered").length,
      rejected: warehouseRequests.filter((r) => r.status === "rejected").length,
      cancelled: warehouseRequests.filter((r) => r.status === "cancelled").length,
      highPriority: warehouseRequests.filter((r) => isHighPriority(r.priority)).length,
      totalQuantity,
      totalStudents,
      schools: warehouseRequests.filter((r) => r.institutionType === "school").length,
      universities: warehouseRequests.filter((r) => r.institutionType === "university").length,
    };
  }, [warehouseRequests, isHighPriority]);

  const getDetailedItemsData = useMemo(
    () => () => {
      const breakdown: Record<string, WarehouseItemBreakdown> = {};
      for (const request of warehouseRequests) {
        if (request.requestedItems && request.requestedItems.length > 0) {
          for (const item of request.requestedItems) {
            const key = item.originalKey === "other" ? `custom_${item.itemName}` : item.originalKey;
            if (!breakdown[key]) {
              breakdown[key] = {
                key,
                name: item.itemName,
                totalQuantity: 0,
                unit: item.unitType,
                requests: [],
                institutions: [],
              };
            }
            breakdown[key].totalQuantity += item.quantity;
            if (!breakdown[key].requests.includes(request.title)) {
              breakdown[key].requests.push(request.title);
            }
            if (!breakdown[key].institutions.includes(request.location)) {
              breakdown[key].institutions.push(request.location);
            }
          }
        } else if (request.itemsBreakdown && request.itemsBreakdown.length > 0) {
          for (const item of request.itemsBreakdown) {
            const key = `breakdown_${item.key}`;
            if (!breakdown[key]) {
              breakdown[key] = {
                key,
                name: item.name,
                totalQuantity: 0,
                unit: item.unit,
                requests: [],
                institutions: [],
              };
            }
            breakdown[key].totalQuantity += item.quantity;
            if (!breakdown[key].requests.includes(request.title)) {
              breakdown[key].requests.push(request.title);
            }
            if (!breakdown[key].institutions.includes(request.location)) {
              breakdown[key].institutions.push(request.location);
            }
          }
        } else if (request.quantity > 0 && request.title) {
          const key = `main_${request.title}`;
          if (!breakdown[key]) {
            breakdown[key] = {
              key,
              name: request.title,
              totalQuantity: 0,
              unit: request.unitType,
              requests: [],
              institutions: [],
            };
          }
          breakdown[key].totalQuantity += request.quantity;
          if (!breakdown[key].requests.includes(request.title)) {
            breakdown[key].requests.push(request.title);
          }
          if (!breakdown[key].institutions.includes(request.location)) {
            breakdown[key].institutions.push(request.location);
          }
        }
      }
      return Object.values(breakdown);
    },
    [warehouseRequests],
  );

  const getInstitutionsData = useMemo(
    () => (type: "school" | "university"): WarehouseInstitutionBreakdown[] => {
      const filtered = warehouseRequests.filter((r) => r.institutionType === type);
      const groups: Record<string, WarehouseInstitutionBreakdown> = {};
      for (const request of filtered) {
        if (!groups[request.location]) {
          groups[request.location] = {
            name: request.location,
            type: request.institutionType,
            requests: [],
            totalQuantity: 0,
            totalStudents: 0,
          };
        }
        groups[request.location].requests.push(request);
        groups[request.location].totalQuantity += sumRequestQuantity(request);
        groups[request.location].totalStudents += request.studentsAffected || 0;
      }
      return Object.values(groups);
    },
    [warehouseRequests],
  );

  return {
    warehouseDepartment,
    warehouseDepartmentDisplay,
    warehouseRequests,
    stats,
    getDetailedItemsData,
    getInstitutionsData,
  };
}
