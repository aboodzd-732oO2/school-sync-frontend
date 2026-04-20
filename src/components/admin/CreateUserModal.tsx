import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { admin as adminApi, lookup } from "@/services/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateUserModal = ({ isOpen, onClose, onCreated }: Props) => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    email: '', password: '',
    userType: 'institution',
    institutionType: '', governorate: '',
    institutionId: 0,
    warehouseGovernorate: '', departmentKey: '',
    warehouseId: 0,
  });

  // بيانات ديناميكية من API
  const [governorates, setGovernorates] = useState<any[]>([]);
  const [institutionTypes, setInstitutionTypes] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // تحميل البيانات الأولية
  useEffect(() => {
    if (!isOpen) return;
    Promise.all([
      lookup.governorates(),
      lookup.institutionTypes(),
      lookup.departments(),
    ]).then(([govs, types, depts]) => {
      setGovernorates(govs);
      setInstitutionTypes(types);
      setDepartments(depts);
      // قيم افتراضية للـ selects
      if (types.length > 0) setForm(f => ({ ...f, institutionType: types[0].key }));
      if (depts.length > 0) setForm(f => ({ ...f, departmentKey: depts[0].key }));
    }).catch(() => {});
  }, [isOpen]);

  // جلب المؤسسات المتاحة (بدون حساب) حسب المحافظة والنوع
  useEffect(() => {
    if (form.userType === 'institution' && form.governorate && form.institutionType) {
      adminApi.listInstitutions({ governorate: form.governorate, type: form.institutionType })
        .then((data: any[]) => {
          setInstitutions(data.filter(i => !i.hasAccount));
        })
        .catch(() => setInstitutions([]));
    } else {
      setInstitutions([]);
    }
  }, [form.userType, form.governorate, form.institutionType]);

  // جلب المستودعات المتاحة حسب المحافظة والقسم
  useEffect(() => {
    if (form.userType === 'warehouse' && form.warehouseGovernorate && form.departmentKey) {
      adminApi.listWarehouses({ governorate: form.warehouseGovernorate, departmentKey: form.departmentKey })
        .then((data: any[]) => {
          setWarehouses(data.filter(w => !w.hasAccount));
        })
        .catch(() => setWarehouses([]));
    } else {
      setWarehouses([]);
    }
  }, [form.userType, form.warehouseGovernorate, form.departmentKey]);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pwd = '';
    for (let i = 0; i < 8; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    setForm(prev => ({ ...prev, password: pwd }));
  };

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      toast({ title: "خطأ", description: "البريد وكلمة المرور مطلوبين", variant: "destructive" });
      return;
    }

    const body: any = { email: form.email, password: form.password, userType: form.userType };

    if (form.userType === 'admin') {
      // admin لا يحتاج institutionId/warehouseId
    } else if (form.userType === 'institution') {
      if (!form.institutionId) {
        toast({ title: "خطأ", description: "اختر مؤسسة", variant: "destructive" });
        return;
      }
      body.institutionId = form.institutionId;
    } else {
      if (!form.warehouseId) {
        toast({ title: "خطأ", description: "اختر مستودع", variant: "destructive" });
        return;
      }
      body.warehouseId = form.warehouseId;
    }

    setSubmitting(true);
    try {
      await adminApi.createUser(body);
      toast({
        title: "تم إنشاء الحساب",
        description: `البريد: ${form.email} | كلمة المرور: ${form.password}`,
      });
      onCreated();
      onClose();
      setForm({
        email: '', password: '',
        userType: 'institution',
        institutionType: institutionTypes[0]?.key || '', governorate: '',
        institutionId: 0,
        warehouseGovernorate: '', departmentKey: departments[0]?.key || '',
        warehouseId: 0,
      });
    } catch (err: any) {
      toast({ title: "فشل الإنشاء", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>إنشاء حساب جديد</DialogTitle>
          <DialogDescription>أنشئ حساب مؤسسة تعليمية أو مستودع</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>نوع الحساب</Label>
            <Select value={form.userType} onValueChange={(v) => setForm({ ...form, userType: v, institutionId: 0, warehouseId: 0 })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="institution">مؤسسة تعليمية</SelectItem>
                <SelectItem value="warehouse">مستودع</SelectItem>
                <SelectItem value="admin">مدير (أدمن)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.userType === 'institution' && (
            <>
              <div>
                <Label>نوع المؤسسة</Label>
                <Select value={form.institutionType} onValueChange={(v) => setForm({ ...form, institutionType: v, institutionId: 0 })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {institutionTypes.map(t => <SelectItem key={t.key} value={t.key}>{t.labelAr}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>المحافظة</Label>
                <Select value={form.governorate} onValueChange={(v) => setForm({ ...form, governorate: v, institutionId: 0 })}>
                  <SelectTrigger><SelectValue placeholder="اختر المحافظة" /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {governorates.map(g => <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>المؤسسة</Label>
                <Select
                  value={form.institutionId ? String(form.institutionId) : ''}
                  onValueChange={(v) => setForm({ ...form, institutionId: parseInt(v) })}
                  disabled={!form.governorate}
                >
                  <SelectTrigger><SelectValue placeholder={institutions.length === 0 ? "لا توجد مؤسسات متاحة" : "اختر المؤسسة"} /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {institutions.map((inst: any) => (
                      <SelectItem key={inst.id} value={String(inst.id)}>{inst.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">فقط المؤسسات بدون حساب تظهر هنا</p>
              </div>
            </>
          )}

          {form.userType === 'warehouse' && (
            <>
              <div>
                <Label>المحافظة</Label>
                <Select value={form.warehouseGovernorate} onValueChange={(v) => setForm({ ...form, warehouseGovernorate: v, warehouseId: 0 })}>
                  <SelectTrigger><SelectValue placeholder="اختر المحافظة" /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {governorates.map(g => <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>القسم</Label>
                <Select value={form.departmentKey} onValueChange={(v) => setForm({ ...form, departmentKey: v, warehouseId: 0 })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d.key} value={d.key}>{d.labelAr}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>المستودع</Label>
                <Select
                  value={form.warehouseId ? String(form.warehouseId) : ''}
                  onValueChange={(v) => setForm({ ...form, warehouseId: parseInt(v) })}
                  disabled={!form.warehouseGovernorate || !form.departmentKey}
                >
                  <SelectTrigger><SelectValue placeholder={warehouses.length === 0 ? "لا توجد مستودعات متاحة" : "اختر المستودع"} /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {warehouses.map((w: any) => (
                      <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">فقط المستودعات بدون حساب</p>
              </div>
            </>
          )}

          <div>
            <Label>البريد الإلكتروني</Label>
            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" />
          </div>

          <div>
            <Label>كلمة المرور</Label>
            <div className="flex gap-2">
              <Input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="كلمة المرور" />
              <Button type="button" variant="outline" onClick={generatePassword}>توليد</Button>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;
