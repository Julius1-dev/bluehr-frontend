import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const OffboardingApi = {
  async listRequests() {
    const headers = getAuthHeaders();
    const res = await axios.get(`${API_BASE}/company-admin/offboarding`, { headers, withCredentials: true });
    return res.data;
  },
  async createRequest(data: any) {
    const headers = getAuthHeaders();
    const res = await axios.post(`${API_BASE}/company-admin/offboarding`, data, { headers, withCredentials: true });
    return res.data;
  },
  async createEmployeeRequest(data: any) {
    const headers = getAuthHeaders();
    const res = await axios.post(`${API_BASE}/employee/offboarding`, data, { headers, withCredentials: true });
    return res.data;
  },
  async updateStatus(id: string, status: string) {
    const headers = getAuthHeaders();
    const res = await axios.patch(`${API_BASE}/company-admin/offboarding/${id}/status`, { status }, { headers, withCredentials: true });
    return res.data;
  },
  async complete(id: string) {
    const headers = getAuthHeaders();
    const res = await axios.post(`${API_BASE}/company-admin/offboarding/${id}/complete`, {}, { headers, withCredentials: true });
    return res.data;
  },
  async reactivate(id: string) {
    const headers = getAuthHeaders();
    const res = await axios.post(`${API_BASE}/company-admin/offboarding/${id}/reactivate`, {}, { headers, withCredentials: true });
    return res.data;
  }
}; 