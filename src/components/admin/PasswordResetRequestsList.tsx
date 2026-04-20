import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { admin as adminApi } from "@/services/api";
import { Check, X, KeyRound } from "lucide-react";
import Pagination from "./Pagination";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";

interface ResetRequest {
  id: number;
  userId: number;
  userEmail: string;
  status: string;
  requestedAt: string;
  resolvedAt: string | null;
  newPassword: string | null;
}

const PAGE_SIZE = 20;

const PasswordResetRequestsList = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<ResetRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [approving, setApproving] = useState<ResetRequest | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi.listPasswordResets({ page: String(page), pageSize: String(PAGE_SIZE) }).then((res: any) => {
      setItems(res.data || []);
      setTotal(res.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pwd = '';
    for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    // نضمن توفر الأحرف الكبيرة والصغيرة والرقم
    return pwd.slice(0, 8) + 'A1b';
  };

  const handleApprove = async () => {
    if (!approving || !newPassword || newPassword.length < 8) {
      toast({ title: "خطأ", description: "كلمة المرور يجب 8 أحرف على الأقل", variant: "destructive" });
      return;
    }
    try {
      await adminApi.approvePasswordReset(approving.id, newPassword);
      toast({
        title: "تمت الموافقة",
        description: `كلمة المرور الجديدة لـ ${approving.userEmail}: ${newPassword}`,
      });
      setApproving(null);
      setNewPassword('');
      load();
    } catch (err: any) {
      toast({ title: "فشل", description: err.message, variant: "destructive" });
    }
  };

  const handleReject = async (item: ResetRequest) => {
    try {
      await adminApi.rejectPasswordReset(item.id);
      toast({ title: "تم الرفض" });
      load();
    } catch (err: any) {
      toast({ title: "فشل", description: err.message, variant: "destructive" });
    }
  };

  const statusBadge = (s: string) => {
    if (s === 'pending') return <Badge className="bg-warning/15 text-warning-foreground">قيد الانتظار</Badge>;
    if (s === 'approved') return <Badge className="bg-success/15 text-success">تمت الموافقة</Badge>;
    return <Badge className="bg-danger/15 text-danger">مرفوض</Badge>;
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <LoadingSkeleton variant="table" rows={5} columns={5} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="لا توجد طلبات"
          description="لم يتم إرسال أي طلبات استعادة كلمة مرور"
        />
      ) : (
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-start">البريد</th>
              <th className="px-4 py-3 text-start">وقت الطلب</th>
              <th className="px-4 py-3 text-start">الحالة</th>
              <th className="px-4 py-3 text-start">وقت المعالجة</th>
              <th className="px-4 py-3 text-start">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map(r => (
              <tr key={r.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3">{r.userEmail}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.requestedAt).toLocaleString('ar-EG')}</td>
                <td className="px-4 py-3">{statusBadge(r.status)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {r.resolvedAt ? new Date(r.resolvedAt).toLocaleString('ar-EG') : '—'}
                </td>
                <td className="px-4 py-3">
                  {r.status === 'pending' && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setApproving(r); setNewPassword(generatePassword()); }} title="موافقة">
                        <Check className="h-4 w-4 text-success" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleReject(r)} title="رفض">
                        <X className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />

      <Dialog open={!!approving} onOpenChange={(o) => !o && setApproving(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>الموافقة على استعادة كلمة المرور</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm">الحساب: <strong>{approving?.userEmail}</strong></p>
            <div>
              <Label>كلمة المرور الجديدة</Label>
              <div className="flex gap-2">
                <Input value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                <Button type="button" variant="outline" onClick={() => setNewPassword(generatePassword())}>توليد</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">8 أحرف على الأقل، مع حرف كبير + صغير + رقم. أبلغ المستخدم بها.</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setApproving(null)}>إلغاء</Button>
              <Button onClick={handleApprove}>موافقة وتعيين</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PasswordResetRequestsList;
