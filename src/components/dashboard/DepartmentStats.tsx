import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, Hash, TrendingUp } from "lucide-react";
import { Request } from "@/types/dashboard";
import { lookup } from "@/services/api";
import { getDepartmentIcon } from "@/lib/departmentIcons";

interface DepartmentStatsProps {
  requests: Request[];
}

const DepartmentStats = ({ requests }: DepartmentStatsProps) => {
  const [departmentsMap, setDepartmentsMap] = useState<Record<string, { labelAr: string; icon: string }>>({});

  useEffect(() => {
    lookup.departments().then((depts: any[]) => {
      const map: Record<string, { labelAr: string; icon: string }> = {};
      depts.forEach(d => { map[d.key] = { labelAr: d.labelAr, icon: d.icon }; });
      setDepartmentsMap(map);
    }).catch(() => {});
  }, []);

  const getDepartmentInfo = (department: string) => {
    const d = departmentsMap[department];
    const labelAr = d?.labelAr.replace(/^قسم\s*/, '') || department;
    const Icon = getDepartmentIcon(d?.icon);
    return { labelAr, Icon };
  };

  const departmentStats = requests.reduce((acc, request) => {
    if (!acc[request.department]) {
      acc[request.department] = {
        count: 0,
        quantity: 0,
        students: 0
      };
    }
    acc[request.department].count++;
    acc[request.department].quantity += request.quantity;
    acc[request.department].students += request.studentsAffected;
    return acc;
  }, {} as Record<string, any>);

  if (Object.keys(departmentStats).length === 0) {
    return null;
  }

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="bg-primary border-b border-border">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-white">
          <TrendingUp className="size-5" />
          <span>إحصائيات الأقسام</span>
        </CardTitle>
        <CardDescription className="text-muted-foreground font-medium">
          تفصيل حسب القسم مع الكميات والطلاب المتأثرين
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(departmentStats).map(([dept, stats]) => {
            const { labelAr, Icon } = getDepartmentInfo(dept);
            return (
            <div key={dept} className="border border-border/60 rounded-lg p-5 bg-card hover:shadow-md hover:border-primary/30 transition-shadow">
              <h4 className="font-bold mb-4 text-lg text-foreground flex items-center gap-2">
                <Icon className="size-5 text-primary" />
                <span>{labelAr}</span>
              </h4>
              <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
                  <span className="flex items-center space-x-1 space-x-reverse font-medium text-primary">
                    <Users className="h-4 w-4 text-primary" />
                    <span>الطلبات:</span>
                  </span>
                  <span className="font-bold text-primary text-lg">{stats.count}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-warning/10 rounded-lg">
                  <span className="flex items-center space-x-1 space-x-reverse font-medium text-muted-foreground">
                    <Package className="h-4 w-4 text-foreground" />
                    <span>العناصر:</span>
                  </span>
                  <span className="font-bold text-foreground text-lg">{stats.quantity}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
                  <span className="flex items-center space-x-1 space-x-reverse font-medium text-primary">
                    <Hash className="h-4 w-4 text-primary" />
                    <span>الطلاب:</span>
                  </span>
                  <span className="font-bold text-primary text-lg">{stats.students}</span>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DepartmentStats;
