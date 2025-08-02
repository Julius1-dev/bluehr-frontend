import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, BarChart2, Download, ChevronRight, Users } from 'lucide-react';
import { formatTime, formatDate } from '@/lib/utils';

export function TimeAndAttendance() {
  const [currentTime, setCurrentTime] = useState(formatTime(new Date()));
  const [attendance, setAttendance] = useState<any>(null);
  const [shift, setShift] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLateReason, setShowLateReason] = useState(false);
  const [lateReason, setLateReason] = useState('');
  const [breakTimer, setBreakTimer] = useState(0);
  const [breakInterval, setBreakInterval] = useState<any>(null);
  const [onBreak, setOnBreak] = useState(false);

  // Fetch all attendance records for the current week and month
  const [attendanceHistoryReal, setAttendanceHistoryReal] = useState<any[]>([]);
  const [weeklyStatsReal, setWeeklyStatsReal] = useState({ totalHours: 0, targetHours: 0, overtime: 0, lateArrivals: 0, lateDuration: 0 });

  // Real-time clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch today's shift and attendance
  const fetchToday = async () => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/employee/attendance/today', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setAttendance(data.attendance);
      setShift(data.shift);
      if (data.attendance && data.attendance.break_start && !data.attendance.break_end) {
        // Resume break timer if on break
        const [h, m] = data.attendance.break_start.split(':').map(Number);
        const start = new Date();
        start.setHours(h, m, 0, 0);
        setBreakTimer(Math.floor((Date.now() - start.getTime()) / 1000));
        setOnBreak(true);
      } else {
        setBreakTimer(0);
        setOnBreak(false);
      }
    } catch (err) {
      setError('Failed to fetch attendance');
    }
  };
  useEffect(() => { fetchToday(); }, []);

  // Break timer effect
  useEffect(() => {
    if (onBreak) {
      const interval = setInterval(() => setBreakTimer(t => t + 1), 1000);
      setBreakInterval(interval);
      return () => clearInterval(interval);
    } else {
      if (breakInterval) clearInterval(breakInterval);
      setBreakInterval(null);
      setBreakTimer(0);
    }
  }, [onBreak]);

  // Helper to get current time in HH:mm format
  function getCurrentTime24() {
  const now = new Date();
    return now.toTimeString().slice(0, 5); // "HH:mm"
  }

  // Helper to compare times in HH:mm or HH:mm:ss
  function isAfter(time1: string, time2: string) {
    // time1, time2: "HH:mm" or "HH:mm:ss"
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    if (h1 > h2) return true;
    if (h1 < h2) return false;
    return m1 > m2;
  }

  // Helper to get start/end of week/month
  function getWeekRange(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diffToMonday));
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
    return [monday, sunday];
  }
  function getMonthRange(date = new Date()) {
    const d = new Date(date);
    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return [first, last];
  }

  // Fetch attendance history for week/month
  const fetchAttendanceHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const [weekStart, weekEnd] = getWeekRange();
      const [monthStart, monthEnd] = getMonthRange();
      // TODO: Replace with real backend endpoint
      const res = await fetch(`http://localhost:4000/employee/attendance/history?from=${weekStart.toISOString().slice(0,10)}&to=${monthEnd.toISOString().slice(0,10)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setAttendanceHistoryReal(data.records || []);
      // Calculate weekly stats
      let totalHours = 0, targetHours = 0, overtime = 0, lateArrivals = 0, lateDuration = 0;
      const shiftHours = shift ? (parseInt(shift.clock_out.slice(0,2)) - parseInt(shift.clock_in.slice(0,2))) : 8;
      const weekRecords = data.records.filter((rec: any) => {
        const d = new Date(rec.date);
        return d >= weekStart && d <= weekEnd;
      });
      const monthRecords = data.records.filter((rec: any) => {
        const d = new Date(rec.date);
        return d >= monthStart && d <= monthEnd;
      });
      weekRecords.forEach((rec: any) => {
        if (rec.clock_in && rec.clock_out) {
          const [h1, m1] = rec.clock_in.split(':').map(Number);
          const [h2, m2] = rec.clock_out.split(':').map(Number);
          totalHours += (h2 + m2/60) - (h1 + m1/60);
        }
        targetHours += shiftHours;
      });
      monthRecords.forEach((rec: any) => {
        // Late logic: rec.late or clock_in > shift.clock_in
        let isLate = false;
        if (rec.clock_in && shift) {
          const [h1, m1] = rec.clock_in.split(':').map(Number);
          const [h2, m2] = shift.clock_in.slice(0,5).split(':').map(Number);
          if (rec.late || h1 > h2 || (h1 === h2 && m1 > m2)) {
            isLate = true;
            lateArrivals++;
            lateDuration += ((h1*60 + m1) - (h2*60 + m2))*60; // seconds
          }
        }
        // Overtime and incomplete logic
        if (rec.clock_in && shift) {
          const [shiftEndH, shiftEndM] = shift.clock_out.slice(0,5).split(':').map(Number);
          const shiftEndMinutes = shiftEndH*60 + shiftEndM;
          let clockOutMinutes = null;
          if (rec.clock_out) {
            const [outH, outM] = rec.clock_out.split(':').map(Number);
            clockOutMinutes = outH*60 + outM;
          }
          // If no clock_out or clock_out is more than 6 hours after shift end, mark as incomplete
          let incomplete = false;
          if (!rec.clock_out) {
            incomplete = true;
          } else if (clockOutMinutes - shiftEndMinutes > 360) { // 6 hours
            incomplete = true;
          }
          rec.incomplete = incomplete;
          // Overtime only if not incomplete
          if (!incomplete && rec.clock_out && clockOutMinutes > shiftEndMinutes) {
            overtime += (clockOutMinutes - shiftEndMinutes)/60;
          }
        }
      });
      setWeeklyStatsReal({ totalHours, targetHours, overtime, lateArrivals, lateDuration });
      // Update attendanceHistoryReal with incomplete and late info
      setAttendanceHistoryReal(data.records.map((rec: any) => {
        let isLate = false;
        if (rec.clock_in && shift) {
          const [h1, m1] = rec.clock_in.split(':').map(Number);
          const [h2, m2] = shift.clock_in.slice(0,5).split(':').map(Number);
          if (rec.late || h1 > h2 || (h1 === h2 && m1 > m2)) {
            isLate = true;
          }
        }
        let incomplete = false;
        if (rec.clock_in && shift) {
          const [shiftEndH, shiftEndM] = shift.clock_out.slice(0,5).split(':').map(Number);
          const shiftEndMinutes = shiftEndH*60 + shiftEndM;
          let clockOutMinutes = null;
          if (rec.clock_out) {
            const [outH, outM] = rec.clock_out.split(':').map(Number);
            clockOutMinutes = outH*60 + outM;
          }
          if (!rec.clock_out) {
            incomplete = true;
          } else if (clockOutMinutes - shiftEndMinutes > 360) {
            incomplete = true;
          }
        }
        return { ...rec, late: isLate, incomplete };
      }));
    } catch (err) {
      // fallback: do nothing
    }
  };
  useEffect(() => { fetchAttendanceHistory(); }, [shift]);

  // Handle clock in
  const handleClockIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const now24 = getCurrentTime24();
      const shiftIn = shift && shift.clock_in ? shift.clock_in.slice(0, 5) : null;
      // If late, prompt for reason
      if (shiftIn && isAfter(now24, shiftIn)) {
        setShowLateReason(true);
        setLoading(false);
        return;
      }
      const res = await fetch('http://localhost:4000/employee/attendance/clock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Failed to clock in');
      await fetchToday();
      showToast('Clocked In Successfully', 'green');
    } catch (err) {
      setError('Failed to clock in');
    } finally {
      setLoading(false);
    }
  };

  // Handle late clock in with reason
  const handleLateClockIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/employee/attendance/clock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reason: lateReason }),
      });
      if (!res.ok) throw new Error('Failed to clock in');
      setShowLateReason(false);
      setLateReason('');
      await fetchToday();
      showToast('Clocked In (Late)', 'yellow');
    } catch (err) {
      setError('Failed to clock in');
    } finally {
      setLoading(false);
    }
  };

  // Handle clock out
  const handleClockOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/employee/attendance/clock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to clock out');
      await fetchToday();
      showToast('Clocked Out', 'red');
    } catch (err) {
      setError('Failed to clock out');
    } finally {
      setLoading(false);
    }
  };

  // Handle break start/end
  const handleBreak = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!onBreak) {
        const res = await fetch('http://localhost:4000/employee/attendance/break-start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to start break');
        setOnBreak(true);
        showToast('Break Started', 'blue');
      } else {
        const res = await fetch('http://localhost:4000/employee/attendance/break-end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to end break');
        setOnBreak(false);
        showToast('Break Ended', 'green');
      }
      await fetchToday();
    } catch (err) {
      setError('Failed to update break');
    } finally {
      setLoading(false);
    }
  };

  // Toast helper
  const showToast = (message: string, color: string) => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 bg-${color}-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };
  
  // UI helpers
  const isClockedIn = attendance && attendance.clock_in && !attendance.clock_out;
  const isClockedOut = attendance && attendance.clock_out;

  // --- MOCK DATA RESTORE ---
  const weeklyStats = {
    totalHours: 32.5,
    targetHours: 40,
    overtime: 2.5,
    lateArrivals: 1,
    earlyDepartures: 0
  };
  
  const attendanceHistory = [
    { date: '2025-04-22', clockIn: '08:55', clockOut: '17:30', status: 'present', hours: 8.5 },
    { date: '2025-04-23', clockIn: '09:10', clockOut: '17:45', status: 'late', hours: 8.5 },
    { date: '2025-04-24', clockIn: '08:45', clockOut: '17:30', status: 'present', hours: 8.75 },
    { date: '2025-04-25', clockIn: '08:50', clockOut: '17:15', status: 'present', hours: 8.25 },
    { date: '2025-04-26', clockIn: '08:30', clockOut: '--:--', status: 'current', hours: 0 }
  ];
  
  const teamAttendance = [
    { name: 'Sarah Johnson', status: 'present', clockIn: '08:30' },
    { name: 'Michael Chen', status: 'late', clockIn: '09:15' },
    { name: 'Emily Brown', status: 'absent', clockIn: '—' },
    { name: 'David Wilson', status: 'present', clockIn: '08:45' }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Time & Attendance</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Time</p>
                  <p className="text-lg font-semibold">{currentTime}</p>
                  {shift && (
                    <div className="text-xs text-gray-400 mt-1">
                      Shift: {shift.clock_in} - {shift.clock_out} (Break: {shift.break_time} min)
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
              <Button 
  size="sm" 
                  className={isClockedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                  onClick={isClockedIn ? handleClockOut : handleClockIn}
                  disabled={loading || isClockedOut}
>
  <Clock className="mr-2 h-4 w-4" />
  {isClockedIn ? 'Clock Out' : 'Clock In'}
</Button>
                <Button
                  size="sm"
                  className={onBreak ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'}
                  onClick={handleBreak}
                  disabled={!isClockedIn || isClockedOut || loading}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {onBreak ? `Finish Break (${Math.floor(breakTimer / 60)}:${('0' + (breakTimer % 60)).slice(-2)})` : 'Start Break'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Weekly Hours</p>
                <p className="text-lg font-semibold">{weeklyStatsReal.totalHours.toFixed(2)} / {weeklyStatsReal.targetHours}h</p>
              </div>
            </div>
            <Progress 
              value={(weeklyStatsReal.totalHours / (weeklyStatsReal.targetHours || 1)) * 100} 
              className="mt-3" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                <BarChart2 className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Overtime Hours</p>
                <p className="text-lg font-semibold">{Math.floor(weeklyStatsReal.overtime)}h {Math.floor((weeklyStatsReal.overtime%1)*60)}m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Late Arrivals</p>
                <p className="text-lg font-semibold">{weeklyStatsReal.lateArrivals}</p>
                <p className="text-xs text-gray-400">{Math.floor(weeklyStatsReal.lateDuration/3600)}h {Math.floor((weeklyStatsReal.lateDuration%3600)/60)}m {weeklyStatsReal.lateDuration%60}s this month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">Attendance History</TabsTrigger>
          <TabsTrigger value="team">Team Attendance</TabsTrigger>
        </TabsList>
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceHistoryReal.map((rec, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        rec.clock_out ? 'bg-green-100 text-green-600' : rec.late ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{formatDate(new Date(rec.date))}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{rec.clock_in}</span>
                          <ChevronRight className="h-4 w-4" />
                          <span>{rec.clock_out || '--:--'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={rec.clock_out ? 'success' : rec.late ? 'warning' : 'default'}>
                        {rec.clock_out ? (rec.late ? 'Present, Late' : 'Present') : rec.late ? 'Late' : 'Current'}
                        {rec.incomplete ? ', Incomplete' : ''}
                      </Badge>
                      <span className="font-medium">{rec.clock_in && rec.clock_out ? `${rec.clock_in} - ${rec.clock_out}` : '--'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamAttendance.map((member, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">Clock in: {member.clockIn}</p>
                      </div>
                    </div>
                    <Badge variant={
                      member.status === 'present' 
                        ? 'success' 
                        : member.status === 'late'
                          ? 'warning'
                          : 'danger'
                    }>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {showLateReason && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Late Clock In</h3>
            <p className="mb-2 text-sm">You are clocking in after your shift start time. Please provide a reason:</p>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mb-4"
              value={lateReason}
              onChange={e => setLateReason(e.target.value)}
              placeholder="Reason for late clock in"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLateReason(false)}>Cancel</Button>
              <Button onClick={handleLateClockIn} disabled={!lateReason}>Submit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}