
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { useDepartmentItems } from "@/hooks/useLookups";
import ItemFormCard from "./inventory/ItemFormCard";
import FormActions from "./inventory/FormActions";
import { validateInventoryForm } from "./inventory/FormValidation";

interface AddInventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: {
    name: string;
    category: string;
    quantity: number;
    unitType: string;
    minThreshold: number;
  }) => void;
  department: string;
  warehouseName: string;
}

interface ItemToAdd {
  id: string;
  selectedItem: string;
  customItemName: string;
  quantity: number;
  minThreshold: number;
}

const AddInventoryItemModal = ({ isOpen, onClose, onAdd, department, warehouseName }: AddInventoryItemModalProps) => {
  const [itemsToAdd, setItemsToAdd] = useState<ItemToAdd[]>([{
    id: '1',
    selectedItem: '',
    customItemName: '',
    quantity: 0,
    minThreshold: 0
  }]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const addNewItem = () => {
    const newItem: ItemToAdd = {
      id: Date.now().toString(),
      selectedItem: '',
      customItemName: '',
      quantity: 0,
      minThreshold: 0
    };
    setItemsToAdd([...itemsToAdd, newItem]);
  };

  const removeItem = (itemId: string) => {
    if (itemsToAdd.length > 1) {
      setItemsToAdd(itemsToAdd.filter(item => item.id !== itemId));
    }
  };

  const updateItem = (itemId: string, field: keyof ItemToAdd, value: string | number) => {
    setItemsToAdd(prevItems =>
      prevItems.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  // التحقق من وجود عناصر مكررة
  const checkForDuplicates = (): boolean => {
    const itemNames: string[] = [];
    
    for (const item of itemsToAdd) {
      const itemName = item.selectedItem === 'أخرى' ? item.customItemName : item.selectedItem;
      if (itemName) {
        const normalizedName = itemName.toLowerCase().trim();
        if (itemNames.includes(normalizedName)) {
          return true;
        }
        itemNames.push(normalizedName);
      }
    }
    
    return false;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const newErrors = validateInventoryForm(itemsToAdd);
    
    // التحقق من التكرار
    if (checkForDuplicates()) {
      newErrors['duplicate'] = 'يوجد عناصر مكررة، يرجى حذف العناصر المكررة أو اختيار عناصر مختلفة';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // إضافة جميع العناصر
      itemsToAdd.forEach(item => {
        const itemName = item.selectedItem === 'أخرى' ? item.customItemName : item.selectedItem;
        
        onAdd({
          name: itemName,
          category: itemName,
          quantity: item.quantity,
          unitType: 'قطعة', // وحدة افتراضية
          minThreshold: item.minThreshold
        });
      });

      // إعادة تعيين النموذج
      setItemsToAdd([{
        id: '1',
        selectedItem: '',
        customItemName: '',
        quantity: 0,
        minThreshold: 0
      }]);
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setItemsToAdd([{
      id: '1',
      selectedItem: '',
      customItemName: '',
      quantity: 0,
      minThreshold: 0
    }]);
    setErrors({});
    onClose();
  };

  // العناصر من API حسب القسم
  const { items: deptItems } = useDepartmentItems(department);
  const availableItems = [...deptItems.map(i => i.labelAr), 'أخرى'];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة عناصر للمخزون</DialogTitle>
          <DialogDescription>
            يمكنك إضافة عدة عناصر في نفس الوقت. اختر العناصر من القائمة أو أضف عناصر مخصصة وحدد الكميات
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* رسالة تحذير عند وجود تكرار */}
          {errors['duplicate'] && (
            <div className="bg-danger/10 border border-danger/30 rounded-md p-3 flex items-start gap-2">
              <AlertTriangle className="size-5 text-danger shrink-0 mt-0.5" />
              <p className="text-danger text-sm font-medium">{errors['duplicate']}</p>
            </div>
          )}

          <div className="space-y-4">
            {itemsToAdd.map((item, index) => (
              <ItemFormCard
                key={item.id}
                item={item}
                index={index}
                department={department}
                warehouseName={warehouseName}
                canRemove={itemsToAdd.length > 1}
                errors={errors}
                availableItems={availableItems}
                allItems={itemsToAdd}
                onUpdate={updateItem}
                onRemove={removeItem}
              />
            ))}
          </div>

          <FormActions
            itemsCount={itemsToAdd.length}
            onAddItem={addNewItem}
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddInventoryItemModal;
