import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Power, Trash2, KeyRound, Search, Users as UsersIcon } from "lucide-react";
import { admin as adminApi } from "@/services/api";
import Pagination from "./Pagination";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";

interface User {
  id: number;
  email: string;
  userType: string;
  isActive: boolean;
  institutionName?: string;
  institutionType?: string;
  warehouseName?: string;
  governorate?: string;
  createdAt: string;
}

interface Props {
  refreshTrigger: number;
}

const PAGE_SIZE = 20;

const UsersList = ({ refreshTrigger }: Props) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const query: Record<string, string> = { page: String(page), pageSize: String(PAGE_SIZE) };
    if (filter !== 'all') query.userType = filter;
    adminApi.listUsers(query).then((res: any) => {
      setUsers(res.data || []);
      setTotal(res.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [refreshTrigger, page, filter]);

  useEffect(() => { setPage(1); }, [filter]);

  const handleToggleActive = async (user: User) => {
    try {
      await adminApi.updateUser(user.id, { isActive: !user.isActive });
      toast({ title: user.isActive ? "تم تعطيل الحساب" : "تم تفعيل الحساب" });
      load();
    } catch (err: any) {
      toast({ title: "فشل", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (user: User) => {
    try {
      await adminApi.deleteUser(user.id);
      toast({ title: "تم حذف الحساب" });
      load();
    } catch (err: any) {
      toast({ title: "فشل", description: err.message, variant: "destructive" });
    }
  };

  const handleChangePassword = async () => {
    if (!passwordUser || !newPassword) return;
    try {
      await adminApi.updateUser(passwordUser.id, { password: newPassword });
      toast({ title: "تم تغيير كلمة المرور", description: `كلمة المرور الجديدة: ${newPassword}` });
      setPasswordUser(null);
      setNewPassword('');
    } catch (err: any) {
      toast({ title: "فشل", description: err.message, variant: "destructive" });
    }
  };

  // search يعمل على الصفحة الحالية فقط
  const filtered = users.filter(u => {
    if (!search) return true;
    const s = search.toLowerCase();
    return u.email.toLowerCase().includes(s) ||
      (u.institutionName?.toLowerCase().includes(s)) ||
      (u.warehouseName?.toLowerCase().includes(s)) ||
      (u.governorate?.toLowerCase().includes(s)) || false;
  });

  const typeLabel = (t: string) =>
    t === 'admin' ? 'مدير' : t === 'institution' ? 'مؤسسة' : 'مستودع';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالبريد أو الاسم..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ps-10"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="admin">مدير</SelectItem>
            <SelectItem value="institution">مؤسسات</SelectItem>
            <SelectItem value="warehouse">مستودعات</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <LoadingSkeleton variant="table" rows={6} columns={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="لا توجد نتائج"
          description={search || filter !== 'all' ? 'جرّب تغيير البحث أو الفلترة' : 'لم يتم إنشاء أي مستخدمين بعد'}
        />
      ) : (
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-start font-semibold">البريد</th>
              <th className="px-4 py-3 text-start font-semibold">النوع</th>
              <th className="px-4 py-3 text-start font-semibold">الاسم / المستودع</th>
              <th className="px-4 py-3 text-start font-semibold">المحافظة</th>
              <th className="px-4 py-3 text-start font-semibold">الحالة</th>
              <th className="px-4 py-3 text-start font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{typeLabel(u.userType)}</Badge>
                </td>
                <td className="px-4 py-3">{u.institutionName || u.warehouseName || '—'}</td>
                <td className="px-4 py-3">{u.governorate || '—'}</td>
                <td className="px-4 py-3">
                  <Badge className={u.isActive ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}>
                    {u.isActive ? 'مفعّل' : 'معطّل'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleToggleActive(u)} title={u.isActive ? 'تعطيل' : 'تفعيل'}>
                        <Power className={`h-4 w-4 ${u.isActive ? 'text-success' : 'text-muted-foreground'}`} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setPasswordUser(u)} title="تغيير كلمة المرور">
                        <KeyRound className="h-4 w-4 text-info" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" title="حذف">
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>حذف الحساب؟</AlertDialogTitle>
                            <AlertDialogDescription>
                              سيتم حذف حساب <strong>{u.email}</strong> نهائياً. لا يمكن التراجع.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(u)} className="bg-danger hover:bg-danger">
                              حذف نهائي
                            </AlertDialogAction>
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

      <Dialog open={!!passwordUser} onOpenChange={(o) => !o && setPasswordUser(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تغيير كلمة المرور</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm">الحساب: <strong>{passwordUser?.email}</strong></p>
            <div>
              <Label>كلمة المرور الجديدة</Label>
              <Input value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="أدخل كلمة المرور" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setPasswordUser(null)}>إلغاء</Button>
              <Button onClick={handleChangePassword}>تحديث</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersList;
