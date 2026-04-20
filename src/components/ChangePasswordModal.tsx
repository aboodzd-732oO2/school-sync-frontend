import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { auth as authApi } from "@/services/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal = ({ isOpen, onClose }: Props) => {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword) {
      toast({ title: "خطأ", description: "كلمة المرور الحالية والجديدة مطلوبتان", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "خطأ", description: "كلمة المرور الجديدة غير متطابقة مع التأكيد", variant: "destructive" });
      return;
    }
    if (newPassword.length < 4) {
      toast({ title: "خطأ", description: "كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast({ title: "تم التغيير", description: "تم تغيير كلمة المرور بنجاح" });
      reset();
      onClose();
    } catch (err: any) {
      toast({ title: "فشل", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>تغيير كلمة المرور</DialogTitle>
          <DialogDescription>أدخل كلمة المرور الحالية ثم الجديدة</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>كلمة المرور الحالية</Label>
            <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          </div>
          <div>
            <Label>كلمة المرور الجديدة</Label>
            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <div>
            <Label>تأكيد كلمة المرور الجديدة</Label>
            <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => { reset(); onClose(); }}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'جاري التغيير...' : 'تغيير'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;
