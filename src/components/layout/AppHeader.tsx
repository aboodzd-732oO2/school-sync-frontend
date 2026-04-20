import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { KeyRound, LogOut, User } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import ChangePasswordModal from "@/components/ChangePasswordModal";

interface Props {
  userEmail: string;
  userDisplay?: string;
  userTypeLabel?: string;
  onLogout: () => void;
}

export function AppHeader({ userEmail, userDisplay, userTypeLabel, onLogout }: Props) {
  const [pwdOpen, setPwdOpen] = useState(false);
  const initials = (userDisplay || userEmail).slice(0, 2).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background px-4 md:px-6">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />

        <div className="flex-1" />

        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-start sm:flex sm:flex-col sm:leading-tight">
                <span className="text-sm font-medium">{userDisplay || userEmail}</span>
                {userTypeLabel && (
                  <span className="text-xs text-muted-foreground">{userTypeLabel}</span>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{userDisplay || userEmail}</span>
                <span className="text-xs text-muted-foreground">{userEmail}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setPwdOpen(true)}>
              <KeyRound className="me-2 size-4" />
              تغيير كلمة المرور
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-danger focus:text-danger">
              <LogOut className="me-2 size-4" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <ChangePasswordModal isOpen={pwdOpen} onClose={() => setPwdOpen(false)} />
    </>
  );
}
