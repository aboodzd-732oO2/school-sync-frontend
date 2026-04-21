import InventoryManagement from "@/components/InventoryManagement";
import { WarehouseHeader } from "@/components/warehouse/WarehouseHeader";
import { useDepartments } from "@/hooks/useLookups";

interface Props {
  user: {
    userType: "warehouse";
    warehouseName: string;
    departmentKey?: string;
  };
}

const WarehouseInventoryPage = ({ user }: Props) => {
  const department = user.departmentKey || "materials";
  const { getLabel } = useDepartments();
  const departmentDisplay = getLabel(department).replace(/^قسم\s*/, "");

  return (
    <div className="space-y-6">
      <WarehouseHeader
        warehouseName={user.warehouseName}
        departmentDisplay={departmentDisplay}
        subtitle={`إدارة مخزون ${departmentDisplay}`}
      />
      <InventoryManagement warehouseName={user.warehouseName} department={department} />
    </div>
  );
};

export default WarehouseInventoryPage;
