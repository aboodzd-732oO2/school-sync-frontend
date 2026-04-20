import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import { useDepartments } from "@/hooks/useLookups";

interface InventoryHeaderProps {
  department: string;
  onAddClick: () => void;
}

const InventoryHeader = ({ department, onAddClick }: InventoryHeaderProps) => {
  const { getLabel: getDeptLabel } = useDepartments();
  const getDepartmentName = (dept: string) =>
    getDeptLabel(dept).replace(/^قسم\s*/, '');

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Package className="size-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">إدارة المخزون</h2>
          <p className="text-sm text-muted-foreground mt-1">
            مخزون قسم <span className="font-medium text-foreground">{getDepartmentName(department)}</span>
          </p>
        </div>
      </div>
      <Button onClick={onAddClick}>
        <Plus className="size-4 me-2" />
        إضافة عنصر
      </Button>
    </div>
  );
};

export default InventoryHeader;
