import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Company Admin Attendance APIs
export const attendanceApi = {
  // Get employee attendance records
  async getEmployeeAttendanceRecords(date?: string, departmentId?: string, startDate?: string, endDate?: string) {
    const params: any = {};
    if (date) params.date = date;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (departmentId) params.department_id = departmentId;
    
    const headers = getAuthHeaders();
    const res = await axios.get(`${API_BASE}/company-admin/attendance/employee-records`, { 
      params, 
      headers, 
      withCredentials: true 
    });
    return res.data;
  },

  // Get attendance summary
  async getAttendanceSummary(date?: string, startDate?: string, endDate?: string) {
    const params: any = {};
    if (date) params.date = date;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const headers = getAuthHeaders();
    const res = await axios.get(`${API_BASE}/company-admin/attendance/summary`, { 
      params, 
      headers, 
      withCredentials: true 
    });
    return res.data;
  },

  // Get recent attendance issues
  async getRecentIssues(days: number = 7) {
    const params = { days: days.toString() };
    
    const headers = getAuthHeaders();
    const res = await axios.get(`${API_BASE}/company-admin/attendance/recent-issues`, { 
      params, 
      headers, 
      withCredentials: true 
    });
    return res.data;
  },

  // Get departments for filtering
  async getDepartments() {
    const headers = getAuthHeaders();
    const res = await axios.get(`${API_BASE}/company-admin/departments`, { 
      headers, 
      withCredentials: true 
    });
    return res.data;
  },
}; 