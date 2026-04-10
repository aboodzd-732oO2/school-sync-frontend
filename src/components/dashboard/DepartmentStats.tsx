import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, Hash } from "lucide-react";
import { Request } from "@/types/dashboard";

interface DepartmentStatsProps {
  requests: Request[];
}

const DepartmentStats = ({ requests }: DepartmentStatsProps) => {
  const getDepartmentText = (department: string) => {
    const departments = {
      'materials': '📦 المواد والأثاث',
      'maintenance': '🔧 الصيانة',
      'academic-materials': '📚 المواد الأكاديمية',
      'technology': '💻 التكنولوجيا',
      'safety': '🛡️ السلامة'
    };
    return departments[department as keyof typeof departments] || department;
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
    <Card className="card-gradient shadow-md border-gray-200">
      <CardHeader className="bg-gradient-to-r from-[hsl(142,60%,25%)] to-[hsl(142,50%,20%)] border-b border-[hsl(142,50%,15%)]">
        <CardTitle className="flex items-center space-x-2 space-x-reverse text-xl font-bold text-white">
          <span>📈</span>
          <span>إحصائيات الأقسام</span>
        </CardTitle>
        <CardDescription className="text-gray-600 font-medium">
          تفصيل حسب القسم مع الكميات والطلاب المتأثرين
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(departmentStats).map(([dept, stats]) => (
            <div key={dept} className="border-2 border-gray-200/50 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-lg hover:border-blue-300 transition-all duration-300 card-hover">
              <h4 className="font-bold mb-4 text-lg text-gray-800">{getDepartmentText(dept)}</h4>
              <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-2 bg-[hsl(142,30%,96%)] rounded-lg">
                  <span className="flex items-center space-x-1 space-x-reverse font-medium text-[hsl(142,60%,20%)]">
                    <Users className="h-4 w-4 text-[hsl(142,60%,25%)]" />
                    <span>الطلبات:</span>
                  </span>
                  <span className="font-bold text-[hsl(142,60%,25%)] text-lg">{stats.count}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-[hsl(38,30%,96%)] rounded-lg">
                  <span className="flex items-center space-x-1 space-x-reverse font-medium text-[hsl(38,80%,50%)]">
                    <Package className="h-4 w-4 text-[hsl(38,85%,60%)]" />
                    <span>العناصر:</span>
                  </span>
                  <span className="font-bold text-[hsl(38,85%,60%)] text-lg">{stats.quantity}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-[hsl(142,30%,96%)] rounded-lg">
                  <span className="flex items-center space-x-1 space-x-reverse font-medium text-[hsl(142,60%,20%)]">
                    <Hash className="h-4 w-4 text-[hsl(142,60%,25%)]" />
                    <span>الطلاب:</span>
                  </span>
                  <span className="font-bold text-[hsl(142,60%,25%)] text-lg">{stats.students}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DepartmentStats;
