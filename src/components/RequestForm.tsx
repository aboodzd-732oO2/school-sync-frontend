import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Package, Users, AlertTriangle, Clock, CheckCircle, AlertCircle, Save, Send } from "lucide-react";
import ItemsSidebar from "./ItemsSidebar";
import SelectedItemsPanel from "./SelectedItemsPanel";

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

  const departmentOptions = {
    'materials': {
      label: '📚 قسم المواد التعليمية',
      subcategories: ['chairs', 'pens', 'boards', 'fans', 'blinds', 'air-conditioners', 'heaters', 'chalk', 'computers', 'projectors', 'other'],
      routeTo: 'مستودع المواد التعليمية المركزي',
      icon: '📦',
      color: 'bg-blue-50 border-blue-200'
    },
    'maintenance': {
      label: '🔧 قسم الصيانة',
      subcategories: ['electrical-issues', 'water-issues', 'connections', 'building-repairs', 'cleaning', 'other'],
      routeTo: 'مركز الصيانة والخدمات الفنية',
      icon: '🛠️',
      color: 'bg-orange-50 border-orange-200'
    },
    'academic-materials': {
      label: '📖 قسم المواد الأكاديمية',
      subcategories: ['textbooks', 'papers', 'notebooks', 'stationery', 'other'],
      routeTo: 'مركز توزيع المناهج والكتب',
      icon: '📚',
      color: 'bg-green-50 border-green-200'
    },
    'technology': {
      label: '💻 قسم التكنولوجيا',
      subcategories: ['computers', 'software', 'network', 'audio-visual', 'other'],
      routeTo: 'مركز تكنولوجيا المعلومات التعليمية',
      icon: '🖥️',
      color: 'bg-purple-50 border-purple-200'
    },
    'safety': {
      label: '🛡️ قسم السلامة',
      subcategories: ['fire-safety', 'security', 'emergency-equipment', 'other'],
      routeTo: 'إدارة الأمن والسلامة المدرسية',
      icon: '🚨',
      color: 'bg-red-50 border-red-200'
    }
  };

  const subcategoryLabels: { [key: string]: string } = {
    'chairs': '🪑 كراسي',
    'pens': '✏️ أقلام',
    'boards': '📋 ألواح',
    'fans': '🌀 مراوح',
    'blinds': '🪟 ستائر',
    'air-conditioners': '❄️ مكيفات',
    'heaters': '🔥 مدافئ',
    'chalk': '✍️ طباشير',
    'computers': '💻 حاسوب',
    'projectors': '📽️ بروجكتر',
    'electrical-issues': '⚡ مشاكل كهربائية',
    'water-issues': '💧 مشاكل مياه',
    'connections': '🔌 توصيلات',
    'building-repairs': '🏗️ إصلاحات المبنى',
    'cleaning': '🧹 تنظيف',
    'textbooks': '📚 كتب مدرسية',
    'papers': '📄 أوراق',
    'notebooks': '📓 دفاتر',
    'stationery': '📝 قرطاسية',
    'software': '💾 برمجيات',
    'network': '🌐 شبكة',
    'audio-visual': '🎵 سمعي بصري',
    'fire-safety': '🔥 السلامة من الحريق',
    'security': '🔒 أمن',
    'emergency-equipment': '🚨 معدات الطوارئ',
    'other': '📝 أخرى'
  };

  const getUnitTypeForSubcategory = (subcategory: string) => {
    const unitMap: { [key: string]: string } = {
      'chairs': 'قطعة',
      'pens': 'قطعة',
      'boards': 'قطعة',
      'fans': 'وحدة',
      'blinds': 'مجموعة',
      'air-conditioners': 'وحدة',
      'heaters': 'وحدة',
      'chalk': 'علبة',
      'computers': 'وحدة',
      'projectors': 'وحدة',
      'textbooks': 'نسخة',
      'papers': 'رزمة',
      'notebooks': 'قطعة',
      'stationery': 'مجموعة',
      'electrical-issues': 'وحدة إضاءة',
      'water-issues': 'موقع',
      'connections': 'نقطة',
      'building-repairs': 'منطقة',
      'cleaning': 'غرفة',
      'other': 'عنصر'
    };
    return unitMap[subcategory] || 'عنصر';
  };

  const getTotalQuantity = () => {
    return formData.subcategoryQuantities.reduce((total, item) => total + item.quantity, 0);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return null;
    }
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
      routedTo: departmentOptions[formData.department as keyof typeof departmentOptions]?.routeTo || 'جهة غير معروفة',
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
        title: "تم حفظ الطلب كمسودة! 📝",
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
        title: "تم إرسال الطلب بنجاح! ✅",
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

  const currentDepartment = departmentOptions[formData.department as keyof typeof departmentOptions];

  const getFieldClassName = (fieldName: keyof ValidationErrors, baseClassName: string = '') => {
    const hasError = touched[fieldName] && errors[fieldName];
    return `${baseClassName} ${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''}`.trim();
  };

  const renderFieldError = (fieldName: keyof ValidationErrors, message: string) => {
    if (touched[fieldName] && errors[fieldName]) {
      return (
        <div className="flex items-center space-x-1 space-x-reverse text-red-600 text-sm mt-1">
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
        <CardTitle className="text-2xl">📝 تقديم طلب جديد</CardTitle>
        <CardDescription>
          املأ النموذج أدناه لتقديم طلب صيانة مفصل أو احتياج من المواد.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          {/* Institution info - read-only fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="institutionType">🏫 نوع المؤسسة التعليمية</Label>
              <Input
                id="institutionType"
                value={formData.institutionType === 'school' ? 'مدرسة' : 'جامعة'}
                readOnly
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">🏢 اسم المؤسسة التعليمية</Label>
              <Input
                id="location"
                value={formData.location}
                readOnly
                className="bg-white"
              />
            </div>
          </div>

          {/* Department Selection with Visual Enhancement */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="department" className="text-lg font-semibold">
                🎯 اختيار نوع الطلب *
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
                  <SelectValue placeholder="📋 اختر القسم المناسب" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(departmentOptions).map(([key, dept]) => (
                    <SelectItem key={key} value={key} className="py-3">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <span className="text-lg">{dept.icon}</span>
                        <span>{dept.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {renderFieldError('department', 'يرجى اختيار نوع الطلب')}
            </div>

            {currentDepartment && (
              <div className={`p-4 rounded-lg border ${currentDepartment.color}`}>
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <span className="text-xl">{currentDepartment.icon}</span>
                  <h3 className="font-semibold">{currentDepartment.label}</h3>
                </div>
                <p className="text-sm text-gray-600">
                  سيتم توجيه طلبك إلى: <strong>{currentDepartment.routeTo}</strong>
                </p>
              </div>
            )}

            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center space-x-2 space-x-reverse">
                <Package className="h-5 w-5 text-blue-600" />
                <span>🔍 التفصيل المحدد * (يمكن اختيار أكثر من عنصر مع تحديد الكمية لكل عنصر)</span>
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
                <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                  يرجى اختيار القسم أولاً لإظهار التفاصيل المتاحة
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">📝 عنوان الطلب *</Label>
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
            <Label htmlFor="description">📄 الوصف التفصيلي *</Label>
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
            <Label htmlFor="priority">⚡ مستوى الأولوية *</Label>
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
                <SelectItem value="high" className="text-red-600">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <AlertTriangle className="h-4 w-4" />
                    <span>🔴 عالية - عاجل</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium" className="text-yellow-600">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Clock className="h-4 w-4" />
                    <span>🟡 متوسطة - خلال أسبوع</span>
                  </div>
                </SelectItem>
                <SelectItem value="low" className="text-green-600">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <CheckCircle className="h-4 w-4" />
                    <span>🟢 منخفضة - حسب الإمكان</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {renderFieldError('priority', 'يرجى اختيار مستوى الأولوية')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="impact">📊 التأثير على العملية التعليمية</Label>
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
            <div className="p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2 space-x-reverse">
                <span>👁️</span>
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
                    <div key={item.subcategory} className="mr-4 flex justify-between text-xs bg-white p-2 rounded">
                      <span>
                        {item.subcategory === 'other' ? item.customDetails : subcategoryLabels[item.subcategory] || item.subcategory}
                      </span>
                      <span className="font-bold">{item.quantity} {getUnitTypeForSubcategory(item.subcategory)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">إجمالي الكمية:</span>
                  <span className="font-bold text-blue-700">{getTotalQuantity()}</span>
                </div>
                {formData.priority && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">الأولوية:</span>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <span>{formData.priority === 'high' ? '🔴 عالية' : formData.priority === 'medium' ? '🟡 متوسطة' : '🟢 منخفضة'}</span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">سيتم التوجيه إلى:</span>
                  <span className="text-blue-700 font-medium">{currentDepartment?.routeTo}</span>
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
              <Save className="h-5 w-5 ml-2" />
              💾 حفظ كمسودة
            </Button>
            
            <Button 
              type="button" 
              onClick={handleSendToWarehouse}
              className="h-12 text-lg"
            >
              <Send className="h-5 w-5 ml-2" />
              🚀 إرسال إلى المستودع
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RequestForm;
