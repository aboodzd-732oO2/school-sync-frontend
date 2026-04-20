import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Edit, Plus, Search, Warehouse as WarehouseIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { admin as adminApi, lookup } from "@/services/api";
import Pagination from "./Pagination";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";

interface Warehouse {
  id: number;
  name: string;
  governorate: string;
  departmentKey: string;
  departmentLabelAr: string;
  hasAccount: boolean;
  accountEmail?: string;
  accountActive?: boolean;
  requestsCount: number;
  inventoryCount: number;
}

const PAGE_SIZE = 20;

const WarehousesList = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Warehouse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [governorates, setGovernorates] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [govFilter, setGovFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', departmentKey: '', governorate: '' });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const query: Record<string, string> = { page: String(page), pageSize: String(PAGE_SIZE) };
    if (govFilter !== 'all') query.governorate = govFilter;
    if (deptFilter !== 'all') query.departmentKey = deptFilter;
    adminApi.listWarehouses(query).then((res: any) => {
      setItems(res.data || []);
      setTotal(res.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    lookup.governorates().then(setGovernorates).catch(() => {});
    lookup.departments().then(setDepartments).catch(() => {});

  }, [page, govFilter, deptFilter]);

  useEffect(() => { setPage(1); }, [govFilter, deptFilter]);

  // توليد اسم تلقائي من labelAr للقسم + المحافظة
  useEffect(() => {
    if (form.departmentKey && form.governorate && departments.length > 0) {
      const dept = departments.find(d => d.key === form.departmentKey);
      if (dept) {
        // نحوّل "قسم المواد والأثاث التعليمي" → "مستودع المواد والأثاث التعليمي"
        const warehouseName = dept.labelAr.replace(/^قسم\s*/, 'مستودع ');
        setForm(prev => ({ ...prev, name: `${warehouseName} - ${form.governorate}` }));
      }
    }
  }, [form.departmentKey, form.governorate, departments]);

  const handleCreate = async () => {
    if (!form.name || !form.departmentKey || !form.governorate) {
      toast({ title: "خطأ", description: "كل الحقول مطلوبة", variant: "destructive" });
      return;
    }
    try {
      await adminApi.createWarehouse(form);
      toast({ title: "تمت الإضافة" });
      setCreating(false);
      setForm({ name: '', departmentKey: '', governorate: '' });
      load();
    } catch (e: any) {
      toast({ title: "فشل", description: e.message, variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      await adminApi.updateWarehouse(editing.id, { name: editing.name });
      toast({ title: "تم التحديث" });
      setEditing(null);
      load();
    } catch (e: any) {
      toast({ title: "فشل", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (item: Warehouse) => {
    try {
      await adminApi.deleteWarehouse(item.id);
      toast({ title: "تم الحذف" });
      load();
    } catch (e: any) {
      toast({ title: "فشل الحذف", description: e.message, variant: "destructive" });
    }
  };

  // search على الصفحة الحالية
  const filtered = items.filter(w => {
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} className="ps-10" />
        </div>
        <Select value={govFilter} onValueChange={setGovFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="all">كل المحافظات</SelectItem>
            {governorates.map(g => <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأقسام</SelectItem>
            {departments.map(d => <SelectItem key={d.key} value={d.key}>{d.labelAr}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 me-2" /> إضافة
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton variant="table" rows={6} columns={7} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={WarehouseIcon}
          title="لا توجد نتائج"
          description={search || govFilter !== 'all' || deptFilter !== 'all' ? 'جرّب تغيير الفلترة' : 'لم يتم إضافة أي مستودعات بعد'}
          action={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4 me-2" />إضافة مستودع</Button>}
        />
      ) : (
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-start">الاسم</th>
              <th className="px-4 py-3 text-start">القسم</th>
              <th className="px-4 py-3 text-start">المحافظة</th>
              <th className="px-4 py-3 text-start">حساب</th>
              <th className="px-4 py-3 text-start">الطلبات</th>
              <th className="px-4 py-3 text-start">المخزون</th>
              <th className="px-4 py-3 text-start">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => (
              <tr key={w.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3">{w.name}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{w.departmentLabelAr}</Badge>
                </td>
                <td className="px-4 py-3">{w.governorate}</td>
                <td className="px-4 py-3">
                  {w.hasAccount ? (
                    <Badge className={w.accountActive ? 'bg-success/15 text-success' : 'bg-muted/50 text-muted-foreground'}>
                      {w.accountActive ? 'مفعّل' : 'معطّل'}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-warning-foreground border-warning/40">بدون حساب</Badge>
                  )}
                </td>
                <td className="px-4 py-3">{w.requestsCount}</td>
                <td className="px-4 py-3">{w.inventoryCount}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(w)}>
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
                          <AlertDialogTitle>حذف المستودع؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            سيتم حذف <strong>{w.name}</strong> والحساب المرتبط والمخزون.
                            {w.requestsCount > 0 && <div className="text-danger mt-2">فيه {w.requestsCount} طلب — لن يتم الحذف.</div>}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(w)} className="bg-danger hover:bg-danger">حذف</AlertDialogAction>
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

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />

      {/* Create */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>إضافة مستودع جديد</DialogTitle></DialogHeader>
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
              <Label>المحافظة</Label>
              <Select value={form.governorate} onValueChange={v => setForm({ ...form, governorate: v })}>
                <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {governorates.map(g => <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الاسم (يتولّد تلقائياً)</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
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
          <DialogHeader><DialogTitle>تعديل المستودع</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>الاسم</Label>
                <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <p className="text-xs text-muted-foreground">* لا يمكن تعديل القسم أو المحافظة بعد الإنشاء</p>
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

export default WarehousesList;
