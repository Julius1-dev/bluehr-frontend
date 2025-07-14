import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Toast notifications are not available, using alerts instead
import { ArrowLeft } from 'lucide-react';

const API_URL = 'http://localhost:4000/company-admin/users';
const DEPARTMENTS_API = 'http://localhost:4000/company-admin/departments';

export default function ChangeDepartment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [changeType, setChangeType] = useState('transfer');
  const [isLoading, setIsLoading] = useState(false);
  const [employee, setEmployee] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch employee');
        const data = await res.json();
        setEmployee(data);
        setSelectedDepartment(data.department_id ? data.department_id.toString() : '');
        setSelectedRole(data.role || '');
      } catch (err) {
        setEmployee(null);
      }
    };
    fetchEmployee();
  }, [id]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(DEPARTMENTS_API, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch departments');
        const data = await res.json();
        setDepartments(data);
      } catch (err) {
        setDepartments([]);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    // Update roles when department changes
    const dept = departments.find((d: any) => d.id?.toString() === selectedDepartment);
    if (dept) {
      setRoles(Array.isArray(dept.roles) ? dept.roles : (dept.roles ? JSON.parse(dept.roles) : []));
    } else {
      setRoles([]);
    }
  }, [selectedDepartment, departments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment || !selectedRole) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          departmentId: selectedDepartment,
          role: selectedRole,
          changeType
        })
      });
      if (!res.ok) throw new Error('Failed to update department/role');
      alert(`${employee?.first_name || employee?.name}'s department/role has been updated successfully.`);
      setTimeout(() => navigate('/admin/team'), 1500);
    } catch (error: any) {
      alert('Failed to update department/role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Change Department / Role</CardTitle>
          <CardDescription>
            Update {employee.first_name || employee.name}'s department and/or role information
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <div className="text-sm text-gray-700 p-2 bg-gray-50 rounded-md">
                  {employee.first_name || employee.name}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Current Position</Label>
                <div className="text-sm text-gray-700 p-2 bg-gray-50 rounded-md">
                  {employee.role}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">New Department *</Label>
              <Select 
                value={selectedDepartment} 
                onValueChange={setSelectedDepartment}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Current: {departments.find(d => d.id?.toString() === employee.department_id?.toString())?.name || 'Not set'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">New Role *</Label>
              <Select 
                value={selectedRole}
                onValueChange={setSelectedRole}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role: string, idx: number) => (
                    <SelectItem key={idx} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Current: {employee.role || 'Not set'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="changeType">Change Type *</Label>
              <Select value={changeType} onValueChange={setChangeType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select change type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promotion">Promotion</SelectItem>
                  <SelectItem value="demotion">Demotion</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Effective Date</Label>
              <div className="text-sm text-gray-700 p-2 bg-gray-50 rounded-md">
                {new Date().toLocaleDateString()}
              </div>
              <p className="text-sm text-muted-foreground">
                The change will be effective immediately
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-3 border-t px-6 py-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
