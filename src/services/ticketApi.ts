import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function getUserFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return jwtDecode(token) as { id: number; role: string; company_id?: number; email?: string; name?: string };
  } catch {
    return null;
  }
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const TicketApi = {
  // Tickets
  async listTickets(role: 'super-admin' | 'company-admin' | 'employee', companyId?: number) {
    const url = role === 'super-admin'
      ? `${API_BASE}/super-admin/tickets`
      : `${API_BASE}/company-admin/tickets`;
    const params = companyId ? { company_id: companyId } : undefined;
    const headers = getAuthHeaders();
    const res = await axios.get(url, { params, headers, withCredentials: true });
    return res.data;
  },
  async getTicket(role: 'super-admin' | 'company-admin' | 'employee', id: number) {
    const url = role === 'super-admin'
      ? `${API_BASE}/super-admin/tickets/${id}`
      : `${API_BASE}/company-admin/tickets/${id}`;
    const headers = getAuthHeaders();
    const res = await axios.get(url, { headers, withCredentials: true });
    return res.data;
  },
  async createTicket(role: 'super-admin' | 'company-admin', data: any) {
    if (role === 'super-admin') {
      throw new Error('Super admin cannot create tickets');
    }
    const url = `${API_BASE}/company-admin/tickets`;
    const headers = getAuthHeaders();
    const res = await axios.post(url, data, { headers, withCredentials: true });
    return res.data;
  },
  async updateTicket(role: 'super-admin' | 'company-admin' | 'employee', id: number, data: any) {
    const url = role === 'super-admin'
      ? `${API_BASE}/super-admin/tickets/${id}`
      : `${API_BASE}/company-admin/tickets/${id}`;
    const headers = getAuthHeaders();
    const res = await axios.put(url, data, { headers, withCredentials: true });
    return res.data;
  },
  async closeTicket(role: 'super-admin' | 'company-admin' | 'employee', id: number) {
    const url = role === 'super-admin'
      ? `${API_BASE}/super-admin/tickets/${id}/close`
      : `${API_BASE}/company-admin/tickets/${id}/close`;
    const headers = getAuthHeaders();
    const res = await axios.post(url, {}, { headers, withCredentials: true });
    return res.data;
  },
  // Messages
  async listMessages(role: 'super-admin' | 'company-admin' | 'employee', ticketId: number) {
    const url = role === 'super-admin'
      ? `${API_BASE}/super-admin/tickets/messages`
      : `${API_BASE}/company-admin/tickets/messages`;
    const headers = getAuthHeaders();
    const res = await axios.get(url, { params: { ticket_id: ticketId }, headers, withCredentials: true });
    return res.data;
  },
  async sendMessage(role: 'super-admin' | 'company-admin' | 'employee', data: any) {
    const url = role === 'super-admin'
      ? `${API_BASE}/super-admin/tickets/message`
      : `${API_BASE}/company-admin/tickets/message`;
    const headers = getAuthHeaders();
    const res = await axios.post(url, data, { headers, withCredentials: true });
    return res.data;
  },
  // Callback
  async requestCallback(role: 'super-admin' | 'company-admin' | 'employee', data: any) {
    const url = role === 'super-admin'
      ? `${API_BASE}/super-admin/tickets/request-callback`
      : `${API_BASE}/company-admin/tickets/request-callback`;
    const headers = getAuthHeaders();
    const res = await axios.post(url, data, { headers, withCredentials: true });
    return res.data;
  },
  // Export
  async exportMessages(role: 'super-admin' | 'company-admin' | 'employee', ticketId: number) {
    const url = role === 'super-admin'
      ? `${API_BASE}/super-admin/tickets/export-messages`
      : `${API_BASE}/company-admin/tickets/export-messages`;
    const headers = getAuthHeaders();
    const res = await axios.get(url, { params: { ticket_id: ticketId }, headers, withCredentials: true });
    return res.data;
  },
  async createSuperAdminTicket(data: any) {
    const url = `${API_BASE}/super-admin/tickets`;
    const headers = getAuthHeaders();
    const res = await axios.post(url, data, { headers, withCredentials: true });
    return res.data;
  },
  async listTicketsByAssignee(userId: number) {
    const url = `${API_BASE}/company-admin/tickets`;
    const params = { assigned_to: userId };
    const headers = getAuthHeaders();
    const res = await axios.get(url, { params, headers, withCredentials: true });
    return res.data;
  },
  // Employee endpoints
  async employeeListTickets() {
    const url = `${API_BASE}/employee/tickets`;
    const headers = getAuthHeaders();
    const res = await axios.get(url, { headers, withCredentials: true });
    return res.data;
  },
  async employeeGetTicket(id: number) {
    const url = `${API_BASE}/employee/tickets/${id}`;
    const headers = getAuthHeaders();
    const res = await axios.get(url, { headers, withCredentials: true });
    return res.data;
  },
  async employeeCreateTicket(data: any) {
    const url = `${API_BASE}/employee/tickets`;
    const headers = getAuthHeaders();
    const res = await axios.post(url, data, { headers, withCredentials: true });
    return res.data;
  },
  async employeeCreateMessage(ticketId: number, message: string) {
    const url = `${API_BASE}/employee/tickets/${ticketId}/message`;
    const headers = getAuthHeaders();
    const res = await axios.post(url, { message }, { headers, withCredentials: true });
    return res.data;
  },
  async employeeListMessages(ticketId: number) {
    const url = `${API_BASE}/employee/tickets/messages`;
    const headers = getAuthHeaders();
    const res = await axios.get(url, { params: { ticket_id: ticketId }, headers, withCredentials: true });
    return res.data;
  },
  async employeeCloseTicket(ticketId: number) {
    const url = `${API_BASE}/employee/tickets/${ticketId}/close`;
    const headers = getAuthHeaders();
    const res = await axios.post(url, {}, { headers, withCredentials: true });
    return res.data;
  },
  async sendToSuperAdminAsCompanyAdmin(data: any) {
    const url = `${API_BASE}/company-admin/tickets/send-to-super-admin`;
    const headers = getAuthHeaders();
    const res = await axios.post(url, data, { headers, withCredentials: true });
    return res.data;
  },
  async sendToSuperAdminAsEmployee(data: any) {
    const url = `${API_BASE}/employee/tickets/send-to-super-admin`;
    const headers = getAuthHeaders();
    const res = await axios.post(url, data, { headers, withCredentials: true });
    return res.data;
  }
}; 