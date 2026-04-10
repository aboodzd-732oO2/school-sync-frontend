
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

interface RejectRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: (reason: string) => void;
  requestTitle: string;
  type: 'warehouse' | 'institution';
}

const RejectRequestDialog = ({ 
  isOpen, 
  onClose, 
  onReject, 
  requestTitle, 
  type 
}: RejectRequestDialogProps) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    
    setIsSubmitting(true);
    await onReject(reason.trim());
    setIsSubmitting(false);
    setReason("");
    onClose();
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const title = type === 'warehouse' ? 'رفض الطلب' : 'إلغاء الطلب';
  const description = type === 'warehouse' 
    ? 'يرجى توضيح سبب رفض هذا الطلب. سيتم إرسال السبب للمؤسسة المرسلة.'
    : 'يرجى توضيح سبب إلغاء هذا الطلب. سيتم إرسال السبب للمستودع.';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 space-x-reverse">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Label className="text-sm font-medium text-blue-700">الطلب:</Label>
            <p className="text-blue-900 font-medium">{requestTitle}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">سبب {type === 'warehouse' ? 'الرفض' : 'الإلغاء'} *</Label>
            <Textarea
              id="reason"
              placeholder={`اكتب سبب ${type === 'warehouse' ? 'رفض' : 'إلغاء'} الطلب...`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              يجب كتابة سبب واضح ومفصل
            </p>
          </div>
        </div>

        <DialogFooter className="flex space-x-2 space-x-reverse">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
          >
            {isSubmitting ? "جاري المعالجة..." : `تأكيد ${type === 'warehouse' ? 'الرفض' : 'الإلغاء'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectRequestDialog;
