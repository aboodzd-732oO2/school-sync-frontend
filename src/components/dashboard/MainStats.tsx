import { Users, Package, ClipboardList } from "lucide-react";
import { Request } from "@/types/dashboard";
import { StatCard } from "@/components/common/StatCard";

interface MainStatsProps {
  requests: Request[];
  onStatsClick: (type: 'total' | 'quantity' | 'students' | 'detailed-requests' | 'detailed-items', title: string, data?: any) => void;
}

const MainStats = ({ requests, onStatsClick }: MainStatsProps) => {
  // حساب إجمالي العناصر بدون تكرار - منطق محسن
  const calculateTotalQuantity = () => {
    let total = 0;
    
    requests.forEach(request => {
      // إذا كان الطلب يحتوي على requestedItems، استخدمها فقط
      if (request.requestedItems && request.requestedItems.length > 0) {
        request.requestedItems.forEach(item => {
          total += item.quantity;
        });
      }
      // وإلا استخدم الكمية الرئيسية للطلب
      else if (request.quantity > 0) {
        total += request.quantity;
      }
    });
    
    return total;
  };

  const stats = {
    total: requests.length,
    totalQuantity: calculateTotalQuantity(),
    totalStudentsAffected: requests.reduce((sum, r) => sum + r.studentsAffected, 0),
  };

  // Calculate detailed breakdown for requests and items
  const getDetailedRequestsData = () => {
    const statusBreakdown = {
      draft: { count: 0, students: 0, items: 0 },
      pending: { count: 0, students: 0, items: 0 },
      'in-progress': { count: 0, students: 0, items: 0 },
      'ready-for-pickup': { count: 0, students: 0, items: 0 },
      completed: { count: 0, students: 0, items: 0 },
      rejected: { count: 0, students: 0, items: 0 },
      cancelled: { count: 0, students: 0, items: 0 }
    };

    // الأولويات ديناميكية — تُبنى من البيانات نفسها
    const priorityBreakdown: Record<string, { count: number; students: number; items: number }> = {};

    const departmentBreakdown: Record<string, { count: number; students: number; items: number }> = {};

    requests.forEach(request => {
      const requestItems = request.requestedItems?.reduce((sum, item) => sum + item.quantity, 0) || request.quantity || 0;

      // Status breakdown
      if (statusBreakdown[request.status as keyof typeof statusBreakdown]) {
        statusBreakdown[request.status as keyof typeof statusBreakdown].count++;
        statusBreakdown[request.status as keyof typeof statusBreakdown].students += request.studentsAffected;
        statusBreakdown[request.status as keyof typeof statusBreakdown].items += requestItems;
      }

      // Priority breakdown (ديناميكي — يقبل أي أولوية)
      if (!priorityBreakdown[request.priority]) {
        priorityBreakdown[request.priority] = { count: 0, students: 0, items: 0 };
      }
      priorityBreakdown[request.priority].count++;
      priorityBreakdown[request.priority].students += request.studentsAffected;
      priorityBreakdown[request.priority].items += requestItems;

      // Department breakdown
      if (!departmentBreakdown[request.department]) {
        departmentBreakdown[request.department] = { count: 0, students: 0, items: 0 };
      }
      departmentBreakdown[request.department].count++;
      departmentBreakdown[request.department].students += request.studentsAffected;
      departmentBreakdown[request.department].items += requestItems;
    });

    return {
      requests: requests.map(request => ({
        ...request,
        itemsCount: (request.requestedItems?.length || 0),
        customItemsCount: request.requestedItems?.filter(item => item.originalKey === 'other').length || 0
      })),
      statusBreakdown,
      priorityBreakdown,
      departmentBreakdown,
      totalStats: stats
    };
  };

  const getDetailedItemsData = () => {
    const itemsBreakdown: Record<string, { 
      name: string; 
      totalQuantity: number; 
      unit: string; 
      requests: Array<{
        id: string;
        title: string;
        status: string;
        institution: string;
        quantity: number;
        students: number;
        date: string;
        priority: string;
      }>;
      statusBreakdown: Record<string, number>;
      priorityBreakdown: Record<string, number>;
    }> = {};
    
    requests.forEach(request => {
      // معالجة العناصر المطلوبة (requestedItems) - الأولوية الأولى
      if (request.requestedItems && request.requestedItems.length > 0) {
        request.requestedItems.forEach(item => {
          const key = item.originalKey === 'other' ? `custom_${item.itemName}` : item.originalKey;
          const name = item.itemName;
          
          if (!itemsBreakdown[key]) {
            itemsBreakdown[key] = {
              name: name,
              totalQuantity: 0,
              unit: item.unitType,
              requests: [],
              statusBreakdown: {},
              priorityBreakdown: {}
            };
          }
          
          itemsBreakdown[key].totalQuantity += item.quantity;
          itemsBreakdown[key].requests.push({
            id: request.id,
            title: request.title,
            status: request.status,
            institution: request.location || '',
            quantity: item.quantity,
            students: request.studentsAffected,
            date: request.dateSubmitted,
            priority: request.priority
          });

          // Status breakdown for this item
          itemsBreakdown[key].statusBreakdown[request.status] = 
            (itemsBreakdown[key].statusBreakdown[request.status] || 0) + item.quantity;

          // Priority breakdown for this item
          itemsBreakdown[key].priorityBreakdown[request.priority] = 
            (itemsBreakdown[key].priorityBreakdown[request.priority] || 0) + item.quantity;
        });
      }
      // معالجة الكمية الرئيسية للطلب - الأولوية الثانية
      else if (request.quantity > 0 && request.title) {
        const key = `main_${request.title}`;
        if (!itemsBreakdown[key]) {
          itemsBreakdown[key] = {
            name: request.title,
            totalQuantity: 0,
            unit: request.unitType,
            requests: [],
            statusBreakdown: {},
            priorityBreakdown: {}
          };
        }
        
        itemsBreakdown[key].totalQuantity += request.quantity;
        itemsBreakdown[key].requests.push({
          id: request.id,
          title: request.title,
          status: request.status,
          institution: request.location || '',
          quantity: request.quantity,
          students: request.studentsAffected,
          date: request.dateSubmitted,
          priority: request.priority
        });

        // Status breakdown for this item
        itemsBreakdown[key].statusBreakdown[request.status] = 
          (itemsBreakdown[key].statusBreakdown[request.status] || 0) + request.quantity;

        // Priority breakdown for this item
        itemsBreakdown[key].priorityBreakdown[request.priority] = 
          (itemsBreakdown[key].priorityBreakdown[request.priority] || 0) + request.quantity;
      }
    });

    return Object.entries(itemsBreakdown).map(([key, data]) => ({
      key,
      ...data
    }));
  };

  const getStudentsDetailedData = () => {
    const studentsByStatus: Record<string, number> = {};
    const studentsByPriority: Record<string, number> = {};
    const studentsByDepartment: Record<string, number> = {};
    const studentsByInstitution: Record<string, { students: number; requests: number }> = {};

    requests.forEach(request => {
      // Students by status
      studentsByStatus[request.status] = (studentsByStatus[request.status] || 0) + request.studentsAffected;
      
      // Students by priority
      studentsByPriority[request.priority] = (studentsByPriority[request.priority] || 0) + request.studentsAffected;
      
      // Students by department
      studentsByDepartment[request.department] = (studentsByDepartment[request.department] || 0) + request.studentsAffected;
      
      // Students by institution
      const institution = request.location || 'غير محدد';
      if (!studentsByInstitution[institution]) {
        studentsByInstitution[institution] = { students: 0, requests: 0 };
      }
      studentsByInstitution[institution].students += request.studentsAffected;
      studentsByInstitution[institution].requests++;
    });

    return {
      totalStudents: stats.totalStudentsAffected,
      studentsByStatus,
      studentsByPriority,
      studentsByDepartment,
      studentsByInstitution,
      averageStudentsPerRequest: Math.round(stats.totalStudentsAffected / requests.length),
      requestsWithMostStudents: requests
        .sort((a, b) => b.studentsAffected - a.studentsAffected)
        .slice(0, 5)
    };
  };

  const handleTotalRequestsClick = () => {
    const detailedData = getDetailedRequestsData();
    onStatsClick('detailed-requests', 'تفاصيل شاملة لإجمالي الطلبات', detailedData);
  };

  const handleTotalItemsClick = () => {
    const detailedData = getDetailedItemsData();
    onStatsClick('detailed-items', 'تفاصيل شاملة لإجمالي العناصر', detailedData);
  };

  const handleStudentsClick = () => {
    const detailedData = getStudentsDetailedData();
    onStatsClick('students', 'تفاصيل شاملة للطلاب المتأثرين', detailedData);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        label="إجمالي الطلبات"
        value={stats.total}
        icon={ClipboardList}
        tone="primary"
        hint="تفصيل حسب الحالة والأولوية"
        onClick={handleTotalRequestsClick}
      />
      <StatCard
        label="إجمالي العناصر"
        value={stats.totalQuantity}
        icon={Package}
        tone="warning"
        hint="تفصيل كل عنصر بالكمية"
        onClick={handleTotalItemsClick}
      />
      <StatCard
        label="الطلاب المتأثرين"
        value={stats.totalStudentsAffected}
        icon={Users}
        tone="success"
        hint="توزيع حسب الأقسام والمؤسسات"
        onClick={handleStudentsClick}
      />
    </div>
  );
};

export default MainStats;
