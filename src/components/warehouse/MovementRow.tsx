import { Badge } from "@/components/ui/badge";
import {
  Plus, Minus, Package, ArrowDownToLine, ArrowUpFromLine,
  Trash2, Edit3, Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  InventoryMovement,
  InventoryMovementReason,
} from "@/types/inventoryMovement";
import {
  MOVEMENT_REASON_LABEL,
  MOVEMENT_REASON_TONE,
} from "@/types/inventoryMovement";

const toneClasses = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning-foreground border-warning/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  info: "bg-info/15 text-info border-info/30",
  default: "bg-muted text-muted-foreground border-border",
};

const icons: Record<InventoryMovementReason, React.ComponentType<{ className?: string }>> = {
  create: Package,
  "manual-increase": Plus,
  "manual-decrease": Minus,
  consume: ArrowUpFromLine,
  return: ArrowDownToLine,
  delete: Trash2,
  "edit-meta": Edit3,
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

interface Props {
  movement: InventoryMovement;
  showItemName?: boolean;
}

export function MovementRow({ movement, showItemName = true }: Props) {
  const Icon = icons[movement.reason] ?? Package;
  const tone = MOVEMENT_REASON_TONE[movement.reason] ?? "default";
  const deltaPositive = movement.delta > 0;
  const deltaZero = movement.delta === 0;
  const deltaSign = deltaPositive ? "+" : "";

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/50 p-3">
      <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-md", toneClasses[tone])}>
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn("text-[11px]", toneClasses[tone])}>
            {MOVEMENT_REASON_LABEL[movement.reason] ?? movement.reason}
          </Badge>
          {showItemName && (
            <span className="text-sm font-medium truncate">{movement.itemName}</span>
          )}
          {movement.requestId && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Link2 className="size-3" />
              طلب #{movement.requestId}
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="tabular-nums">
            الكمية:{" "}
            <span className="font-medium text-foreground">
              {movement.quantityBefore}
            </span>{" "}
            →{" "}
            <span className="font-medium text-foreground">
              {movement.quantityAfter}
            </span>
            {!deltaZero && (
              <span
                className={cn(
                  "ms-1 font-semibold",
                  deltaPositive ? "text-success" : "text-danger",
                )}
              >
                ({deltaSign}
                {movement.delta} {movement.unitType})
              </span>
            )}
          </span>
          <span>·</span>
          <span>{movement.category}</span>
          <span>·</span>
          <span>بواسطة {movement.userEmail}</span>
        </div>

        {movement.note && (
          <div className="mt-1 text-xs italic text-muted-foreground">{movement.note}</div>
        )}
      </div>

      <div className="shrink-0 text-xs tabular-nums text-muted-foreground whitespace-nowrap">
        {formatDate(movement.createdAt)}
      </div>
    </div>
  );
}
