import { useEffect, useState } from "react";
import { lookup } from "@/services/api";

// ═══════ Priorities ═══════
interface Priority { id: number; key: string; labelAr: string; color: string; level: number }

let _prioritiesCache: Priority[] | null = null;
const _priorityListeners: Array<(p: Priority[]) => void> = [];

export function usePriorities() {
  const [priorities, setPriorities] = useState<Priority[]>(_prioritiesCache || []);

  useEffect(() => {
    if (_prioritiesCache) {
      setPriorities(_prioritiesCache);
      return;
    }
    _priorityListeners.push(setPriorities);
    lookup.priorities().then((data: Priority[]) => {
      _prioritiesCache = data;
      _priorityListeners.forEach(fn => fn(data));
    }).catch(() => {});
    return () => {
      const idx = _priorityListeners.indexOf(setPriorities);
      if (idx >= 0) _priorityListeners.splice(idx, 1);
    };
  }, []);

  const getLabel = (key: string) => priorities.find(p => p.key === key)?.labelAr || key;
  const getColor = (key: string) => priorities.find(p => p.key === key)?.color || '#64748b';
  const getLevel = (key: string) => priorities.find(p => p.key === key)?.level ?? 0;
  const maxLevel = priorities.length > 0 ? Math.max(...priorities.map(p => p.level ?? 0)) : 0;
  const isHighPriority = (key: string) => {
    const lvl = getLevel(key);
    return lvl > 0 && lvl === maxLevel;
  };

  return { priorities, getLabel, getColor, getLevel, isHighPriority };
}

// ═══════ Institution Types ═══════
interface InstitutionType { id: number; key: string; labelAr: string }

let _instTypesCache: InstitutionType[] | null = null;
const _instTypeListeners: Array<(t: InstitutionType[]) => void> = [];

export function useInstitutionTypes() {
  const [types, setTypes] = useState<InstitutionType[]>(_instTypesCache || []);

  useEffect(() => {
    if (_instTypesCache) {
      setTypes(_instTypesCache);
      return;
    }
    _instTypeListeners.push(setTypes);
    lookup.institutionTypes().then((data: InstitutionType[]) => {
      _instTypesCache = data;
      _instTypeListeners.forEach(fn => fn(data));
    }).catch(() => {});
    return () => {
      const idx = _instTypeListeners.indexOf(setTypes);
      if (idx >= 0) _instTypeListeners.splice(idx, 1);
    };
  }, []);

  const getLabel = (key: string) => types.find(t => t.key === key)?.labelAr || key;

  return { types, getLabel };
}

// ═══════ Departments ═══════
interface Department { id: number; key: string; labelAr: string; color: string; icon: string }

let _deptsCache: Department[] | null = null;
const _deptListeners: Array<(d: Department[]) => void> = [];

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>(_deptsCache || []);

  useEffect(() => {
    if (_deptsCache) {
      setDepartments(_deptsCache);
      return;
    }
    _deptListeners.push(setDepartments);
    lookup.departments().then((data: Department[]) => {
      _deptsCache = data;
      _deptListeners.forEach(fn => fn(data));
    }).catch(() => {});
    return () => {
      const idx = _deptListeners.indexOf(setDepartments);
      if (idx >= 0) _deptListeners.splice(idx, 1);
    };
  }, []);

  const getLabel = (key: string) => departments.find(d => d.key === key)?.labelAr || key;
  const getIconKey = (key: string) => departments.find(d => d.key === key)?.icon;
  const getColor = (key: string) => departments.find(d => d.key === key)?.color || '#64748b';

  return { departments, getLabel, getIconKey, getColor };
}

// ═══════ Department Items (للعناصر حسب القسم) ═══════
interface DeptItem { id: number; key: string; labelAr: string; defaultUnit: string; departmentKey: string }

export function useDepartmentItems(departmentKey: string | undefined) {
  const [items, setItems] = useState<DeptItem[]>([]);

  useEffect(() => {
    if (!departmentKey) {
      setItems([]);
      return;
    }
    lookup.departmentItems(departmentKey).then(setItems).catch(() => setItems([]));
  }, [departmentKey]);

  const getLabel = (key: string) => items.find(i => i.key === key)?.labelAr || key;
  const getUnit = (key: string) => items.find(i => i.key === key)?.defaultUnit || 'قطعة';

  return { items, getLabel, getUnit };
}
