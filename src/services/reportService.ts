import jsPDF from 'jspdf';

interface Request {
  id: string;
  title: string;
  institutionType: string;
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
  requests: Request[];
}

export class ReportService {
  private static readonly REPORTS_KEY = 'monthlyReports';
  private static readonly LAST_CHECK_KEY = 'lastMonthlyCheck';

  static getDepartmentText(department: string): string {
    switch (department) {
      case 'materials': return 'المواد';
      case 'maintenance': return 'الصيانة';
      case 'academic-materials': return 'المواد الأكاديمية';
      case 'technology': return 'التكنولوجيا';
      case 'safety': return 'السلامة';
      default: return department;
    }
  }

  static getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'in-progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  }

  static getPriorityText(priority: string): string {
    switch (priority) {
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return priority;
    }
  }

  static getMonthName(monthIndex: number): string {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return months[monthIndex];
  }

  static checkAndGenerateMonthlyReport(requests: Request[], institutionName: string): { 
    updatedRequests: Request[], 
    newReport?: MonthlyReport 
  } {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const lastCheck = localStorage.getItem(`${this.LAST_CHECK_KEY}_${institutionName}`);
    const lastCheckDate = lastCheck ? new Date(lastCheck) : null;
    
    // Check if we need to generate a report (new month)
    const shouldGenerateReport = !lastCheckDate || 
      lastCheckDate.getMonth() !== currentMonth || 
      lastCheckDate.getFullYear() !== currentYear;

    if (!shouldGenerateReport) {
      return { updatedRequests: requests };
    }

    // Generate monthly report for last month
    const reportMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const reportYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Filter requests from the report month
    const monthlyRequests = requests.filter(request => {
      const requestDate = new Date(request.dateSubmitted);
      return requestDate.getMonth() === reportMonth && requestDate.getFullYear() === reportYear;
    });

    if (monthlyRequests.length > 0) {
      const report: MonthlyReport = {
        id: `${reportYear}-${reportMonth}-${institutionName}`,
        month: this.getMonthName(reportMonth),
        year: reportYear,
        generatedDate: now.toISOString(),
        totalRequests: monthlyRequests.length,
        completedRequests: monthlyRequests.filter(r => r.status === 'completed').length,
        pendingRequests: monthlyRequests.filter(r => r.status === 'pending').length,
        inProgressRequests: monthlyRequests.filter(r => r.status === 'in-progress').length,
        totalItems: monthlyRequests.reduce((sum, r) => sum + r.quantity, 0),
        totalStudentsAffected: monthlyRequests.reduce((sum, r) => sum + r.studentsAffected, 0),
        requests: monthlyRequests
      };

      // Save the report
      this.saveMonthlyReport(report, institutionName);
      
      // Generate PDF report
      this.generateMonthlyPDF(report, institutionName);
    }

    // Remove requests older than one month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const updatedRequests = requests.filter(request => {
      const requestDate = new Date(request.dateSubmitted);
      return requestDate >= oneMonthAgo;
    });

    // Update last check date
    localStorage.setItem(`${this.LAST_CHECK_KEY}_${institutionName}`, now.toISOString());

    return { 
      updatedRequests, 
      newReport: monthlyRequests.length > 0 ? {
        id: `${reportYear}-${reportMonth}-${institutionName}`,
        month: this.getMonthName(reportMonth),
        year: reportYear,
        generatedDate: now.toISOString(),
        totalRequests: monthlyRequests.length,
        completedRequests: monthlyRequests.filter(r => r.status === 'completed').length,
        pendingRequests: monthlyRequests.filter(r => r.status === 'pending').length,
        inProgressRequests: monthlyRequests.filter(r => r.status === 'in-progress').length,
        totalItems: monthlyRequests.reduce((sum, r) => sum + r.quantity, 0),
        totalStudentsAffected: monthlyRequests.reduce((sum, r) => sum + r.studentsAffected, 0),
        requests: monthlyRequests
      } : undefined
    };
  }

  static saveMonthlyReport(report: MonthlyReport, institutionName: string): void {
    const reportsKey = `${this.REPORTS_KEY}_${institutionName}`;
    const existingReports = JSON.parse(localStorage.getItem(reportsKey) || '[]');
    
    // Check if report already exists
    const existingIndex = existingReports.findIndex((r: MonthlyReport) => r.id === report.id);
    
    if (existingIndex >= 0) {
      existingReports[existingIndex] = report;
    } else {
      existingReports.push(report);
    }
    
    // Keep only last 12 months of reports
    existingReports.sort((a: MonthlyReport, b: MonthlyReport) => 
      new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime()
    );
    
    const reportsToKeep = existingReports.slice(0, 12);
    localStorage.setItem(reportsKey, JSON.stringify(reportsToKeep));
  }

  static getMonthlyReports(institutionName: string): MonthlyReport[] {
    const reportsKey = `${this.REPORTS_KEY}_${institutionName}`;
    return JSON.parse(localStorage.getItem(reportsKey) || '[]');
  }

  static generateMonthlyPDF(report: MonthlyReport, institutionName: string): void {
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFont('helvetica');
    pdf.setFontSize(20);
    pdf.text(`تقرير شهري - ${report.month} ${report.year}`, 20, 30);
    
    // Institution name
    pdf.setFontSize(16);
    pdf.text(institutionName, 20, 50);
    
    // Generation date
    pdf.setFontSize(12);
    pdf.text(`تاريخ إنشاء التقرير: ${new Date(report.generatedDate).toLocaleDateString('ar-EG')}`, 20, 70);
    
    // Summary statistics
    pdf.setFontSize(16);
    pdf.text('الإحصائيات الشهرية:', 20, 90);
    
    pdf.setFontSize(12);
    pdf.text(`إجمالي الطلبات: ${report.totalRequests}`, 20, 110);
    pdf.text(`الطلبات المكتملة: ${report.completedRequests}`, 20, 125);
    pdf.text(`قيد التنفيذ: ${report.inProgressRequests}`, 20, 140);
    pdf.text(`قيد الانتظار: ${report.pendingRequests}`, 20, 155);
    pdf.text(`إجمالي العناصر: ${report.totalItems}`, 20, 170);
    pdf.text(`الطلاب المتأثرين: ${report.totalStudentsAffected}`, 20, 185);
    
    // Completion rate
    const completionRate = report.totalRequests > 0 
      ? Math.round((report.completedRequests / report.totalRequests) * 100)
      : 0;
    pdf.text(`معدل الإنجاز: ${completionRate}%`, 20, 200);
    
    // Department breakdown
    const departmentStats = report.requests.reduce((acc, request) => {
      const dept = this.getDepartmentText(request.department);
      if (!acc[dept]) {
        acc[dept] = { count: 0, quantity: 0 };
      }
      acc[dept].count++;
      acc[dept].quantity += request.quantity;
      return acc;
    }, {} as Record<string, any>);
    
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
    
    // Detailed requests
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
