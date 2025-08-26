import React, { useState, useEffect } from 'react';
import { useDepartments } from '@/hooks/useDepartments';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Download, 
  Filter as FilterIcon, 
  Sparkles, 
  Calendar as CalendarIcon,
  Clock, 
  Users,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
// import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { attendanceApi } from '@/services/attendanceApi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// AI generated insights for different tabs (dynamic from backend)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface Trend {
  day: string;
  present: number;
  late: number;
  absent: number;
  date?: string;
}

interface DepartmentInsight {
  name: string;
  present: number;
  late: number;
  absent: number;
  total: number;
  attendanceRate?: number;
  latenessRate?: number;
  absentRate?: number;
  totalEmployees?: number;
  insights?: string[];
}

interface EmployeeInsight {
  employee_id: number;      // matches the backend field
  first_name?: string;
  last_name?: string;
  name?: string;
  department_id: number | null;
  present_days?: number;
  late_days?: number;
  absent_days?: number;
  joining_date?: string;
  status?: string;
  insights?: string[];
  summary?: {
    present?: number;
    absent?: number;
    late?: number;
    avgHours?: number;
  };
}



interface AIInsights {
  trends: Trend[];
  departments: DepartmentInsight[];
  employees: EmployeeInsight[];
  insights?: string[];
  summary?: {
    avgAbsent?: number;
    avgPresent?: number;
    totalAbsent?: number;
    totalPresent?: number;
    totalLate?: number;
    totalEmployees?: number;
  };
}

interface HRAttendance {
  employee_id: number;
  first_name: string;
  last_name: string;
  present_days: string;
  late_days: string;
  absent_days: string;
  department_id: number | null;
}

