import { XCircle, Ban, Archive } from "lucide-react";
import { Request } from "@/types/dashboard";
import { StatCard } from "@/components/common/StatCard";

interface ClosedRequestsStatsProps {
  requests: Request[];
  onStatsClick: (type: 'rejected' | 'cancelled', title: string) => void;
}

const ClosedRequestsStats = ({ requests, onStatsClick }: ClosedRequestsStatsProps) => {
  const closedStats = {
    rejected: requests.filter(r => r.status === 'rejected').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
  };

  if (closedStats.rejected === 0 && closedStats.cancelled === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Archive className="size-5 text-muted-foreground" />
        الطلبات المغلقة
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {closedStats.rejected > 0 && (
          <StatCard
            label="مرفوض"
            value={closedStats.rejected}
            icon={XCircle}
            tone="danger"
            onClick={() => onStatsClick('rejected', 'الطلبات المرفوضة')}
          />
        )}
        {closedStats.cancelled > 0 && (
          <StatCard
            label="ملغي"
            value={closedStats.cancelled}
            icon={Ban}
            tone="warning"
            onClick={() => onStatsClick('cancelled', 'الطلبات الملغية')}
          />
        )}
      </div>
    </div>
  );
};

export default ClosedRequestsStats;
