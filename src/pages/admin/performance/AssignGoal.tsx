import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Building2, Target } from 'lucide-react';
import { LeaveTypeApi } from '@/services/leaveTypeApi';
import { PerformanceApi } from '@/services/performanceApi';

export default function AssignGoal() {
  const navigate = useNavigate();
  const [goalTitle, setGoalTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('performance');
  const [assignType, setAssignType] = useState<'employee' | 'department'>('employee');
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hours, setHours] = useState('');
  const [alignWithShift, setAlignWithShift] = useState(false);
  const [_showDetails, setShowDetails] = useState(true);
  const [milestones, setMilestones] = useState<{ title: string; dueDate?: string }[]>([]);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDueDate, setMilestoneDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    LeaveTypeApi.listEmployees().then(setEmployees);
    LeaveTypeApi.listDepartments().then(setDepartments);
  }, []);

  const handleAddMilestone = () => {
    if (!milestoneTitle.trim()) return;
    setMilestones([...milestones, { title: milestoneTitle, dueDate: milestoneDueDate }]);
    setMilestoneTitle('');
    setMilestoneDueDate('');
  };

  const handleRemoveMilestone = (idx: number) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const data = {
        title: goalTitle,
        description,
        category,
        milestones,
        startDate,
        endDate,
        hours: hours ? Number(hours) : undefined,
        alignWithShift,
        employeeIds: assignType === 'employee' ? selectedEmployees.map(Number) : [],
        departmentIds: assignType === 'department' ? selectedDepartments.map(Number) : [],
      };
      await PerformanceApi.assignGoal(data);
      setSuccess('Goal assigned successfully!');
      setGoalTitle('');
      setDescription('');
      setCategory('performance');
      setSelectedEmployees([]);
      setSelectedDepartments([]);
      setStartDate('');
      setEndDate('');
      setHours('');
      setAlignWithShift(false);
      setMilestones([]);
      } catch (_err) {
      setError('Failed to assign goal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Back
        </Button>
        <h1 className="text-2xl font-bold flex-1 text-center">Assign New Goal</h1>
        <div className="w-24" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Goal Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="font-medium">Goal Title</Label>
                <Input
                  value={goalTitle}
                  onChange={e => setGoalTitle(e.target.value)}
                  placeholder="Enter goal title"
                  required
                />
                <Label className="font-medium">Category</Label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="performance">Performance</option>
                  <option value="learning">Learning & Development</option>
                  <option value="leadership">Leadership</option>
                  <option value="team">Teamwork</option>
                </select>
                <Label className="font-medium">Description</Label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2 border rounded-md h-24"
                  placeholder="Describe the goal and milestones"
                  required
                />
                <Label className="font-medium">Milestones</Label>
                <div className="space-y-2">
                  <div className="flex gap-2 mb-2">
                    <Input
                      type="text"
                      value={milestoneTitle}
                      onChange={e => setMilestoneTitle(e.target.value)}
                      className="flex-1"
                      placeholder="Milestone title"
                    />
                    <Input
                      type="date"
                      value={milestoneDueDate}
                      onChange={e => setMilestoneDueDate(e.target.value)}
                      className="w-40"
                    />
                    <Button type="button" variant="outline" onClick={handleAddMilestone}>
                      Add
                    </Button>
                  </div>
                  {milestones.length > 0 && (
                    <ul className="space-y-2">
                      {milestones.map((m, idx) => (
                        <li key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                          <span className="flex-1">{m.title} {m.dueDate && <span className="text-xs text-gray-500">(Due: {m.dueDate})</span>}</span>
                          <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveMilestone(idx)}>
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <Label className="font-medium">Assign To</Label>
                <div className="flex gap-4 mb-2">
                  <Button type="button" variant={assignType === 'employee' ? 'default' : 'outline'} onClick={() => setAssignType('employee')}>
                    <Users className="h-4 w-4 mr-2" /> Employees
                  </Button>
                  <Button type="button" variant={assignType === 'department' ? 'default' : 'outline'} onClick={() => setAssignType('department')}>
                    <Building2 className="h-4 w-4 mr-2" /> Departments
                  </Button>
                </div>
                {assignType === 'employee' ? (
                  <div className="space-y-2">
                    <Label>Select Employees</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {employees.map(emp => (
                        <label key={emp.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(emp.id)}
                            onChange={e => setSelectedEmployees(sel => e.target.checked ? [...sel, emp.id] : sel.filter(id => id !== emp.id))}
                          />
                          <span>{emp.first_name || emp.firstName || emp.username || emp.email}{emp.last_name || emp.lastName ? ` ${emp.last_name || emp.lastName}` : ''}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Select Departments</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {departments.map(dep => (
                        <label key={dep.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedDepartments.includes(dep.id)}
                            onChange={e => setSelectedDepartments(sel => e.target.checked ? [...sel, dep.id] : sel.filter(id => id !== dep.id))}
                          />
                          <span>{dep.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <Label className="font-medium">Time Window</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-1/2"
                    placeholder="Start date"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-1/2"
                    placeholder="End date"
                  />
                </div>
                <Label className="font-medium">Number of Hours</Label>
                <Input
                  type="number"
                  min={1}
                  value={hours}
                  onChange={e => setHours(e.target.value)}
                  placeholder="e.g. 10"
                />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={alignWithShift}
                    onChange={e => setAlignWithShift(e.target.checked)}
                    id="align-shift"
                  />
                  <Label htmlFor="align-shift">Align with assigned shift</Label>
                </div>
              </div>
            </div>
            {success && <div className="text-green-600 text-sm">{success}</div>}
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex justify-end mt-8">
              <Button type="submit" className="px-8 py-2 text-lg" disabled={loading}>
                <Target className="mr-2 h-5 w-5" /> {loading ? 'Assigning...' : 'Assign Goal'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 