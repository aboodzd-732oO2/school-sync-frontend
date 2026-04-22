import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import {
  Warehouse as WarehouseIcon, MapPin, Info, AlertCircle, FolderTree,
} from "lucide-react";
import { lookup as lookupApi } from "@/services/api";
import { useDepartments } from "@/hooks/useLookups";
import { getDepartmentIcon } from "@/lib/departmentIcons";

interface Props {
  user: {
    userType: "institution";
    institutionName: string;
    governorate?: string;
  };
}

interface WarehouseRow {
  id: number;
  name: string;
  department: { id: number; key: string; labelAr: string; icon: string; color: string };
  governorate: { id: number; name: string };
}

const InstitutionWarehousesPage = ({ user }: Props) => {
  const [warehouses, setWarehouses] = useState<WarehouseRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { departments } = useDepartments();

  useEffect(() => {
    if (!user.governorate) return;
    let cancelled = false;
    setError(null);
    setWarehouses(null);
    lookupApi
      .warehouses({ governorate: user.governorate })
      .then((data: any) => {
        if (!cancelled) setWarehouses(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "فشل تحميل المستودعات");
      });
  }, [user.governorate]);

  // Build "one card per department" — show warehouse if exists, else "غير متاح"
  const rows = useMemo(() => {
    if (!departments.length) return [];
    const byDept = new Map<string, WarehouseRow>();
    for (const w of warehouses ?? []) {
      byDept.set(w.department.key, w);
    }
    return departments.map((d) => ({
      department: d,
      warehouse: byDept.get(d.key) ?? null,
    }));
  }, [departments, warehouses]);

  return (
    <div>
      <PageHeader
        title="المستودعات المتاحة"
        description={`المستودعات في ${user.governorate ?? "محافظتك"} حسب القسم`}
      />

      <div className="space-y-4">
        <div className="flex items-start gap-2.5 rounded-lg border border-info/30 bg-info/10 p-3">
          <Info className="size-5 shrink-0 text-info mt-0.5" />
          <p className="text-sm text-info">
            عند تقديم طلب لقسم معيّن، يُرسل تلقائياً إلى المستودع المقابل في محافظتك.
            الأقسام التي لا يوجد لها مستودع في محافظتك حالياً تظهر كـ <strong>"غير متاح"</strong>.
          </p>
        </div>

        {error ? (
          <EmptyState icon={AlertCircle} title="تعذر تحميل البيانات" description={error} />
        ) : warehouses === null ? (
          <LoadingSkeleton variant="cards" rows={5} />
        ) : rows.length === 0 ? (
          <EmptyState icon={WarehouseIcon} title="لا توجد أقسام معرّفة" />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rows.map(({ department, warehouse }) => {
              const Icon = getDepartmentIcon(department.icon);
              return (
                <Card
                  key={department.key}
                  className={
                    warehouse
                      ? "border-border/60 transition-shadow hover:shadow-md"
                      : "border-border/60 bg-muted/20"
                  }
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <span
                          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: `${department.color}20`,
                            color: department.color,
                          }}
                        >
                          <Icon className="size-5" />
                        </span>
                        <span>
                          {department.labelAr.replace(/^قسم\s*/, "")}
                        </span>
                      </CardTitle>
                      {warehouse ? (
                        <Badge variant="outline" className="bg-success/15 text-success border-success/30">
                          متاح
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground">
                          غير متاح
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {warehouse ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <WarehouseIcon className="size-4 text-muted-foreground" />
                          <span className="font-medium">{warehouse.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="size-4" />
                          <span>{warehouse.governorate.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FolderTree className="size-4" />
                          <span>يستقبل طلبات: {department.labelAr.replace(/^قسم\s*/, "")}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        لا يوجد مستودع لهذا القسم في محافظتك. طلبات هذا القسم غير متاحة حالياً.
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionWarehousesPage;
