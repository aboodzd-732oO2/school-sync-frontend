import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Edit, Plus, MapPin, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { admin as adminApi } from "@/services/api";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";

interface Governorate {
  id: number;
  name: string;
  institutionsCount: number;
  warehousesCount: number;
}

const GovernoratesList = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Governorate[]>([]);
  const [editing, setEditing] = useState<Governorate | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi.listGovernorates().then(setItems).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name) return;
    try {
      await adminApi.createGovernorate(form);
      toast({ title: "تمت الإضافة" });
      setCreating(false);
      setForm({ name: '' });
      load();
    } catch (e: any) { toast({ title: "فشل", description: e.message, variant: "destructive" }); }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      await adminApi.updateGovernorate(editing.id, { name: editing.name });
      toast({ title: "تم التحديث" });
      setEditing(null);
      load();
    } catch (e: any) { toast({ title: "فشل", description: e.message, variant: "destructive" }); }
  };

  const handleDelete = async (g: Governorate) => {
    try {
      await adminApi.deleteGovernorate(g.id);
      toast({ title: "تم الحذف" });
      load();
    } catch (e: any) { toast({ title: "فشل الحذف", description: e.message, variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">إجمالي المحافظات: <strong>{items.length}</strong></div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 me-2" /> إضافة محافظة
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton variant="table" rows={5} columns={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="لا توجد محافظات"
          description="ابدأ بإضافة أول محافظة"
          action={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4 me-2" />إضافة محافظة</Button>}
        />
      ) : (
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-start">الاسم</th>
              <th className="px-4 py-3 text-start">المؤسسات</th>
              <th className="px-4 py-3 text-start">المستودعات</th>
              <th className="px-4 py-3 text-start">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map(g => (
              <tr key={g.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-semibold">{g.name}</td>
                <td className="px-4 py-3"><Badge variant="outline">{g.institutionsCount}</Badge></td>
                <td className="px-4 py-3"><Badge variant="outline">{g.warehousesCount}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(g)}>
                      <Edit className="h-4 w-4 text-info" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost"><Trash2 className="h-4 w-4 text-danger" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف {g.name}؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            {(g.institutionsCount + g.warehousesCount) > 0 && (
                              <div className="text-danger flex items-center gap-1.5">
                                <AlertTriangle className="size-4 shrink-0" />
                                <span>فيها {g.institutionsCount} مؤسسة و {g.warehousesCount} مستودع — لن يتم الحذف</span>
                              </div>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(g)} className="bg-danger hover:bg-danger">حذف</AlertDialogAction>
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
          <DialogHeader><DialogTitle>إضافة محافظة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>الاسم</Label>
              <Input value={form.name} onChange={e => setForm({ name: e.target.value })} placeholder="اسم المحافظة" />
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
          <DialogHeader><DialogTitle>تعديل المحافظة</DialogTitle></DialogHeader>
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

export default GovernoratesList;
