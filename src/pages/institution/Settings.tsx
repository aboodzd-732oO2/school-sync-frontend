import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Settings as SettingsIcon, Mail, Building2, MapPin, School,
  KeyRound, ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { auth as authApi } from "@/services/api";
import { useInstitutionTypes } from "@/hooks/useLookups";

interface Props {
  user: {
    userType: "institution";
    email: string;
    institutionName: string;
    institutionType?: string;
    governorate?: string;
  };
}

const InstitutionSettingsPage = ({ user }: Props) => {
  const { toast } = useToast();
  const { getLabel: getInstTypeLabel } = useInstitutionTypes();
  const institutionTypeLabel = user.institutionType
    ? getInstTypeLabel(user.institutionType)
    : "—";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور الحالية والجديدة مطلوبتان",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور الجديدة غير متطابقة مع التأكيد",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 4) {
      toast({
        title: "خطأ",
        description: "كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast({ title: "تم التغيير", description: "تم تغيير كلمة المرور بنجاح" });
      reset();
    } catch (err: any) {
      toast({ title: "فشل التغيير", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="الإعدادات" description="بيانات الحساب والمؤسسة وتغيير كلمة المرور" />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <SettingsIcon className="size-5 text-primary" />
              معلومات الحساب
            </CardTitle>
            <CardDescription>البيانات الأساسية لحسابك في النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="size-4" />
                  البريد الإلكتروني
                </dt>
                <dd className="text-sm font-medium">{user.email}</dd>
              </div>
              <div className="space-y-1">
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="size-4" />
                  نوع الحساب
                </dt>
                <dd>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    مؤسسة تعليمية
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-5 text-primary" />
              معلومات المؤسسة
            </CardTitle>
            <CardDescription>بيانات المؤسسة كما سجّلها مدير النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="size-4" />
                  اسم المؤسسة
                </dt>
                <dd className="text-sm font-medium">{user.institutionName}</dd>
              </div>
              <div className="space-y-1">
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <School className="size-4" />
                  النوع
                </dt>
                <dd className="text-sm font-medium">{institutionTypeLabel}</dd>
              </div>
              <div className="space-y-1">
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  المحافظة
                </dt>
                <dd className="text-sm font-medium">{user.governorate ?? "—"}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              لتعديل هذه البيانات، تواصل مع مدير النظام.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="size-5 text-primary" />
              تغيير كلمة المرور
            </CardTitle>
            <CardDescription>أدخل كلمة المرور الحالية ثم الجديدة مرتين للتأكيد</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleChangePassword} disabled={submitting}>
                  {submitting ? "جاري التغيير..." : "تغيير كلمة المرور"}
                </Button>
                <Button variant="outline" onClick={reset} disabled={submitting}>
                  إلغاء
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstitutionSettingsPage;
