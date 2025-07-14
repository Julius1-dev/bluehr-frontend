import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Megaphone, UserPlus, Bell, FileText, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { leaveRequestsApi } from '@/services/leaveRequestsApi';
import { LeaveTypeApi } from '@/services/leaveTypeApi';
import { PerformanceApi } from '@/services/performanceApi';

export function AdminWelcomeCard() {
  const navigate = useNavigate();
  
  // Real-time state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Real stats state
  const [pendingRequests, setPendingRequests] = useState<number | null>(null);
  const [teamMembers, setTeamMembers] = useState<number | null>(null);
  const [reportsDue, setReportsDue] = useState<number | null>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch admin profile data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No auth token');
        
        const res = await fetch('http://localhost:4000/company-admin/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to fetch admin data');
        
        const data = await res.json();
        if (data.success) {
          setAdminData(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch admin data');
        }
      } catch (err: any) {
        console.error('Error fetching admin data:', err);
        setAdminData(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, []);

  useEffect(() => {
    // Fetch pending leave requests
    leaveRequestsApi.getAllLeaveRequests().then(data => {
      if (Array.isArray(data.leaveRequests)) {
        setPendingRequests(data.leaveRequests.filter((r: any) => r.status === 'pending').length);
      } else if (Array.isArray(data)) {
        setPendingRequests(data.filter((r: any) => r.status === 'pending').length);
      } else {
        setPendingRequests(0);
      }
    }).catch(() => setPendingRequests(null));
    // Fetch team members
    LeaveTypeApi.listEmployees().then(data => {
      if (Array.isArray(data)) {
        setTeamMembers(data.length);
      } else if (Array.isArray(data.users)) {
        setTeamMembers(data.users.length);
      } else {
        setTeamMembers(0);
      }
    }).catch(() => setTeamMembers(null));
    // Fetch reports due (upcoming reviews)
    PerformanceApi.getUpcomingReviews().then(data => {
      if (Array.isArray(data)) {
        setReportsDue(data.length);
      } else if (Array.isArray(data.upcomingReviews)) {
        setReportsDue(data.upcomingReviews.length);
      } else {
        setReportsDue(0);
      }
    }).catch(() => setReportsDue(null));
  }, []);

  // Get greeting based on current time
  const currentHour = currentTime.getHours();
  let greeting = "Good morning";
  if (currentHour >= 12 && currentHour < 17) {
    greeting = "Good afternoon";
  } else if (currentHour >= 17) {
    greeting = "Good evening";
  }
  
  const today = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTimeString = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Get admin name
  const adminName = adminData ? `${adminData.firstName} ${adminData.lastName}` : 'Admin';

  return (
    <Card className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white border-none">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{greeting}, {adminName}!</h1>
            <p className="text-indigo-100 mt-1">{today}</p>
            <p className="text-indigo-200 mt-1 font-mono">{currentTimeString}</p>
            <p className="text-indigo-200 mt-2">You have {pendingRequests !== null ? pendingRequests : '-'} pending leave requests and {teamMembers !== null ? teamMembers : '-'} team members.</p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              onClick={() => navigate('/admin/announcements')}
            >
              <Megaphone className="mr-2 h-4 w-4" />
              Post Announcement
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              onClick={() => navigate('/admin/team')}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Onboard Employee
            </Button>

            <Button 
              variant="outline" 
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              onClick={() => navigate('/admin/support')}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & Support
            </Button>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-indigo-100">Pending Requests</p>
              <p className="text-xl font-semibold">{pendingRequests !== null ? pendingRequests : '-'}</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-indigo-100">Team Members</p>
              <p className="text-xl font-semibold">{teamMembers !== null ? teamMembers : '-'}</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-indigo-100">Reports Due</p>
              <p className="text-xl font-semibold">{reportsDue !== null ? reportsDue : '-'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
