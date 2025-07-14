import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '../ui/progress';
import { attendanceApi } from '@/services/attendanceApi';

export function AttendanceOverviewWidget() {
  const navigate = useNavigate();
  
  // Real data state
  const [attendanceStats, setAttendanceStats] = useState<any>({
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
    averageArrivalTime: '-',
    averageDepartureTime: '-'
  });
  const [attendanceIssues, setAttendanceIssues] = useState<any[]>([]);

  useEffect(() => {
    // Fetch attendance summary
    attendanceApi.getAttendanceSummary().then(data => {
      if (data && typeof data === 'object') {
        setAttendanceStats({
          present: data.present || 0,
          absent: data.absent || 0,
          late: data.late || 0,
          total: data.totalEmployees || 0,
          averageArrivalTime: data.averageArrivalTime || '-',
          averageDepartureTime: data.averageDepartureTime || '-'
        });
      }
    }).catch(() => setAttendanceStats({
      present: 0, absent: 0, late: 0, total: 0, averageArrivalTime: '-', averageDepartureTime: '-'
    }));
    // Fetch recent attendance issues
    attendanceApi.getRecentIssues(3).then(data => {
      setAttendanceIssues(Array.isArray(data) ? data : (Array.isArray(data.issues) ? data.issues : []));
    }).catch(() => setAttendanceIssues([]));
  }, []);

  const presentPercentage = attendanceStats.total > 0 ? Math.round((attendanceStats.present / attendanceStats.total) * 100) : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Attendance Overview</CardTitle>
        <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => navigate('/admin/attendance')}>
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Present Today</span>
              <span className="text-sm font-medium">{presentPercentage}%</span>
            </div>
            <Progress value={presentPercentage} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Average Arrival</p>
              <p className="text-lg font-semibold">{attendanceStats.averageArrivalTime}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Average Departure</p>
              <p className="text-lg font-semibold">{attendanceStats.averageDepartureTime}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-green-50 text-green-700 rounded-lg p-2">
              <p className="text-xs">Present</p>
              <p className="text-lg font-semibold">{attendanceStats.present}</p>
            </div>
            <div className="bg-amber-50 text-amber-700 rounded-lg p-2">
              <p className="text-xs">Late</p>
              <p className="text-lg font-semibold">{attendanceStats.late}</p>
            </div>
            <div className="bg-red-50 text-red-700 rounded-lg p-2">
              <p className="text-xs">Absent</p>
              <p className="text-lg font-semibold">{attendanceStats.absent}</p>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500">Recent Issues</h3>
            {attendanceIssues.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No recent issues.</div>
            ) : (
              attendanceIssues.map((issue, index) => (
              <div key={index} className="flex items-start gap-2 border-l-2 border-amber-500 pl-3 py-1">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-sm font-medium">{issue.employee || issue.employee_name || issue.name || ''}</p>
                    <p className="text-xs text-gray-500">{issue.issue || issue.type || ''} - {issue.time || ''}</p>
                    <p className="text-xs text-gray-400">{issue.date ? new Date(issue.date).toLocaleDateString() : ''}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/admin/attendance')}>
          <Clock className="mr-2 h-4 w-4" />
          Generate Attendance Report
        </Button>
      </CardFooter>
    </Card>
  );
}
