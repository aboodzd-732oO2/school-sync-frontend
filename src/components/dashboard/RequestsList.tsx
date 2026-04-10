import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Clock, CheckCircle, Users, Package, FileText, Edit, Trash2, Eye, Play, Search, Calendar, MapPin, Check, RefreshCw } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Request, UserData } from "@/types/dashboard";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ready-for-pickup': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'undelivered': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return '📝 مسودة';
      case 'pending': return '⏳ قيد الانتظار';
      case 'in-progress': return '🔄 قيد التنفيذ';
      case 'ready-for-pickup': return '📦 جاهز للاستلام';
      case 'completed': return '✅ مكتمل';
      case 'undelivered': return '🔄 لم يتم الاستلام - تم إرجاع العناصر';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in-progress': return <AlertTriangle className="h-4 w-4" />;
      case 'ready-for-pickup': return <Package className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'undelivered': return <RefreshCw className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴 عالية';
      case 'medium': return '🟡 متوسطة';
      case 'low': return '🟢 منخفضة';
      default: return priority;
    }
  };

  const getInstitutionTypeText = (type: string) => {
    return type === 'school' ? '🏫 مدرسة' : '🎓 جامعة';
  };

  return (
    <Card className="border-[hsl(142,30%,85%)]">
      <CardHeader className="bg-gradient-to-r from-[hsl(142,60%,25%)] to-[hsl(142,50%,20%)] text-white">
        <CardTitle className="flex items-center space-x-2 space-x-reverse text-white">
          <span>📋</span>
          <span>الطلبات الحديثة</span>
        </CardTitle>
        <CardDescription className="text-white/90">
          نظرة عامة مفصلة على جميع طلبات {user?.institutionName}
        </CardDescription>
        
        {/* Search Bar */}
        <div className="flex items-center space-x-2 space-x-reverse mt-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="🔍 ابحث في الطلبات حسب العنوان..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
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
          <div className="text-sm text-gray-600 mt-2">
            {filteredRequests.length === 0 ? (
              <span>❌ لم يتم العثور على نتائج للبحث عن "{searchTerm}"</span>
            ) : (
              <span>✅ تم العثور على {filteredRequests.length} نتيجة للبحث عن "{searchTerm}"</span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            {searchTerm ? (
              <>
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 text-lg">لم يتم العثور على طلبات تحتوي على "{searchTerm}"</p>
                <p className="text-gray-400 text-sm mt-2">جرب البحث بكلمات أخرى أو امسح البحث لعرض جميع الطلبات</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-500 text-lg">لم يتم تقديم أي طلبات بعد.</p>
                <p className="text-gray-400 text-sm mt-2">ابدأ بتقديم طلبك الأول!</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-all duration-200 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 space-x-reverse mb-3">
                      <h3 className="font-semibold text-lg">{request.title}</h3>
                      <Badge className={`${getPriorityColor(request.priority)} border`}>
                        {getPriorityText(request.priority)}
                      </Badge>
                      <Badge className={`${getStatusColor(request.status)} border`}>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          {getStatusIcon(request.status)}
                          <span>{getStatusText(request.status)}</span>
                        </div>
                      </Badge>
                      <Badge variant="outline" className="border-gray-300">
                        {getInstitutionTypeText(request.institutionType)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{request.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      {request.quantity > 0 && (
                        <div className="flex items-center space-x-2 space-x-reverse bg-[hsl(142,30%,96%)] p-2 rounded">
                          <Package className="h-4 w-4 text-[hsl(142,60%,25%)]" />
                          <span className="font-medium">{request.quantity} {request.unitType}</span>
                        </div>
                      )}
                      {request.studentsAffected > 0 && (
                        <div className="flex items-center space-x-2 space-x-reverse bg-[hsl(142,30%,96%)] p-2 rounded">
                          <Users className="h-4 w-4 text-[hsl(142,60%,25%)]" />
                          <span className="font-medium">{request.studentsAffected} طالب</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 space-x-reverse bg-gray-50 p-2 rounded">
                        <Calendar className="h-4 w-4 text-gray-600" />
                        <span>{new Date(request.dateSubmitted).toLocaleDateString('ar-EG')}</span>
                      </div>
                      {request.schoolLocation && (
                        <div className="flex items-center space-x-2 space-x-reverse bg-[hsl(38,30%,96%)] p-2 rounded">
                          <MapPin className="h-4 w-4 text-[hsl(38,85%,60%)]" />
                          <span>{request.schoolLocation}</span>
                        </div>
                      )}
                    </div>
                    
                    {request.status !== 'draft' && (
                      <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <AlertTriangle className="h-4 w-4" />
                          <span>موجه إلى: <strong className="text-[hsl(142,60%,25%)]">{request.routedTo}</strong></span>
                        </div>
                      </div>
                    )}
                    
                    {/* Show rejection/cancellation reasons if they exist */}
                    {(request.rejectionReason || request.cancellationReason) && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-2 space-x-reverse mb-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="font-medium text-red-800">
                            {request.rejectionReason ? 'سبب الرفض:' : 'سبب الإلغاء:'}
                          </span>
                        </div>
                        <p className="text-red-700 text-sm">
                          {request.rejectionReason || request.cancellationReason}
                        </p>
                        <p className="text-red-600 text-xs mt-1">
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
                      className="hover:bg-[hsl(142,30%,96%)] hover:border-[hsl(142,50%,30%)] hover:text-[hsl(142,60%,25%)] transition-all duration-200"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      عرض
                    </Button>
                    
                    {/* Edit button - only for draft and pending requests */}
                    {(request.status === 'draft' || request.status === 'pending') && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onEditRequest(request)}
                        className="hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700 transition-all duration-200"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        تعديل
                      </Button>
                    )}
                    
                    {/* Send to warehouse button - only for draft requests */}
                    {request.status === 'draft' && (
                      <Button 
                        size="sm" 
                        onClick={() => onStartRequest(request.id, request.title)}
                        className="bg-green-600 hover:bg-green-700 transition-all duration-200"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        إرسال للمستودع
                      </Button>
                    )}
                    
                    {/* Confirm pickup button - only for ready-for-pickup requests */}
                    {request.status === 'ready-for-pickup' && (
                      <>
                        <Button 
                          size="sm"
                          onClick={() => onUpdateStatus(request.id, 'completed')}
                          className="bg-green-600 hover:bg-green-700 transition-all duration-200"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          تأكيد الاستلام
                        </Button>
                        
                        {/* Report undelivered button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm"
                              variant="destructive"
                              className="hover:bg-red-700 transition-all duration-200"
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              لم يتم الاستلام
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent dir="rtl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>⚠️ الإبلاغ عن عدم الاستلام</AlertDialogTitle>
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
                        className="bg-orange-600 hover:bg-orange-700 transition-all duration-200"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        إعادة الإرسال
                      </Button>
                    )}
                    
                    {/* Delete button - for draft requests */}
                    {request.status === 'draft' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" className="hover:bg-red-700 transition-all duration-200">
                            <Trash2 className="h-4 w-4 mr-1" />
                            حذف
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>⚠️ هل أنت متأكد؟</AlertDialogTitle>
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
                          <Button size="sm" variant="destructive" className="hover:bg-red-700 transition-all duration-200">
                            <Trash2 className="h-4 w-4 mr-1" />
                            حذف نهائياً
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>⚠️ حذف الطلب الملغي</AlertDialogTitle>
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
                          <Button size="sm" variant="destructive" className="hover:bg-red-700 transition-all duration-200">
                            <Trash2 className="h-4 w-4 mr-1" />
                            إلغاء الطلب
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>⚠️ هل تريد إلغاء هذا الطلب؟</AlertDialogTitle>
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
