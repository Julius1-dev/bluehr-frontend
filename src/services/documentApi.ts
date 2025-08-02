import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getUserRoleFromToken() {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch (e) {
      return null;
    }
  }
  return null;
}

export interface Document {
  id: number;
  name: string;
  category: string;
  description?: string;
  file_size: number;
  status: 'pending' | 'pending_review' | 'reviewed' | 'signed' | 'approved' | 'rejected';
  uploaded_by: number;
  uploaded_by_name: string;
  is_shared: boolean;
  shared_with?: any;
  access_level: 'view' | 'edit';
  created_at: string;
  updated_at: string;
  require_review?: boolean;
  review_message?: string;
  rejection_reason?: string;
}

export interface DocumentUploadData {
  file: File;
  category: string;
  description?: string;
}

export interface DocumentShareData {
  shared_with: Array<{ id: string; name: string; type: 'employee' | 'department' | 'all' }>;
  access_level: 'view' | 'edit';
}

export const DocumentApi = {
  async uploadDocument(data: DocumentUploadData): Promise<{ message: string; document: Document }> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('category', data.category);
    if (data.description) {
      formData.append('description', data.description);
    }

    const headers = getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/company-admin/documents/upload`, formData, {
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    });

    return response.data;
  },

  async getDocuments(sharedOnly: boolean = false): Promise<Document[]> {
    const params = sharedOnly ? { shared_only: 'true' } : {};
    const headers = getAuthHeaders();
    const role = getUserRoleFromToken();
    let url = `${API_BASE_URL}/company-admin/documents`;
    if (role && role !== 'admin') {
      url = `${API_BASE_URL}/employee/documents`;
    }
    const response = await axios.get(url, {
      params,
      headers,
      withCredentials: true,
    });
    return response.data;
  },

  async getDocument(id: number): Promise<Document> {
    const headers = getAuthHeaders();
    const role = getUserRoleFromToken();
    let url = `${API_BASE_URL}/company-admin/documents/${id}`;
    if (role && role !== 'admin') {
      url = `${API_BASE_URL}/employee/documents/${id}`;
    }
    const response = await axios.get(url, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },

  async downloadDocument(id: number): Promise<Blob> {
    const headers = getAuthHeaders();
    const role = getUserRoleFromToken();
    let url = `${API_BASE_URL}/company-admin/documents/${id}/download`;
    if (role && role !== 'admin') {
      url = `${API_BASE_URL}/employee/documents/${id}/download`;
    }
    const response = await axios.get(url, {
      headers,
      responseType: 'blob',
      withCredentials: true,
    });
    return response.data;
  },

  async shareDocument(id: number, shareData: DocumentShareData): Promise<{ message: string; document: Document }> {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/company-admin/documents/${id}/share`, shareData, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },

  async updateDocumentStatus(id: number, status: 'pending' | 'reviewed' | 'signed'): Promise<{ message: string; document: Document }> {
    const headers = getAuthHeaders();
    const response = await axios.patch(`${API_BASE_URL}/company-admin/documents/${id}/status`, { status }, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },

  async deleteDocument(id: number): Promise<{ message: string }> {
    const headers = getAuthHeaders();
    const response = await axios.delete(`${API_BASE_URL}/company-admin/documents/${id}`, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },

  async getPolicies(): Promise<any[]> {
    const headers = getAuthHeaders();
    const role = getUserRoleFromToken();
    let url = `${API_BASE_URL}/company-admin/policies`;
    if (role && role !== 'admin') {
      url = `${API_BASE_URL}/employee/policies`;
    }
    const response = await axios.get(url, {
      headers,
      withCredentials: true,
    });
    return response.data.policies || [];
  },

  async getDocumentById(id: number): Promise<Document> {
    const headers = getAuthHeaders();
    const role = getUserRoleFromToken();
    let url = `${API_BASE_URL}/company-admin/documents/${id}`;
    if (role && role !== 'admin') {
      url = `${API_BASE_URL}/employee/documents/${id}`;
    }
    const response = await axios.get(url, {
      headers,
      withCredentials: true,
    });
    return response.data;
  },

  async reviewDocument(id: number, action: 'approve' | 'reject', rejectionReason?: string): Promise<{ message: string; document: Document }> {
    const headers = getAuthHeaders();
    const role = getUserRoleFromToken();
    let url = `${API_BASE_URL}/company-admin/documents/${id}/review`;
    if (role && role !== 'admin') {
      url = `${API_BASE_URL}/employee/documents/${id}/review`;
    }
    const payload: any = { action };
    if (action === 'reject' && rejectionReason) {
      payload.rejection_reason = rejectionReason;
    }
    const response = await axios.patch(url, payload, {
      headers,
      withCredentials: true,
    });
    return response.data;
  }
}; 