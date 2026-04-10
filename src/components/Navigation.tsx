
import { Button } from "@/components/ui/button";
import { GraduationCap, FileText, BarChart3, Plus, LogOut, User, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type UserData = {
  email: string;
  loginTime: string;
} & ({
  userType: 'institution';
  institutionType: string;
  institutionName: string;
  warehouseName?: never;
} | {
  userType: 'warehouse';
  warehouseName: string;
  institutionType?: never;
  institutionName?: never;
});

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: UserData;
  onLogout: () => void;
}

const Navigation = ({ activeTab, onTabChange, user, onLogout }: NavigationProps) => {
  const tabs = [
    { id: 'dashboard', label: 'لوحة المتابعة', icon: BarChart3 },
    ...(user.userType === 'institution' ? [{ id: 'submit', label: 'طلب جديد', icon: Plus }] : []),
    { id: 'reports', label: 'التقارير', icon: FileText }
  ];

  const displayName = (user.userType === 'institution' ? user.institutionName : user.warehouseName) || 'المستخدم';
  const userTypeLabel = user.userType === 'institution' ? 'مؤسسة تعليمية' : 'مستودع';

  return (
    <nav className="bg-gradient-to-r from-[hsl(142,60%,25%)] via-[hsl(142,50%,20%)] to-[hsl(142,60%,25%)] shadow-lg border-b border-[hsl(142,50%,15%)] backdrop-blur-sm" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Institution Name */}
          <div className="flex items-center space-x-3 space-x-reverse min-w-0 flex-1">
            {user.userType === 'institution' ? (
              <div className="p-2 bg-gradient-to-br from-[hsl(38,85%,60%)] to-[hsl(38,90%,50%)] rounded-xl shadow-lg">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white flex-shrink-0" />
              </div>
            ) : (
              <div className="p-2 bg-gradient-to-br from-[hsl(38,85%,60%)] to-[hsl(38,90%,50%)] rounded-xl shadow-lg">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white flex-shrink-0" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-white truncate">نظام إدارة الطلبات</h1>
              <p className="text-xs sm:text-sm text-white/90 truncate font-medium">{displayName}</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 space-x-reverse">
            <div className="flex space-x-1 space-x-reverse">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center space-x-2 space-x-reverse transition-all duration-200 ${
                      activeTab === tab.id 
                        ? "bg-gradient-to-r from-[hsl(38,85%,60%)] to-[hsl(38,90%,50%)] text-white shadow-lg hover:shadow-xl" 
                        : "hover:bg-white/10 hover:text-white text-white/80"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{tab.label}</span>
                  </Button>
                );
              })}
            </div>
            
            <div className="flex items-center space-x-3 space-x-reverse border-r border-white/20 pr-4">
              <div className="flex flex-col items-end text-sm">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="max-w-32 truncate font-medium text-white">{user.email}</span>
                </div>
                <span className="text-xs text-white/80 font-medium">{userTypeLabel}</span>
              </div>
              <Button
                variant="outline"
                onClick={onLogout}
                className="flex items-center space-x-2 space-x-reverse border-white/30 bg-white/10 hover:bg-white/20 text-white hover:text-white transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-medium">تسجيل الخروج</span>
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="flex flex-col space-y-4 mt-6">
                  {/* User Info */}
                  <div className="border-b pb-4">
                    <div className="flex flex-col space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <User className="h-4 w-4" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <span className="text-xs text-gray-500 text-right">{userTypeLabel}</span>
                    </div>
                  </div>
                  
                  {/* Navigation Items */}
                  <div className="space-y-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <Button
                          key={tab.id}
                          variant={activeTab === tab.id ? "default" : "ghost"}
                          onClick={() => onTabChange(tab.id)}
                          className="w-full justify-start flex items-center space-x-2 space-x-reverse"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{tab.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                  
                  {/* Logout Button */}
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={onLogout}
                      className="w-full justify-start flex items-center space-x-2 space-x-reverse"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>تسجيل الخروج</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
