import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Edit, Plus, Flag, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { admin as adminApi } from "@/services/api";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";

interface Priority {
  id: number;
  key: string;
  labelAr: string;
  color: string;
  level: number;
  requestsCount: number;
}

const PrioritiesList = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Priority[]>([]);
  const [editing, setEditing] = useState<Priority | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ key: '', labelAr: '', color: '#ef4444', level: 1 });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi.listPriorities().then(setItems).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await adminApi.createPriority(form);
      toast({ title: "تمت الإضافة" });
      setCreating(false);
      setForm({ key: '', labelAr: '', color: '#ef4444', level: 1 });
      load();
    } catch (e: any) { toast({ title: "فشل", description: e.message, variant: "destructive" }); }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      await adminApi.updatePriority(editing.id, { labelAr: editing.labelAr, color: editing.color, level: editing.level });
      toast({ title: "تم التحديث" });
      setEditing(null);
      load();
    } catch (e: any) { toast({ title: "فشل", description: e.message, variant: "destructive" }); }
  };

  const handleDelete = async (p: Priority) => {
    try {
      await adminApi.deletePriority(p.id);
      toast({ title: "تم الحذف" });
      load();
    } catch (e: any) { toast({ title: "فشل", description: e.message, variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">الأولويات: <strong>{items.length}</strong></div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 me-2" /> إضافة أولوية
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton variant="table" rows={4} columns={6} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="لا توجد أولويات"
          description="ابدأ بإضافة أول أولوية"
          action={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4 me-2" />إضافة أولوية</Button>}
        />
      ) : (
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-start">المفتاح</th>
              <th className="px-4 py-3 text-start">الاسم العربي</th>
              <th className="px-4 py-3 text-start">اللون</th>
              <th className="px-4 py-3 text-start">المستوى</th>
              <th className="px-4 py-3 text-start">الطلبات</th>
              <th className="px-4 py-3 text-start">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map(p => (
              <tr key={p.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3"><code className="bg-muted/50 px-2 py-1 rounded text-xs">{p.key}</code></td>
                <td className="px-4 py-3">
                  <Badge style={{ backgroundColor: p.color, color: '#fff' }}>{p.labelAr}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: p.color }}></div>
                    <code className="text-xs">{p.color}</code>
                  </div>
                </td>
                <td className="px-4 py-3"><strong>{p.level}</strong></td>
                <td className="px-4 py-3">{p.requestsCount}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(p)}>
                      <Edit className="h-4 w-4 text-info" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost"><Trash2 className="h-4 w-4 text-danger" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف {p.labelAr}؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            {p.requestsCount > 0 && (
                              <div className="text-danger flex items-center gap-1.5">
                                <AlertTriangle className="size-4 shrink-0" />
                                <span>مستخدمة في {p.requestsCount} طلب — لن يتم الحذف</span>
                              </div>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(p)} className="bg-danger hover:bg-danger">حذف</AlertDialogAction>
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

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>إضافة أولوية</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>المفتاح</Label>
              <Input value={form.key} onChange={e => setForm({ ...form, key: e.target.value.toLowerCase() })} placeholder="urgent, critical..." dir="ltr" />
            </div>
            <div>
              <Label>الاسم العربي</Label>
              <Input value={form.labelAr} onChange={e => setForm({ ...form, labelAr: e.target.value })} placeholder="عاجلة" />
            </div>
            <div>
              <Label>اللون</Label>
              <div className="flex gap-2">
                <Input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-16 h-10 p-1" />
                <Input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="flex-1" dir="ltr" />
              </div>
            </div>
            <div>
              <Label>المستوى (رقم أعلى = أولوية أعلى)</Label>
              <Input
                type="number"
                min={1}
                value={form.level}
                onChange={e => setForm({ ...form, level: parseInt(e.target.value) || 1 })}
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground mt-1">مثال: عالية=3، متوسطة=2، منخفضة=1. الأولوية الأعلى مستوى تُصنّف كـ"عاجلة".</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCreating(false)}>إلغاء</Button>
              <Button onClick={handleCreate}>إضافة</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>تعديل الأولوية</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>المفتاح</Label>
                <Input value={editing.key} disabled dir="ltr" />
              </div>
              <div>
                <Label>الاسم العربي</Label>
                <Input value={editing.labelAr} onChange={e => setEditing({ ...editing, labelAr: e.target.value })} />
              </div>
              <div>
                <Label>اللون</Label>
                <div className="flex gap-2">
                  <Input type="color" value={editing.color} onChange={e => setEditing({ ...editing, color: e.target.value })} className="w-16 h-10 p-1" />
                  <Input value={editing.color} onChange={e => setEditing({ ...editing, color: e.target.value })} className="flex-1" dir="ltr" />
                </div>
              </div>
              <div>
                <Label>المستوى (رقم أعلى = أولوية أعلى)</Label>
                <Input
                  type="number"
                  min={1}
                  value={editing.level}
                  onChange={e => setEditing({ ...editing, level: parseInt(e.target.value) || 1 })}
                  dir="ltr"
                />
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

export default PrioritiesList;
