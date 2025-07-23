export type SharedWithEntry = {
  type: 'employee' | 'department' | 'all';
  id?: string | number;
};

export interface DocumentType {
  id: number;
  name: string;
  category: string;
  status?: string;
  access_level?: string;
  created_at: string;
  rejection_reason?: string;
  uploaded_by: number;
  uploaded_by_name: string;
  require_review?: boolean;
  is_shared?: boolean;
  shared_with?: string | SharedWithEntry[];
  review_message?: string | null; 
}
