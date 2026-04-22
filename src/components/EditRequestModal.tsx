
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { X, Edit, Circle, Save } from "lucide-react";
import { useDepartmentItems } from "@/hooks/useLookups";

interface Request {
  id: string;
  title: string;
  institutionType: string;
  department: string;
  subcategory: string;
  priority: string;
  status: string;
  location: string;
  schoolLocation?: string;
  dateSubmitted: string;
  routedTo: string;
  description: string;
  impact: string;
  quantity: number;
  studentsAffected: number;
  unitType: string;
  requestedItems?: Array<{
    itemName: string;
    originalKey: string;
    quantity: number;
    unitType: string;
    displayText: string;
  }>;
  itemsBreakdown?: Array<{
    name: string;
    key: string;
    quantity: number;
    unit: string;
  }>;
  subcategoryQuantities?: Array<{
    subcategory: string;
    quantity: number;
    customDetails: string;
  }>;
}

interface EditRequestModalProps {
  request: Request | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedRequest: Request) => void;
}

interface SubcategoryWithCustom {
  key: string;
  quantity: number;
  customDetails?: string;
}

const EditRequestModal = ({ request, isOpen, onClose, onUpdate }: EditRequestModalProps) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    impact: '',
    studentsAffected: '',
    subcategory: [] as SubcategoryWithCustom[]
  });

  // العناصر تُجلب ديناميكياً حسب قسم الطلب
  const { items: deptItemsData } = useDepartmentItems(formData.department);

  const subcategoryLabels: { [key: string]: string } = {};
  deptItemsData.forEach(i => { subcategoryLabels[i.key] = i.labelAr; });

  // Parse existing subcategories from different possible formats
  const parseSubcategories = (request: Request): SubcategoryWithCustom[] => {
    const parsedItems: SubcategoryWithCustom[] = [];

    if (request.subcategoryQuantities && Array.isArray(request.subcategoryQuantities)) {
      return request.subcategoryQuantities
        .filter(item => item.subcategory !== 'other')
        .map(item => ({
          key: item.subcategory,
          quantity: item.quantity || 1,
        }));
    }

    if (request.requestedItems && Array.isArray(request.requestedItems)) {
      request.requestedItems
        .filter(item => item.originalKey !== 'other')
        .forEach(item => {
          parsedItems.push({
            key: item.originalKey,
            quantity: item.quantity || 1,
          });
        });
      return parsedItems;
    }

    if (request.subcategory) {
      const items = request.subcategory.split(', ').filter(Boolean);
      items.forEach(item => {
        const foundKey = Object.keys(subcategoryLabels).find(key =>
          subcategoryLabels[key] === item || key === item,
        );
        if (foundKey) {
          parsedItems.push({ key: foundKey, quantity: 1 });
        }
      });
    }

    return parsedItems;
  };

  // Update form data when request changes or modal opens
  useEffect(() => {
    if (request && isOpen) {
      const parsedSubcategories = parseSubcategories(request);
      
      setFormData({
        title: request.title || '',
        description: request.description || '',
        priority: request.priority || '',
        impact: request.impact || '',
        studentsAffected: request.studentsAffected?.toString() || '0',
        subcategory: parsedSubcategories
      });
    }
  }, [request, isOpen]);

  if (!request) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();


    if (!formData.title || !formData.description || !formData.priority) {
      toast({
        title: "معلومات مفقودة",
        description: "يرجى ملء جميع الحقول المطلوبة.",
        variant: "destructive"
      });
      return;
    }

    if (formData.subcategory.length === 0) {
      toast({
        title: "معلومات مفقودة",
        description: "يرجى اختيار عنصر واحد على الأقل.",
        variant: "destructive"
      });
      return;
    }

    // Convert subcategories back to string format for backward compatibility
    const subcategoryString = formData.subcategory
      .map(item => subcategoryLabels[item.key] || item.key)
      .join(', ');

    // Create updated requestedItems array
    const requestedItems = formData.subcategory.map(item => {
      const itemName = subcategoryLabels[item.key] || item.key;
      return {
        itemName,
        originalKey: item.key,
        quantity: item.quantity,
        unitType: getUnitType(item.key),
        displayText: `${itemName} (${item.quantity} ${getUnitType(item.key)})`
      };
    });

    // Create updated itemsBreakdown array
    const itemsBreakdown = formData.subcategory.map(item => ({
      name: subcategoryLabels[item.key] || item.key,
      key: item.key,
      quantity: item.quantity,
      unit: getUnitType(item.key)
    }));

    // Create subcategoryQuantities array for new format
    const subcategoryQuantities = formData.subcategory.map(item => ({
      subcategory: item.key,
      quantity: item.quantity,
      customDetails: item.customDetails || ''
    }));

    // Calculate total quantity
    const totalQuantity = formData.subcategory.reduce((sum, item) => sum + item.quantity, 0);

    const updatedRequest = {
      ...request,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      impact: formData.impact,
      quantity: totalQuantity,
      studentsAffected: parseInt(formData.studentsAffected) || 0,
      subcategory: subcategoryString,
      requestedItems,
      itemsBreakdown,
      subcategoryQuantities,
      unitType: formData.subcategory.length > 1 ? 'متنوع' : getUnitType(formData.subcategory[0]?.key)
    };


    onUpdate(updatedRequest);
    onClose();
    
    toast({
      title: "تم تحديث الطلب",
      description: "تم حفظ التعديلات بنجاح.",
    });
  };

  const getUnitType = (subcategory: string): string => {
    const unitTypes: { [key: string]: string } = {
      'chairs': 'قطعة',
      'pens': 'قلم',
      'boards': 'لوح',
      'fans': 'مروحة',
      'blinds': 'ستارة',
      'air-conditioners': 'مكيف',
      'heaters': 'مدفأة',
      'chalk': 'علبة',
      'computers': 'جهاز',
      'projectors': 'جهاز',
      'textbooks': 'نسخة',
      'papers': 'رزمة',
      'notebooks': 'دفتر',
      'stationery': 'مجموعة',
      'software': 'ترخيص',
      'network': 'خدمة',
      'audio-visual': 'جهاز',
      'other': 'عنصر'
    };
    return unitTypes[subcategory] || 'قطعة';
  };

  const handleSubcategoryToggle = (subcategory: string) => {
    setFormData(prev => {
      const existingIndex = prev.subcategory.findIndex(item => item.key === subcategory);
      
      if (existingIndex !== -1) {
        // Remove the subcategory
        return {
          ...prev,
          subcategory: prev.subcategory.filter((_, index) => index !== existingIndex)
        };
      } else {
        // Add the subcategory
        return {
          ...prev,
          subcategory: [...prev.subcategory, { key: subcategory, quantity: 1 }]
        };
      }
    });
  };

  const handleQuantityChange = (subcategory: string, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      subcategory: prev.subcategory.map(item =>
        item.key === subcategory ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    }));
  };

  const removeSubcategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subcategory: prev.subcategory.filter((_, i) => i !== index)
    }));
  };

  const handleClose = () => {
    onClose();
  };

  const availableSubcategories = deptItemsData.map(i => i.key);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="size-5 text-primary" />
            <span>تعديل الطلب</span>
          </DialogTitle>
          <DialogDescription>
            تعديل تفاصيل الطلب رقم #{request.id}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان الطلب *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="وصف مختصر للمشكلة أو الحاجة"
            />
          </div>

          {/* Multiple Subcategory Selection with Quantities */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">التفصيل المحدد والكميات (يمكن اختيار أكثر من عنصر)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 bg-muted/30 rounded-lg">
              {availableSubcategories.map((sub) => (
                <div key={sub} className="space-y-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={sub}
                      checked={formData.subcategory.some(item => item.key === sub)}
                      onCheckedChange={() => handleSubcategoryToggle(sub)}
                    />
                    <Label htmlFor={sub} className="text-sm cursor-pointer flex-1">
                      {subcategoryLabels[sub] || sub}
                    </Label>
                  </div>
                  
                  {/* Quantity input for selected items */}
                  {formData.subcategory.some(item => item.key === sub) && (
                    <div className="ms-6 space-y-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Label className="text-xs">الكمية:</Label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.subcategory.find(item => item.key === sub)?.quantity || 1}
                          onChange={(e) => handleQuantityChange(sub, parseInt(e.target.value) || 1)}
                          className="w-20 h-8 text-sm"
                        />
                        <span className="text-xs text-muted-foreground">
                          {getUnitType(sub)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Selected subcategories display */}
            {formData.subcategory.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-info/10 rounded-lg">
                <span className="text-sm font-medium text-info">المحدد:</span>
                {formData.subcategory.map((item, index) => (
                  <div key={index} className="flex items-center space-x-1 space-x-reverse bg-info/15 text-info px-2 py-1 rounded-full text-xs">
                    <span>
                      {`${subcategoryLabels[item.key] || item.key} (${item.quantity} ${getUnitType(item.key)})`}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSubcategory(index)}
                      className="hover:bg-info/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentsAffected">الطلاب المتأثرين (اختياري)</Label>
            <Input
              id="studentsAffected"
              type="number"
              value={formData.studentsAffected}
              onChange={(e) => setFormData(prev => ({ ...prev, studentsAffected: e.target.value }))}
              placeholder="عدد الطلاب"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف التفصيلي *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="قدم معلومات مفصلة حول المشكلة أو الحاجة"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">مستوى الأولوية *</Label>
            <Select value={formData.priority} onValueChange={(value) =>
              setFormData(prev => ({ ...prev, priority: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="اختر الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high" className="text-danger">
                  <span className="flex items-center gap-2"><Circle className="size-3 fill-danger text-danger" />عالية</span>
                </SelectItem>
                <SelectItem value="medium" className="text-warning-foreground">
                  <span className="flex items-center gap-2"><Circle className="size-3 fill-warning text-warning" />متوسطة</span>
                </SelectItem>
                <SelectItem value="low" className="text-success">
                  <span className="flex items-center gap-2"><Circle className="size-3 fill-success text-success" />منخفضة</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="impact">التأثير على العملية التعليمية</Label>
            <Textarea
              id="impact"
              value={formData.impact}
              onChange={(e) => setFormData(prev => ({ ...prev, impact: e.target.value }))}
              placeholder="صف كيف تؤثر هذه المشكلة على التدريس والتعلم"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              <X className="size-4 me-1" />
              إلغاء
            </Button>
            <Button type="submit">
              <Save className="size-4 me-1" />
              حفظ التعديلات
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRequestModal;
