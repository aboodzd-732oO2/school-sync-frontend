
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, AlertTriangle } from "lucide-react";

interface ItemToAdd {
  id: string;
  selectedItem: string;
  quantity: number;
  minThreshold: number;
}

interface ItemFormCardProps {
  item: ItemToAdd;
  index: number;
  canRemove: boolean;
  errors: Record<string, string>;
  availableItems: string[];
  allItems: ItemToAdd[];
  onUpdate: (itemId: string, field: keyof ItemToAdd, value: string | number) => void;
  onRemove: (itemId: string) => void;
}

const ItemFormCard = ({
  item,
  index,
  canRemove,
  errors,
  availableItems,
  allItems,
  onUpdate,
  onRemove
}: ItemFormCardProps) => {
  const checkIfItemDuplicated = (): boolean => {
    if (!item.selectedItem) return false;
    return allItems.some(otherItem => {
      if (otherItem.id === item.id) return false;
      return item.selectedItem.toLowerCase() === otherItem.selectedItem.toLowerCase();
    });
  };

  const handleSelectChange = (value: string) => {
    onUpdate(item.id, 'selectedItem', value);
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

        {checkIfItemDuplicated() && (
          <div className="bg-warning/10 border border-warning/30 rounded-md p-3 flex items-start gap-2">
            <AlertTriangle className="size-5 text-warning-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-warning-foreground text-sm font-medium">هذا العنصر مختار بالفعل في عنصر آخر</p>
              <p className="text-warning-foreground text-xs mt-1">يرجى اختيار عنصر مختلف أو حذف أحد العناصر المكررة</p>
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
