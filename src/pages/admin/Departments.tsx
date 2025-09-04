import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Building2, Users, Pencil, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BACKEND_URL } from '@/lib/config';

type Department = {
  id: string;
  name: string;
  description: string;
  headCount: number;
  roles: string[];
};

const API_URL = `${BACKEND_URL}/company-admin/departments`;

export function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newDepartment, setNewDepartment] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState({ deptId: '', role: '', index: -1 });
  const [newRole, setNewRole] = useState('');

  // Fetch departments from backend
  const fetchDepartments = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch departments');
      const data = await res.json();
      setDepartments(data.map((dept: any) => ({
        id: dept.id.toString(),
        name: dept.name,
        description: dept.description,
        headCount: dept.headCount || 0,
        roles: Array.isArray(dept.roles) ? dept.roles : (dept.roles ? JSON.parse(dept.roles) : [])
      })));
    } catch (err: any) {
      setError(err.message || 'Error fetching departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Add department
  const handleAddDepartment = async () => {
    if (!newDepartment.name.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newDepartment.name.trim(),
          description: newDepartment.description.trim(),
          roles: []
        })
      });
      if (!res.ok) throw new Error('Failed to add department');
      const addedDept = await res.json();
      setNewDepartment({ name: '', description: '' });
      await fetchDepartments();
      // Notification logic
      import('@/services/notificationService').then(({ notificationService }) => {
        const notifications = notificationService.getNotifications();
        const alreadyNotified = notifications.some(
          n => n.metadata?.departmentId === addedDept.id
        );
        if (!alreadyNotified) {
          notificationService.addNotification({
            type: 'announcement',
            title: 'Department Added',
            message: `${addedDept.name} department has been created.`,
            priority: 'medium',
            metadata: { departmentId: addedDept.id }
          });
        }
      });
    } catch (err: any) {
      setError(err.message || 'Error adding department');
    }
  };

  // Update department (name, description, roles)
  const handleUpdateDepartment = async (dept: Department) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${dept.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: dept.name,
          description: dept.description,
          roles: dept.roles
        })
      });
      if (!res.ok) throw new Error('Failed to update department');
      await fetchDepartments();
    } catch (err: any) {
      setError(err.message || 'Error updating department');
    }
  };

  // Delete department
  const handleDeleteDepartment = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete department');
      await fetchDepartments();
    } catch (err: any) {
      setError(err.message || 'Error deleting department');
    }
  };

  // Add role to department
  const handleAddRole = async (deptId: string) => {
    if (!newRole.trim()) return;
    const dept = departments.find(d => d.id === deptId);
    if (!dept) return;
    const updatedRoles = [...dept.roles, newRole.trim()];
    try {
      await handleUpdateDepartment({ ...dept, roles: updatedRoles });
      setNewRole('');
    } catch (err: any) {
      setError(err.message || 'Error adding role');
    }
  };

  // Update role in department
  const handleUpdateRole = async (deptId: string) => {
    if (!editingRole.role.trim()) return;
    const dept = departments.find(d => d.id === deptId);
    if (!dept) return;
    const updatedRoles = [...dept.roles];
    updatedRoles[editingRole.index] = editingRole.role.trim();
    try {
      await handleUpdateDepartment({ ...dept, roles: updatedRoles });
      setEditingRole({ deptId: '', role: '', index: -1 });
    } catch (err: any) {
      setError(err.message || 'Error updating role');
    }
  };

  // Delete role from department
  const handleDeleteRole = async (deptId: string, roleIndex: number) => {
    const dept = departments.find(d => d.id === deptId);
    if (!dept) return;
    const updatedRoles = dept.roles.filter((_, idx) => idx !== roleIndex);
    try {
      await handleUpdateDepartment({ ...dept, roles: updatedRoles });
    } catch (err: any) {
      setError(err.message || 'Error deleting role');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Departments & Roles</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Department</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dept-name">Department Name</Label>
              <Input
                id="dept-name"
                placeholder="e.g., Marketing"
                value={newDepartment.name}
                onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="dept-desc">Description</Label>
              <div className="flex gap-2">
                <Input
                  id="dept-desc"
                  placeholder="Department description"
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                />
                <Button type="button" onClick={handleAddDepartment}>
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <Card key={dept.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    {editingId === dept.id ? (
                      <Input
                        value={dept.name}
                        onChange={(e) => {
                          const updated = departments.map(d => 
                            d.id === dept.id ? { ...d, name: e.target.value } : d
                          );
                          setDepartments(updated);
                        }}
                        className="h-8 w-auto p-1"
                      />
                    ) : (
                      dept.name
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{dept.description}</p>
                </div>
                <div className="flex gap-2">
                  {editingId === dept.id ? (
                    <>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setEditingId(null)}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingId(null);
                          // Reset to original values if needed
                        }}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setEditingId(dept.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteDepartment(dept.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <Users className="h-4 w-4 mr-1" />
                <span>{dept.headCount} members</span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2 flex items-center">
                <span>Roles</span>
                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {dept.roles.length}
                </span>
              </h3>
              
              <div className="space-y-2">
                {dept.roles.map((role, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    {editingRole.deptId === dept.id && editingRole.index === index ? (
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={editingRole.role}
                          onChange={(e) => setEditingRole({...editingRole, role: e.target.value})}
                          className="h-8 flex-1"
                          autoFocus
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8"
                          onClick={() => handleUpdateRole(dept.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8"
                          onClick={() => setEditingRole({ deptId: '', role: '', index: -1 })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm">{role}</span>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => setEditingRole({ deptId: dept.id, role, index })}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteRole(dept.id, index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add new role"
                    value={editingRole.deptId === dept.id ? newRole : ''}
                    onChange={(e) => {
                      setNewRole(e.target.value);
                      setEditingRole({ deptId: dept.id, role: e.target.value, index: -1 });
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddRole(dept.id)}
                    className="h-8 text-sm"
                  />
                  <Button 
                    size="sm" 
                    className="h-8"
                    onClick={() => handleAddRole(dept.id)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
