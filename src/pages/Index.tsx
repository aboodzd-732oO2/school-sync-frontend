import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import RequestForm from "@/components/RequestForm";
import Reports from "@/components/Reports";
import LoginForm from "@/components/LoginForm";
import { AppShell } from "@/components/layout/AppShell";

// Institution pages
import InstitutionDashboardPage from "./institution/Dashboard";
import InstitutionActiveRequestsPage from "./institution/ActiveRequests";
import InstitutionRequestsHistoryPage from "./institution/RequestsHistory";
import InstitutionDraftsPage from "./institution/Drafts";
import InstitutionSettingsPage from "./institution/Settings";

// Warehouse pages
import WarehouseDashboardPage from "./warehouse/Dashboard";
import WarehouseActiveRequestsPage from "./warehouse/ActiveRequests";
import WarehouseRequestsHistoryPage from "./warehouse/RequestsHistory";
import WarehouseInventoryPage from "./warehouse/Inventory";
import WarehouseInventoryHistoryPage from "./warehouse/InventoryHistory";
import WarehouseInventoryAlertsPage from "./warehouse/InventoryAlerts";
import WarehouseSettingsPage from "./warehouse/Settings";
import WarehouseNotificationsPage from "./warehouse/Notifications";
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
  departmentKey?: string;
  institutionType?: never;
  institutionName?: never;
});

const WAREHOUSE_ACTIVE_STATUSES = ['pending', 'in-progress', 'ready-for-pickup', 'undelivered'];
// Statuses that warrant a "new" badge for the institution — changes triggered by warehouse
const INSTITUTION_BADGE_STATUSES = ['in-progress', 'ready-for-pickup', 'rejected'];
const WAREHOUSE_ACTIVE_LASTVISIT_KEY = 'warehouse_active_lastvisit_ms';
const INSTITUTION_ACTIVE_LASTVISIT_KEY = 'institution_active_lastvisit_ms';

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [warehouseActiveLastVisit, setWarehouseActiveLastVisit] = useState<number>(() =>
    Number(localStorage.getItem(WAREHOUSE_ACTIVE_LASTVISIT_KEY) || '0'),
  );
  const [institutionActiveLastVisit, setInstitutionActiveLastVisit] = useState<number>(() =>
    Number(localStorage.getItem(INSTITUTION_ACTIVE_LASTVISIT_KEY) || '0'),
  );

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

  // Mark "/requests/active" as visited — stamp the correct role's key
  useEffect(() => {
    if (location.pathname !== '/requests/active') return;
    const now = Date.now();
    if (user?.userType === 'warehouse') {
      localStorage.setItem(WAREHOUSE_ACTIVE_LASTVISIT_KEY, String(now));
      setWarehouseActiveLastVisit(now);
    } else if (user?.userType === 'institution') {
      localStorage.setItem(INSTITUTION_ACTIVE_LASTVISIT_KEY, String(now));
      setInstitutionActiveLastVisit(now);
    }
  }, [location.pathname, user]);

  // Badge count: warehouse active requests submitted AFTER last visit
  const warehouseActiveBadge = useMemo(() => {
    if (user?.userType !== 'warehouse') return 0;
    const deptKey = user.departmentKey || 'materials';
    return requests.filter(r =>
      r.department === deptKey &&
      WAREHOUSE_ACTIVE_STATUSES.includes(r.status) &&
      new Date(r.dateSubmitted).getTime() > warehouseActiveLastVisit,
    ).length;
  }, [user, requests, warehouseActiveLastVisit]);

  // Badge count: institution active requests whose status *changed* after last visit
  // Uses updatedAt (fallback to dateSubmitted) because new actions on existing requests matter most.
  const institutionActiveBadge = useMemo(() => {
    if (user?.userType !== 'institution') return 0;
    return requests.filter(r => {
      if (!INSTITUTION_BADGE_STATUSES.includes(r.status) && r.status !== 'pending') return false;
      const ts = (r as any).updatedAt ? new Date((r as any).updatedAt).getTime() : new Date(r.dateSubmitted).getTime();
      return ts > institutionActiveLastVisit;
    }).length;
  }, [user, requests, institutionActiveLastVisit]);

  // Badge count: number of drafts (informational, warning tone)
  const institutionDraftsBadge = useMemo(() => {
    if (user?.userType !== 'institution') return 0;
    return requests.filter(r => r.status === 'draft').length;
  }, [user, requests]);

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
      <AppShell user={user} onLogout={handleLogout} badges={{ warehouseActive: warehouseActiveBadge, institutionActive: institutionActiveBadge, institutionDrafts: institutionDraftsBadge }}>
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
  } else if (path === '/inventory/history') {
    if (user.userType !== 'warehouse') return <Navigate to="/dashboard" replace />;
    content = <WarehouseInventoryHistoryPage user={user} />;
  } else if (path === '/inventory/alerts') {
    if (user.userType !== 'warehouse') return <Navigate to="/dashboard" replace />;
    content = <WarehouseInventoryAlertsPage />;
  } else if (path === '/settings') {
    if (user.userType === 'warehouse') {
      content = <WarehouseSettingsPage user={user} />;
    } else if (user.userType === 'institution') {
      content = <InstitutionSettingsPage user={user} />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  } else if (path === '/notifications') {
    if (user.userType !== 'warehouse') return <Navigate to="/dashboard" replace />;
    content = <WarehouseNotificationsPage />;
  } else if (path === '/requests') {
    if (user.userType !== 'warehouse') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/requests/active" replace />;
  } else if (path === '/requests/active') {
    if (user.userType === 'warehouse') {
      content = (
        <WarehouseActiveRequestsPage
          requests={requests}
          user={user}
          onUpdateStatus={handleUpdateStatus}
          onUpdateRequest={handleUpdateRequest}
        />
      );
    } else if (user.userType === 'institution') {
      content = (
        <InstitutionActiveRequestsPage
          requests={requests}
          onUpdateStatus={handleUpdateStatus}
          onDeleteRequest={handleDeleteRequest}
          onUpdateRequest={handleUpdateRequest}
          user={user}
        />
      );
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  } else if (path === '/drafts') {
    if (user.userType !== 'institution') return <Navigate to="/dashboard" replace />;
    content = (
      <InstitutionDraftsPage
        requests={requests}
        onUpdateStatus={handleUpdateStatus}
        onDeleteRequest={handleDeleteRequest}
        onUpdateRequest={handleUpdateRequest}
        user={user}
      />
    );
  } else if (path === '/requests/history') {
    if (user.userType === 'warehouse') {
      content = <WarehouseRequestsHistoryPage requests={requests} user={user} />;
    } else if (user.userType === 'institution') {
      content = (
        <InstitutionRequestsHistoryPage
          requests={requests}
          onUpdateStatus={handleUpdateStatus}
          onDeleteRequest={handleDeleteRequest}
          onUpdateRequest={handleUpdateRequest}
          user={user}
        />
      );
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  } else if (path === '/dashboard' || path === '/') {
    if (user.userType === 'warehouse') {
      content = <WarehouseDashboardPage requests={requests} user={user} />;
    } else {
      content = (
        <InstitutionDashboardPage
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
    <AppShell user={user} onLogout={handleLogout} badges={{ warehouseActive: warehouseActiveBadge, institutionActive: institutionActiveBadge, institutionDrafts: institutionDraftsBadge }}>
      {content}
    </AppShell>
  );
};

export default Index;
