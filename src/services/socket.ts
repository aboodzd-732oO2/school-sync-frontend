import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1';
// نستنتج أصل السيرفر من VITE_API_URL
const SOCKET_URL = API_URL.replace(/\/api\/v1\/?$/, '');

let _socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (_socket?.connected) return _socket;
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
  _socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
  });
  return _socket;
}

export function getSocket(): Socket | null {
  return _socket;
}

export function disconnectSocket() {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
}
