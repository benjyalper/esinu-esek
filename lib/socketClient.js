/**
 * Singleton Socket.IO client
 * Call getSocket() anywhere on the client side to get the same socket instance
 */
import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (typeof window === 'undefined') return null; // SSR guard

  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SERVER_URL || window.location.origin;
    socket = io(url, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
    });
    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });
    socket.on('kicked', () => {
      alert('הוצאת מהחדר על ידי המארח.');
      sessionStorage.clear();
      window.location.href = '/';
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
