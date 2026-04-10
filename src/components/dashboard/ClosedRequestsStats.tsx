
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, Ban } from "lucide-react";
import { Request } from "@/types/dashboard";

interface ClosedRequestsStatsProps {
  requests: Request[];
  onStatsClick: (type: 'rejected' | 'cancelled', title: string) => void;
}

const ClosedRequestsStats = ({ requests, onStatsClick }: ClosedRequestsStatsProps) => {
  const closedStats = {
    rejected: requests.filter(r => r.status === 'rejected').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
  };

  // Only show if there are closed requests
  if (closedStats.rejected === 0 && closedStats.cancelled === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">📁 الطلبات المغلقة</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {closedStats.rejected > 0 && (
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-red-300" onClick={() => onStatsClick('rejected', 'الطلبات المرفوضة')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-red-600">{closedStats.rejected}</p>
                  <p className="text-sm text-gray-600">❌ مرفوض</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {closedStats.cancelled > 0 && (
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-orange-300" onClick={() => onStatsClick('cancelled', 'الطلبات الملغية')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Ban className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-orange-600">{closedStats.cancelled}</p>
                  <p className="text-sm text-gray-600">🚫 ملغي</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClosedRequestsStats;
