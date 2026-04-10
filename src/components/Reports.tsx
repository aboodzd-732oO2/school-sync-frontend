
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { useToast } from "@/hooks/use-toast";
import MonthlyReportsModal from "./MonthlyReportsModal";

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

  const getDepartmentText = (department: string) => {
    switch (department) {
      case 'materials': return 'المواد';
      case 'maintenance': return 'الصيانة';
      case 'academic-materials': return 'المواد الأكاديمية';
      case 'technology': return 'التكنولوجيا';
      case 'safety': return 'السلامة';
      default: return department;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'in-progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return priority;
    }
  };

  const generatePDF = () => {
    const pdf = new jsPDF();
    
    // Add Arabic font support (Note: This is a basic implementation)
    pdf.setFont('helvetica');
    
    // Title
    pdf.setFontSize(20);
    pdf.text('School Management System Report', 20, 30);
    
    // Date
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 50);
    
    // Summary
    pdf.setFontSize(16);
    pdf.text('Summary Statistics:', 20, 70);
    
    pdf.setFontSize(12);
    pdf.text(`Total Requests: ${requests.length}`, 20, 90);
    pdf.text(`Completed: ${requests.filter(r => r.status === 'completed').length}`, 20, 105);
    pdf.text(`In Progress: ${requests.filter(r => r.status === 'in-progress').length}`, 20, 120);
    pdf.text(`Pending: ${requests.filter(r => r.status === 'pending').length}`, 20, 135);
    pdf.text(`Total Items: ${requests.reduce((sum, r) => sum + r.quantity, 0)}`, 20, 150);
    pdf.text(`Students Affected: ${requests.reduce((sum, r) => sum + r.studentsAffected, 0)}`, 20, 165);
    
    // Request details
    pdf.setFontSize(16);
    pdf.text('Request Details:', 20, 190);
    
    let yPosition = 210;
    pdf.setFontSize(10);
    
    requests.slice(0, 10).forEach((request, index) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.text(`${index + 1}. ${request.title}`, 20, yPosition);
      pdf.text(`   Status: ${getStatusText(request.status)}`, 25, yPosition + 10);
      pdf.text(`   Department: ${getDepartmentText(request.department)}`, 25, yPosition + 20);
      pdf.text(`   Quantity: ${request.quantity} ${request.unitType}`, 25, yPosition + 30);
      
      yPosition += 45;
    });
    
    pdf.save('school-management-report.pdf');
    
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
    r.priority === 'high' && r.status !== 'completed'
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
        <h1 className="text-3xl font-bold text-gray-900">تقارير نظام إدارة المدرسة</h1>
        <p className="text-gray-600 mt-2">تحليل شامل لطلبات الصيانة والمواد</p>
        <div className="flex justify-center space-x-4 space-x-reverse mt-4">
          <Button onClick={generatePDF}>
            <FileText className="h-4 w-4 ml-2" />
            تحميل التقرير الحالي
          </Button>
          <Button 
            onClick={() => setShowMonthlyReports(true)}
            variant="outline"
          >
            <FileText className="h-4 w-4 ml-2" />
            التقارير الشهرية المؤرشفة
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{requests.length}</div>
            <div className="text-sm text-gray-600">إجمالي الطلبات</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
            <div className="text-sm text-gray-600">معدل الإنجاز</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {requests.reduce((sum, r) => sum + r.quantity, 0)}
            </div>
            <div className="text-sm text-gray-600">إجمالي العناصر</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {requests.reduce((sum, r) => sum + r.studentsAffected, 0)}
            </div>
            <div className="text-sm text-gray-600">الطلاب المتأثرين</div>
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
              <p className="text-gray-500 text-center py-4">لا توجد طلبات عاجلة</p>
            ) : (
              urgentRequests.map((request) => (
                <div key={request.id} className="border-l-4 border-red-500 pl-4">
                  <div className="font-medium text-sm">{request.title}</div>
                  <div className="text-xs text-gray-500">{request.location}</div>
                  <div className="text-xs text-gray-500">
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
                  <li className="text-red-600">• معالجة {urgentRequests.length} طلبات عالية الأولوية فوراً</li>
                )}
                {completionRate < 70 && (
                  <li className="text-blue-600">• تحسين معدل الإنجاز (حالياً {completionRate}%)</li>
                )}
                <li className="text-green-600">• تطوير خطة صيانة وقائية للمناطق عالية الطلب</li>
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
