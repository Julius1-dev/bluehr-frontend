import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, AlertCircle, ChevronRight, CalendarDays, CalendarRange } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/lib/utils';
import { employeeLeaveApi } from '@/services/employeeLeaveApi';

interface LeaveBalance {
  id: number;
  type: string;
  used: number;
  total: number;
  remaining: number;
  color: string;
  description: string;
}

interface UpcomingLeave {
  id: number;
  startDate: string;
  endDate: string;
  type: string;
  status: 'approved' | 'rejected';
  days: number;
  reason: string;
  rejectionReason?: string;
}

interface LeaveHistoryItem {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'approved' | 'rejected' | 'completed';
  notes: string;
  submittedOn: string;
  approvedOn?: string;
  rejectedOn?: string;
  rejectionReason?: string;
}

interface TeamLeaveItem {
  id: number;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  days: number;
}

export function Leave() {
  const navigate = useNavigate();
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [upcomingLeave, setUpcomingLeave] = useState<UpcomingLeave | null>(null);
  const [leaveHistory, setLeaveHistory] = useState<LeaveHistoryItem[]>([]);
  const [teamLeave, setTeamLeave] = useState<TeamLeaveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all leave data
  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching leave data...');
        
        const [balancesResponse, upcomingResponse, historyResponse, teamResponse] = await Promise.all([
          employeeLeaveApi.getLeaveBalances(),
          employeeLeaveApi.getUpcomingLeave(),
          employeeLeaveApi.getLeaveHistory(),
          employeeLeaveApi.getTeamLeave()
        ]);

        console.log('Leave balances response:', balancesResponse);
        console.log('Upcoming leave response:', upcomingResponse);
        console.log('Leave history response:', historyResponse);
        console.log('Team leave response:', teamResponse);

        setLeaveBalances(balancesResponse.leaveBalances || []);
        setUpcomingLeave(upcomingResponse.upcomingLeave);
        setLeaveHistory(historyResponse.leaveHistory || []);
        setTeamLeave(teamResponse.teamLeave || []);
        
        console.log('Set leave balances:', balancesResponse.leaveBalances || []);
        console.log('Set upcoming leave:', upcomingResponse.upcomingLeave);
        console.log('Set leave history:', historyResponse.leaveHistory || []);
        console.log('Set team leave:', teamResponse.teamLeave || []);
      } catch (err) {
        console.error('Error fetching leave data:', err);
        setError('Failed to load leave data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveData();
  }, []);

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
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Leave Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/holidays')}>
            <CalendarRange className="mr-2 h-4 w-4" />
            View Holidays
          </Button>
          <Button onClick={() => navigate('/request-leave')}>
            <CalendarDays className="mr-2 h-4 w-4" />
            Request Leave
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {leaveBalances.length > 0 ? (
          leaveBalances.map((leave, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-8 w-8 rounded-full ${leave.color} flex items-center justify-center`}>
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{leave.type}</p>
                    <p className="text-lg font-semibold">
                      {leave.total - leave.remaining} / {leave.total} days
                      <span className="ml-2 text-xs text-blue-600">({leave.remaining} remaining)</span>
                    </p>
                  </div>
                </div>
                <Progress 
                  value={((leave.total - leave.remaining) / leave.total) * 100} 
                  className="h-2" 
                />
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No leave types available</p>
                  <p className="text-sm text-gray-400">
                    Leave balances: {leaveBalances.length} items
                  </p>
                  <p className="text-sm text-gray-400">
                    Check console for API response details
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {upcomingLeave && (
        <Card className={upcomingLeave.status === 'rejected' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full ${upcomingLeave.status === 'rejected' ? 'bg-red-100' : 'bg-blue-100'} flex items-center justify-center`}>
                  <CalendarDays className={`h-6 w-6 ${upcomingLeave.status === 'rejected' ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h3 className="font-medium">
                    {upcomingLeave.status === 'rejected' ? 'Leave Request Rejected' : 'Upcoming Leave'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(new Date(upcomingLeave.startDate))} - {formatDate(new Date(upcomingLeave.endDate))}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={upcomingLeave.status === 'approved' ? 'success' : 'destructive'}>
                      {upcomingLeave.status.charAt(0).toUpperCase() + upcomingLeave.status.slice(1)}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {upcomingLeave.days} days • {upcomingLeave.type}
                    </span>
                  </div>
                  {upcomingLeave.status === 'rejected' && upcomingLeave.rejectionReason && (
                    <p className="text-sm text-red-600 mt-1">
                      Reason: {upcomingLeave.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Leave History</TabsTrigger>
          <TabsTrigger value="team">Team Leave</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Leave History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaveHistory.length > 0 ? (
                  leaveHistory.map((leave) => (
                    <div 
                      key={leave.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{leave.type}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{formatDate(new Date(leave.startDate))}</span>
                            <ChevronRight className="h-4 w-4" />
                            <span>{formatDate(new Date(leave.endDate))}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{leave.notes}</p>
                          {leave.rejectionReason && (
                            <p className="text-sm text-red-600 mt-1">
                              Rejection: {leave.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={
                          leave.status === 'completed' 
                            ? 'success' 
                            : leave.status === 'approved'
                              ? 'default'
                              : leave.status === 'rejected'
                                ? 'destructive'
                                : 'warning'
                        }>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </Badge>
                        <span className="font-medium">{leave.days}d</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No leave history found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Leave Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamLeave.length > 0 ? (
                  teamLeave.map((member, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{formatDate(new Date(member.startDate))}</span>
                            <ChevronRight className="h-4 w-4" />
                            <span>{formatDate(new Date(member.endDate))}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{member.type}</p>
                        </div>
                      </div>
                      <Badge variant={
                        member.status === 'approved' 
                          ? 'success' 
                          : member.status === 'pending'
                            ? 'warning'
                            : member.status === 'rejected'
                              ? 'destructive'
                              : 'default'
                      }>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No team members in your department or no leave requests found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}