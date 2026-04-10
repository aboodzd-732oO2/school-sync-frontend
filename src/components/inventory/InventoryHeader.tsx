
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";

interface InventoryHeaderProps {
  department: string;
  onAddClick: () => void;
}

const InventoryHeader = ({ department, onAddClick }: InventoryHeaderProps) => {
  const getDepartmentName = (dept: string) => {
    switch (dept) {
      case 'materials': return 'المواد والأثاث';
      case 'maintenance': return 'الصيانة والإصلاح';
      case 'academic-materials': return 'المواد الأكاديمية والكتب';
      case 'technology': return 'التقنيات التعليمية';
      case 'safety': return 'السلامة والأمان';
      default: return dept;
    }
  };

  return (
    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[hsl(142,60%,25%)] to-[hsl(142,50%,20%)] rounded-2xl shadow-lg border border-[hsl(142,50%,15%)]">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2 space-x-reverse">
          <Package className="h-6 w-6" />
          <span>إدارة المخزون</span>
        </h2>
        <p className="text-white/90 font-medium">إدارة مخزون قسم {getDepartmentName(department)}</p>
      </div>
      <Button onClick={onAddClick} className="bg-gradient-to-r from-[hsl(38,85%,60%)] to-[hsl(38,90%,50%)] hover:from-[hsl(38,85%,65%)] hover:to-[hsl(38,90%,55%)] text-white shadow-lg">
        <Plus className="h-4 w-4 mr-2" />
        إضافة عنصر جديد
      </Button>
    </div>
  );
};

export default InventoryHeader;
