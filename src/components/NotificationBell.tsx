import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Check, BellOff } from "lucide-react";
import { notifications as notifApi } from "@/services/api";
import { getSocket } from "@/services/socket";
import { EmptyState } from "@/components/common/EmptyState";

interface Notification {
  id: number;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  linkType: string | null;
  linkId: string | null;
  createdAt: string;
}

const NotificationBell = () => {
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const load = () => {
    notifApi.list({ pageSize: '20' }).then((res: any) => {
      setItems(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    }).catch(() => {});
  };

  useEffect(() => {
    load();
    // safety net: polling كل دقيقتين (real-time عبر socket.io هو الأساسي)
    const interval = setInterval(load, 120000);

    const socket = getSocket();
    const handler = (n: Notification) => {
      setItems(prev => {
        if (prev.some(p => p.id === n.id)) return prev;
        return [n, ...prev].slice(0, 20);
      });
      if (!n.read) setUnreadCount(c => c + 1);
    };
    socket?.on('notification:new', handler);

    return () => {
      clearInterval(interval);
      socket?.off('notification:new', handler);
    };
  }, []);

  const handleMarkRead = async (id: number) => {
    await notifApi.markRead(id).catch(() => {});
    load();
  };

  const handleMarkAllRead = async () => {
    await notifApi.markAllRead().catch(() => {});
    load();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -start-2 h-5 min-w-5 p-0 flex items-center justify-center text-xs bg-danger/100">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end" dir="rtl">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold">الإشعارات</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
              <Check className="h-3 w-3 me-1" />
              قراءة الكل
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <EmptyState
              icon={BellOff}
              title="لا توجد إشعارات"
              description="ستظهر هنا الإشعارات الجديدة فور وصولها"
              className="py-8"
            />
          ) : items.map(n => (
            <div
              key={n.id}
              className={`p-3 border-b hover:bg-muted/30 cursor-pointer ${!n.read ? 'bg-info/10' : ''}`}
              onClick={() => !n.read && handleMarkRead(n.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{n.title}</p>
                  {n.body && <p className="text-xs text-muted-foreground mt-1">{n.body}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleString('ar-EG')}
                  </p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-info mt-1 flex-shrink-0"></div>}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
