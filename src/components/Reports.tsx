import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import {
  FileText, Download, Archive, FileSpreadsheet, AlertTriangle,
  TrendingUp, Package, Users, Target,
} from "lucide-react";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";
import MonthlyReportsModal from "./MonthlyReportsModal";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
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

// Semantic color tokens (via CSS vars)
const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  danger: "hsl(var(--danger))",
  info: "hsl(var(--info))",
  tertiary: "hsl(var(--tertiary))",
};

const PRIORITY_COLOR_CYCLE = [
  CHART_COLORS.danger,
  CHART_COLORS.warning,
  CHART_COLORS.success,
  CHART_COLORS.info,
  CHART_COLORS.tertiary,
];

const csvEscape = (v: unknown): string => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const Reports = ({ requests }: ReportsProps) => {
  const { toast } = useToast();
  const [showMonthlyReports, setShowMonthlyReports] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const { getLabel: getDeptLabel } = useDepartments();
  const getDepartmentText = (department: string) =>
    getDeptLabel(department).replace(/^قسم\s*/, "");

  const getStatusText = (status: string) =>
    getStatusLabel(status).replace(/^[^\s]+\s/, "");

  const { getLabel: getPriorityLabel, isHighPriority } = usePriorities();
  const getPriorityText = (priority: string) => getPriorityLabel(priority);

  const generatePDF = async () => {
    setGeneratingPdf(true);
    try {
      const pdf = new jsPDF();
      await setupArabicFont(pdf);

      pdf.setFontSize(20);
      pdf.text("تقرير نظام إدارة المدرسة", 190, 30, { align: "right" });

      pdf.setFontSize(12);
      pdf.text(`تاريخ التوليد: ${new Date().toLocaleDateString("en-GB")}`, 190, 50, { align: "right" });

      pdf.setFontSize(16);
      pdf.text("الإحصائيات الملخصة:", 190, 70, { align: "right" });

      pdf.setFontSize(12);
      pdf.text(`إجمالي الطلبات: ${requests.length}`, 190, 90, { align: "right" });
      pdf.text(`المكتمل: ${requests.filter((r) => r.status === "completed").length}`, 190, 105, { align: "right" });
      pdf.text(`قيد التنفيذ: ${requests.filter((r) => r.status === "in-progress").length}`, 190, 120, { align: "right" });
      pdf.text(`قيد الانتظار: ${requests.filter((r) => r.status === "pending").length}`, 190, 135, { align: "right" });
      pdf.text(`إجمالي العناصر: ${requests.reduce((s, r) => s + r.quantity, 0)}`, 190, 150, { align: "right" });
      pdf.text(`الطلاب المتأثرون: ${requests.reduce((s, r) => s + r.studentsAffected, 0)}`, 190, 165, { align: "right" });

      pdf.setFontSize(16);
      pdf.text("تفاصيل الطلبات:", 190, 190, { align: "right" });

      let yPosition = 210;
      pdf.setFontSize(10);

      requests.slice(0, 10).forEach((request, index) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 30;
        }
        pdf.text(`${index + 1}. ${request.title}`, 190, yPosition, { align: "right" });
        pdf.text(`الحالة: ${getStatusText(request.status)}`, 185, yPosition + 10, { align: "right" });
        pdf.text(`القسم: ${getDepartmentText(request.department)}`, 185, yPosition + 20, { align: "right" });
        pdf.text(`الكمية: ${request.quantity} ${request.unitType}`, 185, yPosition + 30, { align: "right" });
        yPosition += 45;
      });

      pdf.save("تقرير-إدارة-المدرسة.pdf");
      toast({ title: "تم إنشاء التقرير", description: "تم تحميل تقرير PDF بنجاح" });
    } catch (err: any) {
      toast({
        title: "فشل إنشاء التقرير",
        description: err?.message ?? "حدث خطأ أثناء توليد PDF",
        variant: "destructive",
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const exportCSV = () => {
    try {
      const headers = [
        "#",
        "العنوان",
        "القسم",
        "الأولوية",
        "الحالة",
        "الكمية",
        "الوحدة",
        "الطلاب المتأثرون",
        "تاريخ التقديم",
      ];
      const rows = requests.map((r, i) => [
        i + 1,
        r.title,
        getDepartmentText(r.department),
        getPriorityText(r.priority),
        getStatusText(r.status),
        r.quantity,
        r.unitType,
        r.studentsAffected,
        new Date(r.dateSubmitted).toLocaleDateString("en-GB"),
      ]);
      const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `طلبات-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "تم التصدير", description: `تم تصدير ${requests.length} طلب إلى CSV` });
    } catch (err: any) {
      toast({
        title: "فشل التصدير",
        description: err?.message ?? "حدث خطأ أثناء توليد CSV",
        variant: "destructive",
      });
    }
  };

  // Department statistics
  const departmentStats = useMemo(() => {
    const acc = requests.reduce((map, request) => {
      const deptName = getDepartmentText(request.department);
      if (!map[deptName]) map[deptName] = { count: 0, quantity: 0, students: 0 };
      map[deptName].count++;
      map[deptName].quantity += request.quantity;
      map[deptName].students += request.studentsAffected;
      return map;
    }, {} as Record<string, { count: number; quantity: number; students: number }>);
    return Object.entries(acc).map(([name, data]) => ({
      name,
      requests: data.count,
      quantity: data.quantity,
      students: data.students,
    }));
  }, [requests, getDepartmentText]);

  // Priority distribution
  const priorityData = useMemo(() => {
    const acc = requests.reduce((map, request) => {
      const name = getPriorityText(request.priority);
      map[name] = (map[name] || 0) + 1;
      return map;
    }, {} as Record<string, number>);
    return Object.entries(acc).map(([name, value]) => ({ name, value }));
  }, [requests, getPriorityText]);

  // Monthly trends with completion rate (last 6 months)
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString("ar-EG", { month: "short" });
      const monthRequests = requests.filter((r) => {
        const d = new Date(r.dateSubmitted);
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      });
      const completed = monthRequests.filter((r) => r.status === "completed").length;
      const completionRate = monthRequests.length > 0
        ? Math.round((completed / monthRequests.length) * 100)
        : 0;
      return {
        month: monthName,
        requests: monthRequests.length,
        completed,
        completionRate,
      };
    }).reverse();
  }, [requests]);

  const completionRate = requests.length > 0
    ? Math.round((requests.filter((r) => r.status === "completed").length / requests.length) * 100)
    : 0;

  const urgentRequests = useMemo(
    () => requests.filter((r) => isHighPriority(r.priority) && r.status !== "completed").slice(0, 5),
    [requests, isHighPriority],
  );

  const totalQuantity = requests.reduce((s, r) => s + r.quantity, 0);
  const totalStudents = requests.reduce((s, r) => s + r.studentsAffected, 0);

  const headerActions = (
    <div className="flex flex-wrap gap-2">
      <Button onClick={generatePDF} disabled={generatingPdf}>
        <Download className="size-4 me-1.5" />
        {generatingPdf ? "جاري الإنشاء..." : "تحميل PDF"}
      </Button>
      <Button onClick={exportCSV} variant="outline" disabled={requests.length === 0}>
        <FileSpreadsheet className="size-4 me-1.5" />
        تصدير CSV
      </Button>
      <Button onClick={() => setShowMonthlyReports(true)} variant="outline">
        <Archive className="size-4 me-1.5" />
        الأرشيف الشهري
      </Button>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="التقارير"
        description="تحليل شامل لطلباتك — ملخصات، مخططات، تصدير"
        actions={headerActions}
      />

      <div className="space-y-6">
        {/* Key Metrics */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="إجمالي الطلبات"
            value={requests.length.toLocaleString("en-US")}
            icon={FileText}
            tone="primary"
          />
          <StatCard
            label="معدل الإنجاز"
            value={`${completionRate}%`}
            icon={Target}
            tone={completionRate >= 70 ? "success" : completionRate >= 40 ? "warning" : "danger"}
          />
          <StatCard
            label="إجمالي العناصر"
            value={totalQuantity.toLocaleString("en-US")}
            icon={Package}
            tone="warning"
          />
          <StatCard
            label="الطلاب المتأثرون"
            value={totalStudents.toLocaleString("en-US")}
            icon={Users}
            tone="tertiary"
          />
        </section>

        {/* Charts Row */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">الطلبات حسب القسم</CardTitle>
              <CardDescription>توزيع الطلبات والكميات على الأقسام</CardDescription>
            </CardHeader>
            <CardContent>
              {departmentStats.length === 0 ? (
                <EmptyState icon={FileText} title="لا توجد طلبات" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={departmentStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="requests" fill={CHART_COLORS.primary} name="الطلبات" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="quantity" fill={CHART_COLORS.info} name="الكمية" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">توزيع الأولويات</CardTitle>
              <CardDescription>تصنيف الطلبات حسب مستوى الأولوية</CardDescription>
            </CardHeader>
            <CardContent>
              {priorityData.length === 0 ? (
                <EmptyState icon={FileText} title="لا توجد طلبات" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={90}
                      dataKey="value"
                    >
                      {priorityData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PRIORITY_COLOR_CYCLE[index % PRIORITY_COLOR_CYCLE.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Monthly trend with completion rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-5 text-primary" />
              الاتجاهات الشهرية + معدل الإنجاز
            </CardTitle>
            <CardDescription>
              مقارنة عدد الطلبات (عمود) ومعدل الإنجاز % (خط) على مدار 6 أشهر
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} unit="%" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="requests" fill={CHART_COLORS.primary} name="إجمالي الطلبات" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="left" dataKey="completed" fill={CHART_COLORS.success} name="المكتملة" radius={[6, 6, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="completionRate"
                  stroke={CHART_COLORS.danger}
                  strokeWidth={2}
                  name="معدل الإنجاز %"
                  dot={{ fill: CHART_COLORS.danger, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Urgent Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-5 text-danger" />
              طلبات عاجلة تحتاج متابعة
            </CardTitle>
            <CardDescription>أعلى 5 طلبات عالية الأولوية غير مكتملة</CardDescription>
          </CardHeader>
          <CardContent>
            {urgentRequests.length === 0 ? (
              <EmptyState icon={Target} title="لا توجد طلبات عاجلة" description="كل الطلبات العاجلة مكتملة" />
            ) : (
              <div className="space-y-3">
                {urgentRequests.map((request) => (
                  <div key={request.id} className="border-s-4 border-danger ps-4">
                    <div className="text-sm font-medium">{request.title}</div>
                    <div className="text-xs text-muted-foreground">{request.location}</div>
                    <div className="text-xs text-muted-foreground">
                      {request.quantity} {request.unitType} · {request.studentsAffected} طالب متأثر
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">توصيات ورؤى</CardTitle>
            <CardDescription>تحليل سريع بناءً على بياناتك الحالية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 text-sm font-semibold">ملخص الكميات حسب الفئة</h4>
                <div className="space-y-2">
                  {Object.entries(
                    requests.reduce((acc, r) => {
                      if (!acc[r.subcategory]) acc[r.subcategory] = { total: 0, unit: r.unitType };
                      acc[r.subcategory].total += r.quantity;
                      return acc;
                    }, {} as Record<string, { total: number; unit: string }>),
                  ).map(([sub, data]) => (
                    <div key={sub} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{sub}:</span>
                      <span className="font-medium tabular-nums">
                        {data.total} {data.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold">توصيات</h4>
                <ul className="space-y-2 text-sm">
                  {urgentRequests.length > 0 && (
                    <li className="text-danger">• معالجة {urgentRequests.length} طلبات عاجلة فوراً</li>
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
      </div>

      <MonthlyReportsModal
        isOpen={showMonthlyReports}
        onClose={() => setShowMonthlyReports(false)}
      />
    </div>
  );
};

export default Reports;
