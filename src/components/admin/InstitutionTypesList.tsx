import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Edit, Plus, Tags, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { admin as adminApi } from "@/services/api";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";

interface InstitutionType {
  id: number;
  key: string;
  labelAr: string;
  institutionsCount: number;
}

const InstitutionTypesList = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<InstitutionType[]>([]);
  const [editing, setEditing] = useState<InstitutionType | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ key: '', labelAr: '' });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi.listInstitutionTypes().then(setItems).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await adminApi.createInstitutionType(form);
      toast({ title: "تمت الإضافة" });
      setCreating(false);
      setForm({ key: '', labelAr: '' });
      load();
    } catch (e: any) { toast({ title: "فشل", description: e.message, variant: "destructive" }); }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      await adminApi.updateInstitutionType(editing.id, { labelAr: editing.labelAr });
      toast({ title: "تم التحديث" });
      setEditing(null);
      load();
    } catch (e: any) { toast({ title: "فشل", description: e.message, variant: "destructive" }); }
  };

  const handleDelete = async (t: InstitutionType) => {
    try {
      await adminApi.deleteInstitutionType(t.id);
      toast({ title: "تم الحذف" });
      load();
    } catch (e: any) { toast({ title: "فشل", description: e.message, variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">الأنواع: <strong>{items.length}</strong></div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 me-2" /> إضافة نوع
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton variant="table" rows={5} columns={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="لا توجد أنواع"
          description="ابدأ بإضافة أول نوع مؤسسة"
          action={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4 me-2" />إضافة نوع</Button>}
        />
      ) : (
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-start">المفتاح</th>
              <th className="px-4 py-3 text-start">الاسم العربي</th>
              <th className="px-4 py-3 text-start">المؤسسات</th>
              <th className="px-4 py-3 text-start">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map(t => (
              <tr key={t.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3"><code className="bg-muted/50 px-2 py-1 rounded text-xs">{t.key}</code></td>
                <td className="px-4 py-3">{t.labelAr}</td>
                <td className="px-4 py-3"><Badge variant="outline">{t.institutionsCount}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(t)}>
                      <Edit className="h-4 w-4 text-info" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost"><Trash2 className="h-4 w-4 text-danger" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف {t.labelAr}؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t.institutionsCount > 0 && (
                              <div className="text-danger flex items-center gap-1.5">
                                <AlertTriangle className="size-4 shrink-0" />
                                <span>مرتبط بـ {t.institutionsCount} مؤسسة — لن يتم الحذف</span>
                              </div>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(t)} className="bg-danger hover:bg-danger">حذف</AlertDialogAction>
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
          <DialogHeader><DialogTitle>إضافة نوع مؤسسة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>المفتاح</Label>
              <Input value={form.key} onChange={e => setForm({ ...form, key: e.target.value.toLowerCase() })} placeholder="institute, college, ..." dir="ltr" />
            </div>
            <div>
              <Label>الاسم العربي</Label>
              <Input value={form.labelAr} onChange={e => setForm({ ...form, labelAr: e.target.value })} placeholder="معهد، كلية، ..." />
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
          <DialogHeader><DialogTitle>تعديل النوع</DialogTitle></DialogHeader>
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

export default InstitutionTypesList;
