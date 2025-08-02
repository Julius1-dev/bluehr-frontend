import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Upload, Download, Plus, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

// Mock data for companies

type Company = {
  id: number;
  name: string;
  employee_count: number;
  lastUpdated: string;
};

// Remove top-level useState/useEffect for companies. Move inside AdjustmentsPage.

// Remove mockEmployees. Use real employees from backend.

type Employee = {
  id: number;
  name: string;
  idNumber: string;
  leaveTypes: Array<{
    type: string;
    total: number;
    used: number;
    remaining: number;
    color?: string;
  }>;
};

export default function AdjustmentsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [activeTab, setActiveTab] = useState('companies');
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<number | null>(null);
  const [employeeData, setEmployeeData] = useState<Record<string, any>>({});
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  // State for leave types
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(false);
  // Add state for editing leave days per leave type
  const [editingLeaveDays, setEditingLeaveDays] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:4000/super-admin/companies', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch companies');
        const data = await res.json();
        setCompanies(
          (Array.isArray(data) ? data : []).map((c: any) => ({
            id: c.id,
            name: c.company_name,
            employee_count: c.employee_count,
            lastUpdated: c.last_updated,
          }))
        );
      } catch (err) {
        setCompanies([]);
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle company selection
  const handleCompanySelect = (companyId: number) => {
    setSelectedCompany(companyId);
    setActiveTab('employees');
  };

  // Handle employee selection
  const toggleEmployeeSelection = (employeeId: number) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  // Handle employee data edit
  const handleEditEmployee = (employee: any) => {
    setEditingEmployee(employee.id);
    const leaveDays: Record<string, number> = {};
    employee.leaveTypes.forEach((lt: any) => {
      leaveDays[lt.type] = lt.remaining;
    });
    setEditingLeaveDays(leaveDays);
  };

  // Update saveEmployeeData to call backend for each leave type
  const saveEmployeeData = async () => {
    if (!editingEmployee || !selectedCompany) return;
    const year = new Date().getFullYear();
    const token = localStorage.getItem('token');
    // For each leave type, call backend to update adjustment
    await Promise.all(
      leaveTypes.map(async (lt: any) => {
        const adjustedDays = editingLeaveDays[lt.name];
        if (adjustedDays !== undefined) {
          await fetch(`http://localhost:4000/super-admin/users/company/${selectedCompany}/leave-adjustment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              employeeId: editingEmployee,
              leaveTypeId: lt.id,
              companyId: selectedCompany,
              year,
              adjustedDays
            })
          });
        }
      })
    );
    setEditingEmployee(null);
    setEditingLeaveDays({});
    // Optionally, refetch employees to update UI
  };

  // Handle file import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      // In a real app, parse the CSV/Excel file and show preview
      // No fallback or mock data
      setImportPreview([]);
      setShowImportModal(true);
    }
  };

  // Handle import confirmation
  const confirmImport = () => {
    // In a real app, this would call an API to update the leave data
    setShowImportModal(false);
    setImportFile(null);
    setImportPreview([]);
  };

  // Fetch employees for selected company
  useEffect(() => {
    if (!selectedCompany) return;
    setLoadingEmployees(true);
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch employees (all users) for the company
        const res = await fetch(`http://localhost:4000/super-admin/users/company/${selectedCompany}/employees`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch employees');
        const employeesData = await res.json();
        // In fetchEmployees, use the leaveTypes from the backend response for each employee
        setEmployees(
          employeesData.map((emp: any) => ({
            id: emp.id,
            name: `${emp.first_name} ${emp.last_name}`,
            idNumber: emp.national_id || '',
            leaveTypes: emp.leaveTypes || [] // Use backend-provided leaveTypes
          }))
        );
      } catch (err) {
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, [selectedCompany, leaveTypes]);

  // Fetch leave types for selected company
  useEffect(() => {
    if (!selectedCompany) return;
    setLoadingLeaveTypes(true);
    const fetchLeaveTypes = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch leave types for the selected company using the new super admin endpoint
        const res = await fetch(`http://localhost:4000/super-admin/users/company/${selectedCompany}/leave-types`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch leave types');
        const leaveTypesData = await res.json();
        setLeaveTypes(leaveTypesData);
      } catch (err) {
        setLeaveTypes([]);
      } finally {
        setLoadingLeaveTypes(false);
      }
    };
    fetchLeaveTypes();
  }, [selectedCompany]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leave Adjustments</h1>
          <p className="text-muted-foreground">
            Manage leave adjustments for employees across companies
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'companies' && (
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
          {activeTab === 'employees' && selectedCompany && (
            <Button variant="outline" size="sm" onClick={() => setActiveTab('companies')}>
              Back to Companies
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="companies" disabled={activeTab !== 'companies'}>
            Companies
          </TabsTrigger>
          {selectedCompany && (
            <TabsTrigger value="employees" disabled={activeTab !== 'employees'}>
              {companies.find(c => c.id === selectedCompany)?.name || 'Employees'}
              <ChevronRight className="ml-1 h-4 w-4" />
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="companies" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search companies..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingCompanies ? (
                    <TableRow><TableCell colSpan={4}>Loading companies...</TableCell></TableRow>
                  ) : filteredCompanies.length === 0 ? (
                    <TableRow><TableCell colSpan={4}>No companies found.</TableCell></TableRow>
                  ) : filteredCompanies.map((company) => (
                    <TableRow key={company.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>
                        {company.employee_count} employees
                      </TableCell>
                      <TableCell>{company.lastUpdated}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCompanySelect(company.id)}
                        >
                          View Employees <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search employees..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => {}}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button size="sm" onClick={() => setShowImportModal(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import Adjustments
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>ID Number</TableHead>
                    {leaveTypes.length > 0 ? (
                      leaveTypes.map((lt, idx) => (
                        <TableHead key={lt.name + idx}>{lt.name}</TableHead>
                      ))
                    ) : (
                      <TableHead>No leave types created yet</TableHead>
                    )}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingEmployees ? (
                    <TableRow><TableCell colSpan={4 + leaveTypes.length}>Loading employees...</TableCell></TableRow>
                  ) : employees.length === 0 ? (
                    <TableRow><TableCell colSpan={4 + leaveTypes.length}>No employees found for this company.</TableCell></TableRow>
                  ) : employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedEmployees.includes(employee.id)}
                          onCheckedChange={() => toggleEmployeeSelection(employee.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.idNumber}</TableCell>
                      {leaveTypes.length > 0 ? (
                        leaveTypes.map((lt, idx) => (
                          <TableCell key={lt.name + idx}>
                            {editingEmployee === employee.id ? (
                              <Input
                                type="number"
                                min={0}
                                value={editingLeaveDays[lt.name] ?? 0}
                                onChange={e => setEditingLeaveDays({ ...editingLeaveDays, [lt.name]: Number(e.target.value) })}
                                className="w-20"
                              />
                            ) : (
                              `${employee.leaveTypes.find((eLt: any) => eLt.type === lt.name)?.remaining ?? 0} days`
                            )}
                          </TableCell>
                        ))
                      ) : (
                        <TableCell>No leave types created yet</TableCell>
                      )}
                      <TableCell className="text-right">
                        {editingEmployee === employee.id ? (
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setEditingEmployee(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={saveEmployeeData}
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditEmployee(employee)}
                          >
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl">
            <CardHeader>
              <CardTitle>Import Leave Adjustments</CardTitle>
              <CardDescription>
                Upload a CSV or Excel file with employee leave data. The file should include columns for employee name, ID number, and leave balances.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="mb-2">
                  <label 
                    htmlFor="file-upload" 
                    className="relative cursor-pointer font-medium text-primary hover:text-primary/90"
                  >
                    <span>Upload a file</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only" 
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                    />
                  </label>
                  {' '}or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  CSV or Excel file up to 10MB
                </p>
              </div>

              {importPreview.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Preview (first 2 rows)</h4>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>ID Number</TableHead>
                          <TableHead>Annual Leave</TableHead>
                          <TableHead>Sick Leave</TableHead>
                          <TableHead>Compassionate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importPreview.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.idNumber}</TableCell>
                            <TableCell>{row.annualLeave}</TableCell>
                            <TableCell>{row.sickLeave}</TableCell>
                            <TableCell>{row.compassionateLeave}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
            <div className="flex items-center justify-between p-6 pt-0">
              <Button variant="outline" onClick={() => setShowImportModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmImport}
                disabled={importPreview.length === 0}
              >
                Confirm Import
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
