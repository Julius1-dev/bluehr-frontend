import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Upload, 
  Download, 
  Search,
  Clock,
  FileArchive,
  FilePlus,
  Users,
  ArrowRight,
  Filter,
  Share2,
  Inbox,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  User,
  Building2
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { DocumentApi, Document, DocumentUploadData, DocumentShareData } from '@/services/documentApi';
import axios from 'axios';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DialogTrigger } from '@/components/ui/dialog';
import { DocumentType } from '@/types/documents';
import type { SharedWithEntry } from '@/types/documents';


// Types
interface Recipient {
  id: string;
  name: string;
  type: 'employee' | 'department' | 'all';
}
interface DocumentShareFormData {
  recipients: Recipient[];
  message: string;
  access: 'view' | 'edit';
}

// Add types for Department and Employee
interface Department {
  id: number;
  name: string;
  description?: string;
  roles?: any;
  company_id?: number;
}
interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  department_id?: number;
}

export function Documents() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  
  // State for document sharing modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [shareFormData, setShareFormData] = useState<DocumentShareFormData>({
    recipients: [],
    message: '',
    access: 'view',
  });
  
  // Mock data for recipients (in a real app, this would come from an API)
  const [recipientOptions] = useState([
    { id: 'all', name: 'All Employees', type: 'all' as const },
    { id: 'dept-eng', name: 'Engineering Department', type: 'department' as const },
    { id: 'dept-hr', name: 'HR Department', type: 'department' as const },
    { id: 'dept-sales', name: 'Sales Department', type: 'department' as const },
    { id: 'emp-1', name: 'John Doe', type: 'employee' as const },
    { id: 'emp-2', name: 'Jane Smith', type: 'employee' as const },
  ]);

  // State for upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    file: null as File | null,
    category: '',
    description: '',
  });

  // State for documents
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // State for company policies
  const [policies, setPolicies] = useState<any[]>([]);
  const [policiesLoading, setPoliciesLoading] = useState(false);
  const [policiesError, setPoliciesError] = useState<string | null>(null);

  // State for real departments and employees
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shareSearch, setShareSearch] = useState('');
  const [requireReview, setRequireReview] = useState(false);

  // Add state for review modal actions
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Get current user ID from JWT token
  function getUserIdFromToken() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
      } catch (e) {
        console.warn('Failed to decode JWT token', e);
        return null;
      }
    }
    return null;
  }

  const currentUserId = getUserIdFromToken();

  // Initialize with real API data only (no mock data)
  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      try {
        // Load real documents from API only
        const realDocuments = await DocumentApi.getDocuments();
        setDocuments(realDocuments);
        setFilteredDocuments(realDocuments);
      } catch (error) {
        console.error('Error loading documents:', error);
        setDocuments([]);
        setFilteredDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadDocuments();
  }, []);

  // Filter documents based on search term and category
  useEffect(() => {
    let result = [...documents];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(doc => 
        doc.name.toLowerCase().includes(term) || 
        doc.category.toLowerCase().includes(term)
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(doc => doc.category === selectedCategory);
    }
    
    setFilteredDocuments(result);
  }, [searchTerm, selectedCategory, documents]);
  
  // Get unique categories for filter
  const categories = ['all', ...new Set(documents.map(doc => doc.category))];
  
  // Handle document sharing
  const handleShareDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setIsShareModalOpen(true);
  };
  
  // Fetch departments and employees when share modal opens
  useEffect(() => {
    if (isShareModalOpen) {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem('token');
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const [deptRes, empRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/company-admin/departments`, { headers, withCredentials: true }),
            axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/company-admin/users`, { headers, withCredentials: true })
          ]);
          setDepartments(deptRes.data);
          setEmployees(empRes.data);
        } catch (err) {
          setDepartments([]);
          setEmployees([]);
        }
      };
      fetchData();
    }
  }, [isShareModalOpen]);

  // Filtered recipients for search
  const filteredDepartments: Department[] = departments.filter(d => d.name.toLowerCase().includes(shareSearch.toLowerCase()));
  const filteredEmployees: Employee[] = employees.filter(e => `${e.first_name} ${e.last_name}`.toLowerCase().includes(shareSearch.toLowerCase()));
  
  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocument) return;
    try {
      const shareData: DocumentShareData & { require_review: boolean; message: string } = {
        shared_with: shareFormData.recipients,
        access_level: 'view',
        require_review: requireReview,
        message: shareFormData.message
      };
      await DocumentApi.shareDocument(selectedDocument.id, shareData);
    alert('Document shared successfully!');
    setIsShareModalOpen(false);
    setShareFormData({ recipients: [], message: '', access: 'view' });
      setRequireReview(false);
    } catch (error) {
      console.error('Error sharing document:', error);
      alert('Failed to share document');
    }
  };
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFormData(prev => ({
        ...prev,
        file: e.target.files![0]
      }));
    }
  };
  
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFormData.file) return;
    
    try {
      const uploadData: DocumentUploadData = {
        file: uploadFormData.file,
        category: uploadFormData.category || 'Uncategorized',
        description: uploadFormData.description
      };
      
      const result = await DocumentApi.uploadDocument(uploadData);
      
      // Add the new document to the list
      setDocuments(prev => [result.document, ...prev]);
      setUploadFormData({ file: null, category: '', description: '' });
      setIsUploadModalOpen(false);
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    }
  };
  
  // Handle document download
  const handleDownloadDocument = async (doc: DocumentType) => {
    try {
      const blob = await DocumentApi.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  };

  
  // Get documents based on user role and view
  const getDocumentsForView = () => {
    if (isAdmin) {
      // Admin sees all filtered documents for the company
      return filteredDocuments;
    } else {
      // Employees only see documents shared with them or documents they uploaded
      return filteredDocuments.filter(doc => doc.is_shared || doc.uploaded_by === currentUserId);
    }
  };
  
  const documentsToShow = getDocumentsForView();
  
  // Get recent documents (first 3 documents visible to the user, no mock data filter)
  const recentDocuments = documentsToShow
    .filter(doc => {
      // Exclude review-pending docs that the current user is *supposed to review*
      const isReviewer = doc.require_review && doc.status === 'pending_review' && doc.uploaded_by !== currentUserId && isSharedWith(doc);
      return !isReviewer;
    })
    .slice(0, 3)
    .map(doc => ({
      ...doc,
      uploadedFlag: doc.uploaded_by === currentUserId ? 'Uploaded' : undefined
    }));

  
  // Helper to get current user's department IDs
  const userDepartments = employees.find(e => e.id === currentUserId)?.department_id ? [employees.find(e => e.id === currentUserId)?.department_id] : [];

  // Helper to check if user or their department is in shared_with
 function isSharedWith(doc: DocumentType): boolean {
  if (!doc.shared_with) return false;

  let sharedWith: SharedWithEntry[] = [];

  // Handle both string and array
  if (typeof doc.shared_with === 'string') {
    try {
      sharedWith = JSON.parse(doc.shared_with);
    } catch (e) {
      console.warn('❌ Failed to parse shared_with:', doc.shared_with);
      return false;
    }
  } else if (Array.isArray(doc.shared_with)) {
    sharedWith = doc.shared_with;
  } else {
    return false;
  }

  // Get current user's department
  const userDeptId = employees.find(e => e.id === currentUserId)?.department_id;

  const match = sharedWith.some(entry => {
    if (entry.type === 'all') return true;
    if (entry.type === 'employee' && Number(entry.id) === Number(currentUserId)) return true;
    if (entry.type === 'department' && userDeptId && Number(entry.id) === Number(userDeptId)) return true;
    return false;
  });

  console.log("👥 isSharedWith Debug", {
    docName: doc.name,
    currentUserId,
    userDeptId,
    sharedWith,
    match
  });

  return match;
}





  // Pending Actions: 
  // - Uploader: sees their own shared-for-review docs as 'pending'
  // - Recipient: sees shared-for-review docs as 'pending review' with view button
  const pendingDocuments = documentsToShow
    .filter(doc => {
      const isUploader = doc.uploaded_by === currentUserId;
      const isRecipient = isSharedWith(doc) && !isUploader;
      const needsReview = doc.require_review;
      const isPending = ['pending_review', 'pending'].includes(doc.status);

      const shouldInclude = needsReview && isPending && (isUploader || isRecipient);

      console.log("🔍 Review Check", {
        docName: doc.name,
        isUploader,
        isRecipient,
        needsReview,
        isPending,
        currentUserId,
        uploaded_by: doc.uploaded_by,
        shouldInclude
      });

      return shouldInclude;
    })
    .map(doc => ({
      id: doc.id,
      name: doc.name,
      category: doc.category,
      dueDate: new Date(new Date(doc.created_at).getTime() + 7 * 24 * 60 * 60 * 1000),
      priority: 'high',
      uploaded_by: doc.uploaded_by,
      uploaded_by_name: doc.uploaded_by_name,
      status: doc.status,
      canView: doc.uploaded_by !== currentUserId,
      review_message: doc.review_message ?? null
    }));




  // Shared Documents: shared with user/department AND require_review false (or status not 'pending_review')
  const sharedDocuments = documentsToShow
    .filter(doc =>
      (
        isSharedWith(doc) || doc.uploaded_by === currentUserId
      ) &&
      (
        doc.status === 'approved' ||
        doc.status === 'rejected'
        // optionally: || doc.status === 'reviewed' || doc.status === 'signed'
      )
    )
    .map(doc => ({
      id: doc.id,
      name: doc.name,
      sharedBy: doc.uploaded_by_name,
      sharedDate: new Date(doc.created_at),
      access: doc.access_level,
      status: doc.status,
      rejection_reason: doc.rejection_reason
    }));
  
  // Get company policies (documents in the 'Policies' category')
  const companyPolicies = documents
    .filter(doc => doc.category === 'Policies' && doc.id >= 1000)
    .map(doc => ({
      id: doc.id,
      name: doc.name,
      lastUpdated: new Date(doc.created_at),
      category: doc.category
    }));

  // Fetch company policies from backend
  useEffect(() => {
    const fetchPolicies = async () => {
      setPoliciesLoading(true);
      setPoliciesError(null);
      try {
        const policies = await DocumentApi.getPolicies();
        setPolicies(policies);
      } catch (err: any) {
        setPoliciesError('Failed to fetch policies');
      } finally {
        setPoliciesLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Documents</h1>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search documents..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select onValueChange={(value) => setSelectedCategory(value)} value={selectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isAdmin && (
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Documents</p>
                <p className="text-2xl font-semibold">{documentsToShow.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-2xl font-semibold">{pendingDocuments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Signed Documents</p>
                <p className="text-2xl font-semibold">
                  {documentsToShow.filter(doc => doc.status === 'signed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Shared Documents</p>
                <p className="text-2xl font-semibold">{sharedDocuments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Documents</TabsTrigger>
            <TabsTrigger value="pending">
              Pending Actions
            {pendingDocuments.length > 0 && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {pendingDocuments.length}
              </span>
          )}             

          {/* uphere */}

          </TabsTrigger>
          <TabsTrigger value="policies">Company Policies</TabsTrigger>
          <TabsTrigger value="shared">
            {isAdmin ? 'Shared Documents' : 'Shared with Me'}
            {sharedDocuments.length > 0 && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                {sharedDocuments.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
           {/* this part  */}
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Documents</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDocuments.length === 0 ? (
                  <div className="text-center text-gray-500">No documents uploaded yet.</div>
                ) : (
                  recentDocuments.map((doc) => (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{doc.category}</span>
                          <span>•</span>
                            <span>{(doc.file_size / (1024 * 1024)).toFixed(1)} MB</span>
                              <span>•</span>
                            <span>Uploaded by {doc.uploaded_by_name}</span>
                            {doc.uploadedFlag && (
                              <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold">{doc.uploadedFlag}</span>
                          )}
                        </div>
                      </div>
                    </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant={
                            doc.uploaded_by === currentUserId
                              ? 'success'
                              : doc.status === 'signed'
                                ? 'success'
                                : doc.status === 'pending'
                                  ? 'warning'
                                  : 'default'
                          }>
                            {doc.uploaded_by === currentUserId
                              ? 'Uploaded'
                              : doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </Badge>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(new Date(doc.created_at))}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleDownloadDocument(doc)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleShareDocument(doc)}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Pending Actions</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingDocuments.length === 0 ? (
                  <div className="text-center text-gray-500">No pending actions.</div>
                ) : (
                  pendingDocuments.map((doc) => (
                    <Dialog key={doc.id}>
                      <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium">{doc.name}</p>
                          <div className="text-sm text-gray-500">{doc.category} • Due: {formatDate(doc.dueDate)}</div>
                          <div className="text-xs text-gray-400">Shared by {doc.uploaded_by_name}</div>
                      </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={doc.status === 'pending_review' ? 'warning' : 'default'}>
                            {doc.status === 'pending_review' ? 'Pending Review' : 'Pending'}
                          </Badge>
                          {doc.canView && (
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                Review Document
                              </Button>
                            </DialogTrigger>
                          )}
                    </div>
                    </div>
                      <DialogContent style={{ background: 'white', opacity: 1 }}>
                        <DialogHeader>
                          <DialogTitle>Review Document</DialogTitle>
                          <DialogDescription>
                            <div className="mb-2">
                              <span className="font-medium">{doc.name}</span> ({doc.category})<br />
                              <span className="text-xs text-gray-400">Shared by {doc.uploaded_by_name}</span>
                            </div>
                            <div className="mb-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={async () => {
                                  try {
                                    const blob = await DocumentApi.downloadDocument(doc.id);
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = doc.name;
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                  } catch (error) {
                                    alert('Failed to download document');
                                  }
                                }}
                              >
                                <Download className="h-4 w-4 mr-1 inline" /> Download
                      </Button>
                    </div>
                            {doc.review_message && (
                              <div className="mb-2 p-2 bg-gray-50 rounded text-sm">
                                <span className="font-semibold">Message from sender:</span><br />
                                {doc.review_message}
                  </div>
                            )}
                          </DialogDescription>
                        </DialogHeader>
                        {reviewError && <div className="text-red-500 text-sm mb-2">{reviewError}</div>}
                        {showRejectReason ? (
                          <div className="mb-2">
                            <Textarea
                              placeholder="Enter rejection reason..."
                              value={rejectionReason}
                              onChange={e => setRejectionReason(e.target.value)}
                              rows={3}
                              className="w-full"
                            />
                          </div>
                        ) : null}
                        <div className="flex flex-row justify-end gap-2 mt-2">
                          {showRejectReason ? (
                            <Button
                              variant="destructive"
                              disabled={reviewLoading || !rejectionReason.trim()}
                              onClick={async () => {
                                setReviewLoading(true);
                                setReviewError(null);
                                try {
                                  await DocumentApi.reviewDocument(doc.id, 'reject', rejectionReason);
                                  setDocuments(docs => docs.filter(d => d.id !== doc.id));
                                  setShowRejectReason(false);
                                  setRejectionReason('');
                                } catch (err: any) {
                                  setReviewError(err?.response?.data?.error || 'Failed to reject document');
                                } finally {
                                  setReviewLoading(false);
                                }
                              }}
                            >
                              Submit Rejection
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="default"
                                disabled={reviewLoading}
                                onClick={async () => {
                                  setReviewLoading(true);
                                  setReviewError(null);
                                  try {
                                    await DocumentApi.reviewDocument(doc.id, 'approve');
                                    setDocuments(docs => docs.filter(d => d.id !== doc.id));
                                  } catch (err: any) {
                                    setReviewError(err?.response?.data?.error || 'Failed to approve document');
                                  } finally {
                                    setReviewLoading(false);
                                  }
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                disabled={reviewLoading}
                                onClick={() => setShowRejectReason(true)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* to this part  */}

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Company Policies</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {policiesLoading ? (
                <div className="text-center py-8 text-gray-500">Loading policies...</div>
              ) : policiesError ? (
                <div className="text-center py-8 text-red-600">{policiesError}</div>
              ) : (
              <div className="space-y-4">
                  {policies.length === 0 ? (
                    <div className="text-center text-gray-500">No policies yet.</div>
                  ) : (
                    policies.map((policy) => (
                  <div 
                    key={policy.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                            <p className="font-medium">{policy.title}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{policy.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm text-gray-500">
                            Updated {policy.last_updated ? formatDate(new Date(policy.last_updated)) : ''}
                      </div>
                          {policy.document_url && (
                            <a
                              href={`http://localhost:4000${policy.document_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                            </a>
                          )}
                    </div>
                  </div>
                    ))
                  )}
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shared">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{isAdmin ? 'Shared Documents' : 'Shared with Me'}</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sharedDocuments.map((doc) => (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Share2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>Shared by {doc.sharedBy}</span>
                          <span>•</span>
                          <span className="capitalize">{doc.access} access</span>
                          <span>•</span>
                          <span className={doc.status === 'approved' ? 'text-green-600' : 'text-red-600'}>
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </span>
                        </div>
                        {doc.status === 'rejected' && doc.rejection_reason && (
                          <div className="text-xs text-red-600 mt-1">Reason: {doc.rejection_reason}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm text-gray-500">
                        Shared {formatDate(doc.sharedDate)}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Share Document Modal */}
      {isShareModalOpen && selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share Document</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setIsShareModalOpen(false);
                  setShareFormData({ recipients: [], message: '', access: 'view' });
                  setRequireReview(false);
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <form onSubmit={handleShareSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Search Departments/Employees</label>
                  <Input
                    type="text"
                    placeholder="Type to search..."
                    value={shareSearch}
                    onChange={e => setShareSearch(e.target.value)}
                  />
                  </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Departments</label>
                  <div className="h-24 border rounded p-2 overflow-y-auto">
                    {filteredDepartments.map(dept => (
                      <label key={dept.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={shareFormData.recipients.some(r => r.id === String(dept.id) && r.type === 'department')}
                          onChange={e => {
                            if (e.target.checked) {
                              setShareFormData(prev => ({
                                ...prev,
                                recipients: [...prev.recipients, { id: String(dept.id), name: dept.name, type: 'department' }]
                              }));
                            } else {
                              setShareFormData(prev => ({
                                ...prev,
                                recipients: prev.recipients.filter(r => !(r.id === String(dept.id) && r.type === 'department'))
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{dept.name}</span>
                      </label>
                    ))}
                </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Employees</label>
                  <div className="h-24 border rounded p-2 overflow-y-auto">
                    {filteredEmployees.map(emp => (
                      <label key={emp.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={shareFormData.recipients.some(r => r.id === String(emp.id) && r.type === 'employee')}
                          onChange={e => {
                            if (e.target.checked) {
                        setShareFormData(prev => ({
                          ...prev,
                                recipients: [...prev.recipients, { id: String(emp.id), name: `${emp.first_name} ${emp.last_name}`, type: 'employee' }]
                              }));
                            } else {
                            setShareFormData(prev => ({
                              ...prev,
                                recipients: prev.recipients.filter(r => !(r.id === String(emp.id) && r.type === 'employee'))
                            }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{emp.first_name} {emp.last_name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={requireReview}
                      onChange={e => setRequireReview(e.target.checked)}
                      className="rounded"
                    />
                    Require Review (document will appear in Pending Actions for recipients)
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Access Level</label>
                  <Input value="View Only" disabled className="bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message (optional)</label>
                  <Textarea
                    placeholder="Add a message..."
                    value={shareFormData.message}
                    onChange={e => setShareFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsShareModalOpen(false);
                      setShareFormData({ recipients: [], message: '', access: 'view' });
                      setRequireReview(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={shareFormData.recipients.length === 0}
                  >
                    Share Document
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload Document</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadFormData({ file: null, category: '', description: '' });
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <form onSubmit={handleUploadSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select File</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOCX, XLSX up to 10MB
                      </p>
                    </div>
                  </div>
                  {uploadFormData.file && (
                    <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{uploadFormData.file.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setUploadFormData(prev => ({ ...prev, file: null }))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Select
                    value={uploadFormData.category}
                    onValueChange={(value) => 
                      setUploadFormData(prev => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Contracts">Contracts</SelectItem>
                      <SelectItem value="Policies">Policies</SelectItem>
                      <SelectItem value="Reports">Reports</SelectItem>
                      <SelectItem value="Presentations">Presentations</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description (optional)</label>
                  <Textarea
                    placeholder="Add a description..."
                    value={uploadFormData.description}
                    onChange={(e) => 
                      setUploadFormData(prev => ({ ...prev, description: e.target.value }))
                    }
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsUploadModalOpen(false);
                      setUploadFormData({ file: null, category: '', description: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!uploadFormData.file}
                  >
                    Upload Document
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}