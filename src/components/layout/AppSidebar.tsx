import { Link, useLocation } from "react-router-dom";
import {
  BarChart3, Users, Building2, Warehouse, FolderTree, Package,
  MapPin, School, Ruler, Flag, Map, Lock, ScrollText,
  Plus, FileText, GraduationCap,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type UserType = "admin" | "institution" | "warehouse";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const adminNav: NavGroup[] = [
  {
    label: "نظرة عامة",
    items: [{ label: "الإحصائيات", href: "/admin/stats", icon: BarChart3 }],
  },
  {
    label: "المستخدمين والمؤسسات",
    items: [
      { label: "المستخدمين", href: "/admin/users", icon: Users },
      { label: "المؤسسات", href: "/admin/institutions", icon: Building2 },
      { label: "المستودعات", href: "/admin/warehouses", icon: Warehouse },
    ],
  },
  {
    label: "الإعدادات",
    items: [
      { label: "الأقسام", href: "/admin/departments", icon: FolderTree },
      { label: "عناصر الأقسام", href: "/admin/dept-items", icon: Package },
      { label: "المحافظات", href: "/admin/governorates", icon: MapPin },
      { label: "أنواع المؤسسات", href: "/admin/inst-types", icon: School },
      { label: "الوحدات", href: "/admin/units", icon: Ruler },
      { label: "الأولويات", href: "/admin/priorities", icon: Flag },
    ],
  },
  {
    label: "النظام",
    items: [
      { label: "خريطة التوجيه", href: "/admin/routing", icon: Map },
      { label: "طلبات الاستعادة", href: "/admin/password-resets", icon: Lock },
      { label: "سجل الأحداث", href: "/admin/audit", icon: ScrollText },
    ],
  },
];

const institutionNav: NavGroup[] = [
  {
    label: "الرئيسية",
    items: [
      { label: "لوحة التحكم", href: "/dashboard", icon: BarChart3 },
      { label: "طلب جديد", href: "/submit", icon: Plus },
      { label: "التقارير", href: "/reports", icon: FileText },
    ],
  },
];

const warehouseNav: NavGroup[] = [
  {
    label: "الرئيسية",
    items: [
      { label: "الطلبات", href: "/dashboard", icon: FileText },
      { label: "المخزون", href: "/inventory", icon: Package },
    ],
  },
];

export function AppSidebar({ userType }: { userType: UserType }) {
  const location = useLocation();
  const nav =
    userType === "admin" ? adminNav :
    userType === "institution" ? institutionNav : warehouseNav;

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex aspect-square size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <GraduationCap className="size-5" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-sm">نظام إدارة الطلبات</span>
            <span className="text-xs opacity-75">
              {userType === "admin" ? "لوحة المدير" :
               userType === "institution" ? "مؤسسة تعليمية" : "مستودع"}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {nav.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                        <Link to={item.href}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-2 text-xs opacity-75 group-data-[collapsible=icon]:hidden">
          © 2026 School Sync
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
