import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Package, Plus, Minus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SubcategoryQuantity {
  subcategory: string;
  quantity: number;
  customDetails?: string;
}

interface ItemsSidebarProps {
  subcategories: string[];
  subcategoryLabels: { [key: string]: string };
  selectedItems: SubcategoryQuantity[];
  onToggleItem: (subcategory: string) => void;
  onQuantityChange: (subcategory: string, quantity: number) => void;
  onCustomDetailsChange: (subcategory: string, details: string) => void;
  getUnitType: (subcategory: string) => string;
  hasError?: boolean;
}

const ItemsSidebar = ({
  subcategories,
  subcategoryLabels,
  selectedItems,
  onToggleItem,
  onQuantityChange,
  onCustomDetailsChange,
  getUnitType,
  hasError = false
}: ItemsSidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSubcategories = subcategories.filter(sub =>
    subcategoryLabels[sub]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = (subcategory: string) => {
    return selectedItems.some(item => item.subcategory === subcategory);
  };

  const getSelectedItem = (subcategory: string) => {
    return selectedItems.find(item => item.subcategory === subcategory);
  };

  return (
    <Card className={`h-full border-2 ${hasError ? 'border-red-300' : 'border-[hsl(142,30%,85%)]'} shadow-lg`}>
      <CardHeader className="bg-gradient-to-r from-[hsl(142,60%,25%)] to-[hsl(142,50%,20%)] border-b border-[hsl(142,50%,15%)] pb-4">
        <CardTitle className="flex items-center space-x-2 space-x-reverse text-lg font-bold text-white">
          <Package className="h-5 w-5 text-white" />
          <span>
            قائمة العناصر المتاحة
          </span>
        </CardTitle>
        
        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="🔍 ابحث عن عنصر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        {/* Selected Count */}
        <div className="mt-3 text-sm">
          <span className="text-white/90 font-medium">
            المحدد: <span className="text-white font-bold">{selectedItems.length}</span> من <span className="text-white font-bold">{subcategories.length}</span>
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-2 p-4">
            {filteredSubcategories.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-gray-500 text-sm">لم يتم العثور على عناصر</p>
              </div>
            ) : (
              filteredSubcategories.map((sub) => {
                const selected = isSelected(sub);
                const item = getSelectedItem(sub);
                
                return (
                  <div
                    key={sub}
                    className={`border-2 rounded-xl p-4 transition-all duration-200 ${
                      selected
                        ? 'bg-gradient-to-br from-[hsl(142,30%,96%)] to-white border-[hsl(142,50%,30%)] shadow-md'
                        : 'bg-white border-[hsl(142,30%,85%)] hover:border-[hsl(142,50%,30%)] hover:shadow-sm'
                    }`}
                  >
                    {/* Item Header */}
                    <div className="flex items-center space-x-3 space-x-reverse mb-3">
                      <Checkbox
                        id={sub}
                        checked={selected}
                        onCheckedChange={() => onToggleItem(sub)}
                        className="border-2 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <Label
                        htmlFor={sub}
                        className={`text-sm font-semibold cursor-pointer flex-1 ${
                          selected ? 'text-[hsl(142,60%,25%)]' : 'text-[hsl(142,60%,20%)]'
                        }`}
                      >
                        {subcategoryLabels[sub] || sub}
                      </Label>
                    </div>
                    
                    {/* Quantity Controls - Only show if selected */}
                    {selected && item && (
                      <div className="mr-8 space-y-3 bg-[hsl(142,30%,96%)] rounded-lg p-3 border border-[hsl(142,30%,85%)]">
                        {/* Custom Details for "other" */}
                        {sub === 'other' && (
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-gray-700">
                              تفاصيل العنصر المخصص:
                            </Label>
                            <Input
                              placeholder="اكتب وصف العنصر..."
                              value={item.customDetails || ''}
                              onChange={(e) => onCustomDetailsChange(sub, e.target.value)}
                              className="text-sm border-gray-300 focus:border-blue-500"
                            />
                          </div>
                        )}
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium text-gray-700">
                            الكمية ({getUnitType(sub)}):
                          </Label>
                          <div className="flex items-center space-x-2 space-x-reverse bg-gray-50 rounded-lg p-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 border-gray-300 hover:bg-red-50 hover:border-red-300"
                              onClick={() => onQuantityChange(sub, Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <div className="w-12 text-center">
                              <span className="text-sm font-bold text-[hsl(142,60%,25%)]">{item.quantity}</span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 border-gray-300 hover:bg-green-50 hover:border-green-300"
                              onClick={() => onQuantityChange(sub, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ItemsSidebar;

