import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Calendar, Download, FileText, TrendingUp, Users, Package, CalendarRange,
  AlertCircle, Filter,
} from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useToast } from "@/hooks/use-toast";
import { reports as reportsApi } from "@/services/api";
import { ReportService } from "@/services/reportService";

interface MonthlyReport {
  id: number;
  month: number;
  year: number;
  generatedDate: string;
  institutionName: string;
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  totalItems: number;
  totalStudentsAffected: number;
}

interface MonthlyReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MONTH_NAMES = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const MonthlyReportsModal = ({ isOpen, onClose }: MonthlyReportsModalProps) => {
  const { toast } = useToast();
  const [reports, setReports] = useState<MonthlyReport[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setReports(null);
    setError(null);

    const params: Record<string, string> = {};
    if (yearFilter !== "all") params.year = yearFilter;
    if (monthFilter !== "all") params.month = monthFilter;

    reportsApi
      .list(params)
      .then((data: any[]) => {
        if (cancelled) return;
        setReports(data.map((r) => ({ ...r, id: Number(r.id) })));
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "فشل تحميل التقارير");
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, yearFilter, monthFilter]);

  // Derive list of years from loaded reports (for filter dropdown)
  const years = useMemo(() => {
    if (!reports) return [] as number[];
    return Array.from(new Set(reports.map((r) => r.year))).sort((a, b) => b - a);
  }, [reports]);

  const handleDownload = async (report: MonthlyReport) => {
    setDownloadingId(report.id);
    try {
      const reportForPdf = {
        ...report,
        id: String(report.id),
        month: MONTH_NAMES[report.month] || String(report.month),
        requests: [],
      };
      await ReportService.generateMonthlyPDF(reportForPdf as any, report.institutionName);
      toast({ title: "تم التحميل", description: "تم توليد PDF بنجاح" });
    } catch (err: any) {
      toast({
        title: "فشل التحميل",
        description: err?.message ?? "حدث خطأ أثناء توليد PDF",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const getCompletionRate = (report: MonthlyReport) =>
    report.totalRequests > 0
      ? Math.round((report.completedRequests / report.totalRequests) * 100)
      : 0;

  const hasFilters = yearFilter !== "all" || monthFilter !== "all";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CalendarRange className="size-5 text-primary" />
            التقارير الشهرية المؤرشفة
          </DialogTitle>
          <DialogDescription>
            كل التقارير الشهرية التي تم توليدها لمؤسستك
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-32 bg-card">
                <SelectValue placeholder="السنة" />
              </SelectTrigger>
              <SelectContent className="bg-card border shadow-lg z-50">
                <SelectItem value="all">كل السنوات</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-36 bg-card">
                <SelectValue placeholder="الشهر" />
              </SelectTrigger>
              <SelectContent className="bg-card border shadow-lg z-50">
                <SelectItem value="all">كل الأشهر</SelectItem>
                {MONTH_NAMES.map((name, idx) => (
                  <SelectItem key={idx} value={String(idx)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasFilters && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setYearFilter("all");
                setMonthFilter("all");
              }}
            >
              مسح الفلاتر
            </Button>
          )}
        </div>

        <div className="mt-4">
          {error ? (
            <EmptyState icon={AlertCircle} title="تعذر تحميل التقارير" description={error} />
          ) : reports === null ? (
            <LoadingSkeleton variant="cards" rows={3} />
          ) : reports.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={hasFilters ? "لا توجد تقارير بالفلاتر المحددة" : "لا توجد تقارير شهرية بعد"}
              description={hasFilters
                ? "جرّب تغيير أو مسح الفلاتر"
                : "سيتم إنشاء التقارير تلقائياً في بداية كل شهر"}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report) => {
                const completion = getCompletionRate(report);
                return (
                  <Card key={report.id} className="transition-shadow hover:shadow-md">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-base">
                        <span>
                          {MONTH_NAMES[report.month] ?? report.month} {report.year}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            completion >= 70
                              ? "bg-success/15 text-success border-success/30"
                              : completion >= 40
                                ? "bg-warning/15 text-warning-foreground border-warning/30"
                                : "bg-danger/15 text-danger border-danger/30"
                          }
                        >
                          {completion}% مكتمل
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="size-3.5" />
                        <span className="tabular-nums">
                          {new Date(report.generatedDate).toLocaleDateString("en-GB")}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-1.5">
                          <FileText className="size-4 text-info" />
                          <span className="tabular-nums">{report.totalRequests} طلب</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Package className="size-4 text-primary" />
                          <span className="tabular-nums">{report.totalItems} عنصر</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="size-4 text-tertiary" />
                          <span className="tabular-nums">{report.totalStudentsAffected} طالب</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="size-4 text-success" />
                          <span className="tabular-nums">{report.completedRequests} مكتمل</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">مكتمل:</span>
                          <span className="tabular-nums font-medium text-success">{report.completedRequests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">قيد التنفيذ:</span>
                          <span className="tabular-nums font-medium text-info">{report.inProgressRequests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">قيد الانتظار:</span>
                          <span className="tabular-nums font-medium text-warning-foreground">{report.pendingRequests}</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleDownload(report)}
                        disabled={downloadingId === report.id}
                        className="mt-4 w-full"
                        size="sm"
                      >
                        <Download className="size-4 me-1.5" />
                        {downloadingId === report.id ? "جاري التحميل..." : "تحميل التقرير"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MonthlyReportsModal;
