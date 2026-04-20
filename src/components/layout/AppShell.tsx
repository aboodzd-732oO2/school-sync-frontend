import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

type UserType = "admin" | "institution" | "warehouse";

interface AppShellUser {
  email: string;
  userType: UserType;
  institutionName?: string;
  warehouseName?: string;
}

interface Props {
  user: AppShellUser;
  onLogout: () => void;
  children: React.ReactNode;
}

export function AppShell({ user, onLogout, children }: Props) {
  const display =
    user.userType === "admin" ? "مدير النظام" :
    user.userType === "institution" ? user.institutionName :
    user.warehouseName;

  const typeLabel =
    user.userType === "admin" ? "مدير" :
    user.userType === "institution" ? "مؤسسة تعليمية" : "مستودع";

  return (
    <SidebarProvider>
      <AppSidebar userType={user.userType} />
      <SidebarInset>
        <AppHeader
          userEmail={user.email}
          userDisplay={display}
          userTypeLabel={typeLabel}
          onLogout={onLogout}
        />
        <main className="flex-1 p-4 md:p-6 bg-surface min-h-[calc(100vh-4rem)]">
          <div className="animate-fade-in">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
