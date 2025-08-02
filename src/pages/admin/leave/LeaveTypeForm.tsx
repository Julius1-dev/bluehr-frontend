import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save } from 'lucide-react';
import { LeaveTypeApi } from '@/services/leaveTypeApi';

// Color palette for leave types
const LEAVE_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-red-100 text-red-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
  'bg-gray-100 text-gray-800',
  'bg-green-100 text-green-800',
  'bg-yellow-100 text-yellow-800',
  'bg-orange-100 text-orange-800',
  'bg-teal-100 text-teal-800',
  'bg-cyan-100 text-cyan-800',
  'bg-fuchsia-100 text-fuchsia-800',
];

export default function LeaveTypeForm(props: any) {
  const { isOpen, onClose, onSubmit, initialData, departments = [], employees = [] } = props;
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    days: 0,
    isPaid: true,
    isRecurring: true,
    appliesTo: { type: 'all', id: 'all', name: 'All Employees' },
    color: '',
  });
  const [loadingDeps, setLoadingDeps] = useState(true);
  const [errorDeps, setErrorDeps] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      // Defensive: reconstruct appliesTo if missing or incomplete
      let appliesTo = initialData.appliesTo;
      if (!appliesTo || !appliesTo.type) {
        // Try to reconstruct from applies_to_type and applies_to_ids
        if (initialData.applies_to_type === 'department') {
          if (initialData.applies_to_ids && initialData.applies_to_ids.includes('all')) {
            appliesTo = { type: 'all', id: 'all', name: 'All Employees' };
          } else if (initialData.applies_to_ids && initialData.applies_to_ids.length > 0) {
            const dept = departments.find((d: any) => d.id === initialData.applies_to_ids[0]);
            appliesTo = { type: 'department', id: initialData.applies_to_ids[0], name: dept ? dept.name : 'Department' };
          }
        } else if (initialData.applies_to_type === 'employee') {
          const emp = employees.find((e: any) => e.id === initialData.applies_to_ids[0]);
          appliesTo = { type: 'employee', id: initialData.applies_to_ids[0], name: emp ? emp.name : 'Employee' };
        } else {
          appliesTo = { type: 'all', id: 'all', name: 'All Employees' };
        }
      }
      setFormData({ ...initialData, appliesTo });
    } else {
      setFormData({
        name: '',
        description: '',
        days: 0,
        isPaid: true,
        isRecurring: true,
        appliesTo: { type: 'all', id: 'all', name: 'All Employees' },
        color: '',
      });
    }
  }, [initialData, departments, employees]);

  useEffect(() => {
    const fetchDeps = async () => {
      setLoadingDeps(true);
      setErrorDeps(null);
      try {
        const [deps, emps] = await Promise.all([
          LeaveTypeApi.listDepartments(),
          LeaveTypeApi.listEmployees()
        ]);
        setDepartments([{ id: 'all', name: 'All Departments' }, ...deps]);
        setEmployees([{ id: 'all', name: 'All Employees' }, ...emps]);
      } catch {
        setErrorDeps('Failed to load departments or employees.');
      } finally {
        setLoadingDeps(false);
      }
    };
    fetchDeps();
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    let appliesToType = '';
    let appliesToIds = [];
    if (formData.appliesTo.type === 'all') {
      appliesToType = 'department';
      appliesToIds = ['all'];
    } else if (formData.appliesTo.type === 'department') {
      appliesToType = 'department';
      appliesToIds = [formData.appliesTo.id];
    } else if (formData.appliesTo.type === 'employee') {
      appliesToType = 'employee';
      appliesToIds = [formData.appliesTo.id];
    }
    // Assign a random color if not editing
    let color = formData.color;
    if (!initialData) {
      color = LEAVE_COLORS[Math.floor(Math.random() * LEAVE_COLORS.length)];
    }
    onSubmit({
      name: formData.name,
      description: formData.description,
      days: formData.days,
      isPaid: formData.isPaid,
      isRecurring: formData.isRecurring,
      appliesToType,
      appliesToIds,
      color,
    });
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleAppliesToChange = (type) => {
    setFormData(prev => ({
      ...prev,
      appliesTo: {
        type,
        id: type === 'all' ? 'all' : '',
        name: type === 'all' ? 'All Employees' : ''
      }
    }));
  };

  const handleEntitySelect = (id, name) => {
    setFormData(prev => ({
      ...prev,
      appliesTo: {
        ...prev.appliesTo,
        id,
        name
      }
    }));
  };

  const renderEntitySelector = () => {
    if (!formData.appliesTo || formData.appliesTo.type === 'all') return null;
    const items = formData.appliesTo.type === 'department' ? departments : employees;
    if (loadingDeps) return <div>Loading...</div>;
    if (errorDeps) return <div className="text-red-500">{errorDeps}</div>;
    return (
      <div className="space-y-2">
        <Label>
          {formData.appliesTo.type === 'department' ? 'Select Department' : 'Select Employee'}
        </Label>
        <Select
          value={formData.appliesTo.id}
          onValueChange={(value) => {
            const selected = items.find((item: any) => item.id === value);
            if (selected) {
              handleEntitySelect(selected.id, selected.name);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${formData.appliesTo.type}`} />
          </SelectTrigger>
          <SelectContent>
            {items.map((item: any) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Leave Type' : 'Add New Leave Type'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Leave Type Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Bereavement Leave"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days">Number of Days</Label>
              <Input
                id="days"
                name="days"
                type="number"
                min="0"
                value={formData.days}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter a brief description of this leave type"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Applies To</Label>
              <Select
                value={formData.appliesTo.type}
                onValueChange={handleAppliesToChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select who this applies to" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="department">Specific Department</SelectItem>
                  <SelectItem value="employee">Specific Employee</SelectItem>
                </SelectContent>
              </Select>
              {renderEntitySelector()}
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPaid">Paid Leave</Label>
                <Switch
                  id="isPaid"
                  checked={formData.isPaid}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, isPaid: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isRecurring">Recurring Leave</Label>
                <Switch
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, isRecurring: checked }))
                  }
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              {initialData ? 'Update' : 'Create'} Leave Type
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
