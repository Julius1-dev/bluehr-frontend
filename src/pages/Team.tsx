import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  MapPin,
  Clock,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { BACKEND_URL } from '@/lib/config';

export function Team() {
  // State
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<any | null>(null);
  const [deptActive, setDeptActive] = useState<any[]>([]);
  const [deptOnLeave, setDeptOnLeave] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'members'|'announcements'>('members');

  // Fetch departments with counts
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BACKEND_URL}/employee/auth/departments-with-counts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        console.log('Departments:', data);
        if (data.departments) {
          setDepartments(data.departments.map((d: any) => ({
            id: d.id,
            name: d.name,
            employees: Number(d.employees) || 0,
            active: Number(d.active) || 0,
            onLeave: Number(d.on_leave) || 0
          })));
        } else {
          setDepartments([]);
        }
      } catch (err) {
        setError('Failed to fetch departments');
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch team members in my department
  useEffect(() => {
    const fetchTeamMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BACKEND_URL}/employee/auth/team-members`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        console.log('Team Members:', data);
        if (data.team) {
          setTeamMembers(data.team.map((m: any) => ({
            id: m.id,
            name: m.name,
            role: m.role,
            status: m.status,
            avatar: m.avatar || '',
          })));
        } else {
          setTeamMembers([]);
        }
      } catch (err) {
        setError('Failed to fetch team members');
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamMembers();
  }, []);

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BACKEND_URL}/employee/auth/announcements`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        console.log('Announcements:', data);
        if (data.announcements) {
          setAnnouncements(data.announcements.map((a: any) => ({
            id: a.id,
            title: a.title,
            date: a.date,
            type: a.type,
            content: a.content
          })));
        } else {
          setAnnouncements([]);
        }
      } catch (err) {
        setError('Failed to fetch announcements');
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  // Fetch employees for selected department
  useEffect(() => {
    if (!selectedDept) {
      setDeptActive([]);
      setDeptOnLeave([]);
      return;
    }
    const fetchDeptEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BACKEND_URL}/employee/auth/department-employees?departmentId=${selectedDept.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        console.log('Department Employees:', data);
        setDeptActive((data.active || []).map((m: any) => ({
          id: m.id,
          name: m.name,
          role: m.role,
      status: 'active',
          avatar: m.avatar || '',
        })));
        setDeptOnLeave((data.onLeave || []).map((m: any) => ({
          id: m.id,
          name: m.name,
          role: m.role,
      status: 'away',
          avatar: m.avatar || '',
        })));
      } catch (err) {
        setError('Failed to fetch department employees');
        setDeptActive([]);
        setDeptOnLeave([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDeptEmployees();
  }, [selectedDept]);

  // Filtered departments
  const filteredDepartments = departments.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  // Filtered team members
  const filteredTeamMembers = teamMembers.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  // Filtered dept members
  const filteredDeptActive = deptActive.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  const filteredDeptOnLeave = deptOnLeave.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Team Directory</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search Directory"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
        <Button variant="outline">
          <Search className="mr-2 h-4 w-4" />
          Search Directory
        </Button>
        </div>
      </div>

      {/* Department Cards */}
      {error && <div className="text-red-600">{error}</div>}
      {loading && <div className="text-gray-500">Loading...</div>}
      {!selectedDept ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDepartments.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">No departments found.</div>
          ) : filteredDepartments.map((dept) => (
            <Card key={dept.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedDept(dept)}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{dept.name}</p>
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{dept.employees} employees</span>
                      </div>
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                          <span>{dept.active} Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-amber-500"></span>
                          <span>{dept.onLeave} On Leave</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div>
          <Button variant="outline" onClick={() => setSelectedDept(null)} className="mb-4">Back to Departments</Button>
          <div className="mb-2 font-semibold">Active Employees</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {filteredDeptActive.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">No active employees found.</div>
            ) : filteredDeptActive.map((member) => (
              <Card key={member.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <img src={member.avatar} alt={member.name} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{member.name}</h4>
                      <Badge variant="success">active</Badge>
                    </div>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mb-2 font-semibold">On Leave</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDeptOnLeave.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">No employees on leave found.</div>
            ) : filteredDeptOnLeave.map((member) => (
              <Card key={member.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <img src={member.avatar} alt={member.name} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{member.name}</h4>
                      <Badge variant="warning">away</Badge>
                    </div>
                    <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Team Members</CardTitle>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTeamMembers.length === 0 ? (
                  <div className="text-center text-gray-500">No team members found.</div>
                ) : filteredTeamMembers.map((member) => (
                  <div 
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{member.name}</h4>
                          <Badge variant={member.status === 'active' ? 'success' : 'warning'}>
                            {member.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.status === 'active' ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                          Active
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-600">
                          <span className="inline-block h-2 w-2 rounded-full bg-amber-500"></span>
                          On Leave
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

<TabsContent value="announcements">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Team Announcements</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.length === 0 ? (
                  <div className="text-center text-gray-500">No announcements found.</div>
                ) : announcements.map((announcement) => (
                  <div 
                    key={announcement.id}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{announcement.title}</h4>
                        <Badge variant={announcement.type === 'urgent' ? 'warning' : 'default'}>
                          {announcement.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {announcement.date ? new Date(announcement.date).toLocaleDateString() : ''}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {announcement.content}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}