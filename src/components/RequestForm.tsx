import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Package, Users, AlertTriangle, Clock, CheckCircle, AlertCircle, Save, Send, Eye } from "lucide-react";
import { getDepartmentIcon } from "@/lib/departmentIcons";
import ItemsSidebar from "./ItemsSidebar";
import SelectedItemsPanel from "./SelectedItemsPanel";
import { lookup } from "@/services/api";
import { useInstitutionTypes } from "@/hooks/useLookups";

interface UserData {
  email: string;
  institutionType: string;
  institutionName: string;
  loginTime: string;
}

interface RequestFormProps {
  onSubmit: (request: any) => void;
  userData: UserData | null;
}

interface SubcategoryQuantity {
  subcategory: string;
  quantity: number;
  customDetails?: string; // Added for custom subcategory details
}

interface ValidationErrors {
  department: boolean;
  subcategoryQuantities: boolean;
  title: boolean;
  description: boolean;
  priority: boolean;
}

const RequestForm = ({ onSubmit, userData }: RequestFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    institutionType: userData?.institutionType || '',
    department: '',
    subcategoryQuantities: [] as SubcategoryQuantity[],
    title: '',
    description: '',
    location: userData?.institutionName || '',
    priority: '',
    impact: '',
    studentsAffected: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({
    department: false,
    subcategoryQuantities: false,
    title: false,
    description: false,
    priority: false,
  });

  const [touched, setTouched] = useState({
    department: false,
    subcategoryQuantities: false,
    title: false,
    description: false,
    priority: false,
  });

  const { getLabel: getInstitutionTypeLabel } = useInstitutionTypes();

  // البيانات الديناميكية من API
  const [departmentsList, setDepartmentsList] = useState<Array<{ key: string; labelAr: string; color: string; icon: string }>>([]);
  const [currentItems, setCurrentItems] = useState<Array<{ key: string; labelAr: string; defaultUnit: string }>>([]);
  const [prioritiesList, setPrioritiesList] = useState<Array<{ key: string; labelAr: string; color: string }>>([]);

  // تحميل الأقسام والأولويات عند بداية التحميل
  useEffect(() => {
    lookup.departments().then(setDepartmentsList).catch(() => {});
    lookup.priorities().then(setPrioritiesList).catch(() => {});
  }, []);

  // تحميل عناصر القسم عند تغييره
  useEffect(() => {
    if (formData.department) {
      lookup.departmentItems(formData.department).then(setCurrentItems).catch(() => setCurrentItems([]));
    } else {
      setCurrentItems([]);
    }
  }, [formData.department]);

  const subcategoryLabels = useMemo(() => {
    const map: Record<string, string> = { 'other': 'أخرى' };
    currentItems.forEach(item => { map[item.key] = item.labelAr; });
    return map;
  }, [currentItems]);

  const getUnitTypeForSubcategory = (subcategory: string): string => {
    if (subcategory === 'other') return 'عنصر';
    const item = currentItems.find(i => i.key === subcategory);
    return item?.defaultUnit || 'قطعة';
  };

  // قائمة subcategories للقسم الحالي (تشمل "other")
  const currentSubcategories = useMemo(() => {
    return [...currentItems.map(i => i.key), 'other'];
  }, [currentItems]);

  // اللون والأيقونة يجيان من API ديناميكياً
  const currentDepartment = useMemo(() => {
    const dept = departmentsList.find(d => d.key === formData.department);
    if (!dept) return null;
    return {
      label: dept.labelAr,
      subcategories: currentSubcategories,
      routeTo: `مستودع ${dept.labelAr.replace(/^قسم\s*/, '')} في محافظتك`,
      icon: dept.icon,
      color: dept.color,
    };
  }, [departmentsList, formData.department, currentSubcategories]);

  const getTotalQuantity = () => {
    return formData.subcategoryQuantities.reduce((total, item) => total + item.quantity, 0);
  };

  const getPriorityIcon = (priority: string) => {
    const p = prioritiesList.find(x => x.key === priority);
    if (!p) return null;
    return <AlertTriangle className="h-4 w-4" style={{ color: p.color }} />;
  };

  const validateForm = () => {
    const newErrors = {
      department: !formData.department,
      subcategoryQuantities: formData.subcategoryQuantities.length === 0,
      title: !formData.title.trim(),
      description: !formData.description.trim(),
      priority: !formData.priority,
    };

    setErrors(newErrors);
    setTouched({
      department: true,
      subcategoryQuantities: true,
      title: true,
      description: true,
      priority: true,
    });

    return !Object.values(newErrors).some(error => error);
  };

  const handleFieldBlur = (fieldName: keyof ValidationErrors) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const fieldErrors = {
      department: !formData.department,
      subcategoryQuantities: formData.subcategoryQuantities.length === 0,
      title: !formData.title.trim(),
      description: !formData.description.trim(),
      priority: !formData.priority,
    };

    setErrors(prev => ({ ...prev, [fieldName]: fieldErrors[fieldName] }));
  };

  const createRequest = (status: 'draft' | 'pending') => {
    // Check if all selected subcategories have quantities > 0
    const invalidQuantities = formData.subcategoryQuantities.filter(item => item.quantity <= 0);
    if (invalidQuantities.length > 0) {
      toast({
        title: "كميات غير صحيحة",
        description: "يرجى إدخال كمية صحيحة لجميع التفاصيل المحددة.",
        variant: "destructive"
      });
      return false;
    }

    // Check for custom details validation for "other" options
    const missingCustomDetails = formData.subcategoryQuantities.filter(item => 
      item.subcategory === 'other' && (!item.customDetails || !item.customDetails.trim())
    );
    if (missingCustomDetails.length > 0) {
      toast({
        title: "تفاصيل مفقودة",
        description: "يرجى إدخال تفاصيل العنصر المخصص لجميع الخيارات 'أخرى'.",
        variant: "destructive"
      });
      return false;
    }

    // إنشاء تفاصيل العناصر المطلوبة بدقة
    const detailedItems = formData.subcategoryQuantities.map(item => ({
      itemName: item.subcategory === 'other' ? item.customDetails || 'أخرى' : subcategoryLabels[item.subcategory] || item.subcategory,
      originalKey: item.subcategory,
      quantity: item.quantity,
      unitType: getUnitTypeForSubcategory(item.subcategory),
      displayText: `${item.subcategory === 'other' ? item.customDetails : subcategoryLabels[item.subcategory] || item.subcategory} (${item.quantity} ${getUnitTypeForSubcategory(item.subcategory)})`
    }));

    const request = {
      ...formData,
      id: Date.now().toString(),
      dateSubmitted: new Date().toISOString(),
      status: status, // This will be 'draft' or 'pending' based on the button clicked
      routedTo: currentDepartment?.routeTo || 'جهة غير معروفة',
      unitType: 'متنوع',
      quantity: getTotalQuantity(),
      studentsAffected: formData.studentsAffected ? parseInt(formData.studentsAffected) : 0,
      subcategory: detailedItems.map(item => item.displayText).join(', '),
      // إضافة تفاصيل العناصر المطلوبة
      requestedItems: detailedItems,
      itemsBreakdown: detailedItems.map(item => ({
        name: item.itemName,
        key: item.originalKey,
        quantity: item.quantity,
        unit: item.unitType
      }))
    };

    onSubmit(request);
    return true;
  };

  const handleSaveAsDraft = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "معلومات مفقودة",
        description: "يرجى ملء جميع الحقول المطلوبة واختيار التفاصيل مع الكميات.",
        variant: "destructive"
      });
      return;
    }

    if (createRequest('draft')) {
      toast({
        title: "تم حفظ الطلب كمسودة",
        description: "يمكنك العودة لتعديله وإرساله لاحقاً."
      });
      resetForm();
    }
  };

  const handleSendToWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "معلومات مفقودة",
        description: "يرجى ملء جميع الحقول المطلوبة واختيار التفاصيل مع الكميات.",
        variant: "destructive"
      });
      return;
    }

    if (createRequest('pending')) { // Change status to 'pending' when sending to warehouse
      toast({
        title: "تم إرسال الطلب بنجاح",
        description: `تم توجيه طلبك بإجمالي ${getTotalQuantity()} عنصر إلى المستودع.`
      });
      resetForm();
    }
  };

  const resetForm = () => {
    // Reset form but keep user data
    setFormData({
      institutionType: userData?.institutionType || '',
      department: '',
      subcategoryQuantities: [],
      title: '',
      description: '',
      location: userData?.institutionName || '',
      priority: '',
      impact: '',
      studentsAffected: ''
    });

    // Reset validation states
    setErrors({
      department: false,
      subcategoryQuantities: false,
      title: false,
      description: false,
      priority: false,
    });
    setTouched({
      department: false,
      subcategoryQuantities: false,
      title: false,
      description: false,
      priority: false,
    });
  };

  const handleSubcategoryToggle = (subcategory: string) => {
    const newSubcategoryQuantities = formData.subcategoryQuantities.find(item => item.subcategory === subcategory)
      ? formData.subcategoryQuantities.filter(item => item.subcategory !== subcategory)
      : [...formData.subcategoryQuantities, { subcategory, quantity: 1, customDetails: '' }];

    setFormData(prev => ({
      ...prev,
      subcategoryQuantities: newSubcategoryQuantities
    }));

    // Update validation for subcategories
    if (touched.subcategoryQuantities) {
      setErrors(prev => ({ ...prev, subcategoryQuantities: newSubcategoryQuantities.length === 0 }));
    }
  };

  const handleQuantityChange = (subcategory: string, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      subcategoryQuantities: prev.subcategoryQuantities.map(item =>
        item.subcategory === subcategory ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    }));
  };

  const handleCustomDetailsChange = (subcategory: string, customDetails: string) => {
    setFormData(prev => ({
      ...prev,
      subcategoryQuantities: prev.subcategoryQuantities.map(item =>
        item.subcategory === subcategory ? { ...item, customDetails } : item
      )
    }));
  };

  const removeSubcategory = (subcategory: string) => {
    const newSubcategoryQuantities = formData.subcategoryQuantities.filter(item => item.subcategory !== subcategory);
    setFormData(prev => ({
      ...prev,
      subcategoryQuantities: newSubcategoryQuantities
    }));

    // Update validation for subcategories
    if (touched.subcategoryQuantities) {
      setErrors(prev => ({ ...prev, subcategoryQuantities: newSubcategoryQuantities.length === 0 }));
    }
  };

  const getFieldClassName = (fieldName: keyof ValidationErrors, baseClassName: string = '') => {
    const hasError = touched[fieldName] && errors[fieldName];
    return `${baseClassName} ${hasError ? 'border-danger focus-visible:ring-danger' : ''}`.trim();
  };

  const renderFieldError = (fieldName: keyof ValidationErrors, message: string) => {
    if (touched[fieldName] && errors[fieldName]) {
      return (
        <div className="flex items-center space-x-1 space-x-reverse text-danger text-sm mt-1">
          <AlertCircle className="h-4 w-4" />
          <span>{message}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">تقديم طلب جديد</CardTitle>
        <CardDescription>
          املأ النموذج أدناه لتقديم طلب صيانة مفصل أو احتياج من المواد.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          {/* Institution info - read-only fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="institutionType">نوع المؤسسة التعليمية</Label>
              <Input
                id="institutionType"
                value={getInstitutionTypeLabel(formData.institutionType)}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">اسم المؤسسة التعليمية</Label>
              <Input
                id="location"
                value={formData.location}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          {/* Department Selection with Visual Enhancement */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="department" className="text-lg font-semibold">
                اختيار نوع الطلب *
              </Label>
              <Select 
                value={formData.department} 
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, department: value, subcategoryQuantities: [] }));
                  if (touched.department) {
                    setErrors(prev => ({ ...prev, department: !value, subcategoryQuantities: true }));
                  }
                }}
                onOpenChange={() => handleFieldBlur('department')}
              >
                <SelectTrigger className={getFieldClassName('department', 'h-12')}>
                  <SelectValue placeholder="اختر القسم المناسب" />
                </SelectTrigger>
                <SelectContent>
                  {departmentsList.map(dept => (
                    <SelectItem key={dept.key} value={dept.key} className="py-3">
                      <span>{dept.labelAr}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {renderFieldError('department', 'يرجى اختيار نوع الطلب')}
            </div>

            {currentDepartment && (() => {
              const DeptIcon = getDepartmentIcon(currentDepartment.icon);
              return (
              <div className="p-4 rounded-lg border" style={{ backgroundColor: `${currentDepartment.color}15`, borderColor: `${currentDepartment.color}50` }}>
                <div className="flex items-center gap-2 mb-2">
                  <DeptIcon className="size-5" style={{ color: currentDepartment.color }} />
                  <h3 className="font-semibold">{currentDepartment.label}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  سيتم توجيه طلبك إلى: <strong>{currentDepartment.routeTo}</strong>
                </p>
              </div>
              );
            })()}

            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-info" />
                <span>التفصيل المحدد * (يمكن اختيار أكثر من عنصر مع تحديد الكمية لكل عنصر)</span>
              </Label>
              {currentDepartment && (
                <>
                  {/* Two Column Layout: Sidebar + Selected Panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Items Sidebar */}
                    <div>
                      <ItemsSidebar
                        subcategories={currentDepartment.subcategories}
                        subcategoryLabels={subcategoryLabels}
                        selectedItems={formData.subcategoryQuantities}
                        onToggleItem={(sub) => {
                          handleSubcategoryToggle(sub);
                          handleFieldBlur('subcategoryQuantities');
                        }}
                        onQuantityChange={handleQuantityChange}
                        onCustomDetailsChange={handleCustomDetailsChange}
                        getUnitType={getUnitTypeForSubcategory}
                        hasError={touched.subcategoryQuantities && errors.subcategoryQuantities}
                      />
                    </div>
                    
                    {/* Selected Items Panel */}
                    <div>
                      <SelectedItemsPanel
                        selectedItems={formData.subcategoryQuantities}
                        subcategoryLabels={subcategoryLabels}
                        getUnitType={getUnitTypeForSubcategory}
                        onRemoveItem={removeSubcategory}
                        onQuantityChange={handleQuantityChange}
                      />
                    </div>
                  </div>
                  
                  {renderFieldError('subcategoryQuantities', 'يرجى اختيار عنصر واحد على الأقل')}
                </>
              )}
              {!currentDepartment && (
                <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded">
                  يرجى اختيار القسم أولاً لإظهار التفاصيل المتاحة
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">عنوان الطلب *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, title: e.target.value }));
                if (touched.title) {
                  setErrors(prev => ({ ...prev, title: !e.target.value.trim() }));
                }
              }}
              onBlur={() => handleFieldBlur('title')}
              placeholder="وصف مختصر للمشكلة أو الحاجة"
              className={getFieldClassName('title')}
            />
            {renderFieldError('title', 'يرجى إدخال عنوان للطلب')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentsAffected" className="flex items-center space-x-2 space-x-reverse">
              <Users className="h-4 w-4" />
              <span>الطلاب المتأثرين (اختياري)</span>
            </Label>
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
              onChange={(e) => {
                setFormData(prev => ({ ...prev, description: e.target.value }));
                if (touched.description) {
                  setErrors(prev => ({ ...prev, description: !e.target.value.trim() }));
                }
              }}
              onBlur={() => handleFieldBlur('description')}
              placeholder="قدم معلومات مفصلة حول المشكلة أو الحاجة"
              rows={4}
              className={getFieldClassName('description')}
            />
            {renderFieldError('description', 'يرجى إدخال وصف مفصل للطلب')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">مستوى الأولوية *</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, priority: value }));
                if (touched.priority) {
                  setErrors(prev => ({ ...prev, priority: !value }));
                }
              }}
              onOpenChange={() => handleFieldBlur('priority')}
            >
              <SelectTrigger className={getFieldClassName('priority')}>
                <SelectValue placeholder="اختر الأولوية" />
              </SelectTrigger>
              <SelectContent>
                {prioritiesList.map(p => (
                  <SelectItem key={p.key} value={p.key}>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                      <span>{p.labelAr}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderFieldError('priority', 'يرجى اختيار مستوى الأولوية')}
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

          {/* Enhanced Preview Section */}
          {formData.department && formData.subcategoryQuantities.length > 0 && (
            <div className="p-6 bg-info/10 rounded-lg border border-info/30">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Eye className="size-5 text-info" />
                <span>معاينة الطلب</span>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">القسم:</span>
                  <span>{currentDepartment?.label}</span>
                </div>
                <div className="space-y-1">
                  <span className="font-medium">التفاصيل والكميات:</span>
                  {formData.subcategoryQuantities.map((item) => (
                    <div key={item.subcategory} className="ms-4 flex justify-between text-xs bg-card p-2 rounded">
                      <span>
                        {item.subcategory === 'other' ? item.customDetails : subcategoryLabels[item.subcategory] || item.subcategory}
                      </span>
                      <span className="font-bold">{item.quantity} {getUnitTypeForSubcategory(item.subcategory)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">إجمالي الكمية:</span>
                  <span className="font-bold text-info">{getTotalQuantity()}</span>
                </div>
                {formData.priority && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">الأولوية:</span>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <span>{prioritiesList.find(p => p.key === formData.priority)?.labelAr || formData.priority}</span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">سيتم التوجيه إلى:</span>
                  <span className="text-info font-medium">{currentDepartment?.routeTo}</span>
                </div>
              </div>
            </div>
          )}

          {/* Two Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              type="button" 
              onClick={handleSaveAsDraft}
              variant="outline" 
              className="h-12 text-lg"
            >
              <Save className="h-5 w-5 me-2" />
              حفظ كمسودة
            </Button>
            
            <Button 
              type="button" 
              onClick={handleSendToWarehouse}
              className="h-12 text-lg"
            >
              <Send className="h-5 w-5 me-2" />
              إرسال إلى المستودع
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RequestForm;
