import axios from 'axios';
import { BACKEND_URL } from '../lib/config';

const API_BASE = BACKEND_URL;

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const LeaveTypeApi = {
  // Leave Types
  async listLeaveTypes() {
    const url = `${API_BASE}/company-admin/leave-types`;
    const headers = getAuthHeaders();
    const res = await axios.get(url, { headers, withCredentials: true });
    return res.data;
  },
  async createLeaveType(data) {
    const url = `${API_BASE}/company-admin/leave-types`;
    const headers = getAuthHeaders();
    const res = await axios.post(url, data, { headers, withCredentials: true });
    return res.data;
  },
  async updateLeaveType(id, data) {
    const url = `${API_BASE}/company-admin/leave-types/${id}`;
    const headers = getAuthHeaders();
    const res = await axios.put(url, data, { headers, withCredentials: true });
    return res.data;
  },
  async deleteLeaveType(id) {
    const url = `${API_BASE}/company-admin/leave-types/${id}`;
    const headers = getAuthHeaders();
    const res = await axios.delete(url, { headers, withCredentials: true });
    return res.data;
  },
  // Departments
  async listDepartments() {
    const url = `${API_BASE}/company-admin/departments`;
    const headers = getAuthHeaders();
    const res = await axios.get(url, { headers, withCredentials: true });
    return res.data;
  },
  // Employees
  async listEmployees() {
    const url = `${API_BASE}/company-admin/users`;
    const headers = getAuthHeaders();
    const res = await axios.get(url, { headers, withCredentials: true });
    return res.data;
  }
}; 