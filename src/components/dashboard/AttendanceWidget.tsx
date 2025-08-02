import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Clock, ArrowRight } from 'lucide-react';
import { Progress } from '../ui/progress';
import { formatTime } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

function getLast7Days() {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(new Date(d));
  }
  return days;
}

function getDayLabel(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function calculateHours(clockIn: string | null, clockOut: string | null) {
  if (!clockIn || !clockOut) return 0;
  const [h1, m1] = clockIn.split(':').map(Number);
  const [h2, m2] = clockOut.split(':').map(Number);
  let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (diff < 0) diff += 24 * 60;
  return Math.max(0, diff / 60);
}

export function AttendanceWidget() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(formatTime(new Date()));
  const [lastClockIn, setLastClockIn] = useState<string>('—');
  const [lastClockOut, setLastClockOut] = useState<string>('—');
  const [weekHours, setWeekHours] = useState<{ label: string; hours: number }[]>([]);
  const [totalWeekHours, setTotalWeekHours] = useState<number>(0);
  const [weeklyTargetHours, setWeeklyTargetHours] = useState<number>(40);

  useEffect(() => {
    // Real-time clock
    const interval = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://localhost:4000/employee/attendance/today', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.attendance) {
          setLastClockIn(data.attendance.clock_in || '—');
          setLastClockOut(data.attendance.clock_out || '—');
        } else {
          setLastClockIn('—');
          setLastClockOut('—');
        }
        // Calculate weekly target hours from shift
        if (data.shift) {
          const shift = data.shift;
          // shift.days is a JSON array of days assigned, e.g. ["Monday", "Tuesday", ...]
          // shift.clock_in and shift.clock_out are in "HH:MM:SS" format
          let dailyHours = 0;
          if (shift.clock_in && shift.clock_out) {
            const [h1, m1] = shift.clock_in.split(':').map(Number);
            const [h2, m2] = shift.clock_out.split(':').map(Number);
            let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
            if (diff < 0) diff += 24 * 60;
            dailyHours = diff / 60;
          }
          let daysAssigned = 0;
          if (Array.isArray(shift.days)) {
            daysAssigned = shift.days.length;
          } else if (typeof shift.days === 'string') {
            try {
              const arr = JSON.parse(shift.days);
              if (Array.isArray(arr)) daysAssigned = arr.length;
            } catch {}
          }
          setWeeklyTargetHours(dailyHours * daysAssigned || 40);
        } else {
          setWeeklyTargetHours(40);
        }
      })
      .catch(() => {
        setLastClockIn('—');
        setLastClockOut('—');
        setWeeklyTargetHours(40);
      });

    // Fetch weekly attendance
    const days = getLast7Days();
    const from = days[0].toISOString().slice(0, 10);
    const to = days[6].toISOString().slice(0, 10);
    fetch(`http://localhost:4000/employee/attendance/history?from=${from}&to=${to}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const records = data.records || [];
        const dayMap: Record<string, { clock_in: string | null, clock_out: string | null }> = {};
        for (const rec of records) {
          dayMap[rec.date] = { clock_in: rec.clock_in, clock_out: rec.clock_out };
        }
        let week: { label: string; hours: number }[] = [];
        let total = 0;
        for (const d of days) {
          const dateStr = d.toISOString().slice(0, 10);
          const label = getDayLabel(d);
          const rec = dayMap[dateStr];
          const hours = rec ? calculateHours(rec.clock_in, rec.clock_out) : 0;
          week.push({ label, hours });
          total += hours;
        }
        setWeekHours(week);
        setTotalWeekHours(total);
      })
      .catch(() => {
        setWeekHours([]);
        setTotalWeekHours(0);
      });
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Time & Attendance</CardTitle>
        <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => navigate('/time-attendance')}>
          View History
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Current Time</div>
              <div className="text-xl font-semibold">{currentTime}</div>
            </div>
          </div>
          <Button className="px-4" onClick={() => navigate('/time-attendance')}>
            <Clock className="mr-2 h-4 w-4" />
            Clock In
          </Button>
        </div>
        {/* Weekly hours progress bar */}
        <div className="mt-6 mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Weekly Hours</span>
            <span className="text-sm font-semibold text-gray-900">{totalWeekHours.toFixed(1)} / {weeklyTargetHours.toFixed(1)} hrs</span>
          </div>
          <Progress value={Math.min(100, (totalWeekHours / weeklyTargetHours) * 100)} className="h-2 bg-gray-200 [&>div]:bg-blue-600" />
        </div>
        {/* Daily bars remain unchanged */}
        <div className="mt-4">
          <div className="flex justify-between mb-1 text-xs text-gray-500">
            {weekHours.map((d) => (
              <div key={d.label} className="w-10 text-center">{d.label}</div>
            ))}
          </div>
          <div className="flex justify-between items-end">
            {weekHours.map((d) => (
              <div key={d.label} className="w-10 flex flex-col items-center">
                <div className="h-4 text-xs font-medium">{d.hours.toFixed(1)}</div>
                <Progress value={Math.min(100, (d.hours / 8) * 100)} className="h-2 w-full bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between text-sm text-gray-500">
        <div>Last clock in: {lastClockIn}</div>
        <div>Last clock out: {lastClockOut}</div>
      </CardFooter>
    </Card>
  );
}