import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Clock, Users, Building2, User, Calendar, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import LeaveTypeForm from './LeaveTypeForm';
import { LeaveTypeApi } from '@/services/leaveTypeApi';
import { useNavigate } from 'react-router-dom';

// Helper to map backend leave type to frontend format
function mapLeaveType(leaveType: any, departments: any[] = [], employees: any[] = []) {
  let appliesTo: any = { type: 'all', id: 'all', name: 'All Employees' };
  if (leaveType.applies_to_type === 'department') {
    if (leaveType.applies_to_ids && leaveType.applies_to_ids.includes('all')) {
      appliesTo = { type: 'all', id: 'all', name: 'All Employees' };
    } else if (leaveType.applies_to_ids && leaveType.applies_to_ids.length > 0) {
      const dept = departments.find(d => d.id === leaveType.applies_to_ids[0]);
      appliesTo = { type: 'department', id: leaveType.applies_to_ids[0], name: dept ? dept.name : 'Department' };
    }
  } else if (leaveType.applies_to_type === 'employee') {
    const emp = employees.find(e => e.id === leaveType.applies_to_ids[0]);
    appliesTo = { type: 'employee', id: leaveType.applies_to_ids[0], name: emp ? emp.name : 'Employee' };
  }
  return {
    ...leaveType,
    isPaid: leaveType.is_paid,
    isRecurring: leaveType.is_recurring,
    appliesTo,
  };
}

export default function LeaveTypes() {
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const navigate = useNavigate();

  // Fetch departments and employees for mapping appliesTo
  useEffect(() => {
    const fetchDeps = async () => {
      try {
        const deps = await LeaveTypeApi.listDepartments();
        const emps = await LeaveTypeApi.listEmployees();
        setDepartments(deps);
        setEmployees(emps);
      } catch {
        // ignore for now
      }
    };
    fetchDeps();
  }, []);

  const fetchLeaveTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await LeaveTypeApi.listLeaveTypes();
      console.log('Fetched leave types:', data);
      const leaveTypesRaw = Array.isArray(data.leaveTypes) ? data.leaveTypes : [];
      // Map each leave type to include appliesTo
      const mapped = leaveTypesRaw.map(lt => mapLeaveType(lt, departments, employees));
      setLeaveTypes(mapped);
    } catch (err) {
      setError('Failed to load leave types.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, [departments, employees]);

  const handleAdd = () => {
    setEditingLeaveType(null);
    setIsFormOpen(true);
  };

  const handleEdit = (leaveType: any) => {
    setEditingLeaveType(leaveType);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: any) => {
    if (window.confirm('Are you sure you want to delete this leave type?')) {
      try {
        setError(null); // Clear any previous errors
        await LeaveTypeApi.deleteLeaveType(id);
        // Refresh the list to ensure it's up to date
        await fetchLeaveTypes();
        setSuccess('Leave type deleted successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } catch (error) {
        console.error('Error deleting leave type:', error);
        alert('Failed to delete leave type.');
      }
    }
  };

  const handleSave = async (leaveType: any) => {
    try {
      setError(null); // Clear any previous errors
      if (editingLeaveType) {
        await LeaveTypeApi.updateLeaveType(editingLeaveType.id, leaveType);
        // Refresh the list to ensure it's up to date
        await fetchLeaveTypes();
        setSuccess('Leave type updated successfully!');
      } else {
        await LeaveTypeApi.createLeaveType(leaveType);
        // Refresh the entire list to get the newly created leave type
        await fetchLeaveTypes();
        setSuccess('Leave type created successfully!');
      }
      setIsFormOpen(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving leave type:', error);
      alert('Failed to save leave type.');
    }
  };

  const toggleStatus = async (id: any) => {
    const leaveType = leaveTypes.find(lt => lt.id === id);
    if (!leaveType) return;
    try {
      setError(null); // Clear any previous errors
      await LeaveTypeApi.updateLeaveType(id, { ...leaveType, status: leaveType.status === 'active' ? 'inactive' : 'active' });
      // Refresh the list to ensure it's up to date
      await fetchLeaveTypes();
      setSuccess(`Leave type ${leaveType.status === 'active' ? 'deactivated' : 'activated'} successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        <div>
          <h1 className="text-2xl font-bold">Leave Types</h1>
          <p className="text-muted-foreground">
            Manage different types of leave and their configurations
          </p>
          </div>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Leave Type
        </Button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {(!Array.isArray(leaveTypes)) ? (
        <div className="text-red-500">Leave types data is invalid.</div>
      ) : (
      <Card>
        <CardHeader>
          <CardTitle>Configured Leave Types</CardTitle>
          <CardDescription>
            Manage the different types of leave available to employees
          </CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-gray-400 mr-2" />
                <span>Loading...</span>
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Days</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Applies To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveTypes.map((leaveType) => (
                <TableRow key={leaveType.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      {leaveType.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {leaveType.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <span>{leaveType.days}</span>
                      <Clock className="ml-1 h-4 w-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${leaveType.color || 'bg-blue-100 text-blue-800'}`}
                            style={{ minWidth: 100, textAlign: 'center' }}
                          >
                            {leaveType.name}
                          </span>
                      <Badge variant={leaveType.isPaid ? 'default' : 'outline'} className="w-fit">
                        {leaveType.isPaid ? 'Paid' : 'Unpaid'}
                      </Badge>
                      <Badge variant={leaveType.isRecurring ? 'default' : 'outline'} className="w-fit">
                        {leaveType.isRecurring ? 'Recurring' : 'One-time'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                          {leaveType.appliesTo?.type === 'all' && <Users className="h-4 w-4 mr-1" />}
                          {leaveType.appliesTo?.type === 'department' && <Building2 className="h-4 w-4 mr-1" />}
                          {leaveType.appliesTo?.type === 'employee' && <User className="h-4 w-4 mr-1" />}
                          {leaveType.appliesTo?.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Switch
                        checked={leaveType.status === 'active'}
                        onCheckedChange={() => toggleStatus(leaveType.id)}
                        className="data-[state=checked]:bg-green-500 mr-2"
                      />
                      <Badge variant={leaveType.status === 'active' ? 'default' : 'secondary'}>
                        {leaveType.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(leaveType)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(leaveType.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            )}
        </CardContent>
      </Card>
      )}

      <LeaveTypeForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingLeaveType(null);
        }}
        onSubmit={handleSave}
        initialData={editingLeaveType}
        departments={departments}
        employees={employees}
      />
    </div>
  );
}
