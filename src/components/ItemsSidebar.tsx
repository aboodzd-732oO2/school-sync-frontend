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
    <Card className={`h-full ${hasError ? 'border-danger/40' : 'border-border'} shadow-sm`}>
      <CardHeader className="bg-primary border-b border-border pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
          <Package className="h-5 w-5 text-white" />
          <span>
            قائمة العناصر المتاحة
          </span>
        </CardTitle>
        
        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن عنصر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-10 border-border focus:border-primary focus:ring-primary"
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
        <ScrollArea className="h-[500px] ps-4">
          <div className="space-y-2 p-4">
            {filteredSubcategories.length === 0 ? (
              <div className="text-center py-8">
                <Search className="size-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">لم يتم العثور على عناصر</p>
              </div>
            ) : (
              filteredSubcategories.map((sub) => {
                const selected = isSelected(sub);
                const item = getSelectedItem(sub);
                
                return (
                  <div
                    key={sub}
                    className={`border-2 rounded-xl p-4 transition-[background-color,border-color,box-shadow] ${
                      selected
                        ? 'bg-primary/10 border-primary/30 shadow-md'
                        : 'bg-card border-border hover:border-primary/30 hover:shadow-sm'
                    }`}
                  >
                    {/* Item Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <Checkbox
                        id={sub}
                        checked={selected}
                        onCheckedChange={() => onToggleItem(sub)}
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label
                        htmlFor={sub}
                        className={`text-sm font-semibold cursor-pointer flex-1 ${
                          selected ? 'text-primary' : 'text-primary'
                        }`}
                      >
                        {subcategoryLabels[sub] || sub}
                      </Label>
                    </div>
                    
                    {/* Quantity Controls - Only show if selected */}
                    {selected && item && (
                      <div className="ms-8 space-y-3 bg-muted/50 rounded-lg p-3 border border-border">
                        {/* Custom Details for "other" */}
                        {sub === 'other' && (
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-foreground">
                              تفاصيل العنصر المخصص:
                            </Label>
                            <Input
                              placeholder="اكتب وصف العنصر..."
                              value={item.customDetails || ''}
                              onChange={(e) => onCustomDetailsChange(sub, e.target.value)}
                              className="text-sm border-border focus:border-primary"
                            />
                          </div>
                        )}
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium text-foreground">
                            الكمية ({getUnitType(sub)}):
                          </Label>
                          <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 border-border hover:bg-danger/10 hover:border-danger/40"
                              onClick={() => onQuantityChange(sub, Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <div className="w-12 text-center">
                              <span className="text-sm font-bold text-primary">{item.quantity}</span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 border-border hover:bg-success/10 hover:border-success/40"
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

