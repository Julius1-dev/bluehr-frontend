import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, isToday, parseISO, isWithinInterval } from 'date-fns';
import { Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

// Define types
interface LeaveEvent {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: 'approved' | 'pending' | 'rejected';
  reason?: string;
  color: string;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  startDate: string;
  endDate: string;
  type: string;
  status: 'approved' | 'pending' | 'rejected';
  reason?: string;
}

// Mock data for employees
const MOCK_EMPLOYEES = [
  { id: '1', name: 'Alice Johnson', department: 'Engineering', avatar: '', color: 'bg-blue-100 text-blue-800' },
  { id: '2', name: 'Bob Smith', department: 'Design', avatar: '', color: 'bg-red-100 text-red-800' },
  { id: '3', name: 'Charlie Brown', department: 'Marketing', avatar: '', color: 'bg-green-100 text-green-800' },
  { id: '4', name: 'Diana Prince', department: 'HR', avatar: '', color: 'bg-purple-100 text-purple-800' },
  { id: '5', name: 'Eve Wilson', department: 'Finance', avatar: '', color: 'bg-yellow-100 text-yellow-800' },
  { id: '6', name: 'Frank Miller', department: 'Engineering', avatar: '', color: 'bg-pink-100 text-pink-800' },
];

// Mock leave events data
const MOCK_LEAVE_EVENTS: LeaveEvent[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'Alice Johnson',
    department: 'Engineering',
    leaveType: 'Annual Leave',
    startDate: '2025-01-15',
    endDate: '2025-01-19',
    status: 'approved',
    reason: 'Vacation',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Bob Smith',
    department: 'Design',
    leaveType: 'Sick Leave',
    startDate: '2025-01-20',
    endDate: '2025-01-21',
    status: 'approved',
    reason: 'Medical appointment',
    color: 'bg-red-100 text-red-800'
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Charlie Brown',
    department: 'Marketing',
    leaveType: 'Study Leave',
    startDate: '2025-01-25',
    endDate: '2025-01-27',
    status: 'pending',
    reason: 'Training course',
    color: 'bg-green-100 text-green-800'
  },
  {
    id: '4',
    employeeId: '4',
    employeeName: 'Diana Prince',
    department: 'HR',
    leaveType: 'Annual Leave',
    startDate: '2025-02-01',
    endDate: '2025-02-05',
    status: 'approved',
    reason: 'Family vacation',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: '5',
    employeeId: '5',
    employeeName: 'Eve Wilson',
    department: 'Finance',
    leaveType: 'Maternity Leave',
    startDate: '2025-02-10',
    endDate: '2025-05-10',
    status: 'approved',
    reason: 'Maternity leave',
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: '6',
    employeeId: '6',
    employeeName: 'Frank Miller',
    department: 'Engineering',
    leaveType: 'Annual Leave',
    startDate: '2025-01-30',
    endDate: '2025-02-02',
    status: 'pending',
    reason: 'Personal time',
    color: 'bg-pink-100 text-pink-800'
  },
];

// Mock upcoming leave requests
const MOCK_UPCOMING_LEAVES: LeaveRequest[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'Alice Johnson',
    department: 'Engineering',
    startDate: '2025-01-15',
    endDate: '2025-01-19',
    type: 'Annual Leave',
    status: 'approved',
    reason: 'Vacation'
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Bob Smith',
    department: 'Design',
    startDate: '2025-01-20',
    endDate: '2025-01-21',
    type: 'Sick Leave',
    status: 'approved',
    reason: 'Medical appointment'
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Charlie Brown',
    department: 'Marketing',
    startDate: '2025-01-25',
    endDate: '2025-01-27',
    type: 'Study Leave',
    status: 'pending',
    reason: 'Training course'
  },
  {
    id: '4',
    employeeId: '4',
    employeeName: 'Diana Prince',
    department: 'HR',
    startDate: '2025-02-01',
    endDate: '2025-02-05',
    type: 'Annual Leave',
    status: 'approved',
    reason: 'Family vacation'
  },
  {
    id: '5',
    employeeId: '5',
    employeeName: 'Eve Wilson',
    department: 'Finance',
    startDate: '2025-02-10',
    endDate: '2025-05-10',
    type: 'Maternity Leave',
    status: 'approved',
    reason: 'Maternity leave'
  },
  {
    id: '6',
    employeeId: '6',
    employeeName: 'Frank Miller',
    department: 'Engineering',
    startDate: '2025-01-30',
    endDate: '2025-02-02',
    type: 'Annual Leave',
    status: 'pending',
    reason: 'Personal time'
  },
];

