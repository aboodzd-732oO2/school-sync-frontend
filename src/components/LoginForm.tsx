import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Warehouse, MapPin } from "lucide-react";
import { auth, setToken } from "@/services/api";

interface LoginFormProps {
  onLogin: (userData: any) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: '',
    institutionType: '',
    governorate: '',
    institutionName: '',
    warehouseName: '',
    warehouseGovernorate: ''
  });

  // المحافظات السورية
  const syrianGovernorates = [
    'دمشق',
    'ريف دمشق',
    'حلب',
    'حمص',
    'حماة',
    'اللاذقية',
    'طرطوس',
    'إدلب',
    'الحسكة',
    'دير الزور',
    'الرقة',
    'درعا',
    'السويداء',
    'القنيطرة'
  ];

  const locationOptions: Record<string, Record<string, string[]>> = {
    'school': {
      'دمشق': [
        'مدرسة الأمويين الابتدائية',
        'مدرسة الفاتح الإعدادية',
        'مدرسة دمشق الثانوية',
        'مدرسة القدس الأساسية',
        'مدرسة الشهيد باسل الأسد'
      ],
      'ريف دمشق': [
        'مدرسة الغوطة الابتدائية',
        'مدرسة داريا الإعدادية',
        'مدرسة الزبداني الثانوية',
        'مدرسة قدسيا الأساسية'
      ],
      'حلب': [
        'مدرسة الأندلس الابتدائية',
        'مدرسة حلب الشهباء الإعدادية',
        'مدرسة الكندي الثانوية',
        'مدرسة الزهراء الأساسية'
      ],
      'حمص': [
        'مدرسة الوعر الابتدائية',
        'مدرسة العروبة الإعدادية',
        'مدرسة حمص الثانوية',
        'مدرسة الخالدية الأساسية'
      ],
      'حماة': [
        'مدرسة العاصي الابتدائية',
        'مدرسة حماة الخضراء الإعدادية',
        'مدرسة أبو الفداء الثانوية'
      ],
      'اللاذقية': [
        'مدرسة الساحل الابتدائية',
        'مدرسة اللاذقية الزرقاء الإعدادية',
        'مدرسة تشرين الثانوية'
      ],
      'طرطوس': [
        'مدرسة الشاطئ الابتدائية',
        'مدرسة طرطوس الإعدادية',
        'مدرسة الأرز الثانوية'
      ],
      'إدلب': [
        'مدرسة الزيتون الابتدائية',
        'مدرسة إدلب الخضراء الإعدادية',
        'مدرسة معرة النعمان الثانوية'
      ],
      'الحسكة': [
        'مدرسة الجزيرة الابتدائية',
        'مدرسة الحسكة الإعدادية',
        'مدرسة القامشلي الثانوية'
      ],
      'دير الزور': [
        'مدرسة الفرات الابتدائية',
        'مدرسة دير الزور الإعدادية',
        'مدرسة الميادين الثانوية'
      ],
      'الرقة': [
        'مدرسة الرافدين الابتدائية',
        'مدرسة الرقة الإعدادية',
        'مدرسة تل أبيض الثانوية'
      ],
      'درعا': [
        'مدرسة الجنوب الابتدائية',
        'مدرسة درعا الإعدادية',
        'مدرسة بصرى الثانوية'
      ],
      'السويداء': [
        'مدرسة الجبل الابتدائية',
        'مدرسة السويداء الإعدادية',
        'مدرسة شهبا الثانوية'
      ],
      'القنيطرة': [
        'مدرسة الجولان الابتدائية',
        'مدرسة القنيطرة الإعدادية'
      ]
    },
    'university': {
      'دمشق': [
        'جامعة دمشق',
        'الجامعة السورية الخاصة',
        'جامعة القلمون الخاصة',
        'الجامعة الدولية الخاصة للعلوم والتكنولوجيا'
      ],
      'ريف دمشق': [
        'الجامعة العربية الدولية',
        'جامعة الشام الخاصة'
      ],
      'حلب': [
        'جامعة حلب',
        'جامعة الإيمان الخاصة',
        'الجامعة السورية للعلوم والتكنولوجيا'
      ],
      'حمص': [
        'جامعة البعث',
        'جامعة المأمون الخاصة للعلوم والتكنولوجيا'
      ],
      'حماة': [
        'جامعة حماة'
      ],
      'اللاذقية': [
        'جامعة تشرين',
        'الأكاديمية العربية للعلوم والتكنولوجيا والنقل البحري'
      ],
      'طرطوس': [
        'جامعة طرطوس'
      ],
      'إدلب': [
        'جامعة إدلب'
      ],
      'الحسكة': [
        'جامعة الفرات',
        'جامعة الحسكة'
      ],
      'دير الزور': [
        'جامعة الفرات - فرع دير الزور'
      ],
      'الرقة': [
        'جامعة الفرات - فرع الرقة'
      ],
      'درعا': [
        'جامعة درعا'
      ],
      'السويداء': [
        'جامعة السويداء'
      ],
      'القنيطرة': [
        'جامعة القنيطرة'
      ]
    }
  };

  // أنواع المستودعات مقسمة حسب أقسام الطلبات
  const warehouseTypesByDepartment = {
    'materials': 'مستودع المواد والأثاث التعليمي',
    'maintenance': 'مستودع الصيانة والإصلاح', 
    'academic-materials': 'مستودع المواد الأكاديمية والكتب',
    'technology': 'مستودع التقنيات التعليمية',
    'safety': 'مستودع السلامة والأمان'
  };

  // توليد المستودعات لكل محافظة (مستودع واحد لكل قسم في كل محافظة)
  const warehouseOptions: Record<string, string[]> = {};
  syrianGovernorates.forEach(governorate => {
    warehouseOptions[governorate] = Object.values(warehouseTypesByDepartment).map(type => `${type} - ${governorate}`);
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.userType) {
      toast({ title: "معلومات مفقودة", description: "يرجى ملء جميع الحقول المطلوبة.", variant: "destructive" });
      return;
    }

    if (formData.userType === 'institution' && (!formData.institutionType || !formData.governorate || !formData.institutionName)) {
      toast({ title: "معلومات مفقودة", description: "يرجى اختيار نوع المؤسسة والمحافظة واسم المؤسسة التعليمية.", variant: "destructive" });
      return;
    }

    if (formData.userType === 'warehouse' && (!formData.warehouseGovernorate || !formData.warehouseName)) {
      toast({ title: "معلومات مفقودة", description: "يرجى اختيار المحافظة واسم المستودع.", variant: "destructive" });
      return;
    }

    if (!formData.email.includes('@')) {
      toast({ title: "بريد إلكتروني غير صحيح", description: "يرجى إدخال بريد إلكتروني صحيح.", variant: "destructive" });
      return;
    }

    if (formData.password.length < 4) {
      toast({ title: "كلمة مرور ضعيفة", description: "يجب أن تكون كلمة المرور 4 أحرف على الأقل.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // حاول تسجيل الدخول أولاً
      let result;
      try {
        result = await auth.login(formData.email, formData.password);
      } catch {
        // إذا فشل تسجيل الدخول، سجّل حساب جديد
        result = await auth.register({
          email: formData.email,
          password: formData.password,
          userType: formData.userType,
          institutionType: formData.institutionType,
          governorate: formData.governorate,
          institutionName: formData.institutionName,
          warehouseName: formData.warehouseName,
          warehouseGovernorate: formData.warehouseGovernorate,
        });
      }

      setToken(result.token);

      const userData = {
        ...result.user,
        loginTime: new Date().toISOString(),
        governorate: result.user.governorate,
      };

      onLogin(userData);

      const locationName = formData.userType === 'institution' ? formData.institutionName : formData.warehouseName;
      toast({ title: "تم تسجيل الدخول بنجاح", description: `مرحباً بك في ${locationName}` });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message || "حدث خطأ أثناء تسجيل الدخول", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentLocations = formData.institutionType && formData.governorate ? 
    locationOptions[formData.institutionType]?.[formData.governorate] || [] : [];

  const currentWarehouses = formData.warehouseGovernorate ? 
    warehouseOptions[formData.warehouseGovernorate] || [] : [];

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative" 
      dir="rtl"
      style={{
        backgroundImage: 'url(/backlogin.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Green Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(142,60%,25%)] via-[hsl(142,50%,20%)] to-[hsl(142,60%,25%)] opacity-85"></div>
      <div className="relative z-10">
        <Card 
          className="w-full max-w-[900px] mx-auto shadow-strong border-0 bg-white/95 backdrop-blur-sm relative z-20 overflow-hidden"
          style={{
            backgroundImage: 'url(/login-pattern.png)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            backgroundPosition: 'center center',
            backgroundBlendMode: 'multiply'
          }}
        >
          {/* Overlay for better readability */}
          <div className="absolute inset-0 bg-white/80 pointer-events-none"></div>
          <CardHeader className="text-center space-y-4 pb-6 bg-gradient-to-r from-[hsl(142,60%,25%)] to-[hsl(142,50%,20%)] text-white rounded-t-lg relative overflow-hidden z-10">
          {/* Minimal decorative pattern in header */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="headerPattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                  <circle cx="60" cy="60" r="45" fill="none" stroke="hsl(38,85%,60%)" strokeWidth="1" opacity="0.3"/>
                  {/* 3 stars pattern (reduced) */}
                  {[...Array(3)].map((_, i) => {
                    const x = 60 + (i - 1) * 25;
                    const y = 30;
                    return (
                      <g key={i} transform={`translate(${x},${y})`}>
                        <path d="M0,-8 L2,-2 L8,-2 L3,1 L4.5,7 L0,4 L-4.5,7 L-3,1 L-8,-2 L-2,-2 Z" 
                              fill="hsl(38,85%,60%)" opacity="0.2"/>
                      </g>
                    );
                  })}
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#headerPattern)"/>
            </svg>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center space-x-3 space-x-reverse mb-2">
              <div className="p-3 bg-gradient-to-br from-[hsl(38,85%,60%)] to-[hsl(38,90%,50%)] rounded-2xl shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">نظام إدارة الطلبات</h1>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-white">تسجيل الدخول</CardTitle>
            <CardDescription className="text-sm text-white/90 font-medium">
              أدخل بياناتك للوصول إلى النظام
            </CardDescription>
          </div>
        </CardHeader>
          <CardContent className="p-6 sm:p-8 relative z-10">
            <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">البريد الإلكتروني *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
                className="text-sm bg-white border-gray-300 placeholder:text-gray-400 focus-visible:border-[hsl(142,60%,25%)] focus-visible:ring-[hsl(142,60%,25%)] focus-visible:ring-2 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">كلمة المرور *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="أدخل كلمة المرور"
                className="text-sm bg-white border-gray-300 placeholder:text-gray-400 focus-visible:border-[hsl(142,60%,25%)] focus-visible:ring-[hsl(142,60%,25%)] focus-visible:ring-2 transition-all duration-200"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm">نوع المستخدم *</Label>
              <RadioGroup 
                value={formData.userType} 
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  userType: value, 
                  institutionType: '', 
                  governorate: '',
                  institutionName: '', 
                  warehouseName: '',
                  warehouseGovernorate: ''
                }))}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="institution" id="institution" />
                  <Label htmlFor="institution" className="text-sm flex items-center space-x-2 space-x-reverse cursor-pointer">
                    <GraduationCap className="h-4 w-4" />
                    <span>مؤسسة تعليمية (مدير مدرسة/جامعة)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="warehouse" id="warehouse" />
                  <Label htmlFor="warehouse" className="text-sm flex items-center space-x-2 space-x-reverse cursor-pointer">
                    <Warehouse className="h-4 w-4" />
                    <span>مستودع (موظف مستودع)</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {formData.userType === 'institution' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="institutionType" className="text-sm">نوع المؤسسة التعليمية *</Label>
                  <Select value={formData.institutionType} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, institutionType: value, governorate: '', institutionName: '' }))
                  }>
                    <SelectTrigger className="text-sm bg-white border-gray-300 focus:border-[hsl(142,60%,25%)] focus:ring-[hsl(142,60%,25%)] focus:ring-2">
                      <SelectValue placeholder="اختر نوع المؤسسة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school">مدرسة</SelectItem>
                      <SelectItem value="university">جامعة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="governorate" className="text-sm flex items-center space-x-2 space-x-reverse">
                    <MapPin className="h-4 w-4" />
                    <span>المحافظة *</span>
                  </Label>
                  <Select 
                    value={formData.governorate} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, governorate: value, institutionName: '' }))}
                    disabled={!formData.institutionType}
                  >
                    <SelectTrigger className="text-sm bg-white border-gray-300 focus:border-[hsl(142,60%,25%)] focus:ring-[hsl(142,60%,25%)] focus:ring-2">
                      <SelectValue placeholder="اختر المحافظة" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {syrianGovernorates.map((governorate) => (
                        <SelectItem key={governorate} value={governorate} className="text-sm">
                          {governorate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institutionName" className="text-sm">اسم المؤسسة التعليمية *</Label>
                  <Select 
                    value={formData.institutionName} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, institutionName: value }))}
                    disabled={!formData.institutionType || !formData.governorate}
                  >
                    <SelectTrigger className="text-sm bg-white border-gray-300 focus:border-[hsl(142,60%,25%)] focus:ring-[hsl(142,60%,25%)] focus:ring-2">
                      <SelectValue placeholder="اختر المؤسسة التعليمية" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {currentLocations.map((location) => (
                        <SelectItem key={location} value={location} className="text-sm">
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {formData.userType === 'warehouse' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="warehouseGovernorate" className="text-sm flex items-center space-x-2 space-x-reverse">
                    <MapPin className="h-4 w-4" />
                    <span>المحافظة *</span>
                  </Label>
                  <Select 
                    value={formData.warehouseGovernorate} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, warehouseGovernorate: value, warehouseName: '' }))}
                  >
                    <SelectTrigger className="text-sm bg-white border-gray-300 focus:border-[hsl(142,60%,25%)] focus:ring-[hsl(142,60%,25%)] focus:ring-2">
                      <SelectValue placeholder="اختر المحافظة" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {syrianGovernorates.map((governorate) => (
                        <SelectItem key={governorate} value={governorate} className="text-sm">
                          {governorate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warehouseName" className="text-sm">نوع المستودع *</Label>
                  <Select 
                    value={formData.warehouseName} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, warehouseName: value }))}
                    disabled={!formData.warehouseGovernorate}
                  >
                    <SelectTrigger className="text-sm bg-white border-gray-300 focus:border-[hsl(142,60%,25%)] focus:ring-[hsl(142,60%,25%)] focus:ring-2">
                      <SelectValue placeholder="اختر نوع المستودع" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {currentWarehouses.map((warehouse) => (
                        <SelectItem key={warehouse} value={warehouse} className="text-sm">
                          {warehouse}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-sm font-semibold bg-gradient-to-r from-[hsl(142,60%,25%)] to-[hsl(142,50%,20%)] hover:from-[hsl(142,60%,30%)] hover:to-[hsl(142,50%,25%)] text-white shadow-lg hover:shadow-xl transition-all duration-300 py-6"
            >
              {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
