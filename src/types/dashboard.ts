
export interface Request {
  id: string;
  title: string;
  department: string;
  subcategory: string;
  priority: string;
  status: string;
  location: string;
  schoolLocation?: string;
  dateSubmitted: string;
  routedTo: string;
  description: string;
  impact: string;
  quantity: number;
  studentsAffected: number;
  unitType: string;
  institutionType: string;
  requestedItems?: Array<{
    itemName: string;
    originalKey: string;
    quantity: number;
    unitType: string;
    displayText: string;
  }>;
  rejectionReason?: string;
  rejectionDate?: string;
  cancellationReason?: string;
  cancellationDate?: string;
  cancellationType?: string;
}

export type UserData = {
  email: string;
  loginTime: string;
} & ({
  userType: 'institution';
  institutionType: string;
  institutionName: string;
  warehouseName?: never;
} | {
  userType: 'warehouse';
  warehouseName: string;
  institutionType?: never;
  institutionName?: never;
});

export interface DashboardProps {
  requests: Request[];
  onUpdateStatus: (id: string, status: string) => void;
  onDeleteRequest: (id: string) => void;
  onUpdateRequest?: (updatedRequest: Request) => void;
  user?: UserData | null;
}

export interface StatsModalState {
  isOpen: boolean;
  title: string;
  type: 'total' | 'quantity' | 'students' | 'pending' | 'inProgress' | 'completed' | 'highPriority' | 'draft' | 'institutions' | 'undelivered' | 'detailed-requests' | 'detailed-items' | 'rejected' | 'cancelled';
  requests: Request[];
  data?: any;
}
