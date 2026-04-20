import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Edit, Plus, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { admin as adminApi } from "@/services/api";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";

interface Unit { id: number; name: string; }

const UnitsList = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Unit[]>([]);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi.listUnits().then(setItems).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name) return;
    try {
      await adminApi.createUnit(form);
      toast({ title: "تمت الإضافة" });
      setCreating(false);
      setForm({ name: '' });
      load();
    } catch (e: any) { toast({ title: "فشل", description: e.message, variant: "destructive" }); }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      await adminApi.updateUnit(editing.id, { name: editing.name });
      toast({ title: "تم التحديث" });
      setEditing(null);
      load();
    } catch (e: any) { toast({ title: "فشل", description: e.message, variant: "destructive" }); }
  };

  const handleDelete = async (u: Unit) => {
    try {
      await adminApi.deleteUnit(u.id);
      toast({ title: "تم الحذف" });
      load();
    } catch (e: any) { toast({ title: "فشل", description: e.message, variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">الوحدات: <strong>{items.length}</strong></div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 me-2" /> إضافة وحدة
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton variant="table" rows={5} columns={2} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Ruler}
          title="لا توجد وحدات"
          description="ابدأ بإضافة أول وحدة قياس"
          action={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4 me-2" />إضافة وحدة</Button>}
        />
      ) : (
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-start">الاسم</th>
              <th className="px-4 py-3 text-start">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map(u => (
              <tr key={u.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-semibold">{u.name}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(u)}>
                      <Edit className="h-4 w-4 text-info" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost"><Trash2 className="h-4 w-4 text-danger" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف {u.name}؟</AlertDialogTitle>
                          <AlertDialogDescription>قد تكون هذه الوحدة مستخدمة في عناصر المخزون والطلبات</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(u)} className="bg-danger hover:bg-danger">حذف</AlertDialogAction>
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
          <DialogHeader><DialogTitle>إضافة وحدة قياس</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>الاسم</Label>
              <Input value={form.name} onChange={e => setForm({ name: e.target.value })} placeholder="قطعة، كيلو، متر..." />
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
          <DialogHeader><DialogTitle>تعديل الوحدة</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>الاسم</Label>
                <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
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

export default UnitsList;