export default function LeaveCalendar() {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [leaveEvents, setLeaveEvents] = useState<LeaveEvent[]>(MOCK_LEAVE_EVENTS);
  const [upcomingLeaves, setUpcomingLeaves] = useState<LeaveRequest[]>(MOCK_UPCOMING_LEAVES);

  // Get events for a specific day
  const getDayEvents = (day: Date) => {
    return leaveEvents.filter(event => {
      try {
        const start = parseISO(event.startDate);
        const end = parseISO(event.endDate);
        return isWithinInterval(day, { start, end });
      } catch (error) {
        return false;
      }
    });
  };

  // Handle day click in the monthly view
  const handleDayClick = (day: Date) => {
    setDate(day);
  };

  // Get employee initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Leave Management
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Leave Calendar</h1>
          <p className="text-muted-foreground">
            Overview of all employee leave schedules and requests
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(date, 'MMMM yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                if (newDate) {
                  setDate(newDate);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Tabs defaultValue="month" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Leaves</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Today
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>

        <TabsContent value="month" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly View</CardTitle>
              <CardDescription>Overview of all employee leave schedules for {format(date, 'MMMM yyyy')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center font-medium text-sm">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-4">
                {Array.from({ length: 42 }).map((_, index) => {
                  const currentDate = addDays(startOfWeek(date), index);
                  const dayEvents = getDayEvents(currentDate);
                  
                  return (
                    <div 
                      key={index}
                      className={cn(
                        'min-h-24 p-2 border rounded-md cursor-pointer',
                        isSameDay(currentDate, new Date()) ? 'border-blue-500 bg-blue-50' : 'border-gray-200',
                        dayEvents.length > 0 && 'bg-amber-50',
                        currentDate.getMonth() !== date.getMonth() && 'text-gray-400',
                        'hover:bg-gray-50 transition-colors'
                      )}
                      onClick={() => handleDayClick(currentDate)}
                    >
                      <div className="text-sm font-medium">{format(currentDate, 'd')}</div>
                      {dayEvents.map((event, i) => (
                        <div 
                          key={i}
                          className={cn(
                            'text-xs p-1 mt-1 rounded truncate flex items-center gap-1',
                            event.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          )}
                        >
                          <Avatar className="w-3 h-3">
                            <AvatarFallback className="text-xs">
                              {getInitials(event.employeeName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">{event.employeeName.split(' ')[0]}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly View</CardTitle>
              <CardDescription>Detailed leave schedule for the week of {format(startOfWeek(date), 'MMM d')} - {format(addDays(startOfWeek(date), 6), 'MMM d, yyyy')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 7 }).map((_, index) => {
                  const currentDate = addDays(startOfWeek(date), index);
                  const dayEvents = getDayEvents(currentDate);
                  
                  return (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">
                          {format(currentDate, 'EEEE, MMM d')}
                          {isToday(currentDate) && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Today
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {dayEvents.length > 0 ? (
                            <span className="text-amber-600">{dayEvents.length} employee(s) on leave</span>
                          ) : (
                            <span className="text-green-600">All employees working</span>
                          )}
                        </div>
                      </div>
                      
                      {dayEvents.length > 0 ? (
                        <div className="space-y-2">
                          {dayEvents.map((event, i) => (
                            <div 
                              key={i}
                              className={cn(
                                'p-3 rounded-md border-l-4 flex items-center gap-3',
                                event.status === 'approved' 
                                  ? 'border-green-500 bg-green-50' 
                                  : 'border-yellow-500 bg-yellow-50'
                              )}
                            >
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-sm">
                                  {getInitials(event.employeeName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="font-medium">{event.employeeName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {event.department} • {event.leaveType}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {event.status === 'approved' ? 'Approved' : 'Pending Approval'}
                                </div>
                                {event.reason && (
                                  <div className="mt-1 text-sm">{event.reason}</div>
                                )}
                              </div>
                              <Badge variant={event.status === 'approved' ? 'default' : 'secondary'}>
                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground py-2">
                          No employees on leave
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Leave Requests</CardTitle>
              <CardDescription>View and manage all upcoming employee time off</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingLeaves.length > 0 ? (
                <div className="space-y-4">
                  {upcomingLeaves.map((request) => (
                    <div 
                      key={request.id}
                      className="border rounded-md p-4 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {getInitials(request.employeeName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {request.employeeName}
                            <span className="ml-2 text-sm text-muted-foreground">
                              {request.department}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {request.type} • {format(new Date(request.startDate), 'MMM d')} - {format(new Date(request.endDate), 'MMM d, yyyy')}
                          </div>
                          {request.reason && (
                            <div className="mt-1 text-sm">{request.reason}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          request.status === 'approved' ? 'default' : 
                          request.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Approve</Button>
                            <Button variant="outline" size="sm">Reject</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming leave requests</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 