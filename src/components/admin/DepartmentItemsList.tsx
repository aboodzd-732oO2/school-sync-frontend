import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Edit, Plus, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { admin as adminApi, lookup } from "@/services/api";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";

interface DepartmentItem {
  id: number;
  key: string;
  labelAr: string;
  defaultUnit: string;
  departmentKey: string;
  departmentLabelAr: string;
}

interface Department {
  id: number;
  key: string;
  labelAr: string;
}

const DepartmentItemsList = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<DepartmentItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filterDept, setFilterDept] = useState('all');
  const [editing, setEditing] = useState<DepartmentItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ key: '', labelAr: '', defaultUnit: 'قطعة', departmentKey: '' });

  const [units, setUnits] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    adminApi.listDepartmentItems().then(setItems).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
    adminApi.listDepartments().then(setDepartments).catch(() => {});
    lookup.units().then(setUnits).catch(() => {});
  }, []);

  const handleCreate = async () => {
    try {
      await adminApi.createDepartmentItem(form);
      toast({ title: "تمت الإضافة" });
      setCreating(false);
      setForm({ key: '', labelAr: '', defaultUnit: 'قطعة', departmentKey: '' });
      load();
    } catch (e: any) { toast({ title: "فشل", description: e.message, variant: "destructive" }); }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      await adminApi.updateDepartmentItem(editing.id, { labelAr: editing.labelAr, defaultUnit: editing.defaultUnit });
      toast({ title: "تم التحديث" });
      setEditing(null);
      load();
    } catch (e: any) { toast({ title: "فشل", description: e.message, variant: "destructive" }); }
  };

  const handleDelete = async (i: DepartmentItem) => {
    try {
      await adminApi.deleteDepartmentItem(i.id);
      toast({ title: "تم الحذف" });
      load();
    } catch (e: any) { toast({ title: "فشل", description: e.message, variant: "destructive" }); }
  };

  const filtered = filterDept === 'all' ? items : items.filter(i => i.departmentKey === filterDept);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-col sm:flex-row">
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأقسام</SelectItem>
            {departments.map(d => <SelectItem key={d.key} value={d.key}>{d.labelAr}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 me-2" /> إضافة عنصر
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">عدد العناصر: <strong>{filtered.length}</strong></div>

      {loading ? (
        <LoadingSkeleton variant="table" rows={6} columns={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="لا توجد عناصر"
          description={filterDept !== 'all' ? 'لا توجد عناصر في هذا القسم' : 'ابدأ بإضافة أول عنصر'}
          action={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4 me-2" />إضافة عنصر</Button>}
        />
      ) : (
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-start">القسم</th>
              <th className="px-4 py-3 text-start">المفتاح</th>
              <th className="px-4 py-3 text-start">الاسم العربي</th>
              <th className="px-4 py-3 text-start">الوحدة</th>
              <th className="px-4 py-3 text-start">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3"><Badge variant="outline">{i.departmentLabelAr}</Badge></td>
                <td className="px-4 py-3"><code className="bg-muted/50 px-2 py-1 rounded text-xs">{i.key}</code></td>
                <td className="px-4 py-3">{i.labelAr}</td>
                <td className="px-4 py-3">{i.defaultUnit}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(i)}>
                      <Edit className="h-4 w-4 text-info" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost"><Trash2 className="h-4 w-4 text-danger" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف {i.labelAr}؟</AlertDialogTitle>
                          <AlertDialogDescription>لن يؤثر هذا على الطلبات الموجودة</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(i)} className="bg-danger hover:bg-danger">حذف</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* Create */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>إضافة عنصر جديد</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>القسم</Label>
              <Select value={form.departmentKey} onValueChange={v => setForm({ ...form, departmentKey: v })}>
                <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => <SelectItem key={d.key} value={d.key}>{d.labelAr}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>المفتاح</Label>
              <Input value={form.key} onChange={e => setForm({ ...form, key: e.target.value.toLowerCase() })} placeholder="tables, desks, ..." dir="ltr" />
            </div>
            <div>
              <Label>الاسم العربي</Label>
              <Input value={form.labelAr} onChange={e => setForm({ ...form, labelAr: e.target.value })} placeholder="كراسي" />
            </div>
            <div>
              <Label>الوحدة الافتراضية</Label>
              <Select value={form.defaultUnit} onValueChange={v => setForm({ ...form, defaultUnit: v })}>
                <SelectTrigger><SelectValue placeholder="اختر وحدة" /></SelectTrigger>
                <SelectContent>
                  {units.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCreating(false)}>إلغاء</Button>
              <Button onClick={handleCreate}>إضافة</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>تعديل العنصر</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>القسم</Label>
                <Input value={editing.departmentLabelAr} disabled />
              </div>
              <div>
                <Label>المفتاح</Label>
                <Input value={editing.key} disabled dir="ltr" />
              </div>
              <div>
                <Label>الاسم العربي</Label>
                <Input value={editing.labelAr} onChange={e => setEditing({ ...editing, labelAr: e.target.value })} />
              </div>
              <div>
                <Label>الوحدة</Label>
                <Select value={editing.defaultUnit} onValueChange={v => setEditing({ ...editing, defaultUnit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {units.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditing(null)}>إلغاء</Button>
                <Button onClick={handleUpdate}>حفظ</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentItemsList;
