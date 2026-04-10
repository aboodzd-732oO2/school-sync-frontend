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
      <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
        <CardContent className="p-8 text-center">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-gray-500 font-medium">لم يتم تحديد أي عناصر بعد</p>
          <p className="text-gray-400 text-sm mt-2">اختر العناصر من القائمة الجانبية</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-[hsl(142,50%,30%)] bg-gradient-to-br from-white to-[hsl(142,30%,96%)] shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[hsl(142,60%,25%)] to-[hsl(142,50%,20%)] text-white pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 space-x-reverse text-lg font-bold">
            <CheckCircle className="h-5 w-5" />
            <span>العناصر المحددة</span>
          </CardTitle>
          <Badge className="bg-[hsl(38,85%,60%)] text-white border-[hsl(38,90%,50%)] text-base px-3 py-1">
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
                className="bg-white rounded-xl p-4 border-2 border-[hsl(142,30%,85%)] shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 space-x-reverse mb-2">
                      <h4 className="font-bold text-gray-800">
                        {item.subcategory === 'other' && item.customDetails
                          ? item.customDetails
                          : subcategoryLabels[item.subcategory] || item.subcategory}
                      </h4>
                      <Badge className="bg-[hsl(142,30%,96%)] text-[hsl(142,60%,25%)] border-[hsl(142,50%,30%)]">
                        {item.quantity} {getUnitType(item.subcategory)}
                      </Badge>
                    </div>
                    
                    {item.subcategory === 'other' && item.customDetails && (
                      <p className="text-xs text-gray-500 mt-1">
                        نوع: {subcategoryLabels[item.subcategory]}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onRemoveItem(item.subcategory)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Quantity Quick Adjust */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-600 font-medium">الكمية:</span>
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
                    <span className="w-10 text-center font-bold text-[hsl(142,60%,25%)]">{item.quantity}</span>
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

