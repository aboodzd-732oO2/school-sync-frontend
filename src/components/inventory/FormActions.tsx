
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
          className="border-success/40 bg-success/10 text-success hover:bg-success/15 hover:border-green-400"
        >
          <Plus className="h-4 w-4 ms-2" />
          إضافة عنصر آخر
        </Button>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button type="submit" className="bg-success hover:bg-success" onClick={onSubmit}>
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
