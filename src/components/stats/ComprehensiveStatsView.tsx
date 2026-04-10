
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, Package, Calendar, AlertTriangle } from "lucide-react";

interface ComprehensiveStatsViewProps {
  data: any;
  type: string;
}

const ComprehensiveStatsView = ({ data, type }: ComprehensiveStatsViewProps) => {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'in-progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      case 'rejected': return 'مرفوض';
      case 'cancelled': return 'ملغي';
      case 'draft': return 'مسودة';
      case 'ready-for-pickup': return 'جاهز للاستلام';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-orange-100 text-orange-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'ready-for-pickup': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return priority;
    }
  };

  const renderDetailedRequestsView = () => {
    if (!data || !data.statusBreakdown) return null;

    const totalRequests = data.totalStats?.total || 0;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{totalRequests}</p>
                  <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Package className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{data.totalStats?.totalQuantity || 0}</p>
                  <p className="text-sm text-gray-600">إجمالي العناصر</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">{data.totalStats?.totalStudentsAffected || 0}</p>
                  <p className="text-sm text-gray-600">الطلاب المتأثرين</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-orange-600">{Object.keys(data.departmentBreakdown || {}).length}</p>
                  <p className="text-sm text-gray-600">الأقسام النشطة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>📊 توزيع الطلبات حسب الحالة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(data.statusBreakdown || {}).map(([status, stats]: [string, any]) => {
                if (!stats || stats.count === 0) return null;
                const percentage = totalRequests > 0 ? Math.round((stats.count / totalRequests) * 100) : 0;
                
                return (
                  <div key={status} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(status)}>
                        {getStatusText(status)}
                      </Badge>
                      <span className="text-sm font-medium">{stats.count} طلب ({percentage}%)</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="text-xs text-gray-500 grid grid-cols-3 gap-2">
                      <span>👥 {stats.students || 0} طالب</span>
                      <span>📦 {stats.items || 0} عنصر</span>
                      <span>📈 {stats.count > 0 ? Math.round((stats.students || 0) / stats.count) : 0} متوسط</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        {data.priorityBreakdown && (
          <Card>
            <CardHeader>
              <CardTitle>🔥 توزيع الطلبات حسب الأولوية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data.priorityBreakdown).map(([priority, stats]: [string, any]) => {
                  if (!stats || stats.count === 0) return null;
                  const percentage = totalRequests > 0 ? Math.round((stats.count / totalRequests) * 100) : 0;
                  
                  return (
                    <div key={priority} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Badge className={
                            priority === 'high' ? 'bg-red-100 text-red-800' :
                            priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {getPriorityText(priority)}
                          </Badge>
                          <span className="text-sm font-medium">{stats.count} طلب</span>
                        </div>
                        <span className="text-sm text-gray-500">{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="text-xs text-gray-500 flex space-x-4 space-x-reverse">
                        <span>👥 {stats.students || 0} طالب</span>
                        <span>📦 {stats.items || 0} عنصر</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Department Breakdown */}
        {data.departmentBreakdown && (
          <Card>
            <CardHeader>
              <CardTitle>🏢 توزيع الطلبات حسب الأقسام</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(data.departmentBreakdown)
                  .sort(([,a]: [string, any], [,b]: [string, any]) => (b.count || 0) - (a.count || 0))
                  .map(([department, stats]: [string, any]) => {
                    if (!stats) return null;
                    const percentage = totalRequests > 0 ? Math.round((stats.count / totalRequests) * 100) : 0;
                    
                    return (
                      <div key={department} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{department}</span>
                          <span className="text-sm text-gray-500">{stats.count || 0} طلب ({percentage}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="text-xs text-gray-500 flex space-x-4 space-x-reverse">
                          <span>👥 {stats.students || 0} طالب</span>
                          <span>📦 {stats.items || 0} عنصر</span>
                          <span>📊 {stats.count > 0 ? Math.round((stats.students || 0) / stats.count) : 0} متوسط/طلب</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderDetailedItemsView = () => {
    if (!Array.isArray(data)) return null;

    return (
      <div className="space-y-4">
        {data.map((item: any, index: number) => (
          <Card key={index} className="border-r-4 border-r-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{item.name || 'عنصر غير محدد'}</CardTitle>
                <Badge className="bg-blue-100 text-blue-800">
                  {item.totalQuantity || 0} {item.unit || 'وحدة'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Status Breakdown for this item */}
                {item.statusBreakdown && (
                  <div>
                    <h4 className="font-semibold text-sm mb-3">توزيع الكميات حسب حالة الطلبات:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(item.statusBreakdown).map(([status, quantity]: [string, any]) => (
                        <div key={status} className="text-center p-2 bg-gray-50 rounded">
                          <Badge className={getStatusColor(status)} variant="outline">
                            {getStatusText(status)}
                          </Badge>
                          <p className="text-sm font-medium mt-1">{quantity || 0} {item.unit || 'وحدة'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Priority Breakdown for this item */}
                {item.priorityBreakdown && (
                  <div>
                    <h4 className="font-semibold text-sm mb-3">توزيع الكميات حسب الأولوية:</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(item.priorityBreakdown).map(([priority, quantity]: [string, any]) => (
                        <div key={priority} className="text-center p-2 bg-gray-50 rounded">
                          <Badge className={
                            priority === 'high' ? 'bg-red-100 text-red-800' :
                            priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          } variant="outline">
                            {getPriorityText(priority)}
                          </Badge>
                          <p className="text-sm font-medium mt-1">{quantity || 0} {item.unit || 'وحدة'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Individual Requests */}
                {item.requests && Array.isArray(item.requests) && (
                  <div>
                    <h4 className="font-semibold text-sm mb-3">تفاصيل الطلبات ({item.requests.length} طلب):</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {item.requests.map((request: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-white p-3 rounded border">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <Badge className={getStatusColor(request.status || '')} variant="outline">
                              {getStatusText(request.status || '')}
                            </Badge>
                            <span className="font-medium">{request.institution || 'غير محدد'}</span>
                            <span className="text-gray-500">#{(request.id || '').toString().slice(-6)}</span>
                          </div>
                          <div className="text-left space-y-1">
                            <div className="font-medium">{request.quantity || 0} {item.unit || 'وحدة'}</div>
                            <div className="text-gray-500">👥 {request.students || 0} طالب</div>
                            <div className="text-gray-500">{request.date ? new Date(request.date).toLocaleDateString('ar-SA') : 'غير محدد'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderStudentsDetailedView = () => {
    if (!data) return null;

    return (
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">{data.totalStudents || 0}</p>
                  <p className="text-sm text-gray-600">إجمالي الطلاب</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{data.averageStudentsPerRequest || 0}</p>
                  <p className="text-sm text-gray-600">متوسط/طلب</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{Object.keys(data.studentsByInstitution || {}).length}</p>
                  <p className="text-sm text-gray-600">المؤسسات</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students by Status */}
        {data.studentsByStatus && (
          <Card>
            <CardHeader>
              <CardTitle>👥 توزيع الطلاب حسب حالة الطلبات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(data.studentsByStatus).map(([status, students]: [string, any]) => {
                  const percentage = data.totalStudents > 0 ? Math.round((students / data.totalStudents) * 100) : 0;
                  
                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(status)}>
                          {getStatusText(status)}
                        </Badge>
                        <span className="text-sm font-medium">{students || 0} طالب ({percentage}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Students by Institution */}
        {data.studentsByInstitution && (
          <Card>
            <CardHeader>
              <CardTitle>🏢 توزيع الطلاب حسب المؤسسات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {Object.entries(data.studentsByInstitution)
                  .sort(([,a]: [string, any], [,b]: [string, any]) => (b.students || 0) - (a.students || 0))
                  .map(([institution, stats]: [string, any]) => {
                    if (!stats) return null;
                    const percentage = data.totalStudents > 0 ? Math.round((stats.students / data.totalStudents) * 100) : 0;
                    
                    return (
                      <div key={institution} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{institution}</span>
                          <span className="text-sm text-gray-500">
                            {stats.students || 0} طالب • {stats.requests || 0} طلب
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="text-xs text-gray-500">
                          {percentage}% من إجمالي الطلاب • متوسط {stats.requests > 0 ? Math.round((stats.students || 0) / stats.requests) : 0} طالب/طلب
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Requests by Students */}
        {data.requestsWithMostStudents && Array.isArray(data.requestsWithMostStudents) && (
          <Card>
            <CardHeader>
              <CardTitle>🔝 الطلبات الأكثر تأثيراً على الطلاب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.requestsWithMostStudents.map((request: any, index: number) => (
                  <div key={request.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <span className="font-bold text-lg text-blue-600">#{index + 1}</span>
                      <div>
                        <p className="font-medium">{request.title || 'غير محدد'}</p>
                        <p className="text-sm text-gray-600">{request.location || 'غير محدد'} - {request.department || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-purple-600">{request.studentsAffected || 0} طالب</p>
                      <Badge className={getStatusColor(request.status || '')} variant="outline">
                        {getStatusText(request.status || '')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderStatusSpecificView = () => {
    if (!data || !data.requests || !data.stats) return null;

    return (
      <div className="space-y-6">
        {/* Status Summary */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{data.stats.count || 0}</p>
                <p className="text-sm text-gray-600">عدد الطلبات</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{data.stats.students || 0}</p>
                <p className="text-sm text-gray-600">الطلاب المتأثرين</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{data.stats.items || 0}</p>
                <p className="text-sm text-gray-600">إجمالي العناصر</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{data.stats.institutions || 0}</p>
                <p className="text-sm text-gray-600">المؤسسات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips and Insights */}
        {data.tips && Array.isArray(data.tips) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <span>نصائح ومعلومات مهمة</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.tips.map((tip: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 space-x-reverse text-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>📋 قائمة الطلبات المفصلة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.requests.map((request: any) => (
                <div key={request.id || Math.random()} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <Badge className={getStatusColor(request.status || '')}>
                        {getStatusText(request.status || '')}
                      </Badge>
                      <span className="font-medium">{request.title || 'غير محدد'}</span>
                    </div>
                    <span className="text-sm text-gray-500">#{(request.id || '').toString().slice(-6)}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>📍 {request.location || 'غير محدد'}</div>
                    <div>🏢 {request.department || 'غير محدد'}</div>
                    <div>👥 {request.studentsAffected || 0} طالب</div>
                    <div>📅 {request.dateSubmitted ? new Date(request.dateSubmitted).toLocaleDateString('ar-SA') : 'غير محدد'}</div>
                  </div>
                  
                  {request.requestedItems && Array.isArray(request.requestedItems) && request.requestedItems.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">العناصر المطلوبة:</p>
                      <div className="flex flex-wrap gap-2">
                        {request.requestedItems.map((item: any, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {item.itemName || 'غير محدد'} - {item.quantity || 0} {item.unitType || 'وحدة'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render based on type and data structure
  if (type === 'detailed-requests' && data && data.statusBreakdown) {
    return renderDetailedRequestsView();
  }
  
  if (type === 'detailed-items' && Array.isArray(data)) {
    return renderDetailedItemsView();
  }
  
  if (type === 'students' && data && data.totalStudents !== undefined) {
    return renderStudentsDetailedView();
  }
  
  if (data && data.requests && data.stats) {
    return renderStatusSpecificView();
  }

  return (
    <div className="text-center py-8">
      <p className="text-gray-500">لا توجد بيانات متاحة للعرض</p>
    </div>
  );
};

export default ComprehensiveStatsView;
