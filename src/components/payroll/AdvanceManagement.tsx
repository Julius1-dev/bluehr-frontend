import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CheckCircle,
  Clock,
  Eye,
  Filter,
  RefreshCw,
  Search,
  Download,
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { BACKEND_URL } from '@/lib/config';

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Helper function to format date
const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

// Define types for advance requests
interface AdvanceRequest {
  id: number;
  employee: {
    name: string;
    email: string;
    basicSalary: number;
  department: string;
  };
  amount: number;
  method: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  createdAt: string;
  transactionFee: number;
  sourceOfFunds: string;
  rejectionReason?: string;
  approvedAt?: string;
  rejectedAt?: string;
}

// Define props for the component
interface AdvanceManagementProps {
  advanceSettings: {
    autoApprove: boolean;
    adminApproval: boolean;
    advanceSource: 'company_wallet' | 'blueHR';
  };
}

// Link to advance settings page
const ADVANCE_SETTINGS_URL = '/admin/advance-settings';

export function AdvanceManagement({ advanceSettings }: AdvanceManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [advanceRequests, setAdvanceRequests] = useState<AdvanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AdvanceRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // Fetch advance requests from backend
  const fetchAdvanceRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/company-admin/advance-approval/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch advance requests');
      }

      const result = await response.json();
      if (result.success) {
        setAdvanceRequests(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch advance requests');
      }
    } catch (error) {
      console.error('Error fetching advance requests:', error);
      toast.error('Failed to load advance requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvanceRequests();
  }, []);

  // Filter advances based on search and filters
  const filteredAdvances = advanceRequests.filter(advance => {
    // Search filter
    const matchesSearch = 
      advance.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      advance.employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      advance.employee.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      advance.reason.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Department filter
    const matchesDepartment = selectedDepartment === 'all' || advance.employee.department === selectedDepartment;
    
    // Status filter
    const matchesStatus = selectedStatus === 'all' || advance.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });
  
  // Get unique departments for filter
  const departments = ['all', ...new Set(advanceRequests.map(a => a.employee.department))];
  
  // Handle approve action
  const handleApprove = async (request: AdvanceRequest) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/company-admin/advance-approval/${request.id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: 'Approved by admin'
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Advance request approved successfully');
        fetchAdvanceRequests(); // Refresh the list
      } else {
        toast.error(result.error || 'Failed to approve advance request');
      }
    } catch (error) {
      console.error('Error approving advance request:', error);
      toast.error('Failed to approve advance request');
    } finally {
      setProcessing(false);
    }
  };

  // Handle reject action
  const handleReject = (request: AdvanceRequest) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/company-admin/advance-approval/${selectedRequest.id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rejectionReason: rejectionReason.trim()
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Advance request rejected successfully');
        setRejectDialogOpen(false);
        setRejectionReason('');
        setSelectedRequest(null);
        fetchAdvanceRequests(); // Refresh the list
      } else {
        toast.error(result.error || 'Failed to reject advance request');
      }
    } catch (error) {
      console.error('Error rejecting advance request:', error);
      toast.error('Failed to reject advance request');
    } finally {
      setProcessing(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3" /> Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      case 'processed':
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle className="h-3 w-3" /> Processed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading advance requests...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Advance Management</h2>
          <p className="text-gray-600">Manage employee advance requests and approvals</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setRefreshing(true);
              fetchAdvanceRequests().finally(() => setRefreshing(false));
            }}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link to={ADVANCE_SETTINGS_URL}>
              <Filter className="h-4 w-4 mr-2" />
              Advance Settings
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                  placeholder="Search employees, reasons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
              />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Department</label>
              <select 
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>
              
            <div>
              <label className="text-sm font-medium">Status</label>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="processed">Processed</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
          
          {/* Advance requests table */}
      <Card>
        <CardContent className="p-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  {advanceSettings.adminApproval && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdvances.length > 0 ? (
                  filteredAdvances.map((advance) => (
                    <TableRow key={advance.id}>
                      <TableCell>
                        <div className="font-medium">{advance.employee.name}</div>
                        <div className="text-sm text-gray-500">{advance.employee.email}</div>
                      </TableCell>
                      <TableCell>{advance.employee.department}</TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(advance.amount)}</div>
                        {advance.transactionFee > 0 && (
                          <div className="text-xs text-blue-500">
                            Fee: {formatCurrency(advance.transactionFee)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">
                          <div className="truncate">{advance.reason}</div>
                          {advance.status === 'rejected' && advance.rejectionReason && (
                            <div className="text-xs text-red-500 mt-1">
                              <strong>Rejection:</strong> {advance.rejectionReason}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(advance.createdAt)}</div>
                        {advance.status === 'approved' && advance.approvedAt && (
                          <div className="text-xs text-green-600">
                            Approved: {formatDate(advance.approvedAt)}
                          </div>
                        )}
                        {advance.status === 'rejected' && advance.rejectedAt && (
                          <div className="text-xs text-red-600">
                            Rejected: {formatDate(advance.rejectedAt)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="capitalize">
                        {advance.sourceOfFunds.replace('_', ' ')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(advance.status)}
                      </TableCell>
                      {advanceSettings.adminApproval && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {advance.status === 'pending' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleApprove(advance)}
                                  disabled={processing}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="sr-only">Approve</span>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleReject(advance)}
                                  disabled={processing}
                                >
                                  <XCircle className="h-4 w-4" />
                                  <span className="sr-only">Reject</span>
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={advanceSettings.adminApproval ? 8 : 7} className="text-center py-8">
                      <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No advance requests match your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Advance Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this advance request from {selectedRequest?.employee.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmReject} disabled={processing || !rejectionReason.trim()}>
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
