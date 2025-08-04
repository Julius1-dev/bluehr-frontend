import { io, Socket } from 'socket.io-client';

import { BACKEND_URL } from '../lib/config';

const SOCKET_URL = BACKEND_URL;

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