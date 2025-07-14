import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Users, ArrowRight, UserCheck, UserX, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { LeaveTypeApi } from '@/services/leaveTypeApi';

export function TeamOverviewWidget() {
  const navigate = useNavigate();
  
  // Real data state
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    // Fetch employees
    LeaveTypeApi.listEmployees().then(data => {
      let members = Array.isArray(data) ? data : (Array.isArray(data.users) ? data.users : []);
      // Combine first_name, middle_name, last_name into name for display
      members = members.map((member: any) => ({
        ...member,
        name: [member.first_name, member.middle_name, member.last_name].filter(Boolean).join(' ')
      }));
      setTeamMembers(members);
    }).catch(() => setTeamMembers([]));
    // Fetch departments
    LeaveTypeApi.listDepartments().then(data => {
      setDepartments(Array.isArray(data) ? data : []);
    }).catch(() => setDepartments([]));
  }, []);

  // Calculate stats
  const total = teamMembers.length;
  const active = teamMembers.filter(m => (m.status || '').toLowerCase() === 'active').length;
  const onLeave = teamMembers.filter(m => (m.status || '').toLowerCase().includes('leave')).length;

  // Recent team members (last 5 by created_at or id desc)
  const recentMembers = [...teamMembers]
    .sort((a, b) => {
      if (a.created_at && b.created_at) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return (b.id || 0) - (a.id || 0);
    })
    .slice(0, 5);

  // Department distribution
  const departmentStats = departments.map((dept: any) => {
    const count = teamMembers.filter(m => m.department_id?.toString() === dept.id?.toString()).length;
    return {
      name: dept.name,
      count,
      color: 'bg-blue-500' // You can map colors by dept name if desired
    };
  });
  
  const getStatusColor = (status: string) => {
    switch((status || '').toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'leave':
      case 'on leave': return 'bg-amber-500';
      case 'inactive': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Team Overview</CardTitle>
        <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => navigate('/admin/team')}>
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg">
            <Users className="h-4 w-4" />
            <span className="font-medium">Total: {total}</span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg">
            <UserCheck className="h-4 w-4" />
            <span className="font-medium">Active: {active}</span>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg">
            <UserX className="h-4 w-4" />
            <span className="font-medium">On Leave: {onLeave}</span>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500">Recent Team Members</h3>
          <div className="space-y-3">
            {recentMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar || undefined} alt={member.name} />
                    <AvatarFallback>{member.name?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.position || member.role || ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {departments.find(d => d.id?.toString() === member.department_id?.toString())?.name || member.department || ''}
                  </Badge>
                  <div className={`h-2 w-2 rounded-full ${getStatusColor(member.status)}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Department Distribution</h3>
          <div className="flex flex-wrap gap-2">
            {departmentStats.map(dept => (
              <div key={dept.name} className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
                <div className={`h-2 w-2 rounded-full ${dept.color}`}></div>
                <span className="text-xs font-medium">{dept.name}</span>
                <span className="text-xs text-gray-500">({dept.count})</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/admin/team')}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Team Member
        </Button>
      </CardFooter>
    </Card>
  );
}
