import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  UserPlus,
  Download,
  Upload,
  Pencil
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table as PreviewTable, TableBody as PreviewTableBody, TableCell as PreviewTableCell, TableHead as PreviewTableHead, TableHeader as PreviewTableHeader, TableRow as PreviewTableRow } from '@/components/ui/table';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BACKEND_URL } from '@/lib/config';

const API_URL = 'http://localhost:4000/company-admin/users';
const DEPARTMENTS_API = 'http://localhost:4000/company-admin/departments';

// Replace hardcoded backend URL with BACKEND_URL
const TEAM_API = `${BACKEND_URL}/company-admin/team`;

// Department filter options
const departments = ['All Departments', 'Design', 'Engineering', 'HR', 'Finance', 'Product', 'Marketing'];

// Status options
const statusOptions = ['All Status', 'Active', 'On Leave', 'Inactive'];

// Utility to convert snake_case or spaced headers to camelCase
function toCamelCase(str: string) {
  return str
    .replace(/[_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
    .replace(/^(.)/, (m) => m.toLowerCase());
}

function mapHeadersToCamelCase(row: Record<string, any>) {
  const mapped: Record<string, any> = {};
  for (const key in row) {
    mapped[toCamelCase(key)] = row[key];
  }
  return mapped;
}

export function TeamManagement(): JSX.Element {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importOpen, setImportOpen] = useState(false);
  
  useEffect(() => {
    const fetchTeamMembers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_URL, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch team members');
        const data = await res.json();
        // Combine first_name, middle_name, last_name into name
        const mapped = data.map((member: any) => ({
          ...member,
          name: [member.first_name, member.middle_name, member.last_name].filter(Boolean).join(' ')
        }));
        setTeamMembers(mapped);
      } catch (err: any) {
        setError(err.message || 'Error fetching team members');
      } finally {
        setLoading(false);
      }
    };
    fetchTeamMembers();
  }, []);
  
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(DEPARTMENTS_API, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch departments');
        const data = await res.json();
        setDepartmentsList(data);
      } catch (err) {
        setDepartmentsList([]);
      }
    };
    fetchDepartments();
  }, []);
  
  const handleAddEmployee = () => {
    navigate('/admin/team/add');
  };
  
  const handleEditEmployee = (id: number) => {
    navigate(`/admin/team/edit/${id}`);
  };
  
  // Filter team members based on search term, department, and status
  const filteredTeamMembers = teamMembers.filter(member => {
    const name = member.name || '';
    const email = member.email || '';
    const position = member.position || '';
    const department = member.department || '';
    const status = member.status || '';
    const matchesSearch = 
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = 
      selectedDepartment === 'All Departments' || 
      department === selectedDepartment;
    const matchesStatus = 
      selectedStatus === 'All Status' || 
      status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesDepartment && matchesStatus;
  });
  
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on leave':
        return 'bg-amber-100 text-amber-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  const handleImportClick = () => {
    setImportOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCloseImport = () => setImportOpen(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Map headers to camelCase and department_name to department_id
        const mapped = (results.data as any[]).map(row => {
          const camelRow = mapHeadersToCamelCase(row);
          // Accept department_name or departmentName
          const deptName = camelRow.departmentName || camelRow.department_name || camelRow.department;
          const dept = departmentsList.find(d => d.name?.toLowerCase() === (deptName || '').toLowerCase());
          if (dept) {
            return { ...camelRow, departmentId: dept.id, _deptError: false };
          } else {
            return { ...camelRow, departmentId: '', _deptError: true };
          }
        });
        navigate('/admin/team/import/preview', { state: { csvData: mapped, csvHeaders: results.meta.fields } });
      }
    });
  };
  
  const handleExport = () => {
    const doc = new jsPDF();
    const tableColumn = ['Name', 'Email', 'Department', 'Role', 'Status', 'Join Date'];
    const tableRows = filteredTeamMembers.map((member) => [
      member.name || '',
      member.email || '',
      departmentsList.find((d) => d.id?.toString() === member.department_id?.toString())?.name || '',
      member.role || '',
      member.status || '',
      member.joining_date ? new Date(member.joining_date).toLocaleDateString() : ''
    ]);
    autoTable(doc, { head: [tableColumn], body: tableRows });
    doc.save('employees.pdf');
  };
  
  const handleSampleDownload = () => {
    const sample = [
      ['first_name','middle_name','last_name','email','phone','date_of_birth','gender','national_id','kra_pin','nssf_number','nhif_number','joining_date','department_name','role','employment_type','payment_frequency','basic_salary','bank_name','bank_branch','account_number','account_name','emergency_contact_name','emergency_contact_phone','emergency_contact_relationship','status'],
      ['John','M','Doe','john.doe@example.com','0712345678','1990-01-01','male','12345678','A123456789B','NSSF123','NHIF123','2023-01-01','Engineering','Engineer','full-time','monthly','50000','Equity','Nairobi','1234567890','John Doe','Jane Doe','0712345678','Spouse','active']
    ];
    const csv = Papa.unparse(sample);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_employees.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-6 p-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
      />
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk Import Employees</DialogTitle>
          </DialogHeader>
          <div className="mb-2 font-semibold">Instructions</div>
          <ul className="list-disc ml-6 text-sm mb-2">
            <li>Download the sample CSV file and fill in your employee data.</li>
            <li>Required fields: <b>first_name, last_name, email, department_name, role, joining_date, status</b> (others optional).</li>
            <li>Department name must match exactly as created in your system.</li>
            <li>Upload the completed CSV using the file input below.</li>
          </ul>
          <Button size="sm" variant="outline" onClick={handleSampleDownload}>Download Sample CSV</Button>
          <input
            type="file"
            accept=".csv"
            className="block mt-4"
            onChange={handleFileChange}
          />
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseImport}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-gray-500">Manage your team members, departments, and roles.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="gap-1" onClick={handleImportClick}>
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button 
            size="sm" 
            className="gap-1"
            onClick={handleAddEmployee}
          >
            <UserPlus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            View and manage all team members in your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by name, email, or position..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <select 
                  className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select 
                  className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeamMembers.map((member) => {
                  const department = departmentsList.find((d) => d.id?.toString() === member.department_id?.toString());
                  return (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.avatar} alt={member.name || ''} />
                            <AvatarFallback>{member.name?.split(' ').map((n: string) => n[0]).join('') || ''}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name && member.name.trim() !== '' ? member.name : 'Unnamed Employee'}</div>
                            <div className="text-sm text-gray-500">{member.email || ''}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {department ? department.name : ''}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.role || ''}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(member.status || '')} font-normal`}>
                          {member.status?.charAt(0).toUpperCase() + member.status?.slice(1) || ''}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.joining_date ? new Date(member.joining_date).toLocaleDateString() : ''}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              className="cursor-pointer" 
                              onClick={() => navigate(`/admin/team/view/${member.id}`)}
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer" 
                              onClick={() => handleEditEmployee(member.id)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => navigate(`/admin/team/${member.id}/department`)}
                            >
                              <Building className="mr-2 h-4 w-4" />
                              Change Department
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => navigate(`/admin/team/${member.id}/schedule`)}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              View Schedule
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <div>Showing {filteredTeamMembers.length} of {teamMembers.length} team members</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
