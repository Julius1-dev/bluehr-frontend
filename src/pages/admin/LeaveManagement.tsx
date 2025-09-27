import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Check, 
  X, 
  FileText, 
  Clock,
  CalendarDays,
  Settings,
  Download
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { leaveRequestsApi } from '@/services/leaveRequestsApi';

interface LeaveRequest {
  id: number;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  duration: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedOn: string;
  approvedOn?: string;
  approvedBy?: string;
  rejectedOn?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  leaveTypeColor: string;
}

interface LeaveSummary {
  pending: number;
  approved: number;
  rejected: number;
}

interface LeaveType {
  name: string;
  defaultDays: number;
  color: string;
}

export function LeaveManagement(): JSX.Element {
  const [activeTab, setActiveTab] = useState('pending');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveSummary, setLeaveSummary] = useState<LeaveSummary>({ pending: 0, approved: 0, rejected: 0 });
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Fetch leave data
  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [requestsResponse, summaryResponse] = await Promise.all([
          leaveRequestsApi.getAllLeaveRequests(),
          leaveRequestsApi.getLeaveSummary()
        ]);

        setLeaveRequests(requestsResponse.leaveRequests || []);
        setLeaveSummary(summaryResponse.summary || { pending: 0, approved: 0, rejected: 0 });
        setLeaveTypes(summaryResponse.leaveTypes || []);
      } catch (err) {
        console.error('Error fetching leave data:', err);
        setError('Failed to load leave data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveData();
  }, []);

  // Filter leave requests based on active tab
  const filteredLeaveRequests = leaveRequests.filter(request => {
    if (activeTab === 'all') return true;
    return request.status === activeTab;
  });

  // Handle approve leave request
  const handleApprove = async (requestId: number) => {
    try {
      await leaveRequestsApi.approveLeaveRequest(requestId);
      // Refresh data
      const requestsResponse = await leaveRequestsApi.getAllLeaveRequests();
      const summaryResponse = await leaveRequestsApi.getLeaveSummary();
      setLeaveRequests(requestsResponse.leaveRequests || []);
      setLeaveSummary(summaryResponse.summary || { pending: 0, approved: 0, rejected: 0 });
      alert('Leave request approved successfully!');
    } catch (err: any) {
      console.error('Error approving leave request:', err);
      alert(err.response?.data?.error || 'Failed to approve leave request');
    }
  };

  // Handle reject leave request
  const handleReject = async (requestId: number) => {
    const rejectionReason = prompt('Please provide a reason for rejection:');
    if (!rejectionReason) return;

    try {
      await leaveRequestsApi.rejectLeaveRequest(requestId, rejectionReason);
      // Refresh data
      const requestsResponse = await leaveRequestsApi.getAllLeaveRequests();
      const summaryResponse = await leaveRequestsApi.getLeaveSummary();
      setLeaveRequests(requestsResponse.leaveRequests || []);
      setLeaveSummary(summaryResponse.summary || { pending: 0, approved: 0, rejected: 0 });
      alert('Leave request rejected successfully!');
    } catch (err: any) {
      console.error('Error rejecting leave request:', err);
      alert(err.response?.data?.error || 'Failed to reject leave request');
    }
  };
  
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getLeaveTypeColor = (leaveType: string): string => {
    const type = leaveTypes.find(t => t.name === leaveType);
    return type ? type.color : 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading leave data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header Section - Mobile Responsive */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-gray-500">Review and manage employee leave requests.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate('/admin/leave-policies')}>
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Policies</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button size="sm" className="gap-1" onClick={() => navigate('/admin/leave-calendar')}>
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Leave Summary</CardTitle>
            <CardDescription>
              Overview of leave requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                  <span className="text-sm font-medium">Pending</span>
                </div>
                <span className="font-semibold">{leaveSummary.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-400"></div>
                  <span className="text-sm font-medium">Approved</span>
                </div>
                <span className="font-semibold">{leaveSummary.approved}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400"></div>
                  <span className="text-sm font-medium">Rejected</span>
                </div>
                <span className="font-semibold">{leaveSummary.rejected}</span>
              </div>
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Leave Types</h4>
                <div className="space-y-2">
                  {leaveTypes.map((type) => (
                    <div key={type.name} className="flex items-center justify-between">
                      <Badge className={`${type.color} font-normal`}>{type.name}</Badge>
                      <span className="text-xs text-gray-500">{type.defaultDays} days</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle>Leave Requests</CardTitle>
            <CardDescription>
              Review and manage employee leave requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All Requests</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-0">
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Employee</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeaveRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={request.employeeAvatar} alt={request.employeeName} />
                                <AvatarFallback>{request.employeeName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{request.employeeName}</div>
                                <div className="text-xs text-gray-500">{request.department}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getLeaveTypeColor(request.leaveType)} font-normal`}>
                              {request.leaveType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{request.duration}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(request.status)} font-normal`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" title="View Details">
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">View Details</span>
                              </Button>
                              
                              {request.status === 'pending' && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-green-600" 
                                    title="Approve"
                                    onClick={() => handleApprove(request.id)}
                                  >
                                    <Check className="h-4 w-4" />
                                    <span className="sr-only">Approve</span>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-red-600" 
                                    title="Reject"
                                    onClick={() => handleReject(request.id)}
                                  >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Reject</span>
                                  </Button>
                                </>
                              )}
                              
                              {request.status !== 'pending' && (
                                <Button variant="ghost" size="icon" title="View History">
                                  <Clock className="h-4 w-4" />
                                  <span className="sr-only">View History</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredLeaveRequests.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No leave requests found</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {activeTab === 'pending' && "There are no pending leave requests to review."}
                      {activeTab === 'approved' && "There are no approved leave requests."}
                      {activeTab === 'rejected' && "There are no rejected leave requests."}
                      {activeTab === 'all' && "There are no leave requests in the system."}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
