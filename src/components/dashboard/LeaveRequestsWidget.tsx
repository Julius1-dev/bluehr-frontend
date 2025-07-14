import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { leaveRequestsApi } from '@/services/leaveRequestsApi';

export function LeaveRequestsWidget() {
  const navigate = useNavigate();
  
  // Real leave requests state
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);

  useEffect(() => {
    leaveRequestsApi.getAllLeaveRequests().then(data => {
      if (Array.isArray(data.leaveRequests)) {
        setLeaveRequests(data.leaveRequests);
      } else if (Array.isArray(data)) {
        setLeaveRequests(data);
      } else {
        setLeaveRequests([]);
      }
    }).catch(() => setLeaveRequests([]));
  }, []);
  
  const getStatusBadge = (status: string) => {
    switch((status || '').toLowerCase()) {
      case 'approved': 
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
      case 'rejected': 
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      case 'pending': 
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pending</Badge>;
      default: 
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    }
  };
  
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    if (start === end) {
      return formatDate(startDate);
    }
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Show up to 3 most recent pending leave requests
  const recentRequests = [...leaveRequests]
    .filter(r => (r.status || '').toLowerCase() === 'pending')
    .sort((a, b) => {
      if (a.created_at && b.created_at) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return (b.id || 0) - (a.id || 0);
    })
    .slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Leave Requests</CardTitle>
        <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => navigate('/admin/leave-requests')}>
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          {recentRequests.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No pending requests right now.</div>
          ) : (
            recentRequests.map(request => (
            <div key={request.id} className="border border-gray-100 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                      <AvatarImage src={request.avatar || undefined} alt={request.employee_name || request.name || ''} />
                      <AvatarFallback>{(request.employee_name || request.name || '').split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                    <span className="text-sm font-medium">{request.employee_name || request.name || ''}</span>
                </div>
                {getStatusBadge(request.status)}
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-500">Type</p>
                    <p className="font-medium">{request.type || request.leave_type || ''}</p>
                </div>
                <div>
                  <p className="text-gray-500">Duration</p>
                    <p className="font-medium">{request.days_requested || request.daysRequested || ''} day{(request.days_requested || request.daysRequested) > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                    <p className="font-medium">{formatDateRange(request.start_date || request.startDate, request.end_date || request.endDate)}</p>
                  </div>
                </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="w-full text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Approve
                </Button>
                <Button size="sm" variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                  <XCircle className="mr-1 h-3 w-3" />
                  Reject
                </Button>
              </div>
            </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/admin/leave-requests')}>
          <Calendar className="mr-2 h-4 w-4" />
          Manage Leave Policies
        </Button>
      </CardFooter>
    </Card>
  );
}
