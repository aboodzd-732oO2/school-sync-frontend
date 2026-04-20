
import { FileText, Clock, RefreshCw, CheckCircle, Flame, BarChart3 } from "lucide-react";
import { Request } from "@/types/dashboard";
import { usePriorities } from "@/hooks/useLookups";
import { StatCard } from "@/components/common/StatCard";

interface StatusStatsProps {
  requests: Request[];
  onStatsClick: (type: 'draft' | 'pending' | 'inProgress' | 'completed' | 'highPriority', title: string, data?: any) => void;
}

const StatusStats = ({ requests, onStatsClick }: StatusStatsProps) => {
  const { isHighPriority } = usePriorities();
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
    const highPriorityRequests = activeRequests.filter(r => isHighPriority(r.priority));
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
          requests: activeRequests.filter(r => isHighPriority(r.priority)),
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
      <div>
        <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
          <BarChart3 className="size-5" />
          متابعة الطلبات النشطة
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            label="مسودة"
            value={stats.draft.count}
            icon={FileText}
            tone="default"
            hint={`${stats.draft.students} طالب · ${stats.draft.items} عنصر`}
            onClick={() => handleStatsClick('draft', 'تفاصيل المسودات')}
          />
          <StatCard
            label="قيد الانتظار"
            value={stats.pending.count}
            icon={Clock}
            tone="warning"
            hint={`${stats.pending.students} طالب · ${stats.pending.items} عنصر`}
            onClick={() => handleStatsClick('pending', 'تفاصيل الطلبات قيد الانتظار')}
          />
          <StatCard
            label="قيد التنفيذ"
            value={stats.inProgress.count}
            icon={RefreshCw}
            tone="primary"
            hint={`${stats.inProgress.inPreparation} قيد التحضير · ${stats.inProgress.readyForPickup} جاهز`}
            onClick={() => handleStatsClick('inProgress', 'تفاصيل الطلبات قيد التنفيذ')}
          />
          <StatCard
            label="مكتمل"
            value={stats.completed.count}
            icon={CheckCircle}
            tone="success"
            hint={`${stats.completed.students} طالب · ${stats.completed.items} عنصر`}
            onClick={() => handleStatsClick('completed', 'تفاصيل الطلبات المكتملة')}
          />
          <StatCard
            label="أولوية عالية"
            value={stats.highPriority.count}
            icon={Flame}
            tone="danger"
            hint={`${stats.highPriority.urgentRequests} عاجل · ${stats.highPriority.students} طالب`}
            onClick={() => handleStatsClick('highPriority', 'تفاصيل الطلبات عالية الأولوية')}
          />
        </div>
      </div>
    </div>
  );
};

export default StatusStats;
