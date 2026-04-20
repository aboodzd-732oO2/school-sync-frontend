import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Edit, Plus, Search, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { admin as adminApi, lookup } from "@/services/api";
import Pagination from "./Pagination";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";

interface Institution {
  id: number;
  name: string;
  institutionType: string;
  governorate: string;
  hasAccount: boolean;
  accountEmail?: string;
  accountActive?: boolean;
  requestsCount: number;
}

const PAGE_SIZE = 20;

const InstitutionsList = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Institution[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [governorates, setGovernorates] = useState<any[]>([]);
  const [institutionTypes, setInstitutionTypes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [govFilter, setGovFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [editing, setEditing] = useState<Institution | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', institutionType: '', governorate: '' });
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const query: Record<string, string> = { page: String(page), pageSize: String(PAGE_SIZE) };
    if (govFilter !== 'all') query.governorate = govFilter;
    if (typeFilter !== 'all') query.type = typeFilter;
    adminApi.listInstitutions(query).then((res: any) => {
      setItems(res.data || []);
      setTotal(res.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    lookup.governorates().then(setGovernorates).catch(() => {});
    lookup.institutionTypes().then((types: any[]) => {
      setInstitutionTypes(types);
      if (types.length > 0) setForm(f => ({ ...f, institutionType: types[0].key }));
    }).catch(() => {});

  }, [page, govFilter, typeFilter]);

  useEffect(() => { setPage(1); }, [govFilter, typeFilter]);

  const typeLabel = (key: string) => institutionTypes.find(t => t.key === key)?.labelAr || key;

  const handleCreate = async () => {
    if (!form.name || !form.governorate) {
      toast({ title: "خطأ", description: "الاسم والمحافظة مطلوبين", variant: "destructive" });
      return;
    }
    try {
      await adminApi.createInstitution(form);
      toast({ title: "تمت الإضافة", description: `تم إضافة ${form.name}` });
      setCreating(false);
      setForm({ name: '', institutionType: 'school', governorate: '' });
      load();
    } catch (e: any) {
      toast({ title: "فشل", description: e.message, variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      await adminApi.updateInstitution(editing.id, {
        name: editing.name,
        institutionType: editing.institutionType,
        governorate: editing.governorate,
      });
      toast({ title: "تم التحديث" });
      setEditing(null);
      load();
    } catch (e: any) {
      toast({ title: "فشل", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (item: Institution) => {
    try {
      await adminApi.deleteInstitution(item.id);
      toast({ title: "تم الحذف" });
      load();
    } catch (e: any) {
      toast({ title: "فشل الحذف", description: e.message, variant: "destructive" });
    }
  };

  // search على الصفحة الحالية
  const filtered = items.filter(i => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
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
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            {institutionTypes.map(t => <SelectItem key={t.key} value={t.key}>{t.labelAr}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 me-2" /> إضافة
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton variant="table" rows={6} columns={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="لا توجد نتائج"
          description={search || govFilter !== 'all' || typeFilter !== 'all' ? 'جرّب تغيير الفلترة' : 'لم يتم إضافة أي مؤسسات بعد'}
          action={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4 me-2" />إضافة مؤسسة</Button>}
        />
      ) : (
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-start">الاسم</th>
              <th className="px-4 py-3 text-start">النوع</th>
              <th className="px-4 py-3 text-start">المحافظة</th>
              <th className="px-4 py-3 text-start">حساب</th>
              <th className="px-4 py-3 text-start">الطلبات</th>
              <th className="px-4 py-3 text-start">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3">{i.name}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{typeLabel(i.institutionType)}</Badge>
                </td>
                <td className="px-4 py-3">{i.governorate}</td>
                <td className="px-4 py-3">
                  {i.hasAccount ? (
                    <Badge className={i.accountActive ? 'bg-success/15 text-success' : 'bg-muted/50 text-muted-foreground'}>
                      {i.accountActive ? 'مفعّل' : 'معطّل'}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-warning-foreground border-warning/40">بدون حساب</Badge>
                  )}
                </td>
                <td className="px-4 py-3">{i.requestsCount}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(i)}>
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
                          <AlertDialogTitle>حذف المؤسسة؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            سيتم حذف <strong>{i.name}</strong> والحساب المرتبط بها. لا يمكن التراجع.
                            {i.requestsCount > 0 && <div className="text-danger mt-2">تحذير: فيها {i.requestsCount} طلب — لن يتم الحذف.</div>}
                          </AlertDialogDescription>
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

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />

      {/* Create Modal */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>إضافة مؤسسة جديدة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>نوع المؤسسة</Label>
              <Select value={form.institutionType} onValueChange={v => setForm({ ...form, institutionType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {institutionTypes.map(t => <SelectItem key={t.key} value={t.key}>{t.labelAr}</SelectItem>)}
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
              <Label>الاسم</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="اسم المؤسسة" />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setCreating(false)}>إلغاء</Button>
              <Button onClick={handleCreate}>إضافة</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>تعديل المؤسسة</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>نوع المؤسسة</Label>
                <Select value={editing.institutionType} onValueChange={v => setEditing({ ...editing, institutionType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {institutionTypes.map(t => <SelectItem key={t.key} value={t.key}>{t.labelAr}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>المحافظة</Label>
                <Select value={editing.governorate} onValueChange={v => setEditing({ ...editing, governorate: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {governorates.map(g => <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>الاسم</Label>
                <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
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

export default InstitutionsList;
