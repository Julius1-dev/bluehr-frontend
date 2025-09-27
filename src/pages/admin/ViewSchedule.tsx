import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import axios from 'axios';
import { BACKEND_URL } from '@/lib/config';

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

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  avatar?: string;
}

// API configuration
const getAuthToken = () => {
  return localStorage.getItem('token');
};

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



export default function ViewSchedule() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [leaveEvents, setLeaveEvents] = useState<LeaveEvent[]>([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState<LeaveRequest[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch employee details
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const response = await api.get(`/company-admin/users/${id}`);
        const userData = response.data;
        setEmployee({
          id: userData.id.toString(),
          name: `${userData.first_name} ${userData.last_name}`,
          email: userData.email,
          department: userData.department?.name || 'No Department',
          avatar: userData.avatar_url
        });
      } catch (err) {
        console.error('Error fetching employee details:', err);
        setError('Failed to load employee details');
      }
    };

    if (id) {
      fetchEmployeeDetails();
    }
  }, [id]);

  // Fetch leave events data
  useEffect(() => {
    const fetchLeaveData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const [eventsResponse, upcomingResponse] = await Promise.all([
          api.get(`/company-admin/leave-calendar/employee/${id}/leave-events`),
          api.get(`/company-admin/leave-calendar/employee/${id}/upcoming-leaves`)
        ]);

        setLeaveEvents(eventsResponse.data.leaveEvents || []);
        setUpcomingLeaves(upcomingResponse.data.upcomingLeaves || []);
      } catch (err) {
        console.error('Error fetching leave data:', err);
        setError('Failed to load leave calendar data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveData();
  }, [id]);

  // Get events for a specific day
  const getDayEvents = (day: Date) => {
    return leaveEvents.filter(event => {
      try {
        const start = parseISO(event.startDate);
        const end = parseISO(event.endDate);
        return isWithinInterval(day, { start, end });
      } catch (_error) {
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

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading employee schedule data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
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
          <h1 className="text-2xl font-bold tracking-tight">{employee?.name}'s Leave Schedule</h1>
          <p className="text-muted-foreground">
            Overview of {employee?.name}'s leave schedules and requests
          </p>
          {employee && (
            <div className="flex items-center gap-2 mt-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={employee.avatar} alt={employee.name} />
                <AvatarFallback className="text-xs">
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {employee.department} • {employee.email}
              </span>
            </div>
          )}
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
              <CardDescription>Overview of {employee?.name}'s leave schedules for {format(date, 'MMMM yyyy')}</CardDescription>
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
                          <span className="truncate">{event.leaveType}</span>
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
                            <span className="text-amber-600">{dayEvents.length} leave request(s)</span>
                          ) : (
                            <span className="text-green-600">No leave scheduled</span>
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
                              <div className="flex-1">
                                <div className="font-medium">{event.leaveType}</div>
                                <div className="text-sm text-muted-foreground">
                                  {format(new Date(event.startDate), 'MMM d')} - {format(new Date(event.endDate), 'MMM d, yyyy')}
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
                            {request.type}
                            <span className="ml-2 text-sm text-muted-foreground">
                              {request.department}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(request.startDate), 'MMM d')} - {format(new Date(request.endDate), 'MMM d, yyyy')}
                          </div>
                          {request.reason && (
                            <div className="mt-1 text-sm">{request.reason}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">
                          Approved
                        </Badge>
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
