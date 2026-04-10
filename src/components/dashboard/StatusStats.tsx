
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Request } from "@/types/dashboard";

interface StatusStatsProps {
  requests: Request[];
  onStatsClick: (type: 'draft' | 'pending' | 'inProgress' | 'completed' | 'highPriority', title: string, data?: any) => void;
}

const StatusStats = ({ requests, onStatsClick }: StatusStatsProps) => {
  // Filter out rejected and cancelled requests from main tracking
  const activeRequests = requests.filter(r => r.status !== 'rejected' && r.status !== 'cancelled');
  
  const calculateDetailedStats = (status: string) => {
    const statusRequests = activeRequests.filter(r => r.status === status);
    const totalStudents = statusRequests.reduce((sum, r) => sum + r.studentsAffected, 0);
    const totalItems = statusRequests.reduce((sum, r) => {
      return sum + (r.requestedItems?.reduce((itemSum, item) => itemSum + item.quantity, 0) || r.quantity || 0);
    }, 0);
    
    const departments = [...new Set(statusRequests.map(r => r.department))];
    const institutions = [...new Set(statusRequests.map(r => r.location))];
    
    return {
      count: statusRequests.length,
      students: totalStudents,
      items: totalItems,
      departments: departments.length,
      institutions: institutions.length,
      avgStudentsPerRequest: statusRequests.length > 0 ? Math.round(totalStudents / statusRequests.length) : 0
    };
  };

  const calculateHighPriorityStats = () => {
    const highPriorityRequests = activeRequests.filter(r => r.priority === 'high');
    const statusBreakdown: Record<string, number> = {};
    
    highPriorityRequests.forEach(r => {
      statusBreakdown[r.status] = (statusBreakdown[r.status] || 0) + 1;
    });

    return {
      ...calculateDetailedStats('high-priority'),
      count: highPriorityRequests.length,
      statusBreakdown,
      urgentRequests: highPriorityRequests.filter(r => 
        r.status === 'pending' || r.status === 'draft'
      ).length
    };
  };

  const stats = {
    draft: calculateDetailedStats('draft'),
    pending: calculateDetailedStats('pending'),
    inProgress: (() => {
      const inProgressRequests = activeRequests.filter(r => 
        r.status === 'in-progress' || r.status === 'ready-for-pickup'
      );
      const readyForPickup = inProgressRequests.filter(r => r.status === 'ready-for-pickup').length;
      const inPreparation = inProgressRequests.filter(r => r.status === 'in-progress').length;
      
      return {
        ...calculateDetailedStats('in-progress'),
        count: inProgressRequests.length,
        readyForPickup,
        inPreparation
      };
    })(),
    completed: calculateDetailedStats('completed'),
    highPriority: calculateHighPriorityStats(),
  };

  const handleStatsClick = (type: string, title: string) => {
    let detailedData;
    
    switch(type) {
      case 'draft':
        detailedData = {
          requests: activeRequests.filter(r => r.status === 'draft'),
          stats: stats.draft,
          tips: [
            'يمكن تعديل هذه الطلبات',
            'يمكن حذف الطلبات غير المرغوبة',
            'إرسال الطلبات الجاهزة للمستودع'
          ]
        };
        break;
      case 'pending':
        detailedData = {
          requests: activeRequests.filter(r => r.status === 'pending'),
          stats: stats.pending,
          tips: [
            'الطلبات قيد المراجعة في المستودع',
            'يمكن إلغاء الطلب إذا لزم الأمر',
            'متوقع البدء في التحضير قريباً'
          ]
        };
        break;
      case 'inProgress':
        detailedData = {
          requests: activeRequests.filter(r => 
            r.status === 'in-progress' || r.status === 'ready-for-pickup'
          ),
          stats: stats.inProgress,
          tips: [
            `${stats.inProgress.inPreparation} طلب قيد التحضير`,
            `${stats.inProgress.readyForPickup} طلب جاهز للاستلام`,
            'تحقق من الطلبات الجاهزة للاستلام'
          ]
        };
        break;
      case 'completed':
        detailedData = {
          requests: activeRequests.filter(r => r.status === 'completed'),
          stats: stats.completed,
          tips: [
            'طلبات تم استلامها بنجاح',
            'تحقق من تفاصيل التسليم',
            'تقييم جودة الخدمة'
          ]
        };
        break;
      case 'highPriority':
        detailedData = {
          requests: activeRequests.filter(r => r.priority === 'high'),
          stats: stats.highPriority,
          tips: [
            `${stats.highPriority.urgentRequests} طلب عاجل يحتاج متابعة`,
            'تأكد من توفر العناصر المطلوبة',
            'تواصل مع المستودع للتسريع'
          ]
        };
        break;
    }
    
    onStatsClick(type as any, title, detailedData);
  };

  return (
    <div className="space-y-6">
      {/* Main Tracking Stats - Active Requests Only */}
      <div>
        <h3 className="text-xl font-bold text-[hsl(142,60%,25%)] mb-6">📊 متابعة الطلبات النشطة</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="cursor-pointer card-hover border-2 border-[hsl(142,30%,85%)] bg-gradient-to-br from-white to-[hsl(142,30%,96%)] shadow-md hover:shadow-xl hover:border-[hsl(142,50%,30%)] transition-all duration-300" 
                onClick={() => handleStatsClick('draft', 'تفاصيل المسودات')}>
            <CardContent className="p-5">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2.5 bg-gradient-to-br from-[hsl(142,50%,35%)] to-[hsl(142,60%,25%)] rounded-xl shadow-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-[hsl(142,60%,25%)]">{stats.draft.count}</p>
                  <p className="text-sm font-semibold text-[hsl(142,60%,20%)]">📝 مسودة</p>
                  <div className="text-xs text-gray-500 mt-1.5 space-y-0.5">
                    <div>👥 {stats.draft.students} طالب</div>
                    <div>📦 {stats.draft.items} عنصر</div>
                    <div>🏢 {stats.draft.institutions} مؤسسة</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer card-hover border-2 border-[hsl(38,70%,50%)] bg-gradient-to-br from-white to-[hsl(38,30%,96%)] shadow-md hover:shadow-xl hover:border-[hsl(38,85%,60%)] transition-all duration-300" 
                onClick={() => handleStatsClick('pending', 'تفاصيل الطلبات قيد الانتظار')}>
            <CardContent className="p-5">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2.5 bg-gradient-to-br from-[hsl(38,85%,60%)] to-[hsl(38,90%,50%)] rounded-xl shadow-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-[hsl(38,85%,60%)]">{stats.pending.count}</p>
                  <p className="text-sm font-semibold text-[hsl(38,80%,50%)]">⏳ قيد الانتظار</p>
                  <div className="text-xs text-gray-500 mt-1.5 space-y-0.5">
                    <div>👥 {stats.pending.students} طالب</div>
                    <div>📦 {stats.pending.items} عنصر</div>
                    <div>📊 {stats.pending.departments} قسم</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer card-hover border-2 border-[hsl(142,50%,30%)] bg-gradient-to-br from-white to-[hsl(142,30%,96%)] shadow-md hover:shadow-xl hover:border-[hsl(142,50%,25%)] transition-all duration-300" 
                onClick={() => handleStatsClick('inProgress', 'تفاصيل الطلبات قيد التنفيذ')}>
            <CardContent className="p-5">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2.5 bg-gradient-to-br from-[hsl(142,50%,35%)] to-[hsl(142,60%,25%)] rounded-xl shadow-lg">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-[hsl(142,60%,25%)]">{stats.inProgress.count}</p>
                  <p className="text-sm font-semibold text-[hsl(142,60%,20%)]">🔄 قيد التنفيذ</p>
                  <div className="text-xs text-gray-500 mt-1.5 space-y-0.5">
                    <div>🔄 {stats.inProgress.inPreparation} قيد التحضير</div>
                    <div>✅ {stats.inProgress.readyForPickup} جاهز</div>
                    <div>👥 {stats.inProgress.students} طالب</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer card-hover border-2 border-[hsl(142,50%,30%)] bg-gradient-to-br from-white to-[hsl(142,30%,96%)] shadow-md hover:shadow-xl hover:border-[hsl(142,50%,25%)] transition-all duration-300" 
                onClick={() => handleStatsClick('completed', 'تفاصيل الطلبات المكتملة')}>
            <CardContent className="p-5">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2.5 bg-gradient-to-br from-[hsl(142,50%,35%)] to-[hsl(142,60%,25%)] rounded-xl shadow-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-[hsl(142,60%,25%)]">{stats.completed.count}</p>
                  <p className="text-sm font-semibold text-[hsl(142,60%,20%)]">✅ مكتمل</p>
                  <div className="text-xs text-gray-500 mt-1.5 space-y-0.5">
                    <div>👥 {stats.completed.students} طالب</div>
                    <div>📦 {stats.completed.items} عنصر</div>
                    <div>📈 {stats.completed.avgStudentsPerRequest} متوسط/طلب</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer card-hover border-2 border-[hsl(38,70%,50%)] bg-gradient-to-br from-white to-[hsl(38,30%,96%)] shadow-md hover:shadow-xl hover:border-[hsl(38,85%,60%)] transition-all duration-300" 
                onClick={() => handleStatsClick('highPriority', 'تفاصيل الطلبات عالية الأولوية')}>
            <CardContent className="p-5">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2.5 bg-gradient-to-br from-[hsl(38,85%,60%)] to-[hsl(38,90%,50%)] rounded-xl shadow-lg">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-[hsl(38,85%,60%)]">{stats.highPriority.count}</p>
                  <p className="text-sm font-semibold text-[hsl(38,80%,50%)]">🔴 أولوية عالية</p>
                  <div className="text-xs text-gray-500 mt-1.5 space-y-0.5">
                    <div>🚨 {stats.highPriority.urgentRequests} عاجل</div>
                    <div>👥 {stats.highPriority.students} طالب</div>
                    <div>📦 {stats.highPriority.items} عنصر</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StatusStats;
