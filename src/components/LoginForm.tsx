import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap } from "lucide-react";
import { auth, setToken } from "@/services/api";
import { connectSocket } from "@/services/socket";
import ForgotPasswordModal from "./ForgotPasswordModal";

interface LoginFormProps {
  onLogin: (userData: any) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({ title: "معلومات مفقودة", description: "يرجى إدخال البريد وكلمة المرور.", variant: "destructive" });
      return;
    }

    if (!email.includes('@')) {
      toast({ title: "بريد إلكتروني غير صحيح", description: "يرجى إدخال بريد إلكتروني صحيح.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await auth.login(email, password);
      setToken(result.token);
      connectSocket(result.token);

      const userData = { ...result.user, loginTime: new Date().toISOString() };
      onLogin(userData);

      toast({ title: "تم تسجيل الدخول بنجاح", description: "مرحباً بك" });
    } catch (err: any) {
      toast({ title: "فشل تسجيل الدخول", description: err.message || "بيانات غير صحيحة", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface" dir="rtl">
      <Card className="w-full max-w-md shadow-lg border-border/60">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto flex size-14 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-7" />
          </div>
          <CardTitle className="text-xl font-bold">نظام إدارة الطلبات</CardTitle>
          <CardDescription className="text-sm">
            أدخل بيانات حسابك للوصول إلى النظام
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>

            <button
              type="button"
              onClick={() => setForgotOpen(true)}
              className="text-sm text-primary hover:underline block mx-auto"
            >
              نسيت كلمة المرور؟
            </button>

            <p className="text-xs text-muted-foreground text-center pt-2">
              لا تملك حساب؟ تواصل مع مدير النظام لإنشاء حساب جديد
            </p>
          </form>
        </CardContent>
      </Card>

      <ForgotPasswordModal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
};

export default LoginForm;
