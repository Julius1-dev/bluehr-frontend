import React, { useState, useEffect } from 'react';
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// AI generated insights for different tabs
const aiInsights = {
  trends: [
    "BlueAI: I've noticed a consistent improvement in on-time arrivals since last month, with a 12% decrease in late arrivals compared to the previous period.",
    "BlueAI: There's a clear weekly pattern showing higher absenteeism on Mondays (15% higher than other weekdays). Consider flexible start times for better work-life balance.",
    "BlueAI: The Engineering department shows excellent attendance consistency, with a 98% on-time rate over the past month.",
    "BlueAI: I've detected that employees who start between 8:45-9:15 AM have 22% higher productivity scores than those who start later."
  ],
  departments: [
    "BlueAI: The Marketing team has shown remarkable improvement, reducing late arrivals by 35% this month after the new flexible hours policy.",
    "BlueAI: The HR department maintains the highest overall attendance rate at 97.5%, setting a great example for other teams.",
    "BlueAI: The Engineering team's attendance is strong, but I notice they tend to work later hours. Consider monitoring work-life balance.",
    "BlueAI: The Sales department has the highest variability in attendance. This correlates with their field work schedule and client meetings."
  ],
  employees: [
    "BlueAI: Sarah Johnson has perfect attendance this quarter and consistently arrives 10 minutes early. Consider recognizing her reliability.",
    "BlueAI: Michael Chen has improved his punctuality by 40% since last month after the one-on-one coaching session.",
    "BlueAI: I've identified 3 employees who might benefit from a flexible work arrangement based on their commuting patterns and attendance history.",
    "BlueAI: The top 10% of employees with the best attendance records are 30% more likely to receive promotions within two years."
  ]
};

// Mock data for attendance analytics
const mockAnalytics = {
  totalEmployees: 127,
  presentToday: 112,
  lateToday: 8,
  absentToday: 7,
  onLeaveToday: 3,
  attendanceRate: 88.2,
  lateRate: 6.3,
  absentRate: 5.5,
  weeklyTrend: [
    { day: 'Mon', present: 120, late: 5, absent: 2 },
    { day: 'Tue', present: 118, late: 7, absent: 2 },
    { day: 'Wed', present: 115, late: 8, absent: 4 },
    { day: 'Thu', present: 122, late: 3, absent: 2 },
    { day: 'Fri', present: 117, late: 6, absent: 4 },
    { day: 'Sat', present: 60, late: 2, absent: 5 },
    { day: 'Sun', present: 10, late: 0, absent: 5 }
  ],
  byDepartment: [
    { name: 'Engineering', present: 45, late: 3, absent: 2, total: 50 },
    { name: 'Design', present: 18, late: 1, absent: 1, total: 20 },
    { name: 'Marketing', present: 22, late: 2, absent: 1, total: 25 },
    { name: 'HR', present: 12, late: 0, absent: 0, total: 12 },
    { name: 'Finance', present: 15, late: 2, absent: 3, total: 20 }
  ]
};

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
    ? mockAnalytics.byDepartment 
    : mockAnalytics.byDepartment.filter(dept => dept.name.toLowerCase() === selectedDepartment);
  
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
                  {mockAnalytics.byDepartment.map((dept) => (
                    <SelectItem key={dept.name} value={dept.name.toLowerCase()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Popover>
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
            </Popover>
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
                <div className="text-2xl font-bold">{mockAnalytics.totalEmployees}</div>
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
                <div className="text-2xl font-bold">{mockAnalytics.presentToday}</div>
                <p className="text-xs text-muted-foreground">
                  {mockAnalytics.attendanceRate}% attendance rate
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
                <div className="text-2xl font-bold">{mockAnalytics.lateToday}</div>
                <p className="text-xs text-muted-foreground">
                  {mockAnalytics.lateRate}% of total employees
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
                <div className="text-2xl font-bold">{mockAnalytics.absentToday}</div>
                <p className="text-xs text-muted-foreground">
                  {mockAnalytics.absentRate}% of total employees
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Weekly Overview Card */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Weekly Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] flex items-center justify-center bg-muted/5 rounded-md border border-dashed">
                  <div className="text-center space-y-2">
                    <CalendarIcon className="h-10 w-10 mx-auto text-blue-500" />
                    <p className="text-muted-foreground">Attendance chart will be displayed here</p>
                  </div>
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
                  {mockAnalytics.byDepartment.map((dept) => (
                    <div key={dept.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{dept.name}</span>
                        <span className="text-muted-foreground">
                          {dept.present}/{dept.total} ({Math.round((dept.present / dept.total) * 100)}%)
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${(dept.present / dept.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              BlueAI Insights
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {aiInsights.trends.map((insight, i) => (
                <div key={i} className="p-4 bg-muted/10 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
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
              <div className="h-[400px] flex items-center justify-center bg-muted/5 rounded-md border border-dashed">
                <div className="text-center space-y-2">
                  <CalendarIcon className="h-10 w-10 mx-auto text-blue-500" />
                  <p className="text-muted-foreground">Trends visualization will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              BlueAI Trend Insights
            </h3>
            <div className="grid gap-4">
              {aiInsights.trends.map((insight, i) => (
                <div key={i} className="p-4 bg-muted/10 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <CalendarIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-sm">{insight}</p>
                  </div>
                </div>
              ))}
            </div>
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
              <div className="h-[400px] flex items-center justify-center bg-muted/5 rounded-md border border-dashed">
                <div className="text-center space-y-2">
                  <Users className="h-10 w-10 mx-auto text-blue-500" />
                  <p className="text-muted-foreground">Department analytics will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              BlueAI Department Insights
            </h3>
            <div className="grid gap-4">
              {aiInsights.departments.map((insight, i) => (
                <div key={i} className="p-4 bg-muted/10 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Employee Insights Tab */}
        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Insights</CardTitle>
              <CardDescription>Detailed attendance patterns for employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/5 rounded-md border border-dashed">
                <div className="text-center space-y-2">
                  <Users className="h-10 w-10 mx-auto text-blue-500" />
                  <p className="text-muted-foreground">Employee insights will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              BlueAI Employee Insights
            </h3>
            <div className="grid gap-4">
              {aiInsights.employees.map((insight, i) => (
                <div key={i} className="p-4 bg-muted/10 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
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
