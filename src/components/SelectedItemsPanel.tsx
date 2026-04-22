import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Package, CheckCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SubcategoryQuantity {
  subcategory: string;
  quantity: number;
  customDetails?: string;
}

interface SelectedItemsPanelProps {
  selectedItems: SubcategoryQuantity[];
  subcategoryLabels: { [key: string]: string };
  getUnitType: (subcategory: string) => string;
  onRemoveItem: (subcategory: string) => void;
  onQuantityChange: (subcategory: string, quantity: number) => void;
}

const SelectedItemsPanel = ({
  selectedItems,
  subcategoryLabels,
  getUnitType,
  onRemoveItem,
  onQuantityChange
}: SelectedItemsPanelProps) => {
  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  if (selectedItems.length === 0) {
    return (
      <Card className="border-dashed border-border bg-muted/30">
        <CardContent className="p-8 text-center">
          <Package className="size-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">لم يتم تحديد أي عناصر بعد</p>
          <p className="text-muted-foreground text-sm mt-2">اختر العناصر من القائمة الجانبية</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-primary/30 bg-card shadow-sm">
      <CardHeader className="bg-primary text-white pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 space-x-reverse text-lg font-bold">
            <CheckCircle className="h-5 w-5" />
            <span>العناصر المحددة</span>
          </CardTitle>
          <Badge className="bg-warning text-warning-foreground border-warning text-base px-3 py-1">
            {selectedItems.length} عنصر
          </Badge>
        </div>
        <div className="mt-3 flex items-center space-x-2 space-x-reverse text-white/90">
          <Package className="h-4 w-4" />
          <span className="font-semibold">الإجمالي: {totalQuantity} {totalQuantity === 1 ? 'عنصر' : 'عناصر'}</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-3">
            {selectedItems.map((item) => (
              <div
                key={item.subcategory}
                className="bg-card rounded-lg p-4 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 space-x-reverse mb-2">
                      <h4 className="font-bold text-foreground">
                        {subcategoryLabels[item.subcategory] || item.subcategory}
                      </h4>
                      <Badge className="bg-muted/50 text-primary border-primary/30">
                        {item.quantity} {getUnitType(item.subcategory)}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-danger hover:text-danger hover:bg-danger/10"
                    onClick={() => onRemoveItem(item.subcategory)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Quantity Quick Adjust */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground font-medium">الكمية:</span>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => onQuantityChange(item.subcategory, Math.max(1, item.quantity - 1))}
                    >
                      <span className="text-xs">-</span>
                    </Button>
                    <span className="w-10 text-center font-bold text-primary">{item.quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => onQuantityChange(item.subcategory, item.quantity + 1)}
                    >
                      <span className="text-xs">+</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SelectedItemsPanel;

