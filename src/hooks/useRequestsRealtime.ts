import { useEffect } from "react";
import { getSocket } from "@/services/socket";

interface Handlers {
  onNew?: (request: any) => void;
  onStatusChanged?: (request: any) => void;
}

export function useRequestsRealtime({ onNew, onStatusChanged }: Handlers) {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    if (onNew) socket.on('request:new', onNew);
    if (onStatusChanged) socket.on('request:status-changed', onStatusChanged);

    return () => {
      if (onNew) socket.off('request:new', onNew);
      if (onStatusChanged) socket.off('request:status-changed', onStatusChanged);
    };
  }, [onNew, onStatusChanged]);
}
