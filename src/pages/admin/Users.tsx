import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import UsersList from "@/components/admin/UsersList";
import CreateUserModal from "@/components/admin/CreateUserModal";

export default function AdminUsersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <PageHeader
        title="إدارة المستخدمين"
        description="إنشاء وإدارة حسابات المدير والمؤسسات والمستودعات"
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <UserPlus className="me-2 size-4" />
            إنشاء حساب جديد
          </Button>
        }
      />
      <Card>
        <CardContent className="p-6"><UsersList refreshTrigger={refreshKey} /></CardContent>
      </Card>
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
