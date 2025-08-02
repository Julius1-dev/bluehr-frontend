import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { CalendarClock, Clock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '@/lib/config';

export function WelcomeCard() {
  const navigate = useNavigate();
  const currentHour = new Date().getHours();
  
  let greeting = "Good morning";
  if (currentHour >= 12 && currentHour < 17) {
    greeting = "Good afternoon";
  } else if (currentHour >= 17) {
    greeting = "Good evening";
  }
  
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // State for backend data
  const [nextPayDate, setNextPayDate] = useState<string>('...');
  const [leaveBalance, setLeaveBalance] = useState<string>('...');
  const [notices, setNotices] = useState<any[]>([]);
  const [noticesCount, setNoticesCount] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Fetch next pay date
    fetch(`${BACKEND_URL}/employee/payroll/data`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.currentPay && data.data.currentPay.payDate) {
          setNextPayDate(new Date(data.data.currentPay.payDate).toLocaleDateString());
        } else {
          setNextPayDate('Not Set');
        }
      })
      .catch(() => setNextPayDate('Not Set'));

    // Fetch leave balance (annual leave)
    fetch(`${BACKEND_URL}/employee/leave/balances`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.leaveBalances && Array.isArray(data.leaveBalances)) {
          // Try to find annual leave type (case-insensitive)
          const annual = data.leaveBalances.find((b: any) => b.type.toLowerCase().includes('annual'));
          if (annual) {
            setLeaveBalance(`${annual.remaining} days`);
          } else {
            setLeaveBalance('N/A');
          }
        } else {
          setLeaveBalance('N/A');
        }
      })
      .catch(() => setLeaveBalance('N/A'));

    // Fetch important notices (announcements)
    fetch(`${BACKEND_URL}/employee/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(profileData => {
        if (profileData.success && profileData.data && profileData.data.companyId) {
          fetch(`${BACKEND_URL}/company-admin/announcements?companyId=${profileData.data.companyId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(data => {
              if (data.announcements && Array.isArray(data.announcements)) {
                setNotices(data.announcements);
                setNoticesCount(data.announcements.length);
              } else {
                setNotices([]);
                setNoticesCount(0);
              }
            })
            .catch(() => {
              setNotices([]);
              setNoticesCount(0);
            });
        } else {
          setNotices([]);
          setNoticesCount(0);
        }
      })
      .catch(() => {
        setNotices([]);
        setNoticesCount(0);
      });
  }, []);

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{greeting}, Sarah!</h1>
            <p className="text-blue-100 mt-1">{today}</p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              onClick={() => navigate('/time-attendance')}
            >
              <Clock className="mr-2 h-4 w-4" />
              Clock In
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              onClick={() => navigate('/leave')}
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              Request Leave
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              onClick={() => navigate('/payroll')}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Payslip
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-blue-100">Next Pay Date</div>
            <div className="text-lg font-semibold mt-1">{nextPayDate}</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-blue-100">Leave Balance</div>
            <div className="text-lg font-semibold mt-1">{leaveBalance}</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-blue-100">Important Notices</div>
            <div className="text-lg font-semibold mt-1">{noticesCount} {noticesCount === 1 ? 'notice' : 'notices'}</div>
            {noticesCount > 0 && (
              <ul className="mt-2 space-y-1 text-white/90 text-sm max-h-24 overflow-y-auto pr-2">
                {notices.slice(0, 3).map((notice, idx) => (
                  <li key={notice.id || idx} className="truncate">{notice.title}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}