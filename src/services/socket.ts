import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export function connectSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true
    });
  }
  return socket;
}

export function joinTicketRoom(ticketId: number | string) {
  if (socket) {
    socket.emit('join_ticket', ticketId);
  }
}

export function leaveTicketRoom(ticketId: number | string) {
  if (socket) {
    socket.emit('leave_ticket', ticketId);
  }
} 