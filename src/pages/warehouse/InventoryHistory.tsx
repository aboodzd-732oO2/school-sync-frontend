import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { WarehouseHeader } from "@/components/warehouse/WarehouseHeader";
import { MovementRow } from "@/components/warehouse/MovementRow";
import { History, Search, Filter, ChevronRight, ChevronLeft } from "lucide-react";
import { inventory as inventoryApi } from "@/services/api";
import { useDepartments } from "@/hooks/useLookups";
import type { InventoryMovement, InventoryMovementReason } from "@/types/inventoryMovement";
import { MOVEMENT_REASON_LABEL } from "@/types/inventoryMovement";

interface Props {
  user: {
    userType: "warehouse";
    warehouseName: string;
    departmentKey?: string;
  };
}

const PAGE_SIZE = 50;
const REASONS: InventoryMovementReason[] = [
  "create",
  "manual-increase",
  "manual-decrease",
  "consume",
  "return",
  "delete",
  "edit-meta",
];

const InventoryHistoryPage = ({ user }: Props) => {
  const { getLabel } = useDepartments();
  const deptKey = user.departmentKey || "materials";
  const deptDisplay = getLabel(deptKey).replace(/^قسم\s*/, "");

  const [movements, setMovements] = useState<InventoryMovement[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setMovements(null);
    const filters: Record<string, string> = {
      page: String(page),
      pageSize: String(PAGE_SIZE),
    };
    if (reasonFilter !== "all") filters.reason = reasonFilter;

    inventoryApi
      .movements(filters)
      .then((res) => {
        if (!cancelled) {
          setMovements(res.data);
          setTotal(res.total);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "فشل تحميل السجل");
      });
    return () => {
      cancelled = true;
    };
  }, [page, reasonFilter]);

  useEffect(() => {
    setPage(1);
  }, [reasonFilter]);

  const filteredMovements = useMemo(() => {
    if (!movements) return null;
    if (!searchTerm) return movements;
    const q = searchTerm.toLowerCase();
    return movements.filter(
      (m) =>
        m.itemName.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.userEmail.toLowerCase().includes(q) ||
        (m.note && m.note.toLowerCase().includes(q)),
    );
  }, [movements, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <WarehouseHeader
        warehouseName={user.warehouseName}
        departmentDisplay={deptDisplay}
        subtitle="سجل كامل لكل حركات المخزون (إنشاء، تعديل، خصم، إرجاع، حذف)"
      />

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            سجل حركات المخزون
          </CardTitle>
          <CardDescription>
            {total === 0 ? "لا توجد حركات بعد" : `${total} حركة مسجّلة — أحدث الحركات في الأعلى`}
          </CardDescription>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="ابحث بالعنصر، الفئة، المستخدم، الملاحظة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <Select value={reasonFilter} onValueChange={setReasonFilter}>
                <SelectTrigger className="w-48 bg-card">
                  <SelectValue placeholder="نوع الحركة" />
                </SelectTrigger>
                <SelectContent className="bg-card border shadow-lg z-50">
                  <SelectItem value="all">كل الأنواع</SelectItem>
                  {REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {MOVEMENT_REASON_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(searchTerm || reasonFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setReasonFilter("all");
                }}
              >
                مسح الفلاتر
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {error ? (
            <EmptyState icon={History} title="تعذر تحميل السجل" description={error} />
          ) : filteredMovements === null ? (
            <LoadingSkeleton variant="list" rows={8} />
          ) : filteredMovements.length === 0 ? (
            <EmptyState
              icon={History}
              title="لا توجد حركات بالفلاتر الحالية"
              description={searchTerm || reasonFilter !== "all"
                ? "جرّب تغيير أو مسح الفلاتر"
                : "لم تُسجّل أي حركة مخزون بعد"}
            />
          ) : (
            <div className="space-y-2">
              {filteredMovements.map((m) => (
                <MovementRow key={m.id} movement={m} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                الصفحة {page} من {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronRight className="size-4 me-1" />
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  التالي
                  <ChevronLeft className="size-4 ms-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryHistoryPage;
