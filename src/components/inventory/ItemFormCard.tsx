
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, AlertTriangle, Info } from "lucide-react";
import { InventoryService } from "@/services/inventoryService";

interface ItemToAdd {
  id: string;
  selectedItem: string;
  customItemName: string;
  quantity: number;
  minThreshold: number;
}

interface ItemFormCardProps {
  item: ItemToAdd;
  index: number;
  department: string;
  warehouseName: string;
  canRemove: boolean;
  errors: Record<string, string>;
  availableItems: string[];
  allItems: ItemToAdd[]; // إضافة جميع العناصر للتحقق من التكرار
  onUpdate: (itemId: string, field: keyof ItemToAdd, value: string | number) => void;
  onRemove: (itemId: string) => void;
}

const ItemFormCard = ({
  item,
  index,
  department,
  warehouseName,
  canRemove,
  errors,
  availableItems,
  allItems,
  onUpdate,
  onRemove
}: ItemFormCardProps) => {
  // التحقق من وجود العنصر في المخزون
  const checkIfItemExists = (): boolean => {
    // يتم التحقق من جهة السيرفر عند إرسال الطلب
    return false;
  };

  // التحقق من تكرار العنصر في النموذج الحالي
  const checkIfItemDuplicated = (): boolean => {
    const currentItemName = item.selectedItem === 'أخرى' ? item.customItemName : item.selectedItem;
    if (!currentItemName) return false;
    
    return allItems.some(otherItem => {
      if (otherItem.id === item.id) return false; // تجاهل العنصر الحالي
      
      const otherItemName = otherItem.selectedItem === 'أخرى' ? otherItem.customItemName : otherItem.selectedItem;
      return currentItemName.toLowerCase() === otherItemName.toLowerCase();
    });
  };

  const handleSelectChange = (value: string) => {
    onUpdate(item.id, 'selectedItem', value);
    if (value !== 'أخرى') {
      onUpdate(item.id, 'customItemName', '');
    }
  };

  const handleCustomItemChange = (value: string) => {
    onUpdate(item.id, 'customItemName', value);
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">العنصر {index + 1}</CardTitle>
          {canRemove && (
            <Button
              type="button"
              variant="outline" 
              size="sm"
              onClick={() => onRemove(item.id)}
              className="text-danger hover:text-danger hover:bg-danger/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`selectedItem_${item.id}`}>اختر العنصر *</Label>
          <Select 
            value={item.selectedItem || ""} 
            onValueChange={handleSelectChange}
          >
            <SelectTrigger 
              className={`w-full ${errors[`selectedItem_${item.id}`] ? "border-danger" : ""}`}
              id={`selectedItem_${item.id}`}
            >
              <SelectValue placeholder="اختر العنصر من القائمة" />
            </SelectTrigger>
            <SelectContent>
              {availableItems.map((availableItem) => (
                <SelectItem key={availableItem} value={availableItem}>
                  {availableItem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors[`selectedItem_${item.id}`] && (
            <p className="text-danger text-sm mt-1">{errors[`selectedItem_${item.id}`]}</p>
          )}
        </div>

        {/* حقل العنصر المخصص */}
        {item.selectedItem === 'أخرى' && (
          <div>
            <Label htmlFor={`customItemName_${item.id}`}>وصف العنصر المخصص *</Label>
            <Input
              id={`customItemName_${item.id}`}
              value={item.customItemName || ''}
              onChange={(e) => handleCustomItemChange(e.target.value)}
              placeholder="اكتب وصف العنصر المخصص"
              className={errors[`customItemName_${item.id}`] ? "border-danger" : ""}
            />
            {errors[`customItemName_${item.id}`] && (
              <p className="text-danger text-sm mt-1">{errors[`customItemName_${item.id}`]}</p>
            )}
          </div>
        )}

        {/* تنبيه العنصر المكرر في النموذج */}
        {checkIfItemDuplicated() && (
          <div className="bg-warning/10 border border-warning/30 rounded-md p-3 flex items-start gap-2">
            <AlertTriangle className="size-5 text-warning-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-warning-foreground text-sm font-medium">هذا العنصر مختار بالفعل في عنصر آخر</p>
              <p className="text-warning-foreground text-xs mt-1">يرجى اختيار عنصر مختلف أو حذف أحد العناصر المكررة</p>
            </div>
          </div>
        )}

        {/* تنبيه وجود العنصر في المخزون */}
        {checkIfItemExists() && !checkIfItemDuplicated() && (
          <div className="bg-info/10 border border-info/30 rounded-md p-3 flex items-start gap-2">
            <Info className="size-5 text-info shrink-0 mt-0.5" />
            <div>
              <p className="text-info text-sm font-medium">هذا العنصر موجود بالفعل في المخزون</p>
              <p className="text-info text-xs mt-1">سيتم إضافة الكمية الجديدة إلى الكمية الموجودة</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`quantity_${item.id}`}>الكمية *</Label>
            <Input
              id={`quantity_${item.id}`}
              type="number"
              min="1"
              value={item.quantity || ''}
              onChange={(e) => onUpdate(item.id, 'quantity', parseInt(e.target.value) || 0)}
              placeholder="أدخل الكمية"
              className={errors[`quantity_${item.id}`] ? "border-danger" : ""}
            />
            {errors[`quantity_${item.id}`] && (
              <p className="text-danger text-sm mt-1">{errors[`quantity_${item.id}`]}</p>
            )}
          </div>

          <div>
            <Label htmlFor={`minThreshold_${item.id}`}>حد التنبيه</Label>
            <Input
              id={`minThreshold_${item.id}`}
              type="number"
              min="0"
              value={item.minThreshold || ''}
              onChange={(e) => onUpdate(item.id, 'minThreshold', parseInt(e.target.value) || 0)}
              placeholder="0"
              className={errors[`minThreshold_${item.id}`] ? "border-danger" : ""}
            />
            {errors[`minThreshold_${item.id}`] && (
              <p className="text-danger text-sm mt-1">{errors[`minThreshold_${item.id}`]}</p>
            )}
            <p className="text-muted-foreground text-sm mt-1">سيظهر تنبيه عندما تصل الكمية لهذا الحد</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemFormCard;
