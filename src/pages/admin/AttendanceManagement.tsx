import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  Download, 
  Filter, 
  BarChart2, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  CalendarRange,
  Settings
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { attendanceApi } from '@/services/attendanceApi';

// Types for attendance data
interface AttendanceRecord {
  id: number;
  date: string;
  employeeName: string;
  employeeAvatar: string;
  department: string;
  clockIn: string;
  clockOut: string;
  status: string;
  workHours: string;
  notes: string;
}

interface AttendanceSummary {
  totalEmployees: number;
  present: number;
  late: number;
  absent: number;
  onLeave: number;
  averageWorkHours: string;
  attendanceRate: number;
}

interface RecentIssue {
  type: string;
  employeeName: string;
  date: string;
  description: string;
  details: string;
}

interface Department {
  id: number;
  name: string;
}

// Status filter options
const statusOptions = ['All Status', 'Present', 'Late', 'Absent', 'On Leave'];

// Date filter options
const dateOptions = ['Today', 'Yesterday', 'This Week', 'Last Week', 'This Month', 'Custom Range'];

export function AttendanceManagement(): JSX.Element {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  
  // State for real data
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary>({
    totalEmployees: 0,
    present: 0,
    late: 0,
    absent: 0,
    onLeave: 0,
    averageWorkHours: '0h 00m',
    attendanceRate: 0
  });
  const [recentIssues, setRecentIssues] = useState<RecentIssue[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  

  // Helper function to get date string based on filter
  const getDateFromFilter = (filter: string): string => {
    const today = new Date();
    switch (filter) {
      case 'Today':
        return today.toISOString().slice(0, 10);
      case 'Yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().slice(0, 10);
      case 'This Week':
        // For demo, return today's date
        return today.toISOString().slice(0, 10);
      case 'Last Week':
        // For demo, return yesterday's date
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 1);
        return lastWeek.toISOString().slice(0, 10);
      default:
        return today.toISOString().slice(0, 10);
    }
  };

  // Helper function to get date range for week/month filters
  const getDateRangeFromFilter = (filter: string): { startDate: string; endDate: string } => {
    const today = new Date();
    
    switch (filter) {
      case 'This Week':
        // Get start of current week (Monday)
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        
        // Get end of current week (Sunday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        return {
          startDate: startOfWeek.toISOString().slice(0, 10),
          endDate: endOfWeek.toISOString().slice(0, 10)
        };
        
      case 'Last Week':
        // Get start of last week (Monday)
        const startOfLastWeek = new Date(today);
        const dayOfLastWeek = today.getDay();
        const diffLastWeek = today.getDate() - dayOfLastWeek + (dayOfLastWeek === 0 ? -6 : 1) - 7; // Subtract 7 days
        startOfLastWeek.setDate(diffLastWeek);
        startOfLastWeek.setHours(0, 0, 0, 0);
        
        // Get end of last week (Sunday)
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
        endOfLastWeek.setHours(23, 59, 59, 999);
        
        return {
          startDate: startOfLastWeek.toISOString().slice(0, 10),
          endDate: endOfLastWeek.toISOString().slice(0, 10)
        };
        
      case 'This Month':
        // Get start of current month
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        // Get end of current month
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        return {
          startDate: startOfMonth.toISOString().slice(0, 10),
          endDate: endOfMonth.toISOString().slice(0, 10)
        };
        
      default:
        return {
          startDate: today.toISOString().slice(0, 10),
          endDate: today.toISOString().slice(0, 10)
        };
    }
  };

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const departmentId = selectedDepartment === 'All Departments' ? undefined : selectedDepartment;

      // Determine if we need date range or single date
      const needsDateRange = ['This Week', 'Last Week', 'This Month'].includes(selectedDate);

      let date: string | undefined;
      let startDate: string | undefined;
      let endDate: string | undefined;

      if (needsDateRange) {
        const dateRange = getDateRangeFromFilter(selectedDate);
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
      } else {
        date = getDateFromFilter(selectedDate);
      }

      // Fetch all data in parallel
      const [recordsResponse, summaryResponse, issuesResponse, departmentsResponse] = await Promise.all([
        attendanceApi.getEmployeeAttendanceRecords(date, departmentId, startDate, endDate),
        attendanceApi.getAttendanceSummary(date, startDate, endDate),
        attendanceApi.getRecentIssues(7),
        attendanceApi.getDepartments()
      ]);

      console.log('Attendance Records Response:', recordsResponse);
      console.log('Attendance Summary Response:', summaryResponse);
      console.log('Recent Issues Response:', issuesResponse);
      console.log('Departments Response:', departmentsResponse);

      setAttendanceRecords(recordsResponse.records || []);
      setAttendanceSummary(summaryResponse);
      setRecentIssues(issuesResponse.issues || []);
      setDepartments(departmentsResponse.departments || []);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Failed to load attendance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedDepartment]);

  // Filter attendance records based on selected status
  const filteredAttendanceRecords = attendanceRecords.filter(record => {
    const matchesStatus = 
      selectedStatus === 'All Status' || 
      record.status.toLowerCase() === selectedStatus.toLowerCase();
      
    return matchesStatus;
  });
  
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-amber-100 text-amber-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'on leave':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'late':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Calendar className="h-4 w-4 text-blue-600" />;
    }
  };


  const formatTime = (isoString: string | null | undefined) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  
  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'late':
        return <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />;
      case 'missed_clockout':
        return <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600 mt-0.5" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading attendance data...</p>
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
            <Button onClick={fetchData} variant="outline">
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Attendance Management</h1>
          <p className="text-gray-500">Monitor and manage employee attendance records.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => navigate('/admin/attendance-settings')}
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button 
            size="sm" 
            className="gap-1"
            onClick={() => navigate('/admin/attendance/analytics')}
          >
            <BarChart2 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </Button>
        </div>
      </div>
      
      {/* Summary Cards - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {selectedDate === 'Today' ? "Today's Summary" :
               selectedDate === 'Yesterday' ? "Yesterday's Summary" :
               selectedDate === 'This Week' ? "This Week's Summary" :
               selectedDate === 'Last Week' ? "Last Week's Summary" :
               selectedDate === 'This Month' ? "This Month's Summary" :
               "Attendance Summary"}
            </CardTitle>
            <CardDescription className="text-sm">
              {selectedDate === 'Today' || selectedDate === 'Yesterday' ? 
                new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) :
               selectedDate === 'This Week' || selectedDate === 'Last Week' ? 
                `${getDateRangeFromFilter(selectedDate).startDate} to ${getDateRangeFromFilter(selectedDate).endDate}` :
               selectedDate === 'This Month' ? 
                new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) :
                new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Attendance Rate</span>
                  <span className="text-sm font-medium">{attendanceSummary.attendanceRate}%</span>
                </div>
                <Progress value={attendanceSummary.attendanceRate} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Present</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold mt-1">{attendanceSummary.present}</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium">Late</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold mt-1">{attendanceSummary.late}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Absent</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold mt-1">{attendanceSummary.absent}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">On Leave</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold mt-1">{attendanceSummary.onLeave}</p>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Employees</span>
                  <span className="font-medium">{attendanceSummary.totalEmployees}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Avg. Work Hours</span>
                  <span className="font-medium">{attendanceSummary.averageWorkHours}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Recent Issues</h4>
                <div className="space-y-3">
                  {recentIssues.length > 0 ? (
                    recentIssues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-2">
                        {getIssueIcon(issue.type)}
                    <div>
                          <p className="text-sm font-medium">{issue.description}</p>
                          <p className="text-xs text-gray-500">{issue.employeeName} - {new Date(issue.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">No recent issues</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>
              View and manage employee attendance records
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <select 
                  className="w-full appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                >
                  {dateOptions.map((date) => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
                <CalendarRange className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative flex-1">
                <select 
                  className="w-full appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="All Departments">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative flex-1">
                <select 
                  className="w-full appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            {/* Mobile Responsive Table */}
            <div className="border rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px] md:w-[250px]">Employee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Clock In</TableHead>
                      <TableHead className="hidden md:table-cell">Clock Out</TableHead>
                      <TableHead className="hidden lg:table-cell">Work Hours</TableHead>
                      <TableHead className="hidden lg:table-cell">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 md:h-10 md:w-10">
                              <AvatarImage src={record.employeeAvatar} alt={record.employeeName} />
                              <AvatarFallback className="text-xs md:text-sm">{record.employeeName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm md:text-base truncate">{record.employeeName}</div>
                              <div className="text-xs text-gray-500 truncate">{record.department}</div>
                              <div className="text-xs text-gray-400 md:hidden">
                                {formatTime(record.clockIn)} - {formatTime(record.clockOut)} • {record.workHours}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(record.status)}
                            <Badge className={`${getStatusColor(record.status)} font-normal text-xs`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{formatTime(record.clockIn)}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{formatTime(record.clockOut)}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{record.workHours}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-gray-500">{record.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {filteredAttendanceRecords.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No attendance records found</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Try adjusting your filters to see more results.
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <div>Showing {filteredAttendanceRecords.length} records</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
