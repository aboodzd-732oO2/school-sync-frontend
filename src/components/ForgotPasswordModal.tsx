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

const ForgotPasswordModal = ({ isOpen, onClose }: Props) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.includes('@')) {
      toast({ title: "خطأ", description: "بريد إلكتروني غير صحيح", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      toast({
        title: "تم إرسال طلبك",
        description: "يرجى التواصل مع مدير النظام ليوافق على طلبك ويُعلمك بكلمة المرور الجديدة.",
      });
      setEmail('');
      onClose();
    } catch (err: any) {
      toast({ title: "فشل", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) { setEmail(''); onClose(); } }}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>استعادة كلمة المرور</DialogTitle>
          <DialogDescription>
            أدخل بريدك الإلكتروني، سيُرسَل طلبك للمدير للموافقة عليه
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>البريد الإلكتروني</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => { setEmail(''); onClose(); }}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;
