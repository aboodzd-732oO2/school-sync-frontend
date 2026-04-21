import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import Dashboard from "@/components/Dashboard";
import RequestForm from "@/components/RequestForm";
import Reports from "@/components/Reports";
import LoginForm from "@/components/LoginForm";
import { AppShell } from "@/components/layout/AppShell";

// Warehouse pages
import WarehouseDashboardPage from "./warehouse/Dashboard";
import WarehouseRequestsPage from "./warehouse/Requests";
import WarehouseInventoryPage from "./warehouse/Inventory";
import { auth, requests as requestsApi, warehouse as warehouseApi, removeToken } from "@/services/api";
import { connectSocket, disconnectSocket } from "@/services/socket";
import { useRequestsRealtime } from "@/hooks/useRequestsRealtime";

// Admin pages
import AdminStatsPage from "./admin/Stats";
import AdminUsersPage from "./admin/Users";
import AdminInstitutionsPage from "./admin/Institutions";
import AdminWarehousesPage from "./admin/Warehouses";
import AdminDepartmentsPage from "./admin/Departments";
import AdminDeptItemsPage from "./admin/DeptItems";
import AdminGovernoratesPage from "./admin/Governorates";
import AdminInstTypesPage from "./admin/InstTypes";
import AdminUnitsPage from "./admin/Units";
import AdminPrioritiesPage from "./admin/Priorities";
import AdminRoutingPage from "./admin/Routing";
import AdminPasswordResetsPage from "./admin/PasswordResets";
import AdminAuditPage from "./admin/Audit";

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
  userType: 'admin';
  institutionType?: never;
  institutionName?: never;
  warehouseName?: never;
} | {
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
  const location = useLocation();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    if (!user || user.userType === 'admin') return;
    try {
      const data = user.userType === 'institution'
        ? await requestsApi.list()
        : await warehouseApi.listRequests();
      setRequests(data);
    } catch (err) {
      console.error('Error loading requests:', err);
    }
  }, [user]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await auth.me();
          setUser({ ...profile, loginTime: new Date().toISOString() });
          connectSocket(token);
        } catch {
          removeToken();
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => { if (user) loadRequests(); }, [user, loadRequests]);

  const handleLogin = (userData: UserData) => {
    setUser(userData);
    // توجيه افتراضي حسب الدور
    if (userData.userType === 'admin') navigate('/admin/stats');
    else navigate('/dashboard');
  };

  const handleLogout = () => {
    disconnectSocket();
    removeToken();
    setUser(null);
    setRequests([]);
    navigate('/');
  };

  useRequestsRealtime({
    onNew: useCallback((r: Request) => {
      setRequests(prev => prev.some(p => p.id === r.id) ? prev : [r, ...prev]);
    }, []),
    onStatusChanged: useCallback((r: Request) => {
      setRequests(prev => prev.map(p => p.id === r.id ? r : p));
    }, []),
  });

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
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating request:', err);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const updated = user?.userType === 'warehouse'
        ? await warehouseApi.updateRequestStatus(id, { status })
        : await requestsApi.updateStatus(id, { status });
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
    } catch (err) { console.error(err); }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      await requestsApi.remove(id);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleUpdateRequest = async (updatedRequest: Request) => {
    try {
      if (updatedRequest.status === 'cancelled' || updatedRequest.status === 'rejected') {
        const updated = user?.userType === 'warehouse'
          ? await warehouseApi.updateRequestStatus(updatedRequest.id, {
              status: updatedRequest.status,
              rejectionReason: updatedRequest.rejectionReason,
              cancellationReason: updatedRequest.cancellationReason,
              cancellationType: updatedRequest.cancellationType,
            })
          : await requestsApi.updateStatus(updatedRequest.id, {
              status: updatedRequest.status,
              cancellationReason: updatedRequest.cancellationReason,
              cancellationType: updatedRequest.cancellationType,
            });
        setRequests(prev => prev.map(r => r.id === updatedRequest.id ? updated : r));
      } else {
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
    } catch (err) { console.error(err); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginForm onLogin={handleLogin} />;

  // Admin routing
  if (user.userType === 'admin') {
    const path = location.pathname;
    let content: React.ReactNode;
    if (path === '/' || path === '/admin' || path === '/admin/stats') content = <AdminStatsPage />;
    else if (path === '/admin/users') content = <AdminUsersPage />;
    else if (path === '/admin/institutions') content = <AdminInstitutionsPage />;
    else if (path === '/admin/warehouses') content = <AdminWarehousesPage />;
    else if (path === '/admin/departments') content = <AdminDepartmentsPage />;
    else if (path === '/admin/dept-items') content = <AdminDeptItemsPage />;
    else if (path === '/admin/governorates') content = <AdminGovernoratesPage />;
    else if (path === '/admin/inst-types') content = <AdminInstTypesPage />;
    else if (path === '/admin/units') content = <AdminUnitsPage />;
    else if (path === '/admin/priorities') content = <AdminPrioritiesPage />;
    else if (path === '/admin/routing') content = <AdminRoutingPage />;
    else if (path === '/admin/password-resets') content = <AdminPasswordResetsPage />;
    else if (path === '/admin/audit') content = <AdminAuditPage />;
    else return <Navigate to="/admin/stats" replace />;

    return (
      <AppShell user={user} onLogout={handleLogout}>
        {content}
      </AppShell>
    );
  }

  // Institution + Warehouse routing
  const path = location.pathname;
  let content: React.ReactNode;

  if (path === '/submit') {
    if (user.userType !== 'institution') return <Navigate to="/dashboard" replace />;
    content = <RequestForm onSubmit={handleSubmitRequest} userData={user} />;
  } else if (path === '/reports') {
    content = <Reports requests={requests} />;
  } else if (path === '/inventory') {
    if (user.userType !== 'warehouse') return <Navigate to="/dashboard" replace />;
    content = <WarehouseInventoryPage user={user} />;
  } else if (path === '/requests') {
    if (user.userType !== 'warehouse') return <Navigate to="/dashboard" replace />;
    content = (
      <WarehouseRequestsPage
        requests={requests}
        user={user}
        onUpdateStatus={handleUpdateStatus}
        onUpdateRequest={handleUpdateRequest}
      />
    );
  } else if (path === '/dashboard' || path === '/') {
    if (user.userType === 'warehouse') {
      content = <WarehouseDashboardPage requests={requests} user={user} />;
    } else {
      content = (
        <Dashboard
          requests={requests}
          onUpdateStatus={handleUpdateStatus}
          onDeleteRequest={handleDeleteRequest}
          onUpdateRequest={handleUpdateRequest}
          user={user}
        />
      );
    }
  } else {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AppShell user={user} onLogout={handleLogout}>
      {content}
    </AppShell>
  );
};

export default Index;
