import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, AlertCircle, Users, Package, Hash, School, University, List } from "lucide-react";
import { usePriorities, useInstitutionTypes, useDepartments } from "@/hooks/useLookups";
import { getStatusLabel, getStatusClass } from "@/lib/statusConfig";

interface Request {
  id: string;
  title: string;
  institutionType: string;
  department: string;
  subcategory: string;
  priority: string;
  status: string;
  location: string;
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
}

interface RequestDetailsModalProps {
  request: Request | null;
  isOpen: boolean;
  onClose: () => void;
}

const RequestDetailsModal = ({ request, isOpen, onClose }: RequestDetailsModalProps) => {
  if (!request) return null;

  const getStatusColor = (status: string) => getStatusClass(status);
  const getStatusText = (status: string) => getStatusLabel(status);

  const { getLabel: getPriorityLabel, getColor: getPriorityHexColor } = usePriorities();
  const { getLabel: getInstitutionTypeText } = useInstitutionTypes();
  const { getLabel: getDeptLabel } = useDepartments();

  const getPriorityStyle = (priority: string) => ({
    backgroundColor: `${getPriorityHexColor(priority)}20`,
    color: getPriorityHexColor(priority),
  });
  const getPriorityText = (priority: string) => getPriorityLabel(priority);
  const getDepartmentText = (department: string) => getDeptLabel(department).replace(/^قسم\s*/, '');

  const InstitutionIcon = request.institutionType === 'school' ? School : University;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{request.title}</DialogTitle>
          <DialogDescription>
            تفاصيل الطلب رقم #{request.id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <Badge className={getStatusColor(request.status)}>
              {getStatusText(request.status)}
            </Badge>
            <Badge style={getPriorityStyle(request.priority)}>
              {getPriorityText(request.priority)}
            </Badge>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>تاريخ التقديم:</strong> {new Date(request.dateSubmitted).toLocaleDateString('ar-EG')}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <InstitutionIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>نوع المؤسسة:</strong> {getInstitutionTypeText(request.institutionType)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>المؤسسة:</strong> {request.location}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>القسم:</strong> {getDepartmentText(request.department)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {request.quantity > 0 && !request.requestedItems && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>الكمية:</strong> {request.quantity} {request.unitType}
                  </span>
                </div>
              )}
              
              {request.studentsAffected > 0 && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>الطلاب المتأثرين:</strong> {request.studentsAffected} طالب
                  </span>
                </div>
              )}
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>موجه إلى:</strong> {request.routedTo}
                </span>
              </div>
            </div>
          </div>

          {/* تفاصيل العناصر المطلوبة */}
          {request.requestedItems && request.requestedItems.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 space-x-reverse mb-3">
                <List className="h-5 w-5 text-info" />
                <h4 className="font-semibold">العناصر المطلوبة بالتفصيل:</h4>
              </div>
              <div className="bg-info/10 p-4 rounded-lg border border-info/30">
                <div className="grid gap-3">
                  {request.requestedItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-card p-3 rounded-lg border shadow-sm">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-8 h-8 bg-info/15 rounded-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-info" />
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{item.itemName}</span>
                          <p className="text-sm text-muted-foreground">كود العنصر: {item.originalKey}</p>
                        </div>
                      </div>
                      <div className="text-end">
                        <Badge variant="outline" className="bg-info/15 text-info border-info/40 font-medium">
                          {item.quantity} {item.unitType}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-info/40">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-info">إجمالي العناصر:</span>
                    <span className="text-lg font-bold text-info">
                      {request.requestedItems.reduce((sum, item) => sum + item.quantity, 0)} عنصر
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-medium text-info">عدد أنواع العناصر:</span>
                    <span className="text-lg font-bold text-info">
                      {request.requestedItems.length} نوع
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="font-semibold mb-2">الوصف التفصيلي:</h4>
            <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg">
              {request.description}
            </p>
          </div>

          {/* Impact */}
          {request.impact && (
            <div>
              <h4 className="font-semibold mb-2">التأثير على العملية التعليمية:</h4>
              <p className="text-sm text-foreground bg-info/10 p-3 rounded-lg">
                {request.impact}
              </p>
            </div>
          )}

          {/* Status History */}
          <div>
            <h4 className="font-semibold mb-2">سجل الحالة:</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>تم تقديم الطلب</span>
                <span className="text-muted-foreground">{new Date(request.dateSubmitted).toLocaleDateString('ar-EG')}</span>
              </div>
              {request.status !== 'pending' && (
                <div className="flex justify-between items-center text-sm">
                  <span>بدء التنفيذ</span>
                  <span className="text-muted-foreground">-</span>
                </div>
              )}
              {request.status === 'completed' && (
                <div className="flex justify-between items-center text-sm">
                  <span>تم الإكمال</span>
                  <span className="text-muted-foreground">-</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestDetailsModal;
