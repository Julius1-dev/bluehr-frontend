import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Save, X, Plus, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BACKEND_URL } from '@/lib/config';
import LocationForm from './LocationForm';
import {
  getLocations,
  saveLocation,
  deleteLocation,
} from '@/api/officeLocationApi';

import type { OfficeLocationData } from '@/types';

// Mock data (you might want to move these to separate files)
const mockLocations = [
  { id: 1, name: 'Main Office', address: '123 Main St', radius: 100 },
  { id: 2, name: 'Branch Office', address: '456 Branch Ave', radius: 150 }
];

const mockExceptions = [
  { id: 1, name: 'Remote Work Policy', type: 'schedule', days: ['Monday', 'Friday'], active: true },
  { id: 2, name: 'Field Work Exception', type: 'location', days: [], active: false }
];

const mockDepartments = [
  { id: 1, name: 'Engineering' },
  { id: 2, name: 'Marketing' }
];

const mockEmployees = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' }
];

type WorkShift = {
  id: string;
  targetName: string;
  days: string[];
  clockIn: string;
  clockOut: string;
  breakTime: string;
  targetType?: string;
  targetId?: string;
};

export default function AttendanceSettings() {
  const navigate = useNavigate();
  const [isLocationEnabled, setIsLocationEnabled] = useState(true);
  const [showAddException, setShowAddException] = useState(false);
  const [newException, setNewException] = useState<{
    name: string;
    type: string;
    days: string[];
    startTime: string;
    endTime: string;
    appliesTo: string[];
    appliesToType: string;
    selectedDepartment: string;
    selectedEmployee: string;
  }>({
    name: '',
    type: 'schedule',
    days: [],
    startTime: '09:00',
    endTime: '17:00',
    appliesTo: [],
    appliesToType: 'department',
    selectedDepartment: '',
    selectedEmployee: ''
  });
  const [showAddWorkShift, setShowAddWorkShift] = useState(false);
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [workShiftTargetType, setWorkShiftTargetType] = useState<'department' | 'employee'>('department');
  const [workShiftTargetId, setWorkShiftTargetId] = useState('');
  const [workShiftDays, setWorkShiftDays] = useState<string[]>([]);
  const [workShiftClockIn, setWorkShiftClockIn] = useState('09:00');
  const [workShiftClockOut, setWorkShiftClockOut] = useState('17:00');
  const [workShiftBreakTime, setWorkShiftBreakTime] = useState('60');
  const [editingWorkShift, setEditingWorkShift] = useState<WorkShift | null>(null);
  const [workShiftError, setWorkShiftError] = useState<string | null>(null);
  const [locations, setLocations] = useState<OfficeLocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<OfficeLocationData | null>(null);
  const [loading, setLoading] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day: string) => {
    setNewException(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d: string) => d !== day)
        : [...prev.days, day]
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getLocations();
        if (Array.isArray(res)) {
          setLocations(res);
        } else {
          console.error('Expected an array but got:', res);
          setLocations([]); // fallback to avoid crash
        }
      } catch (err) {
        console.error('Failed to load locations', err);
        setLocations([]); // fallback in case of error
      }
    };
    fetchData();
  }, []);


  const handleSave = async (location: OfficeLocationData) => {
    try {
      setLoading(true);
      const saved = await saveLocation(location);
      if (location.id) {
        setLocations(prev => prev.map(l => (l.id === saved.id ? saved : l)));
      } else {
        setLocations(prev => [...prev, saved]);
      }
      setSelectedLocation(null);
    } catch (err) {
      console.error('Error saving location:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLocation(id);
      setLocations(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error('Error deleting location:', err);
    }
  };

  const handleAddException = () => {
    console.log('Adding exception:', newException);
    setShowAddException(false);
    setNewException({
      name: '',
      type: 'schedule',
      days: [],
      startTime: '09:00',
      endTime: '17:00',
      appliesTo: [],
      appliesToType: 'department',
      selectedDepartment: '',
      selectedEmployee: ''
    });
  };

  const handleEditWorkShift = (shift: any) => {
    setEditingWorkShift(shift);
    setWorkShiftTargetType(shift.targetType);
    setWorkShiftTargetId(shift.targetId);
    setWorkShiftDays(shift.days);
    setWorkShiftClockIn(shift.clockIn);
    setWorkShiftClockOut(shift.clockOut);
    setWorkShiftBreakTime(shift.breakTime.replace(' min', ''));
    setShowAddWorkShift(true);
  };

  const handleAddWorkShift = () => {
    setEditingWorkShift(null);
    setWorkShiftTargetType('department');
    setWorkShiftTargetId('');
    setWorkShiftDays([]);
    setWorkShiftClockIn('09:00');
    setWorkShiftClockOut('17:00');
    setWorkShiftBreakTime('60');
    setShowAddWorkShift(true);
  };

  const handleSaveWorkShift = async () => {
    setWorkShiftError(null);
    const token = localStorage.getItem('token');
    const payload = {
      target_type: workShiftTargetType,
      target_id: parseInt(workShiftTargetId, 10),
      days: workShiftDays,
      clock_in: workShiftClockIn,
      clock_out: workShiftClockOut,
      break_time: workShiftBreakTime,
    };

    // 🔍 Log payload before making request
    console.log("Submitting work shift payload:", payload);

    try {
      let response;

      if (editingWorkShift) {
        response = await fetch(`${BACKEND_URL}/company-admin/attendance/work-shifts/${editingWorkShift.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${BACKEND_URL}/company-admin/attendance/work-shifts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server responded with error:", response.status, errorText);
        throw new Error(errorText);
      }

      setShowAddWorkShift(false);
      setEditingWorkShift(null);

      const wsRes = await fetch(`${BACKEND_URL}/company-admin/attendance/work-shifts`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const wsData = await wsRes.json();

      if (Array.isArray(wsData)) {
        setWorkShifts(wsData.map((ws: any) => ({
          id: ws.id,
          targetName: ws.target_type === 'department'
            ? departments.find((d: any) => d.id === ws.target_id)?.name || 'Department'
            : employees.find((e: any) => e.id === ws.target_id)?.name || 'Employee',
          days: ws.days,
          clockIn: ws.clock_in,
          clockOut: ws.clock_out,
          breakTime: ws.break_time + ' min',
          targetType: ws.target_type,
          targetId: ws.target_id,
        })));
      } else {
        setWorkShifts([]);
        setWorkShiftError('Failed to fetch work shifts.');
      }
    } catch (err) {
      console.error("Error saving work shift:", err);
      setWorkShiftError('Failed to save work shift.');
    }
  };



  const handleDeleteWorkShift = async (id: string) => {
    setWorkShiftError(null);
    const token = localStorage.getItem('token');
    try {
      await fetch(`${BACKEND_URL}/company-admin/attendance/work-shifts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      // Refresh work shifts after deletion
      const wsRes = await fetch(`${BACKEND_URL}/company-admin/attendance/work-shifts`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const wsData = await wsRes.json();

      if (Array.isArray(wsData)) {
        setWorkShifts(wsData.map((ws: any) => ({
          id: ws.id,
          targetName: ws.target_type === 'department'
            ? departments.find((d: any) => d.id === ws.target_id)?.name || 'Department'
            : employees.find((e: any) => e.id === ws.target_id)?.name || 'Employee',
          days: ws.days,
          clockIn: ws.clock_in,
          clockOut: ws.clock_out,
          breakTime: ws.break_time + ' min',
          targetType: ws.target_type,
          targetId: ws.target_id,
        })));
      } else {
        setWorkShifts([]);
        setWorkShiftError('Failed to fetch work shifts.');
      }
    } catch (err) {
      setWorkShiftError('Failed to delete work shift.');
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      setWorkShiftError(null);
      const token = localStorage.getItem('token');
      const depRes = await fetch(`${BACKEND_URL}/company-admin/departments`, { headers: { 'Authorization': `Bearer ${token}` } });
      const empRes = await fetch(`${BACKEND_URL}/company-admin/users`, { headers: { 'Authorization': `Bearer ${token}` } });
      const wsRes = await fetch(`${BACKEND_URL}/company-admin/attendance/work-shifts`, { headers: { 'Authorization': `Bearer ${token}` } });
      const depData = await depRes.json();
      const empData = await empRes.json();
      const wsData = await wsRes.json();
      setDepartments(depData);
      setEmployees(empData);
      if (Array.isArray(wsData)) {
        setWorkShifts(wsData.map((ws: any) => ({
          id: ws.id,
          targetName: ws.target_type === 'department'
            ? depData.find((d: any) => d.id === ws.target_id)?.name || 'Department'
            : empData.find((e: any) => e.id === ws.target_id)?.name || 'Employee',
          days: ws.days,
          clockIn: ws.clock_in,
          clockOut: ws.clock_out,
          breakTime: ws.break_time + ' min',
          targetType: ws.target_type,
          targetId: ws.target_id,
        })));
      } else {
        setWorkShifts([]);
        setWorkShiftError('Failed to fetch work shifts.');
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => navigate(-1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Attendance Settings</h1>
            <p className="text-muted-foreground">Configure attendance and check-in requirements</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="locations">Office Locations</TabsTrigger>
          <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
          <TabsTrigger value="workshift">Work Shift</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Check-in Requirements</CardTitle>
              <CardDescription>
                Configure location and time requirements for employee check-ins
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <Label htmlFor="location-tracking" className="text-base">
                      Require Location for Check-in
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Employees must be within office boundaries to check in
                  </p>
                </div>
                <Switch
                  id="location-tracking"
                  checked={isLocationEnabled}
                  onCheckedChange={setIsLocationEnabled}
                />
              </div>

              {isLocationEnabled && (
                <div className="rounded-lg border p-4 space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Allowed Check-in Radius</h4>
                    <div className="flex items-center space-x-4">
                      <div className="w-1/2">
                        <Label htmlFor="radius">Radius (meters)</Label>
                        <Input
                          id="radius"
                          type="number"
                          defaultValue="100"
                          className="mt-1"
                        />
                      </div>
                      <div className="w-1/2">
                        <Label>Office Location</Label>
                        <Select defaultValue="1">
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockLocations.map(location => (
                              <SelectItem key={location.id} value={String(location.id)}>
                                {location.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Office Locations</CardTitle>
                  <CardDescription>Manage your office locations for attendance tracking</CardDescription>
                </div>
                <Button onClick={() => navigate('/admin/attendance/locations/new')}>
                  <Plus className="mr-2 h-4 w-4" /> Add Location
                </Button>
              </div>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">


                <div className="mt-4 space-y-2">
                  <h2 className="text-lg font-semibold">Saved Office Locations</h2>
                  {locations.map((loc) => (
                    <div
                      key={loc.id}
                      className="p-2 border rounded-md flex justify-between items-center"
                    >
                      <div>
                        <strong>{loc.name}</strong> – {loc.address}
                        <br />
                        Lat: {loc.latitude}, Lng: {loc.longitude}, Radius: {loc.radius}m
                      </div>
                      <div className="space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/attendance/locations/${loc.id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this location?')) {
                              handleDelete(loc.id!);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* here */}

        <TabsContent value="exceptions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Attendance Exceptions</CardTitle>
                  <CardDescription>Configure exceptions to attendance rules</CardDescription>
                </div>
                <Button onClick={() => setShowAddException(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Exception
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockExceptions.map(exception => (
                  <div key={exception.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{exception.name}</h4>
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            {exception.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {exception.type === 'schedule' ? (
                            <span>Schedule-based exception</span>
                          ) : (
                            <span>Location-based exception</span>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {exception.days.map(day => (
                            <span key={day} className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workshift */}

        <TabsContent value="workshift" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Work Shifts</CardTitle>
                  <CardDescription>Set work shifts, clock in/out, and break times for departments or employees</CardDescription>
                </div>
                <Button onClick={handleAddWorkShift}>
                  <Plus className="mr-2 h-4 w-4" /> Add Work Shift
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Table of current work shifts */}
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department/Employee</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Clock In</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Clock Out</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Break Time</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {workShifts.map(shift => (
                      <tr key={shift.id} className="bg-white border-b">
                        <td className="px-4 py-2">{shift.targetName}</td>
                        <td className="px-4 py-2">{shift.days.join(', ')}</td>
                        <td className="px-4 py-2">{shift.clockIn}</td>
                        <td className="px-4 py-2">{shift.clockOut}</td>
                        <td className="px-4 py-2">{shift.breakTime}</td>
                        <td className="px-4 py-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditWorkShift(shift)}>
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Exception Modal */}
      {showAddException && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Exception</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAddException(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Exception Name</Label>
                <Input 
                  placeholder="e.g., Remote Work Policy" 
                  value={newException.name}
                  onChange={(e) => setNewException({...newException, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Exception Type</Label>
                <Select 
                  value={newException.type}
                  onValueChange={(value) => setNewException({...newException, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="schedule">Schedule-based (specific days/times)</SelectItem>
                    <SelectItem value="location">Location-based (anywhere)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Applies To</Label>
                <div className="flex space-x-2">
                  <Select 
                    value={newException.appliesToType}
                    onValueChange={(value) => setNewException({...newException, appliesToType: value})}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={
                        newException.appliesToType === 'department' ? 'Select department' : 'Select employee'
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {newException.appliesToType === 'department' ? (
                        mockDepartments.map(dept => (
                          <SelectItem key={dept.id} value={String(dept.id)}>
                            {dept.name}
                          </SelectItem>
                        ))
                      ) : (
                        mockEmployees.map(emp => (
                          <SelectItem key={emp.id} value={String(emp.id)}>
                            {emp.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Days of Week</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {daysOfWeek.map(day => (
                    <Button
                      key={day}
                      type="button"
                      variant={newException.days.includes(day) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleDay(day)}
                    >
                      {day.substring(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input 
                    type="time" 
                    value={newException.startTime}
                    onChange={(e) => setNewException({...newException, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input 
                    type="time" 
                    value={newException.endTime}
                    onChange={(e) => setNewException({...newException, endTime: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddException(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddException}>
                  <Save className="mr-2 h-4 w-4" /> Save Exception
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

     {/* Add/Edit Work Shift Modal */}
      {showAddWorkShift && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingWorkShift ? 'Edit' : 'Add'} Work Shift
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAddWorkShift(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Applies To</Label>
                <div className="flex space-x-2">
                  <Select value={workShiftTargetType} onValueChange={(v: string) => setWorkShiftTargetType(v as 'department' | 'employee')}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={workShiftTargetId} onValueChange={v => setWorkShiftTargetId(v)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={workShiftTargetType === 'department' ? 'Select department' : 'Select employee'} />
                    </SelectTrigger>
                    <SelectContent>
                    {workShiftTargetType === 'department' ? (
                      departments.map((dept) => (
                        <SelectItem
                          key={dept.id}
                          value={String(dept.id)}
                          className="text-black dark:text-white"
                        >
                          {dept.name}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        {console.log('Employees in dropdown:', employees)}
                        {employees.map((emp) => (
                          <SelectItem
                          key={emp.id}
                          value={String(emp.id)}
                          className="!text-black dark:!text-white bg-white dark:bg-gray-900"
                        >
                          {`${emp.first_name} ${emp.last_name}`}
                        </SelectItem>

                        ))}
                      </>
                    )}
                  </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Days of Week</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {daysOfWeek.map(day => (
                    <Button
                      key={day}
                      type="button"
                      variant={workShiftDays.includes(day) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setWorkShiftDays(prev =>
                          prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                        )
                      }
                    >
                      {day.substring(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Clock In</Label>
                  <Input type="time" value={workShiftClockIn} onChange={e => setWorkShiftClockIn(e.target.value)} />
                </div>
                <div>
                  <Label>Clock Out</Label>
                  <Input type="time" value={workShiftClockOut} onChange={e => setWorkShiftClockOut(e.target.value)} />
                </div>
                <div>
                  <Label>Break Time (minutes)</Label>
                  <Input type="number" value={workShiftBreakTime} onChange={e => setWorkShiftBreakTime(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddWorkShift(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveWorkShift}>
                  <Save className="mr-2 h-4 w-4" /> Save Work Shift
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
