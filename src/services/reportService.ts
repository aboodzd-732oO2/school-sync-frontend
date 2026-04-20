import jsPDF from 'jspdf';
import { lookup } from './api';
import { getStatusLabel } from '@/lib/statusConfig';

let _amiriBase64: string | null = null;

async function loadAmiriFont(): Promise<string> {
  if (_amiriBase64) return _amiriBase64;
  const res = await fetch('/fonts/Amiri-Regular.ttf');
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  _amiriBase64 = btoa(binary);
  return _amiriBase64;
}

export async function setupArabicFont(pdf: jsPDF): Promise<void> {
  try {
    const base64 = await loadAmiriFont();
    pdf.addFileToVFS('Amiri-Regular.ttf', base64);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setR2L(true);
  } catch {
    pdf.setFont('helvetica');
  }
}

interface MonthlyReport {
  id: string;
  month: string;
  year: number;
  generatedDate: string;
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  totalItems: number;
  totalStudentsAffected: number;
  requests: Array<{
    id: string;
    title: string;
    department: string;
    priority: string;
    status: string;
    dateSubmitted: string;
    quantity: number;
    studentsAffected: number;
    unitType: string;
  }>;
}

export class ReportService {
  private static departmentCache: Record<string, string> = {};
  private static priorityCache: Record<string, string> = {};

  static async loadCaches(): Promise<void> {
    try {
      const [depts, pris] = await Promise.all([
        lookup.departments(),
        lookup.priorities(),
      ]);
      this.departmentCache = {};
      (depts as any[]).forEach(d => { this.departmentCache[d.key] = d.labelAr.replace(/^قسم\s*/, ''); });
      this.priorityCache = {};
      (pris as any[]).forEach(p => { this.priorityCache[p.key] = p.labelAr; });
    } catch {}
  }

  static getDepartmentText(department: string): string {
    return this.departmentCache[department] || department;
  }

  static getStatusText(status: string): string {
    return getStatusLabel(status).replace(/^[^\s]+\s/, '');
  }

  static getPriorityText(priority: string): string {
    return this.priorityCache[priority] || priority;
  }

  static getMonthName(monthIndex: number): string {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return months[monthIndex];
  }

  static async generateMonthlyPDF(report: MonthlyReport, institutionName: string): Promise<void> {
    await this.loadCaches();
    const pdf = new jsPDF();

    await setupArabicFont(pdf);
    pdf.setFontSize(20);
    pdf.text(`تقرير شهري - ${report.month} ${report.year}`, 20, 30);

    pdf.setFontSize(16);
    pdf.text(institutionName, 20, 50);

    pdf.setFontSize(12);
    pdf.text(`تاريخ إنشاء التقرير: ${new Date(report.generatedDate).toLocaleDateString('ar-EG')}`, 20, 70);

    pdf.setFontSize(16);
    pdf.text('الإحصائيات الشهرية:', 20, 90);

    pdf.setFontSize(12);
    pdf.text(`إجمالي الطلبات: ${report.totalRequests}`, 20, 110);
    pdf.text(`الطلبات المكتملة: ${report.completedRequests}`, 20, 125);
    pdf.text(`قيد التنفيذ: ${report.inProgressRequests}`, 20, 140);
    pdf.text(`قيد الانتظار: ${report.pendingRequests}`, 20, 155);
    pdf.text(`إجمالي العناصر: ${report.totalItems}`, 20, 170);
    pdf.text(`الطلاب المتأثرين: ${report.totalStudentsAffected}`, 20, 185);

    const completionRate = report.totalRequests > 0
      ? Math.round((report.completedRequests / report.totalRequests) * 100)
      : 0;
    pdf.text(`معدل الإنجاز: ${completionRate}%`, 20, 200);

    const departmentStats = report.requests.reduce((acc, request) => {
      const dept = this.getDepartmentText(request.department);
      if (!acc[dept]) acc[dept] = { count: 0, quantity: 0 };
      acc[dept].count++;
      acc[dept].quantity += request.quantity;
      return acc;
    }, {} as Record<string, { count: number; quantity: number }>);

    pdf.setFontSize(16);
    pdf.text('التوزيع حسب الأقسام:', 20, 220);

    let yPos = 240;
    pdf.setFontSize(10);
    Object.entries(departmentStats).forEach(([dept, stats]) => {
      if (yPos > 270) {
        pdf.addPage();
        yPos = 30;
      }
      pdf.text(`${dept}: ${stats.count} طلب، ${stats.quantity} عنصر`, 20, yPos);
      yPos += 15;
    });

    if (report.requests.length > 0) {
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('تفاصيل الطلبات:', 20, 30);

      yPos = 50;
      pdf.setFontSize(10);

      report.requests.forEach((request, index) => {
        if (yPos > 260) {
          pdf.addPage();
          yPos = 30;
        }
        pdf.text(`${index + 1}. ${request.title}`, 20, yPos);
        pdf.text(`   الحالة: ${this.getStatusText(request.status)}`, 25, yPos + 10);
        pdf.text(`   القسم: ${this.getDepartmentText(request.department)}`, 25, yPos + 20);
        pdf.text(`   الكمية: ${request.quantity} ${request.unitType}`, 25, yPos + 30);
        pdf.text(`   الطلاب المتأثرين: ${request.studentsAffected}`, 25, yPos + 40);
        pdf.text(`   التاريخ: ${new Date(request.dateSubmitted).toLocaleDateString('ar-EG')}`, 25, yPos + 50);
        yPos += 65;
      });
    }

    const fileName = `تقرير-شهري-${report.month}-${report.year}-${institutionName}.pdf`;
    pdf.save(fileName);
  }
}
