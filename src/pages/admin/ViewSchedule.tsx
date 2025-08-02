import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define types
interface ScheduleItem {
  date: string;
  type: string;
  status: string;
  title: string;
  reason?: string;
}

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
  status: 'approved' | 'pending' | 'rejected';
  reason?: string;
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Mock data - replace with actual API calls
const mockEmployee = {
  id: '1',
  name: 'John Doe',
  position: 'Software Engineer',
  department: 'Engineering',
  avatar: '',
  status: 'active',
  joinDate: '2023-01-15',
};

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    startDate: '2025-06-10',
    endDate: '2025-06-14',
    type: 'Annual Leave',
    status: 'approved',
    reason: 'Vacation',
  },
  {
    id: '2',
    startDate: '2025-06-20',
    endDate: '2025-06-21',
    type: 'Sick Leave',
    status: 'pending',
    reason: 'Medical appointment',
  },
];

const mockSchedule = [
  { date: '2025-06-10', type: 'leave', status: 'approved', title: 'Annual Leave' },
  { date: '2025-06-11', type: 'leave', status: 'approved', title: 'Annual Leave' },
  { date: '2025-06-12', type: 'leave', status: 'approved', title: 'Annual Leave' },
  { date: '2025-06-13', type: 'leave', status: 'approved', title: 'Annual Leave' },
  { date: '2025-06-14', type: 'leave', status: 'approved', title: 'Annual Leave' },
  { date: '2025-06-20', type: 'leave', status: 'pending', title: 'Sick Leave' },
  { date: '2025-06-21', type: 'leave', status: 'pending', title: 'Sick Leave' },
  // Add more schedule items as needed
];

export default function ViewSchedule() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [employee, setEmployee] = useState<typeof mockEmployee | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    // In a real app, fetch employee data by ID
    // const fetchData = async () => {
    //   const [empRes, leaveRes, schedRes] = await Promise.all([
    //     fetch(`/api/employees/${id}`),
    //     fetch(`/api/leave-requests?employeeId=${id}`),
    //     fetch(`/api/schedule?employeeId=${id}`)
    //   ]);
    //   setEmployee(await empRes.json());
    //   setLeaveRequests(await leaveRes.json());
    //   setSchedule(await schedRes.json());
    // };
    // fetchData();
    
    // Mock data for now
    setEmployee(mockEmployee);
    setLeaveRequests(mockLeaveRequests);
    setSchedule(mockSchedule);
  }, [id]);

  // Get events for a specific day
  const getDayEvents = (day: Date) => {
    return schedule.filter(item => isSameDay(new Date(item.date), day));
  };
  
  // Handle day click in the monthly view
  const handleDayClick = (day: Date) => {
    setDate(day);
  };

  // Removed unused renderDay function

  if (!employee) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Team
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{employee.name}'s Schedule</h1>
          <p className="text-muted-foreground">
            {employee.position} • {employee.department}
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
              <CardDescription>Overview of {employee.name}'s schedule for {format(date, 'MMMM yyyy')}</CardDescription>
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
                            'text-xs p-1 mt-1 rounded truncate',
                            event.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          )}
                        >
                          {event.title}
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
              <CardDescription>Detailed schedule for the week of {format(startOfWeek(date), 'MMM d')} - {format(addDays(startOfWeek(date), 6), 'MMM d, yyyy')}</CardDescription>
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
                            <span className="text-amber-600">On Leave</span>
                          ) : (
                            <span className="text-green-600">Working</span>
                          )}
                        </div>
                      </div>
                      
                      {dayEvents.length > 0 ? (
                        <div className="space-y-2">
                          {dayEvents.map((event, i) => (
                            <div 
                              key={i}
                              className={cn(
                                'p-3 rounded-md border-l-4',
                                event.status === 'approved' 
                                  ? 'border-green-500 bg-green-50' 
                                  : 'border-yellow-500 bg-yellow-50'
                              )}
                            >
                              <div className="font-medium">{event.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {event.status === 'approved' ? 'Approved' : 'Pending Approval'}
                              </div>
                              {event.reason && (
                                <div className="mt-1 text-sm">{event.reason}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground py-2">
                          No scheduled events
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
              <CardDescription>View and manage {employee.name}'s upcoming time off</CardDescription>
            </CardHeader>
            <CardContent>
              {leaveRequests.length > 0 ? (
                <div className="space-y-4">
                  {leaveRequests.map((request) => (
                    <div 
                      key={request.id}
                      className="border rounded-md p-4 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">
                          {request.type}
                          <span className={cn(
                            'ml-2 px-2 py-0.5 text-xs rounded-full',
                            request.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          )}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(request.startDate), 'MMM d')} - {format(new Date(request.endDate), 'MMM d, yyyy')}
                        </div>
                        {request.reason && (
                          <div className="mt-1 text-sm">{request.reason}</div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <>
                            <Button variant="outline" size="sm">Approve</Button>
                            <Button variant="outline" size="sm">Reject</Button>
                          </>
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
