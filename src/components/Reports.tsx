
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { useToast } from "@/hooks/use-toast";
import MonthlyReportsModal from "./MonthlyReportsModal";
import { usePriorities, useDepartments } from "@/hooks/useLookups";
import { getStatusLabel } from "@/lib/statusConfig";
import { setupArabicFont } from "@/services/reportService";

interface Request {
  id: string;
  title: string;
  department: string;
  subcategory: string;
  priority: string;
  status: string;
  location: string;
  dateSubmitted: string;
  routedTo: string;
  description: string;
  impact: string;
  quantity: number;
  studentsAffected: number;
  unitType: string;
}

interface ReportsProps {
  requests: Request[];
}

const Reports = ({ requests }: ReportsProps) => {
  const { toast } = useToast();
  const [showMonthlyReports, setShowMonthlyReports] = useState(false);

  const { getLabel: getDeptLabel } = useDepartments();
  const getDepartmentText = (department: string) =>
    getDeptLabel(department).replace(/^قسم\s*/, '');

  const getStatusText = (status: string) =>
    getStatusLabel(status).replace(/^[^\s]+\s/, '');

  const { getLabel: getPriorityLabel, isHighPriority } = usePriorities();
  const getPriorityText = (priority: string) => getPriorityLabel(priority);

  const generatePDF = async () => {
    const pdf = new jsPDF();
    await setupArabicFont(pdf);

    pdf.setFontSize(20);
    pdf.text('تقرير نظام إدارة المدرسة', 190, 30, { align: 'right' });

    pdf.setFontSize(12);
    pdf.text(`تاريخ التوليد: ${new Date().toLocaleDateString('ar-EG')}`, 190, 50, { align: 'right' });

    pdf.setFontSize(16);
    pdf.text('الإحصائيات الملخصة:', 190, 70, { align: 'right' });

    pdf.setFontSize(12);
    pdf.text(`إجمالي الطلبات: ${requests.length}`, 190, 90, { align: 'right' });
    pdf.text(`المكتمل: ${requests.filter(r => r.status === 'completed').length}`, 190, 105, { align: 'right' });
    pdf.text(`قيد التنفيذ: ${requests.filter(r => r.status === 'in-progress').length}`, 190, 120, { align: 'right' });
    pdf.text(`قيد الانتظار: ${requests.filter(r => r.status === 'pending').length}`, 190, 135, { align: 'right' });
    pdf.text(`إجمالي العناصر: ${requests.reduce((sum, r) => sum + r.quantity, 0)}`, 190, 150, { align: 'right' });
    pdf.text(`الطلاب المتأثرون: ${requests.reduce((sum, r) => sum + r.studentsAffected, 0)}`, 190, 165, { align: 'right' });

    pdf.setFontSize(16);
    pdf.text('تفاصيل الطلبات:', 190, 190, { align: 'right' });

    let yPosition = 210;
    pdf.setFontSize(10);

    requests.slice(0, 10).forEach((request, index) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 30;
      }
      pdf.text(`${index + 1}. ${request.title}`, 190, yPosition, { align: 'right' });
      pdf.text(`الحالة: ${getStatusText(request.status)}`, 185, yPosition + 10, { align: 'right' });
      pdf.text(`القسم: ${getDepartmentText(request.department)}`, 185, yPosition + 20, { align: 'right' });
      pdf.text(`الكمية: ${request.quantity} ${request.unitType}`, 185, yPosition + 30, { align: 'right' });
      yPosition += 45;
    });

    pdf.save('تقرير-إدارة-المدرسة.pdf');
    
    toast({
      title: "تم إنشاء التقرير",
      description: "تم تحميل تقرير PDF بنجاح",
    });
  };

  // Department statistics
  const departmentStats = Object.entries(
    requests.reduce((acc, request) => {
      const deptName = getDepartmentText(request.department);
      if (!acc[deptName]) {
        acc[deptName] = { count: 0, quantity: 0, students: 0 };
      }
      acc[deptName].count++;
      acc[deptName].quantity += request.quantity;
      acc[deptName].students += request.studentsAffected;
      return acc;
    }, {} as Record<string, any>)
  ).map(([name, data]) => ({
    name,
    requests: data.count,
    quantity: data.quantity,
    students: data.students
  }));

  // Priority distribution  
  const priorityData = Object.entries(
    requests.reduce((acc, request) => {
      const priorityText = getPriorityText(request.priority);
      acc[priorityText] = (acc[priorityText] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Monthly trends (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleDateString('ar-EG', { month: 'long' });
    const monthRequests = requests.filter(r => {
      const requestDate = new Date(r.dateSubmitted);
      return requestDate.getMonth() === date.getMonth() && 
             requestDate.getFullYear() === date.getFullYear();
    }).length;
    return { month: monthName, requests: monthRequests };
  }).reverse();

  // Calculate completion rate
  const completionRate = requests.length > 0 
    ? Math.round((requests.filter(r => r.status === 'completed').length / requests.length) * 100)
    : 0;

  // High priority items that need attention
  const urgentRequests = requests.filter(r =>
    isHighPriority(r.priority) && r.status !== 'completed'
  ).slice(0, 5);

  // Get institution name from localStorage
  const getCurrentInstitution = () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return user.institutionName;
    }
    return 'مؤسسة غير محددة';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">تقارير نظام إدارة المدرسة</h1>
        <p className="text-muted-foreground mt-2">تحليل شامل لطلبات الصيانة والمواد</p>
        <div className="flex justify-center space-x-4 space-x-reverse mt-4">
          <Button onClick={generatePDF}>
            <FileText className="h-4 w-4 me-2" />
            تحميل التقرير الحالي
          </Button>
          <Button 
            onClick={() => setShowMonthlyReports(true)}
            variant="outline"
          >
            <FileText className="h-4 w-4 me-2" />
            التقارير الشهرية المؤرشفة
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-info">{requests.length}</div>
            <div className="text-sm text-muted-foreground">إجمالي الطلبات</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-success">{completionRate}%</div>
            <div className="text-sm text-muted-foreground">معدل الإنجاز</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-warning-foreground">
              {requests.reduce((sum, r) => sum + r.quantity, 0)}
            </div>
            <div className="text-sm text-muted-foreground">إجمالي العناصر</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-tertiary">
              {requests.reduce((sum, r) => sum + r.studentsAffected, 0)}
            </div>
            <div className="text-sm text-muted-foreground">الطلاب المتأثرين</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>الطلبات حسب القسم</CardTitle>
            <CardDescription>توزيع الطلبات والكميات عبر الأقسام المختلفة</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="requests" fill="#8884d8" name="الطلبات" />
                <Bar dataKey="quantity" fill="#82ca9d" name="الكمية" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع الأولويات</CardTitle>
            <CardDescription>تصنيف الطلبات حسب مستوى الأولوية</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>الاتجاهات الشهرية</CardTitle>
          <CardDescription>عدد الطلبات المقدمة على مدى الأشهر الستة الماضية</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="requests" fill="#8884d8" name="الطلبات" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Urgent Requests */}
      <Card>
        <CardHeader>
          <CardTitle>الطلبات العاجلة</CardTitle>
          <CardDescription>طلبات عالية الأولوية تحتاج انتباه فوري</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {urgentRequests.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">لا توجد طلبات عاجلة</p>
            ) : (
              urgentRequests.map((request) => (
                <div key={request.id} className="border-e-4 border-danger pe-4">
                  <div className="font-medium text-sm">{request.title}</div>
                  <div className="text-xs text-muted-foreground">{request.location}</div>
                  <div className="text-xs text-muted-foreground">
                    {request.quantity} {request.unitType} • {request.studentsAffected} طالب متأثر
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>التوصيات والرؤى</CardTitle>
          <CardDescription>تحليل وتوصيات بناءً على البيانات الحالية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">ملخص الكميات حسب الفئة</h4>
              <div className="space-y-2">
                {Object.entries(
                  requests.reduce((acc, request) => {
                    if (!acc[request.subcategory]) {
                      acc[request.subcategory] = { total: 0, unit: request.unitType };
                    }
                    acc[request.subcategory].total += request.quantity;
                    return acc;
                  }, {} as Record<string, any>)
                ).map(([subcategory, data]) => (
                  <div key={subcategory} className="flex justify-between text-sm">
                    <span>{subcategory}:</span>
                    <span className="font-medium">{data.total} {data.unit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">التوصيات</h4>
              <ul className="space-y-2 text-sm">
                {urgentRequests.length > 0 && (
                  <li className="text-danger">• معالجة {urgentRequests.length} طلبات عالية الأولوية فوراً</li>
                )}
                {completionRate < 70 && (
                  <li className="text-info">• تحسين معدل الإنجاز (حالياً {completionRate}%)</li>
                )}
                <li className="text-success">• تطوير خطة صيانة وقائية للمناطق عالية الطلب</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <MonthlyReportsModal 
        isOpen={showMonthlyReports}
        onClose={() => setShowMonthlyReports(false)}
        institutionName={getCurrentInstitution()}
      />
    </div>
  );
};

export default Reports;
