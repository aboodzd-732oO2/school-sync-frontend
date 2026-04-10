
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, FileText, TrendingUp, Users, Package } from "lucide-react";
import { reports as reportsApi } from "@/services/api";
import { ReportService } from "@/services/reportService";

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
  requests: any[];
}

interface MonthlyReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionName: string;
}

const monthNames = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const MonthlyReportsModal = ({ isOpen, onClose, institutionName }: MonthlyReportsModalProps) => {
  const [reports, setReports] = useState<MonthlyReport[]>([]);

  useEffect(() => {
    if (isOpen) {
      reportsApi.list().then((data: any[]) => {
        setReports(data.map(r => ({
          ...r,
          id: String(r.id),
          month: monthNames[r.month] || String(r.month),
          requests: [],
        })));
      }).catch(() => {});
    }
  }, [isOpen]);

  const handleDownloadReport = (report: MonthlyReport) => {
    ReportService.generateMonthlyPDF(report, institutionName);
  };

  const getCompletionRate = (report: MonthlyReport) => {
    return report.totalRequests > 0 
      ? Math.round((report.completedRequests / report.totalRequests) * 100)
      : 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center space-x-2 space-x-reverse">
            <FileText className="h-6 w-6" />
            <span>التقارير الشهرية المؤرشفة</span>
          </DialogTitle>
          <DialogDescription>
            عرض التقارير التلقائية التي تم إنشاؤها شهرياً لمؤسسة {institutionName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد تقارير شهرية بعد</p>
              <p className="text-sm text-gray-400 mt-2">
                سيتم إنشاء التقارير تلقائياً في بداية كل شهر
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((report) => (
                  <Card key={report.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-lg">
                        <span>{report.month} {report.year}</span>
                        <Badge variant="outline" className="text-xs">
                          {getCompletionRate(report)}% مكتمل
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-500 space-x-1 space-x-reverse">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(report.generatedDate).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span>{report.totalRequests} طلب</span>
                        </div>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Package className="h-4 w-4 text-green-500" />
                          <span>{report.totalItems} عنصر</span>
                        </div>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Users className="h-4 w-4 text-purple-500" />
                          <span>{report.totalStudentsAffected} طالب</span>
                        </div>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <TrendingUp className="h-4 w-4 text-orange-500" />
                          <span>{report.completedRequests} مكتمل</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>مكتمل:</span>
                          <span className="text-green-600">{report.completedRequests}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>قيد التنفيذ:</span>
                          <span className="text-blue-600">{report.inProgressRequests}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>قيد الانتظار:</span>
                          <span className="text-yellow-600">{report.pendingRequests}</span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => handleDownloadReport(report)}
                        className="w-full mt-4"
                        size="sm"
                      >
                        <Download className="h-4 w-4 ml-2" />
                        تحميل التقرير
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MonthlyReportsModal;
