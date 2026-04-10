import { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import RequestForm from "@/components/RequestForm";
import Reports from "@/components/Reports";
import LoginForm from "@/components/LoginForm";
import { auth, requests as requestsApi, warehouse as warehouseApi, removeToken } from "@/services/api";

interface Request {
  id: string;
  title: string;
  institutionType: string;
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
  requestedItems?: Array<{
    itemName: string;
    originalKey: string;
    quantity: number;
    unitType: string;
    displayText: string;
  }>;
  itemsBreakdown?: Array<{
    name: string;
    key: string;
    quantity: number;
    unit: string;
  }>;
  rejectionReason?: string;
  rejectionDate?: string;
  cancellationReason?: string;
  cancellationDate?: string;
  cancellationType?: string;
}

type UserData = {
  email: string;
  loginTime: string;
  governorate?: string;
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

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [requests, setRequests] = useState<Request[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // تحميل الطلبات من API
  const loadRequests = useCallback(async () => {
    if (!user) return;
    try {
      let data;
      if (user.userType === 'institution') {
        data = await requestsApi.list();
      } else {
        data = await warehouseApi.listRequests();
      }
      setRequests(data);
    } catch (err) {
      console.error('Error loading requests:', err);
    }
  }, [user]);

  // تحقق من تسجيل الدخول عبر JWT
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await auth.me();
          setUser({ ...profile, loginTime: new Date().toISOString() });
        } catch {
          removeToken();
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // تحميل الطلبات عند تسجيل الدخول
  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user, loadRequests]);

  const handleLogin = (userData: UserData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    removeToken();
    setUser(null);
    setRequests([]);
    setActiveTab('dashboard');
  };

  const handleSubmitRequest = async (newRequest: Request) => {
    try {
      const created = await requestsApi.create({
        title: newRequest.title,
        description: newRequest.description,
        impact: newRequest.impact,
        priority: newRequest.priority,
        status: newRequest.status === 'draft' ? 'draft' : 'pending',
        quantity: newRequest.quantity,
        studentsAffected: newRequest.studentsAffected,
        unitType: newRequest.unitType,
        subcategory: newRequest.subcategory,
        departmentKey: newRequest.department,
        requestedItems: newRequest.requestedItems || [],
      });
      setRequests(prev => [created, ...prev]);
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Error creating request:', err);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      let updated;
      if (user?.userType === 'warehouse') {
        updated = await warehouseApi.updateRequestStatus(id, { status });
      } else {
        updated = await requestsApi.updateStatus(id, { status });
      }
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      await requestsApi.remove(id);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting request:', err);
    }
  };

  const handleUpdateRequest = async (updatedRequest: Request) => {
    try {
      // إذا تغيرت الحالة (إلغاء أو رفض)
      if (updatedRequest.status === 'cancelled' || updatedRequest.status === 'rejected') {
        let updated;
        if (user?.userType === 'warehouse') {
          updated = await warehouseApi.updateRequestStatus(updatedRequest.id, {
            status: updatedRequest.status,
            rejectionReason: updatedRequest.rejectionReason,
            cancellationReason: updatedRequest.cancellationReason,
            cancellationType: updatedRequest.cancellationType,
          });
        } else {
          updated = await requestsApi.updateStatus(updatedRequest.id, {
            status: updatedRequest.status,
            cancellationReason: updatedRequest.cancellationReason,
            cancellationType: updatedRequest.cancellationType,
          });
        }
        setRequests(prev => prev.map(r => r.id === updatedRequest.id ? updated : r));
      } else {
        // تعديل عادي على الطلب
        const updated = await requestsApi.update(updatedRequest.id, {
          title: updatedRequest.title,
          description: updatedRequest.description,
          impact: updatedRequest.impact,
          priority: updatedRequest.priority,
          quantity: updatedRequest.quantity,
          studentsAffected: updatedRequest.studentsAffected,
          unitType: updatedRequest.unitType,
          subcategory: updatedRequest.subcategory,
          requestedItems: updatedRequest.requestedItems,
        });
        setRequests(prev => prev.map(r => r.id === updatedRequest.id ? updated : r));
      }
    } catch (err) {
      console.error('Error updating request:', err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard
          requests={requests}
          onUpdateStatus={handleUpdateStatus}
          onDeleteRequest={handleDeleteRequest}
          onUpdateRequest={handleUpdateRequest}
          user={user}
        />;
      case 'submit':
        return user?.userType === 'institution' ? (
          <RequestForm onSubmit={handleSubmitRequest} userData={user} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">هذا القسم متاح للمؤسسات التعليمية فقط</p>
          </div>
        );
      case 'reports':
        return <Reports requests={requests} />;
      default:
        return <Dashboard
          requests={requests}
          onUpdateStatus={handleUpdateStatus}
          onDeleteRequest={handleDeleteRequest}
          onUpdateRequest={handleUpdateRequest}
          user={user}
        />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(142,60%,25%)] via-[hsl(142,50%,20%)] to-[hsl(142,60%,25%)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-white/20 border-t-white mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 bg-gradient-to-br from-[hsl(38,85%,60%)] to-[hsl(38,90%,50%)] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">📚</span>
              </div>
            </div>
          </div>
          <p className="mt-6 text-lg font-semibold text-white">جاري التحميل...</p>
          <p className="mt-2 text-sm text-white/80">يرجى الانتظار</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(142,30%,96%)] via-[hsl(142,40%,94%)] to-[hsl(142,30%,96%)] w-full" dir="rtl">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={handleLogout} />
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="w-full overflow-hidden">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
