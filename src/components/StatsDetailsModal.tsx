
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import DetailedItemsView from "./stats/DetailedItemsView";
import InstitutionsView from "./stats/InstitutionsView";
import ItemsSummaryView from "./stats/ItemsSummaryView";
import InstitutionsSummaryView from "./stats/InstitutionsSummaryView";
import RequestsListView from "./stats/RequestsListView";
import ComprehensiveStatsView from "./stats/ComprehensiveStatsView";

interface RequestItem {
  itemName: string;
  quantity: number;
}

interface RequestData {
  id: string;
  institutionName: string;
  institutionType: 'school' | 'university';
  department: string;
  governorate: string;
  items: RequestItem[];
  status: 'pending' | 'approved' | 'rejected' | 'in-progress' | 'completed';
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
}

interface StatsDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: RequestData[] | any;
  type: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed' | 'total-items' | 'institution-requests' | 'total' | 'quantity' | 'students' | 'inProgress' | 'highPriority' | 'draft' | 'institutions' | 'undelivered' | 'detailed-requests' | 'detailed-items' | 'schools' | 'universities';
  requests?: any[];
}

const StatsDetailsModal = ({ isOpen, onClose, title, data, type, requests }: StatsDetailsModalProps) => {
  // Use requests prop if provided, otherwise use data
  const requestsData = requests || data || [];

  const renderContent = () => {
    // Handle comprehensive stats views for enhanced data
    if (type === 'detailed-requests' || type === 'detailed-items' || type === 'students' || 
        type === 'draft' || type === 'pending' || type === 'inProgress' || 
        type === 'completed' || type === 'highPriority') {
      return <ComprehensiveStatsView data={data} type={type} />;
    }

    // Handle detailed items from warehouse dashboard
    if (type === 'detailed-items' && Array.isArray(data) && data.length > 0 && data[0]?.key) {
      return <DetailedItemsView data={data} />;
    }

    // Handle institutions data from warehouse dashboard
    if ((type === 'schools' || type === 'universities') && Array.isArray(data) && data.length > 0 && data[0]?.name) {
      return <InstitutionsView data={data} type={type} />;
    }

    if (type === 'total-items') {
      return <ItemsSummaryView requestsData={requestsData} />;
    }

    if (type === 'institution-requests') {
      return <InstitutionsSummaryView requestsData={requestsData} />;
    }

    // عرض الطلبات العادية
    return <RequestsListView requestsData={requestsData} />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription>
            {Array.isArray(data) ? 
              `تفاصيل ${title} (${data.length} عنصر)` : 
              `تفاصيل شاملة - ${title}`
            }
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[75vh] pr-4">
          {renderContent()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default StatsDetailsModal;
