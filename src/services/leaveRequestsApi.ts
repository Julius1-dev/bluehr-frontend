import axios from 'axios';
import { BACKEND_URL } from '../lib/config';

const API_BASE = BACKEND_URL;

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Company Admin Leave Requests APIs
export const leaveRequestsApi = {
  // Get all leave requests for the company
  async getAllLeaveRequests() {
    const headers = getAuthHeaders();
    const res = await axios.get(`${API_BASE}/company-admin/leave-requests`, { 
      headers, 
      withCredentials: true 
    });
    return res.data;
  },

  // Get leave summary for the company
  async getLeaveSummary() {
    const headers = getAuthHeaders();
    const res = await axios.get(`${API_BASE}/company-admin/leave-requests/summary`, { 
      headers, 
      withCredentials: true 
    });
    return res.data;
  },

  // Approve leave request
  async approveLeaveRequest(requestId: number) {
    const headers = getAuthHeaders();
    const res = await axios.put(`${API_BASE}/company-admin/leave-requests/${requestId}/approve`, {}, { 
      headers, 
      withCredentials: true 
    });
    return res.data;
  },

  // Reject leave request
  async rejectLeaveRequest(requestId: number, rejectionReason: string) {
    const headers = getAuthHeaders();
    const res = await axios.put(`${API_BASE}/company-admin/leave-requests/${requestId}/reject`, 
      { rejectionReason }, 
      { headers, withCredentials: true }
    );
    return res.data;
  },
}; 