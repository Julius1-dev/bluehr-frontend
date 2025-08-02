import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const PerformanceApi = {
  // Employee: get own performance
  async getOwnPerformance() {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/employee/performance`, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },
  // Admin: get any employee's performance
  async getPerformance(employeeId) {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/company-admin/performance/${employeeId}`, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },
  // Admin: upsert any employee's performance
  async upsertPerformance(employeeId, data) {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/company-admin/performance/${employeeId}`, data, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },
  // Employee: add a new goal with milestones
  async addGoal(goal) {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/employee/performance/goals`, { goal }, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },
  // Admin: get all employee goals
  async getAllEmployeeGoals() {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/company-admin/performance/goals`, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },
  // Employee: submit milestone progress for approval
  async submitMilestoneForApproval(goalIndex: number, milestoneIndex: number) {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/employee/performance/milestone/progress`, { goalIndex, milestoneIndex }, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },
  // Admin: approve a milestone
  async approveMilestone(employeeId: number, goalIndex: number, milestoneIndex: number) {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/company-admin/performance/milestone/approve`, { employeeId, goalIndex, milestoneIndex }, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },
  // Admin: reject a milestone
  async rejectMilestone(employeeId: number, goalIndex: number, milestoneIndex: number, rejectionReason: string) {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/company-admin/performance/milestone/reject`, { employeeId, goalIndex, milestoneIndex, rejectionReason }, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },
  // Admin: assign a goal to employees/departments
  async assignGoal(data: any) {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/company-admin/performance/assign-goal`, data, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },
  // Admin: get upcoming reviews
  async getUpcomingReviews() {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/company-admin/reviews/upcoming`, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },
  // Admin: schedule a review
  async scheduleReview(data: any) {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/company-admin/reviews/schedule`, data, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },
  // Admin: get review history
  async getReviewHistory() {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/company-admin/reviews/history`, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },
  // Admin: get achievements
  async getAchievements() {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/company-admin/achievements`, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },
  // Admin: award an achievement
  async awardAchievement(data: any) {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/company-admin/achievements/award`, data, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },
  // Admin: get all employees for the company
  async getAllEmployees() {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/company-admin/users`, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },
  // Admin: get review by ID
  async getReviewById(id: number | string) {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/company-admin/reviews/${id}`, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },
  // Admin: save review results
  async saveReviewResult(id: number | string, data: any) {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/company-admin/reviews/${id}/result`, data, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },
  // Employee: get own completed reviews
  async getOwnReviews() {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/employee/performance/reviews`, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },
  // Employee: get all employees for the company (for ticket assignment)
  async employeeGetAllEmployees() {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/employee/tickets/employees`, {
      headers,
      withCredentials: true,
    });
    return response.data;
  }
}; 