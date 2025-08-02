import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useNavigate } from 'react-router-dom';
import { employeeLeaveApi } from '@/services/employeeLeaveApi';

export function LeaveWidget() {
  const navigate = useNavigate();
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [recentApprovedLeave, setRecentApprovedLeave] = useState<any | null>(null);

  useEffect(() => {
    // Fetch leave balances
    employeeLeaveApi.getLeaveBalances().then(data => {
      if (data && Array.isArray(data.leaveBalances)) {
        setLeaveTypes(data.leaveBalances);
      }
    });
    // Fetch most recent approved leave
    employeeLeaveApi.getLeaveHistory().then(data => {
      if (data && Array.isArray(data.leaveHistory)) {
        const approved = data.leaveHistory.filter((l: any) => l.status === 'approved');
        if (approved.length > 0) {
          // Sort by endDate or end_date descending, pick the most recent
          approved.sort((a: any, b: any) => {
            const aEnd = new Date(a.endDate || a.end_date).getTime();
            const bEnd = new Date(b.endDate || b.end_date).getTime();
            return bEnd - aEnd;
          });
          setRecentApprovedLeave(approved[0]);
        }
      }
    });
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Leave Management</CardTitle>
        <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => navigate('/leave')}>
          View All
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaveTypes.map((leave, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{leave.type}</span>
                <span className="text-sm text-gray-500">
                  {leave.used} / {leave.total} days
                </span>
              </div>
              <Progress 
                value={leave.total > 0 ? (leave.used / leave.total) * 100 : 0} 
                className="h-2" 
              />
            </div>
          ))}
        </div>
        {recentApprovedLeave && (
          <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Approved Leave</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {(recentApprovedLeave.startDate || recentApprovedLeave.start_date)} - {(recentApprovedLeave.endDate || recentApprovedLeave.end_date)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="success">Approved</Badge>
                    <span className="text-xs text-gray-500">
                      {recentApprovedLeave.days}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button className="w-full" onClick={() => navigate('/leave')}>
          <Calendar className="mr-2 h-4 w-4" />
          Request Leave
        </Button>
      </CardFooter>
    </Card>
  );
}