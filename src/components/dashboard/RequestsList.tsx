import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Clock, CheckCircle, Users, Package, FileText, Edit, Trash2, Eye, Play, Search, Calendar, MapPin, Check, RefreshCw, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/common/EmptyState";
import { Request, UserData } from "@/types/dashboard";
import { usePriorities, useInstitutionTypes } from "@/hooks/useLookups";
import { getStatusLabel, getStatusClass, getStatusIcon as getStatusIconFromConfig } from "@/lib/statusConfig";

interface RequestsListProps {
  requests: Request[];
  user?: UserData | null;
  onViewDetails: (request: Request) => void;
  onEditRequest: (request: Request) => void;
  onStartRequest: (id: string, title: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDeleteRequest: (id: string, title: string) => void;
  onReportUndelivered?: (id: string, title: string) => void;
  onCancelRequest?: (request: Request) => void;
}

const RequestsList = ({ 
  requests, 
  user, 
  onViewDetails, 
  onEditRequest, 
  onStartRequest, 
  onUpdateStatus, 
  onDeleteRequest,
  onReportUndelivered,
  onCancelRequest
}: RequestsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRequests = requests.filter(request =>
    request.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => getStatusClass(status);
  const getStatusText = (status: string) => getStatusLabel(status);
  const getStatusIcon = (status: string) => {
    const Icon = getStatusIconFromConfig(status);
    return <Icon className="size-3.5" />;
  };

  const { getLabel: getPriorityLabel, getColor: getPriorityHexColor } = usePriorities();
  const { getLabel: getInstitutionTypeLabel } = useInstitutionTypes();

  const getPriorityStyle = (priority: string) => ({
    backgroundColor: `${getPriorityHexColor(priority)}20`,
    color: getPriorityHexColor(priority),
    borderColor: `${getPriorityHexColor(priority)}50`,
  });
  const getPriorityText = (priority: string) => getPriorityLabel(priority);
  const getInstitutionTypeText = (type: string) => getInstitutionTypeLabel(type);

  return (
    <Card className="border-border">
      <CardHeader className="bg-primary text-white">
        <CardTitle className="flex items-center gap-2 text-white">
          <FileText className="size-5" />
          <span>الطلبات الحديثة</span>
        </CardTitle>
        <CardDescription className="text-white/90">
          نظرة عامة مفصلة على جميع طلبات {user?.institutionName}
        </CardDescription>
        
        {/* Search Bar */}
        <div className="flex items-center space-x-2 space-x-reverse mt-4">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث في الطلبات حسب العنوان..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-10"
            />
          </div>
          {searchTerm && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSearchTerm("")}
            >
              مسح البحث
            </Button>
          )}
        </div>
        
        {/* Search Results Summary */}
        {searchTerm && (
          <div className="flex items-center gap-2 text-sm text-white/90 mt-2">
            {filteredRequests.length === 0 ? (
              <>
                <X className="size-4" />
                <span>لم يتم العثور على نتائج للبحث عن "{searchTerm}"</span>
              </>
            ) : (
              <>
                <Check className="size-4" />
                <span>تم العثور على {filteredRequests.length} نتيجة للبحث عن "{searchTerm}"</span>
              </>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filteredRequests.length === 0 ? (
          searchTerm ? (
            <EmptyState
              icon={Search}
              title={`لم يتم العثور على طلبات تحتوي على "${searchTerm}"`}
              description="جرب البحث بكلمات أخرى أو امسح البحث لعرض جميع الطلبات"
            />
          ) : (
            <EmptyState
              icon={FileText}
              title="لم يتم تقديم أي طلبات بعد"
              description="ابدأ بتقديم طلبك الأول!"
            />
          )
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-6 hover:bg-muted/30 hover:shadow-md transition-[background-color,box-shadow]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 space-x-reverse mb-3">
                      <h3 className="font-semibold text-lg">{request.title}</h3>
                      <Badge className="border" style={getPriorityStyle(request.priority)}>
                        {getPriorityText(request.priority)}
                      </Badge>
                      <Badge className={`${getStatusColor(request.status)} border`}>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          {getStatusIcon(request.status)}
                          <span>{getStatusText(request.status)}</span>
                        </div>
                      </Badge>
                      <Badge variant="outline" className="border-border">
                        {getInstitutionTypeText(request.institutionType)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{request.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      {request.quantity > 0 && (
                        <div className="flex items-center space-x-2 space-x-reverse bg-muted/50 p-2 rounded">
                          <Package className="h-4 w-4 text-primary" />
                          <span className="font-medium">{request.quantity} {request.unitType}</span>
                        </div>
                      )}
                      {request.studentsAffected > 0 && (
                        <div className="flex items-center space-x-2 space-x-reverse bg-muted/50 p-2 rounded">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="font-medium">{request.studentsAffected} طالب</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 space-x-reverse bg-muted/30 p-2 rounded">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(request.dateSubmitted).toLocaleDateString('ar-EG')}</span>
                      </div>
                      {request.schoolLocation && (
                        <div className="flex items-center space-x-2 space-x-reverse bg-warning/10 p-2 rounded">
                          <MapPin className="h-4 w-4 text-foreground" />
                          <span>{request.schoolLocation}</span>
                        </div>
                      )}
                    </div>
                    
                    {request.status !== 'draft' && (
                      <div className="flex items-center space-x-4 space-x-reverse text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <AlertTriangle className="h-4 w-4" />
                          <span>موجه إلى: <strong className="text-primary">{request.routedTo}</strong></span>
                        </div>
                      </div>
                    )}
                    
                    {/* Show rejection/cancellation reasons if they exist */}
                    {(request.rejectionReason || request.cancellationReason) && (
                      <div className="mt-3 p-3 bg-danger/10 border border-danger/30 rounded-lg">
                        <div className="flex items-center space-x-2 space-x-reverse mb-2">
                          <AlertTriangle className="h-4 w-4 text-danger" />
                          <span className="font-medium text-danger">
                            {request.rejectionReason ? 'سبب الرفض:' : 'سبب الإلغاء:'}
                          </span>
                        </div>
                        <p className="text-danger text-sm">
                          {request.rejectionReason || request.cancellationReason}
                        </p>
                        <p className="text-danger text-xs mt-1">
                          التاريخ: {new Date(request.rejectionDate || request.cancellationDate || '').toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 space-x-reverse">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onViewDetails(request)}
                      className="hover:bg-muted/50 hover:border-primary/30 hover:text-primary transition-colors"
                    >
                      <Eye className="h-4 w-4 ms-1" />
                      عرض
                    </Button>
                    
                    {/* Edit button - only for draft and pending requests */}
                    {(request.status === 'draft' || request.status === 'pending') && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onEditRequest(request)}
                        className="hover:bg-warning/10 hover:border-warning/40 hover:text-warning-foreground transition-colors"
                      >
                        <Edit className="h-4 w-4 ms-1" />
                        تعديل
                      </Button>
                    )}
                    
                    {/* Send to warehouse button - only for draft requests */}
                    {request.status === 'draft' && (
                      <Button 
                        size="sm" 
                        onClick={() => onStartRequest(request.id, request.title)}
                        className="bg-success hover:bg-success transition-colors"
                      >
                        <Play className="h-4 w-4 ms-1" />
                        إرسال للمستودع
                      </Button>
                    )}
                    
                    {/* Confirm pickup button - only for ready-for-pickup requests */}
                    {request.status === 'ready-for-pickup' && (
                      <>
                        <Button 
                          size="sm"
                          onClick={() => onUpdateStatus(request.id, 'completed')}
                          className="bg-success hover:bg-success transition-colors"
                        >
                          <Check className="h-4 w-4 ms-1" />
                          تأكيد الاستلام
                        </Button>
                        
                        {/* Report undelivered button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm"
                              variant="destructive"
                              className="hover:bg-danger transition-colors"
                            >
                              <RefreshCw className="h-4 w-4 ms-1" />
                              لم يتم الاستلام
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent dir="rtl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="size-5 text-warning-foreground" />الإبلاغ عن عدم الاستلام</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل تؤكد أنه لم يتم استلام هذا الطلب؟ سيتم إرجاع العناصر للمخزون ووضع الطلب في حالة "لم يتم الاستلام".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onReportUndelivered?.(request.id, request.title)}>
                                تأكيد عدم الاستلام
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                    
                    {/* Re-send button for undelivered requests */}
                    {request.status === 'undelivered' && (
                      <Button 
                        size="sm"
                        onClick={() => onUpdateStatus(request.id, 'pending')}
                        className="bg-warning hover:bg-warning/80 text-warning-foreground transition-colors"
                      >
                        <RefreshCw className="h-4 w-4 ms-1" />
                        إعادة الإرسال
                      </Button>
                    )}
                    
                    {/* Delete button - for draft requests */}
                    {request.status === 'draft' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" className="hover:bg-danger transition-colors">
                            <Trash2 className="h-4 w-4 ms-1" />
                            حذف
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="size-5 text-warning-foreground" />هل أنت متأكد؟</AlertDialogTitle>
                            <AlertDialogDescription>
                              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف هذا الطلب نهائياً من النظام.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteRequest(request.id, request.title)}>
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    
                    {/* Delete button - for cancelled requests */}
                    {request.status === 'cancelled' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" className="hover:bg-danger transition-colors">
                            <Trash2 className="h-4 w-4 ms-1" />
                            حذف نهائياً
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="size-5 text-warning-foreground" />حذف الطلب الملغي</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل تريد حذف هذا الطلب الملغي نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteRequest(request.id, request.title)}>
                              حذف نهائياً
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    
                    {/* Cancel button - ONLY for pending and in-progress requests (NOT ready-for-pickup) */}
                    {(request.status === 'pending' || request.status === 'in-progress') && onCancelRequest && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" className="hover:bg-danger transition-colors">
                            <Trash2 className="h-4 w-4 ms-1" />
                            إلغاء الطلب
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="size-5 text-warning-foreground" />هل تريد إلغاء هذا الطلب؟</AlertDialogTitle>
                            <AlertDialogDescription>
                              سيتم إلغاء الطلب وإرسال سبب الإلغاء للمستودع. هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onCancelRequest(request)}>
                              تأكيد الإلغاء
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RequestsList;
