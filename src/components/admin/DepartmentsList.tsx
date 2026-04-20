import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Plus, Layers, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { admin as adminApi } from "@/services/api";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { DEPARTMENT_ICON_OPTIONS, getDepartmentIcon } from "@/lib/departmentIcons";

interface Department {
  id: number;
  key: string;
  labelAr: string;
  color: string;
  icon: string;
  warehousesCount: number;
  requestsCount: number;
}

const DepartmentsList = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Department[]>([]);
  const [editing, setEditing] = useState<Department | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ key: '', labelAr: '', color: '#64748b', icon: 'folder' });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi.listDepartments().then(setItems).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.key || !form.labelAr) {
      toast({ title: "خطأ", description: "المفتاح والاسم مطلوبين", variant: "destructive" });
      return;
    }
    try {
      await adminApi.createDepartment(form);
      toast({ title: "تمت الإضافة" });
      setCreating(false);
      setForm({ key: '', labelAr: '', color: '#64748b', icon: 'folder' });
      load();
    } catch (e: any) {
      toast({ title: "فشل", description: e.message, variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      await adminApi.updateDepartment(editing.id, { labelAr: editing.labelAr, color: editing.color, icon: editing.icon });
      toast({ title: "تم التحديث" });
      setEditing(null);
      load();
    } catch (e: any) {
      toast({ title: "فشل", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (d: Department) => {
    try {
      await adminApi.deleteDepartment(d.id);
      toast({ title: "تم الحذف" });
      load();
    } catch (e: any) {
      toast({ title: "فشل الحذف", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          إجمالي الأقسام: <strong>{items.length}</strong>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 me-2" /> إضافة قسم
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton variant="table" rows={5} columns={7} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="لا توجد أقسام"
          description="ابدأ بإضافة أول قسم"
          action={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4 me-2" />إضافة قسم</Button>}
        />
      ) : (
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-start">الأيقونة</th>
              <th className="px-4 py-3 text-start">المفتاح (key)</th>
              <th className="px-4 py-3 text-start">الاسم العربي</th>
              <th className="px-4 py-3 text-start">اللون</th>
              <th className="px-4 py-3 text-start">المستودعات</th>
              <th className="px-4 py-3 text-start">الطلبات</th>
              <th className="px-4 py-3 text-start">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map(d => {
              const DeptIcon = getDepartmentIcon(d.icon);
              return (
              <tr key={d.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3">
                  <DeptIcon className="size-5 text-primary" />
                </td>
                <td className="px-4 py-3">
                  <code className="bg-muted/50 px-2 py-1 rounded text-xs">{d.key}</code>
                </td>
                <td className="px-4 py-3">{d.labelAr}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: d.color }}></div>
                    <code className="text-xs">{d.color}</code>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{d.warehousesCount}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{d.requestsCount}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(d)}>
                      <Edit className="h-4 w-4 text-info" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف القسم؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            حذف <strong>{d.labelAr}</strong>.
                            {(d.warehousesCount > 0 || d.requestsCount > 0) && (
                              <div className="text-danger mt-2 flex items-center gap-1.5">
                                <AlertTriangle className="size-4 shrink-0" />
                                <span>فيه {d.warehousesCount} مستودع و {d.requestsCount} طلب — لن يتم الحذف.</span>
                              </div>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(d)} className="bg-danger hover:bg-danger">حذف</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      {/* Create */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>إضافة قسم جديد</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>المفتاح (للنظام)</Label>
              <Input
                value={form.key}
                onChange={e => setForm({ ...form, key: e.target.value.toLowerCase() })}
                placeholder="sports, health, ..."
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground mt-1">حروف إنجليزية صغيرة + شرطات فقط</p>
            </div>
            <div>
              <Label>الاسم العربي</Label>
              <Input value={form.labelAr} onChange={e => setForm({ ...form, labelAr: e.target.value })} placeholder="قسم الرياضة" />
            </div>
            <div>
              <Label>الأيقونة</Label>
              <Select value={form.icon} onValueChange={v => setForm({ ...form, icon: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENT_ICON_OPTIONS.map(opt => {
                    const Icon = getDepartmentIcon(opt.key);
                    return (
                      <SelectItem key={opt.key} value={opt.key}>
                        <span className="flex items-center gap-2">
                          <Icon className="size-4 text-primary" />
                          <span>{opt.labelAr}</span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>اللون</Label>
              <div className="flex gap-2">
                <Input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-16 h-10 p-1" />
                <Input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} dir="ltr" className="flex-1" />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setCreating(false)}>إلغاء</Button>
              <Button onClick={handleCreate}>إضافة</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>تعديل القسم</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>المفتاح (غير قابل للتعديل)</Label>
                <Input value={editing.key} disabled dir="ltr" />
              </div>
              <div>
                <Label>الاسم العربي</Label>
                <Input value={editing.labelAr} onChange={e => setEditing({ ...editing, labelAr: e.target.value })} />
              </div>
              <div>
                <Label>الأيقونة</Label>
                <Select value={editing.icon} onValueChange={v => setEditing({ ...editing, icon: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENT_ICON_OPTIONS.map(opt => {
                      const Icon = getDepartmentIcon(opt.key);
                      return (
                        <SelectItem key={opt.key} value={opt.key}>
                          <span className="flex items-center gap-2">
                            <Icon className="size-4 text-primary" />
                            <span>{opt.labelAr}</span>
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>اللون</Label>
                <div className="flex gap-2">
                  <Input type="color" value={editing.color} onChange={e => setEditing({ ...editing, color: e.target.value })} className="w-16 h-10 p-1" />
                  <Input value={editing.color} onChange={e => setEditing({ ...editing, color: e.target.value })} dir="ltr" className="flex-1" />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
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

export default DepartmentsList;
