import React, { useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { OffboardingApi } from '@/services/offboardingApi';
import { useState } from 'react';

// Types
type OffboardingStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'completed';
type OffboardingType = 'resignation' | 'retirement' | 'other' | 'termination';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
}

interface OffboardingRequest {
  id: string;
  employee: Employee;
  type: OffboardingType;
  status: OffboardingStatus;
  submittedDate: Date;
  lastWorkingDay: Date;
  reason: string;
  reviewedBy?: string;
  reviewDate?: Date;
}

// Mock data
  const _mockRequests: OffboardingRequest[] = [
  {
    id: 'REQ-001',
    employee: {
      id: 'EMP-001',
      name: 'John Doe',
      email: 'john.doe@example.com',
      department: 'Engineering',
      position: 'Senior Developer'
    },
    type: 'resignation',
    status: 'pending',
    submittedDate: new Date('2025-06-01'),
    lastWorkingDay: new Date('2025-07-15'),
    reason: 'Found a new opportunity',
  },
  {
    id: 'REQ-002',
    employee: {
      id: 'EMP-002',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      department: 'HR',
      position: 'HR Manager'
    },
    type: 'retirement',
    status: 'approved',
    submittedDate: new Date('2025-05-28'),
    lastWorkingDay: new Date('2025-08-31'),
    reason: 'Retirement after 20 years of service',
    reviewedBy: 'Admin User',
    reviewDate: new Date('2025-05-30')
  }
];

const statusVariantMap: Record<OffboardingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-800'
};

const typeVariantMap: Record<OffboardingType, string> = {
  resignation: 'bg-purple-100 text-purple-800',
  retirement: 'bg-indigo-100 text-indigo-800',
  termination: 'bg-rose-100 text-rose-800',
  other: 'bg-gray-100 text-gray-800'
};

interface OffboardingRequestsTableProps {
  searchQuery: string;
  onRequestsChange?: (requests: OffboardingRequest[]) => void;
}

export default function OffboardingRequestsTable({ searchQuery, onRequestsChange }: OffboardingRequestsTableProps) {
  const [requests, setRequests] = React.useState<OffboardingRequest[]>([]);
  const [_loading, setLoading] = React.useState(true);
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingReactivate, setPendingReactivate] = useState<OffboardingRequest | null>(null);

  // Fetch requests from backend
  useEffect(() => {
    let isMounted = true;
    let interval: any;
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const data = await OffboardingApi.listRequests();
        if (isMounted) {
          const mapped = Array.isArray(data)
            ? data.map((req: any) => ({
                id: req.id,
                employee: {
                  id: req.employee_id,
                  name: `${req.first_name || ''} ${req.last_name || ''}`.trim(),
                  email: req.email,
                  department: req.department_id || '',
                  position: req.role || '',
                },
                type: req.type,
                status: req.status,
                submittedDate: req.submitted_date ? new Date(req.submitted_date) : new Date(0),
                lastWorkingDay: req.last_working_day ? new Date(req.last_working_day) : new Date(0),
                reason: req.reason,
                notes: req.notes || '',
                reviewedBy: req.reviewed_by,
                reviewDate: req.review_date ? new Date(req.review_date) : undefined,
              }))
            : [];
          setRequests(mapped);
          if (onRequestsChange) onRequestsChange(mapped);
        }
      } catch (_err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
    interval = setInterval(fetchRequests, 5000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [onRequestsChange]);

  // Also call onRequestsChange when requests are updated (e.g., status/reactivation)
  useEffect(() => {
    if (onRequestsChange) onRequestsChange(requests);
  }, [requests, onRequestsChange]);

  const filteredRequests = requests.filter(request => 
    (request.employee?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     request.employee?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     String(request.id).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleStatusUpdate = async (id: string, newStatus: OffboardingStatus) => {
    try {
      await OffboardingApi.updateStatus(id, newStatus);
      setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus, reviewedBy: 'Current User', reviewDate: new Date() } : req));
    } catch (err) {
      // Optionally handle error
    }
  };

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>Last Working Day</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredRequests.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="font-medium">
              <div className="flex flex-col">
                <span>{request.employee.name}</span>
                <span className="text-xs text-muted-foreground">{request.employee.position}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge className={typeVariantMap[request.type]}>
                {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={statusVariantMap[request.status]}>
                {request.status.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </Badge>
            </TableCell>
            <TableCell>{format(request.submittedDate, 'MMM d, yyyy')}</TableCell>
            <TableCell>{format(request.lastWorkingDay, 'MMM d, yyyy')}</TableCell>
            <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                {request.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-2"
                      onClick={() => handleStatusUpdate(request.id, 'approved')}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-2"
                      onClick={() => handleStatusUpdate(request.id, 'rejected')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
                  {(request.status === 'approved' || request.status === 'completed') && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => { setPendingReactivate(request); setShowConfirm(true); }}
                      disabled={reactivatingId === request.id}
                    >
                      Activate Employee
                    </Button>
                  )}
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {filteredRequests.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              No offboarding requests found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
      {showConfirm && pendingReactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Reactivate Employee</h3>
            <p className="mb-4">This employee was offboarded. Are you sure you want to reactivate their account?</p>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => { setShowConfirm(false); setPendingReactivate(null); }}>Cancel</Button>
              <Button
                onClick={async () => {
                  setReactivatingId(pendingReactivate.id);
                  try {
                    await OffboardingApi.reactivate(pendingReactivate.id);
                    setRequests(prev => prev.map(req => req.id === pendingReactivate.id ? { ...req, status: 'approved' } : req));
                    setShowConfirm(false);
                    setPendingReactivate(null);
                  } finally {
                    setReactivatingId(null);
                  }
                }}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
