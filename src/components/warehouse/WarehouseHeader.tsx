import { Warehouse } from "lucide-react";

interface Props {
  warehouseName: string;
  departmentDisplay: string;
  subtitle?: string;
}

export function WarehouseHeader({ warehouseName, departmentDisplay, subtitle }: Props) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Warehouse className="size-5" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-foreground">{warehouseName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {subtitle ?? (
            <>
              معالجة طلبات <span className="font-medium text-foreground">{departmentDisplay}</span> من مؤسسات المحافظة
            </>
          )}
        </p>
      </div>
    </div>
  );
}
