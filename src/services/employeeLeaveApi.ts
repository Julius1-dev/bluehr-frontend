import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Employee Leave APIs
export const employeeLeaveApi = {
  // Get employee's leave balances
  async getLeaveBalances() {
    try {
      const headers = getAuthHeaders();
      console.log('Making request to:', `${API_BASE}/employee/leave/balances`);
      console.log('Headers:', headers);
      
      const res = await axios.get(`${API_BASE}/employee/leave/balances`, { 
        headers, 
        withCredentials: true 
      });
      
      console.log('Leave balances response:', res.data);
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      console.log('leaveBalances property:', res.data.leaveBalances);
      console.log('Type of leaveBalances:', typeof res.data.leaveBalances);
      console.log('Is leaveBalances array?', Array.isArray(res.data.leaveBalances));
      return res.data;
    } catch (error) {
      console.error('Error in getLeaveBalances:', error);
      throw error;
    }
  },

  // Get upcoming leave for employee
  async getUpcomingLeave() {
    try {
      const headers = getAuthHeaders();
      const res = await axios.get(`${API_BASE}/employee/leave/upcoming`, { 
        headers, 
        withCredentials: true 
      });
      console.log('Upcoming leave response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error in getUpcomingLeave:', error);
      throw error;
    }
  },

  // Get leave history for employee
  async getLeaveHistory() {
    try {
      const headers = getAuthHeaders();
      const res = await axios.get(`${API_BASE}/employee/leave/history`, { 
        headers, 
        withCredentials: true 
      });
      console.log('Leave history response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error in getLeaveHistory:', error);
      throw error;
    }
  },

  // Get team leave schedule for employee's department
  async getTeamLeave() {
    try {
      const headers = getAuthHeaders();
      const res = await axios.get(`${API_BASE}/employee/leave/team`, { 
        headers, 
        withCredentials: true 
      });
      console.log('Team leave response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error in getTeamLeave:', error);
      throw error;
    }
  },

  // Get available leave types for employee
  async getAvailableLeaveTypes() {
    try {
      const headers = getAuthHeaders();
      const res = await axios.get(`${API_BASE}/employee/leave/types`, { 
        headers, 
        withCredentials: true 
      });
      console.log('Available leave types response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error in getAvailableLeaveTypes:', error);
      throw error;
    }
  },

  // Submit leave request
  async submitLeaveRequest(data: {
    leaveTypeId: number;
    startDate: string;
    endDate: string;
    reason: string;
  }) {
    try {
      const headers = getAuthHeaders();
      const res = await axios.post(`${API_BASE}/employee/leave/request`, data, { 
        headers, 
        withCredentials: true 
      });
      return res.data;
    } catch (error) {
      console.error('Error in submitLeaveRequest:', error);
      throw error;
    }
  },
}; 