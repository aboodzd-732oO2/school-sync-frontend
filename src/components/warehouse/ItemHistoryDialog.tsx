import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { History } from "lucide-react";
import { inventory as inventoryApi } from "@/services/api";
import { MovementRow } from "./MovementRow";
import type { InventoryMovement } from "@/types/inventoryMovement";

interface Props {
  itemId: number | null;
  itemName?: string;
  open: boolean;
  onClose: () => void;
}

export function ItemHistoryDialog({ itemId, itemName, open, onClose }: Props) {
  const [movements, setMovements] = useState<InventoryMovement[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !itemId) return;
    let cancelled = false;
    setMovements(null);
    setError(null);
    inventoryApi
      .itemHistory(itemId)
      .then((data) => {
        if (!cancelled) setMovements(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "فشل تحميل السجل");
      });
    return () => {
      cancelled = true;
    };
  }, [itemId, open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            سجل حركة العنصر
          </DialogTitle>
          <DialogDescription>
            {itemName ? `كل التغييرات على: ${itemName}` : "كل التغييرات"}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-2 overflow-y-auto">
          {error ? (
            <EmptyState icon={History} title="تعذر تحميل السجل" description={error} />
          ) : movements === null ? (
            <LoadingSkeleton variant="list" rows={5} />
          ) : movements.length === 0 ? (
            <EmptyState icon={History} title="لا توجد حركات لهذا العنصر" />
          ) : (
            movements.map((m) => <MovementRow key={m.id} movement={m} showItemName={false} />)
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
