
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FormActionsProps {
  itemsCount: number;
  onAddItem: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const FormActions = ({ itemsCount, onAddItem, onSubmit, onCancel }: FormActionsProps) => {
  return (
    <>
      {/* زر إضافة عنصر جديد */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={onAddItem}
          className="border-green-300 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-400"
        >
          <Plus className="h-4 w-4 mr-2" />
          إضافة عنصر آخر
        </Button>
      </div>

      <div className="flex space-x-2 space-x-reverse pt-4 border-t">
        <Button type="submit" className="bg-green-600 hover:bg-green-700" onClick={onSubmit}>
          إضافة جميع العناصر ({itemsCount})
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </>
  );
};

export default FormActions;