const useAIInsights = () => {
  const [aiInsights, setAiInsights] = useState<AIInsights>({
    trends: [],
    departments: [],
    employees: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const payload = JSON.parse(atob(token.split(".")[1]));
        const companyId = payload.company_id;
        if (!companyId) throw new Error("No company ID found in token");

        const res = await fetch(
          `${API_BASE_URL}/ai-oversight/hr-trends/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

        const data = await res.json();
        console.log("AI insights API response:", data);

        if (data.success && data.hrData && data.trends) {
          const hrData = data.hrData;
          const trendsData = data.trends;

          // Normalize attendance
          const attendanceByEmployee: HRAttendance[] =
            hrData.attendance?.byEmployee || [];

          const departmentsRaw: any[] =
            hrData.attendance?.byDepartment || trendsData.departments || [];

          // Map trends
          const trends: Trend[] = Array.isArray(trendsData.trends)
            ? trendsData.trends.map((t: any) => ({
                day: t.day || "Unknown",
                present: Number(t.present || 0),
                late: Number(t.late || 0),
                absent: Number(t.absent || 0),
                date: t.date,
              }))
            : [];

          // Map departments
          const departments: DepartmentInsight[] = departmentsRaw.map(
            (dept: any) => ({
              name: dept.department || dept.department_name || "Unknown",
              present: Number(dept.present || dept.present_days || 0),
              late: Number(dept.late || dept.late_days || 0),
              absent: Number(dept.absent || dept.absent_days || 0),
              total: Number(dept.total || dept.totalEmployees || dept.total_employees || 0) ||
                Number(dept.present || dept.present_days || 0) +
                Number(dept.late || dept.late_days || 0) +
                Number(dept.absent || dept.absent_days || 0),
              attendanceRate: typeof dept.attendanceRate === 'number' ? dept.attendanceRate : (typeof dept.attendance_rate === 'number' ? dept.attendance_rate : undefined),
              latenessRate: typeof dept.latenessRate === 'number' ? dept.latenessRate : (typeof dept.lateness_rate === 'number' ? dept.lateness_rate : undefined),
              absentRate: typeof dept.absentRate === 'number' ? dept.absentRate : (typeof dept.absent_rate === 'number' ? dept.absent_rate : undefined),
              totalEmployees: typeof dept.totalEmployees === 'number' ? dept.totalEmployees : (typeof dept.total_employees === 'number' ? dept.total_employees : undefined),
              insights: Array.isArray(dept.insights) ? dept.insights : [],
            })
          );

          // Map employees (robust fallback)
          let employeesRaw: any[] = [];
          if (Array.isArray(trendsData.employees) && trendsData.employees.length > 0) {
            employeesRaw = trendsData.employees;
          } else if (Array.isArray(hrData.employees) && hrData.employees.length > 0) {
            employeesRaw = hrData.employees;
          } else if (Array.isArray(hrData.attendance?.byEmployee) && hrData.attendance.byEmployee.length > 0) {
            employeesRaw = hrData.attendance.byEmployee;
          } else if (Array.isArray(attendanceByEmployee) && attendanceByEmployee.length > 0) {
            employeesRaw = attendanceByEmployee;
          }

          const employees: EmployeeInsight[] = employeesRaw.map((emp: any) => ({
            employee_id: emp.employee_id,
            first_name: emp.first_name,
            last_name: emp.last_name,
            name: emp.name,
            department_id: emp.department_id ?? null,
            present_days: Number(emp.present_days ?? emp.present ?? 0),
            late_days: Number(emp.late_days ?? emp.late ?? 0),
            absent_days: Number(emp.absent_days ?? emp.absent ?? 0),
            joining_date: emp.joining_date,
            status: emp.status,
            insights: Array.isArray(emp.insights) ? emp.insights : [],
            summary: typeof emp.summary === 'object' ? emp.summary : undefined,
          }));

          setAiInsights({
            trends,
            departments,
            employees,
            insights: Array.isArray(trendsData.insights) ? trendsData.insights : [],
            summary: typeof trendsData.summary === 'object' ? trendsData.summary : undefined,
          });
        } else {
          setError(data.message || "Failed to load AI insights");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load AI insights");
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, []);

  return { aiInsights, loading, error };
};









//   weeklyTrend: [
//     { day: 'Mon', present: 120, late: 5, absent: 2 },
//     { day: 'Tue', present: 118, late: 7, absent: 2 },
//     { day: 'Wed', present: 115, late: 8, absent: 4 },
//     { day: 'Thu', present: 122, late: 3, absent: 2 },
//     { day: 'Fri', present: 117, late: 6, absent: 4 },
//     { day: 'Sat', present: 60, late: 2, absent: 5 },
//     { day: 'Sun', present: 10, late: 0, absent: 5 }
//   ],
//   byDepartment: [
//     { name: 'Engineering', present: 45, late: 3, absent: 2, total: 50 },
//     { name: 'Design', present: 18, late: 1, absent: 1, total: 20 },
//     { name: 'Marketing', present: 22, late: 2, absent: 1, total: 25 },
//     { name: 'HR', present: 12, late: 0, absent: 0, total: 12 },
//     { name: 'Finance', present: 15, late: 2, absent: 3, total: 20 }
//   ]
// };

// Error Boundary Component
class ErrorBoundaryImpl extends React.Component<{ onError: (error: Error) => void, children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError(error);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
          <p className="mt-2 text-red-500">Please try refreshing the page or contact support if the issue persists.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Main Analytics Content Component
const AnalyticsContent = () => {
  // State for employee attendance data
  const [employeeAttendance, setEmployeeAttendance] = useState<
    { name: string; present: number; late: number; absent: number }[]
  >([]);

  // Loading state for async operations
  const [loading, setLoading] = useState<boolean>(false);

  // Error state for async operations
  const [error, setError] = useState<string | null>(null);

  // AI Insights hook
  const { aiInsights, loading: aiLoading, error: aiError } = useAIInsights();
  // Defensive fallback for aiInsights
  const safeAIInsights = aiInsights || { trends: [], departments: [], employees: [] };
  // Debug log for employees array
  console.log('safeAIInsights.employees:', safeAIInsights.employees);

  // Helper to derive start/end ISO date strings from a simple filter (e.g. 'This Week')
  const getDateRangeFromFilter = (filter: string): { startDate: string; endDate: string } => {
    const now = new Date();

    if (filter === 'Today') {
      const d = now.toISOString().slice(0, 10);
      return { startDate: d, endDate: d };
    }

    // Default to current week: Monday - Sunday
    const dayOfWeek = now.getDay(); // 0 (Sun) - 6 (Sat)
    const monday = new Date(now);
    // compute Monday (treat Monday as first day)
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const startDate = monday.toISOString().slice(0, 10);
    const endDate = sunday.toISOString().slice(0, 10);
    return { startDate, endDate };
  };

  // Fetch employee attendance records for the current week and aggregate by status
  useEffect(() => {
    const fetchEmployeeAttendance = async () => {
      try {
        // Always get Monday (start) and Sunday (end) of the current week
        const now = new Date();
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const startDate = monday.toISOString().slice(0, 10);
        const endDate = sunday.toISOString().slice(0, 10);
        console.log('[EmployeeAttendance] startDate:', startDate, 'endDate:', endDate);
        const records = await attendanceApi.getEmployeeAttendanceRecords(undefined, undefined, startDate, endDate);
        console.log('[EmployeeAttendance] fetched records:', records);
        // Support both array and { records: [...] } API responses
        const arr = Array.isArray(records) ? records : (Array.isArray(records?.records) ? records.records : []);
        // Aggregate by employee and status
        const employeeMap: Record<string, { name: string; present: number; late: number; absent: number }> = {};
        arr.forEach((rec: any) => {
          const name = rec.employeeName || rec.name || 'Unknown';
          if (!employeeMap[name]) {
            employeeMap[name] = { name, present: 0, late: 0, absent: 0 };
          }
          const status = (rec.status || '').toLowerCase();
          if (status === 'present') {
            employeeMap[name].present += 1;
          } else if (status === 'late') {
            employeeMap[name].late += 1;
            // Also count late as present
            employeeMap[name].present += 1;
          } else if (status === 'absent') {
            employeeMap[name].absent += 1;
          }
        });
        const mapped = Object.values(employeeMap);
        setEmployeeAttendance(mapped.slice(0, 10)); // Top 10
      } catch (err) {
        setEmployeeAttendance([]);
        console.error('Failed to load employee attendance:', err);
      }
    };
    fetchEmployeeAttendance();
  }, []);
  const [analytics, setAnalytics] = useState({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
    attendanceRate: 0,
    lateRate: 0,
    absentRate: 0,
    byDepartment: [] as { department: string; present: number; late: number; absent: number }[]
  });

  // Use shared departments hook
  const { departments, loading: departmentsLoading, error: departmentsError } = useDepartments();

  // State for weekly trend data
  const [weeklyTrend, setWeeklyTrend] = useState<
    { day: string; date: string; present: number; late: number; absent: number }[]
  >([
    { day: 'Mon', date: '', present: 0, late: 0, absent: 0 },
    { day: 'Tue', date: '', present: 0, late: 0, absent: 0 },
    { day: 'Wed', date: '', present: 0, late: 0, absent: 0 },
    { day: 'Thu', date: '', present: 0, late: 0, absent: 0 },
    { day: 'Fri', date: '', present: 0, late: 0, absent: 0 },
    { day: 'Sat', date: '', present: 0, late: 0, absent: 0 },
    { day: 'Sun', date: '', present: 0, late: 0, absent: 0 }
  ]);

  // Only show the last 7 days in the chart (Monday-Sunday)
  const last7Days = weeklyTrend.slice(-7);
  console.log('WeeklyTrend for chart:', last7Days); // (See <attachments> above for file contents. You may not need to search or read the file again.)

  useEffect(() => {
    // Helper to get Monday of current week
    const getMonday = (d: Date) => {
      const day = d.getDay();
      const diff = d.getDate() - ((day + 6) % 7);
      return new Date(d.setDate(diff));
    };

    // Fetch summary for today (for cards)
    const fetchOverview = async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const summary = await attendanceApi.getAttendanceSummary(today);
        setAnalytics({
          totalEmployees: summary.totalEmployees,
          presentToday: summary.present,
          lateToday: summary.late,
          absentToday: summary.absent,
          attendanceRate: summary.attendanceRate,
          lateRate: parseFloat(
            ((summary.late / summary.totalEmployees) * 100).toFixed(1)
          ),
          absentRate: parseFloat(
            ((summary.absent / summary.totalEmployees) * 100).toFixed(1)
          ),
          byDepartment: summary.byDepartment || []
        });
      } catch (err) {
        console.error("Failed to load overview:", err);
      }
    };

    // Fetch weekly trend using summary API for each day
    const fetchWeeklyTrend = async () => {
      setLoading(true);
      setError(null);
      try {
        const today = new Date();
        const monday = getMonday(new Date());
        const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const trendData: { day: string; date: string; present: number; late: number; absent: number }[] = [];
        for (let i = 0; i < 7; i++) {
          const dateObj = new Date(monday);
          dateObj.setDate(monday.getDate() + i);
          const dateStr = dateObj.toISOString().slice(0, 10);
          try {
            const summary = await attendanceApi.getAttendanceSummary(dateStr);
            trendData.push({
              day: dayLabels[i],
              date: dateStr,
              present: summary.present + summary.late,
              late: summary.late,
              absent: summary.absent,
            });
          } catch (err) {
            trendData.push({
              day: dayLabels[i],
              date: dateStr,
              present: 0,
              late: 0,
              absent: 0,
            });
          }
        }
        setWeeklyTrend(trendData);
      } catch (err) {
        console.error('Error fetching weekly trend data:', err);
        setError('Failed to load weekly trend data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
    fetchWeeklyTrend();
  }, []);
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Ensure we have a valid active tab
  useEffect(() => {
    const validTabs = ['overview', 'trends', 'departments', 'employees'];
    if (!validTabs.includes(activeTab)) {
      setActiveTab('overview');
    }
  }, [activeTab]);

  // Format date range for display
  const dateRangeDisplay = dateRange?.from 
    ? `${format(dateRange.from, 'MMM d, yyyy')} - ${dateRange.to ? format(dateRange.to, 'MMM d, yyyy') : format(dateRange.from, 'MMM d, yyyy')}`
    : 'Select date range';

  // Filter departments based on selection
const filteredDepartments = selectedDepartment === 'all' 
  ? departments || []
  : (departments || []).filter(
      dept => dept.name.toLowerCase() === selectedDepartment
    );



// Use filteredDepartments to avoid lint warning
console.log('Filtered departments count:', filteredDepartments.length);

  
  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Attendance Analytics</h1>
            <p className="text-muted-foreground">
              Track and analyze attendance patterns and trends
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <TabsList className="w-full md:w-auto justify-start mb-4 md:mb-0">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="departments">By Department</TabsTrigger>
            <TabsTrigger value="employees">Employee Insights</TabsTrigger>
          </TabsList>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="flex items-center space-x-2">
              <FilterIcon className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                    {analytics.byDepartment.map((dept) => (
                      <SelectItem key={dept.department} value={dept.department.toLowerCase()}>
                            {dept.department}
                          </SelectItem>

                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[240px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRangeDisplay}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover> */}
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Employees Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Employees
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalEmployees}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all departments
                  </p>

              </CardContent>
            </Card>

            {/* Present Today Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.presentToday + analytics.lateToday}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.presentToday + analytics.lateToday} present &middot; {analytics.attendanceRate}% attendance rate
                </p>
              </CardContent>
            </Card>

            {/* Late Arrivals Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.lateToday}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.lateRate}% of total employees
                  </p>

              </CardContent>
            </Card>

            {/* Absent Today Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.absentToday}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.absentRate}% of total employees
                  </p>

              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Weekly Overview Card */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Weekly Overview</CardTitle>
                <CardDescription>Attendance trends over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={last7Days}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-4 border rounded shadow">
                                <p className="font-bold">{payload[0].payload.day} ({payload[0].payload.date})</p>
                                <p className="text-green-600">Present: {payload[0].payload.present}</p>
                                <p className="text-yellow-600">Late: {payload[0].payload.late}</p>
                                <p className="text-red-600">Absent: {payload[0].payload.absent}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Bar dataKey="present" name="Present" fill="#16a34a" stackId="a" />
                      <Bar dataKey="late" name="Late" fill="#ca8a04" stackId="a" />
                      <Bar dataKey="absent" name="Absent" fill="#dc2626" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Departments Card */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Departments</CardTitle>
                <CardDescription>Attendance by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentsLoading ? (
                    <div className="text-muted-foreground text-sm">Loading departments...</div>
                  ) : departmentsError ? (
                    <div className="text-red-500 text-sm">{departmentsError}</div>
                  ) : filteredDepartments.length === 0 ? (
                    <div className="text-muted-foreground text-sm">No department data available.</div>
                  ) : (
                    filteredDepartments.map((dept) => {
                      return (
                        <div key={dept.id} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{dept.name}</span>
                            <span className="text-muted-foreground">
                              {dept.headCount} members
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${dept.headCount > 0 && analytics.totalEmployees > 0 ? (dept.headCount / analytics.totalEmployees) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Section */}
          <div className="pt-6 border-t">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
              BlueAI Insights
            </h3>

            {aiLoading ? (
              <div className="flex items-center text-muted-foreground text-sm">
                <Sparkles className="h-4 w-4 mr-2 animate-spin text-blue-400" />
                Loading AI insights...
              </div>
            ) : aiError ? (
              <div className="text-red-500 text-sm">{aiError}</div>
            ) : !safeAIInsights || !Array.isArray(safeAIInsights.trends) || safeAIInsights.trends.length === 0 ? (
              <div className="text-muted-foreground text-sm">No AI insights available.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {safeAIInsights.trends.map((trend, i) => (
                  <div 
                    key={i} 
                    className="p-5 rounded-2xl shadow-sm border bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-blue-600">
                        {trend.day}
                        {trend.date ? ` • ${(() => { try { return format(new Date(trend.date), 'd MMM yyyy'); } catch { return trend.date; } })()}` : ''}
                      </p>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                        Insights
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="flex flex-col items-center p-2 rounded-lg bg-green-50">
                        <span className="text-xs text-muted-foreground">Present</span>
                        <span className="font-bold text-green-600">{trend.present}</span>
                      </div>
                      <div className="flex flex-col items-center p-2 rounded-lg bg-yellow-50">
                        <span className="text-xs text-muted-foreground">Late</span>
                        <span className="font-bold text-yellow-600">{trend.late}</span>
                      </div>
                      <div className="flex flex-col items-center p-2 rounded-lg bg-red-50">
                        <span className="text-xs text-muted-foreground">Absent</span>
                        <span className="font-bold text-red-600">{trend.absent}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trends</CardTitle>
              <CardDescription>Weekly attendance patterns and analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyTrend}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-4 border rounded shadow">
                              <p className="font-bold">{payload[0].payload.day}</p>
                              <p className="text-green-600">Present: {payload[0].payload.present}</p>
                              <p className="text-yellow-600">Late: {payload[0].payload.late}</p>
                              <p className="text-red-600">Absent: {payload[0].payload.absent}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="present" name="Present" fill="#16a34a" stackId="a" />
                    <Bar dataKey="late" name="Late" fill="#ca8a04" stackId="a" />
                    <Bar dataKey="absent" name="Absent" fill="#dc2626" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="pt-6 border-t space-y-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
              BlueAI Trend Insights
            </h3>

            {aiLoading ? (
              <div className="flex items-center text-muted-foreground text-sm">
                <Sparkles className="h-4 w-4 mr-2 animate-spin text-blue-400" />
                Loading AI insights...
              </div>
            ) : aiError ? (
              <div className="text-red-500 text-sm">{aiError}</div>
            ) : !safeAIInsights || !safeAIInsights.trends || !Array.isArray(safeAIInsights.trends) ? (
              <div className="text-muted-foreground text-sm">No AI insights available.</div>
            ) : (
              <>
                {/* AI Insights Section */}
                {safeAIInsights.insights && safeAIInsights.insights.length > 0 && (
                  <Card className="shadow-sm rounded-2xl hover:shadow-md transition">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-600">
                        <Sparkles className="h-4 w-4" /> AI Insights
                      </CardTitle>
                      <CardDescription>Key findings & recommendations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {safeAIInsights.insights.map((msg: string, idx: number) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 p-2 rounded-lg bg-blue-50 border border-blue-100 text-sm"
                          >
                            <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                            <span className="text-blue-700">{msg}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Summary Section */}
                {safeAIInsights.summary && (
                  <Card className="shadow-sm rounded-2xl hover:shadow-md transition">
                    <CardHeader>
                      <CardTitle className="text-blue-600">Summary</CardTitle>
                      <CardDescription>
                        Aggregated attendance statistics for the selected period
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex flex-col items-center p-3 rounded-lg bg-green-50">
                          <span className="text-xs text-muted-foreground">Avg Present</span>
                          <span className="font-bold text-green-600">
                            {safeAIInsights.summary.avgPresent ?? "-"}
                          </span>
                        </div>
                        <div className="flex flex-col items-center p-3 rounded-lg bg-red-50">
                          <span className="text-xs text-muted-foreground">Avg Absent</span>
                          <span className="font-bold text-red-600">
                            {safeAIInsights.summary.avgAbsent ?? "-"}
                          </span>
                        </div>
                        <div className="flex flex-col items-center p-3 rounded-lg bg-blue-50">
                          <span className="text-xs text-muted-foreground">Total Present</span>
                          <span className="font-bold text-blue-600">
                            {safeAIInsights.summary.totalPresent ?? "-"}
                          </span>
                        </div>
                        <div className="flex flex-col items-center p-3 rounded-lg bg-yellow-50">
                          <span className="text-xs text-muted-foreground">Total Late</span>
                          <span className="font-bold text-yellow-600">
                            {safeAIInsights.summary.totalLate ?? "-"}
                          </span>
                        </div>
                        <div className="flex flex-col items-center p-3 rounded-lg bg-pink-50">
                          <span className="text-xs text-muted-foreground">Total Absent</span>
                          <span className="font-bold text-pink-600">
                            {safeAIInsights.summary.totalAbsent ?? "-"}
                          </span>
                        </div>
                        <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50">
                          <span className="text-xs text-muted-foreground">Employees</span>
                          <span className="font-bold text-gray-700">
                            {safeAIInsights.summary.totalEmployees ?? "-"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Daily Trends Section */}
                  {Array.isArray(safeAIInsights.trends) && safeAIInsights.trends.length > 0 && (
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-medium flex items-center gap-2 text-blue-600">
                        <CalendarIcon className="h-5 w-5" />
                        Daily Trends
                      </h3>
                      <div className="grid gap-4">
                        {safeAIInsights.trends.map((insight, i) => (
                          <div
                            key={i}
                            className="p-4 rounded-xl border bg-gradient-to-r from-blue-50 to-white hover:shadow-sm transition"
                          >
                            <div className="flex items-start gap-3">
                              <div className="bg-blue-100 p-2 rounded-full">
                                <CalendarIcon className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1 text-sm">
                                <p className="font-medium text-gray-800">
                                  {insight.day}{insight.date ? ` (${insight.date})` : ""}
                                </p>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                  <div className="flex flex-col items-center p-2 rounded-lg bg-green-50">
                                    <span className="text-xs text-muted-foreground">Present</span>
                                    <span className="font-bold text-green-600">{insight.present}</span>
                                  </div>
                                  <div className="flex flex-col items-center p-2 rounded-lg bg-yellow-50">
                                    <span className="text-xs text-muted-foreground">Late</span>
                                    <span className="font-bold text-yellow-600">{insight.late}</span>
                                  </div>
                                  <div className="flex flex-col items-center p-2 rounded-lg bg-red-50">
                                    <span className="text-xs text-muted-foreground">Absent</span>
                                    <span className="font-bold text-red-600">{insight.absent}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
          </div>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Analysis</CardTitle>
              <CardDescription>Detailed attendance breakdown by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentsLoading ? (
                  <div className="text-muted-foreground text-sm">Loading departments...</div>
                ) : departmentsError ? (
                  <div className="text-red-500 text-sm">{departmentsError}</div>
                ) : departments.length === 0 ? (
                  <div className="text-muted-foreground text-sm">No department data available.</div>
                ) : (
                  departments.map((dept) => {
                    return (
                      <div key={dept.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{dept.name}</span>
                          <span className="text-muted-foreground">
                            {dept.headCount} members
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${dept.headCount > 0 && analytics.totalEmployees > 0 ? (dept.headCount / analytics.totalEmployees) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
          <div className="pt-6 border-t space-y-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
              BlueAI Department Insights
            </h3>

            {aiLoading ? (
              <div className="flex items-center text-muted-foreground text-sm">
                <Sparkles className="h-4 w-4 mr-2 animate-spin text-blue-400" />
                Loading AI insights...
              </div>
            ) : aiError ? (
              <div className="text-red-500 text-sm">{aiError}</div>
            ) : !safeAIInsights || !Array.isArray(safeAIInsights.departments) ? (
              <div className="text-muted-foreground text-sm">No AI insights available.</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {safeAIInsights.departments.map((insight, i) => (
                  <Card
                    key={i}
                    className="rounded-2xl shadow-sm hover:shadow-md transition border border-blue-100"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-blue-600 text-base flex justify-between items-center">
                        {insight.name}
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                          Dept
                        </span>
                      </CardTitle>
                      <CardDescription>Department performance overview</CardDescription>
                    </CardHeader>

                    <CardContent>
                      {/* Attendance Stats */}
                      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                        <div className="p-2 rounded-lg bg-green-50 flex flex-col items-center">
                          <span className="text-muted-foreground">Present</span>
                          <span className="font-bold text-green-600">{insight.present}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-yellow-50 flex flex-col items-center">
                          <span className="text-muted-foreground">Late</span>
                          <span className="font-bold text-yellow-600">{insight.late}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-red-50 flex flex-col items-center">
                          <span className="text-muted-foreground">Absent</span>
                          <span className="font-bold text-red-600">{insight.absent}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-50 flex flex-col items-center">
                          <span className="text-muted-foreground">Total</span>
                          <span className="font-bold text-blue-600">{insight.total}</span>
                        </div>
                      </div>

                      {/* Rates */}
                      <div className="grid grid-cols-2 gap-3 text-xs mb-2">
                        <div className="p-2 rounded-lg bg-gray-50 flex flex-col items-center">
                          <span className="text-muted-foreground">Attendance Rate</span>
                          <span className="font-semibold text-blue-700">
                            {insight.attendanceRate !== undefined
                              ? `${insight.attendanceRate.toFixed(1)}%`
                              : "-"}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-gray-50 flex flex-col items-center">
                          <span className="text-muted-foreground">Lateness Rate</span>
                          <span className="font-semibold text-yellow-700">
                            {insight.latenessRate !== undefined
                              ? `${insight.latenessRate.toFixed(1)}%`
                              : "-"}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-gray-50 flex flex-col items-center">
                          <span className="text-muted-foreground">Absenteeism</span>
                          <span className="font-semibold text-red-700">
                            {insight.absentRate !== undefined
                              ? `${insight.absentRate.toFixed(1)}%`
                              : "-"}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-gray-50 flex flex-col items-center">
                          <span className="text-muted-foreground">Employees</span>
                          <span className="font-semibold text-gray-700">
                            {insight.totalEmployees ?? "-"}
                          </span>
                        </div>
                      </div>

                      {/* AI Insights */}
                      {insight.insights && insight.insights.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-blue-600 mb-1">
                            AI Notes
                          </p>
                          <ul className="space-y-2">
                            {insight.insights.map((msg: string, idx: number) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 p-2 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700"
                              >
                                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                                {msg}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Employee Insights Tab */}
        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Insights</CardTitle>
              <CardDescription>Top 10 employees by attendance for this week (with AI details)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {employeeAttendance.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No employee attendance data available.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={employeeAttendance}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-4 border rounded shadow">
                                <p className="font-bold">{payload[0].payload.name}</p>
                                <p className="text-green-600">Present: {payload[0].payload.present}</p>
                                <p className="text-yellow-600">Late: {payload[0].payload.late}</p>
                                <p className="text-red-600">Absent: {payload[0].payload.absent}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Bar dataKey="present" name="Present" fill="#16a34a" stackId="a" />
                      <Bar dataKey="late" name="Late" fill="#ca8a04" stackId="a" />
                      <Bar dataKey="absent" name="Absent" fill="#dc2626" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="pt-6 border-t space-y-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
              BlueAI Employee Insights
            </h3>

            {aiLoading ? (
              <div className="flex items-center text-muted-foreground text-sm">
                <Sparkles className="h-4 w-4 mr-2 animate-spin text-blue-400" />
                Loading AI insights...
              </div>
            ) : aiError ? (
              <div className="text-red-500 text-sm">{aiError}</div>
            ) : employeeAttendance.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                No employee attendance data available.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {employeeAttendance.map((emp, i) => {
                  const aiEmp = safeAIInsights.employees.find(
                    ai =>
                      ai.name === emp.name ||
                      `${ai.first_name ?? ""} ${ai.last_name ?? ""}`.trim() === emp.name
                  );

                  return (
                    <Card
                      key={i}
                      className="rounded-2xl shadow-sm hover:shadow-md transition border border-blue-100"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-blue-600 text-base flex justify-between items-center">
                          {emp.name}
                          {aiEmp?.status && (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-50 text-green-600">
                              {aiEmp.status}
                            </span>
                          )}
                        </CardTitle>
                        {aiEmp?.joining_date && (
                          <CardDescription>
                            Joined {new Date(aiEmp.joining_date).toLocaleDateString()}
                          </CardDescription>
                        )}
                      </CardHeader>

                      <CardContent>
                        {/* Attendance Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-green-50 flex flex-col items-center">
                            <span className="text-xs text-muted-foreground">Present</span>
                            <span className="font-bold text-green-600">{emp.present}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-yellow-50 flex flex-col items-center">
                            <span className="text-xs text-muted-foreground">Late</span>
                            <span className="font-bold text-yellow-600">{emp.late}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-red-50 flex flex-col items-center">
                            <span className="text-xs text-muted-foreground">Absent</span>
                            <span className="font-bold text-red-600">{emp.absent}</span>
                          </div>
                        </div>

                        {/* Avg Hours */}
                        {aiEmp?.summary?.avgHours !== undefined && (
                          <div className="mb-3 text-xs text-center p-2 rounded-lg bg-blue-50">
                            <span className="text-muted-foreground">Avg Hours:</span>{" "}
                            <span className="font-semibold text-blue-700">
                              {aiEmp.summary.avgHours.toFixed(2)} hrs/day
                            </span>
                          </div>
                        )}

                        {/* AI Insights */}
                        {aiEmp?.insights && aiEmp.insights.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-blue-600 mb-1">
                              AI Notes
                            </p>
                            <ul className="space-y-2">
                              {aiEmp.insights.map((msg, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 p-2 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700"
                                >
                                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                                  {msg}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Main Component with Error Boundary
const AnalyticsPage = () => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  return (
    <ErrorBoundaryImpl 
      onError={(err) => {
        console.error('Error in Analytics component:', err);
        setHasError(true);
        setError(err);
      }}
    >
      {hasError ? (
        <div className="p-6">
          <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
          <p className="mt-2 text-red-500">{error?.message || 'An unexpected error occurred'}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </div>
      ) : (
        <AnalyticsContent />
      )}
    </ErrorBoundaryImpl>
  );
};

export default AnalyticsPage;
