import { useState, useEffect, useMemo } from 'react';
import { calculatePAYE, calculateSHIF, calculateNSSF, calculateHousingLevy } from './payrollCalculations';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Filter, Search, Save, Edit, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { EditPayrollModal } from './EditPayrollModal';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BACKEND_URL } from '@/lib/config';

// Format currency utility
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2
  }).format(amount);
};

// Define payment frequency types
type PaymentFrequencyFilter = 'all' | 'hourly' | 'weekly' | 'monthly' | 'yearly';

interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
  payment_frequency: string;
  basic_salary: number;
  paye: number;
  shif: number;
  nssf: number;
  housing_levy: number;
  allowances: number;
  deductions: number;
  net_pay: number;
  status: string;
  allowance_reason?: string;
  deduction_reason?: string;
  original_salary?: number;
  latenessDeduction?: number;
  earlyLeaveDeduction?: number;
}

interface PayrollStatus {
  status: 'not_processed' | 'processed' | 'processing' | 'failed';
  processedAt?: string;
  totalAmount?: number;
  employeeCount?: number;
}

interface PayrollProcessorProps {
  payrollMonth: string;
  payrollYear: number;
  onSaveAndRunLater?: (updatedEmployees: any[]) => void;
  onRunNow?: (updatedEmployees: any[]) => void;
  onClose?: () => void;
}

// Utility to convert month name (e.g., "June") or number string ("6") to number
function getMonthNumber(month: string | number): number {
  if (typeof month === 'number') return month;
  if (/^\d+$/.test(month)) return parseInt(month, 10);
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  const idx = months.indexOf(month.toLowerCase());
  return idx === -1 ? NaN : idx + 1;
}

// Fetch master payroll and return processedEmployees array
export async function fetchMasterPayroll(payrollMonth: number | string, payrollYear: number, paymentFrequency: string): Promise<any[]> {
  try {
    const token = localStorage.getItem('token');
    if (!token) return [];
    const monthNum = getMonthNumber(payrollMonth);
    if (isNaN(monthNum)) return [];
    const response = await fetch(
      `${BACKEND_URL}/company-admin/master-payroll?payrollMonth=${monthNum}&payrollYear=${payrollYear}&paymentFrequency=${paymentFrequency}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    if (response.ok) {
      const data = await response.json();
      return data.processedEmployees || [];
    }
  } catch (err) {
    // Optionally handle error
  }
  return [];
}

export function PayrollProcessor({ payrollMonth, payrollYear, onSaveAndRunLater, onRunNow, onClose }: PayrollProcessorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedFrequency, setSelectedFrequency] = useState<PaymentFrequencyFilter>('all');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayroll, setProcessingPayroll] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [payrollStatus, setPayrollStatus] = useState<PayrollStatus>({ status: 'not_processed' });
  const [checkingStatus, setCheckingStatus] = useState<boolean>(false);
  const [selectedPaymentFrequency, setSelectedPaymentFrequency] = useState<string>('monthly');

  // Check payroll processing status
  const checkPayrollStatus = async () => {
    try {
      setCheckingStatus(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${BACKEND_URL}/company-admin/payroll/status?payrollMonth=${getMonthNumber(payrollMonth)}&payrollYear=${payrollYear}&paymentFrequency=${selectedPaymentFrequency}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPayrollStatus(data);
      }
    } catch (error) {
      console.error('Error checking payroll status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Fetch employees and departments from backend
  useEffect(() => {
    const fetchDepartmentsAndEmployees = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }

        // First fetch departments to build the mapping
        const deptResponse = await fetch(`${BACKEND_URL}/company-admin/departments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!deptResponse.ok) {
          throw new Error(`Failed to fetch departments: ${deptResponse.status} ${deptResponse.statusText}`);
        }

        const deptData = await deptResponse.json();

        // Create department ID to name mapping
        const deptMap: { [key: string]: string } = {};
        if (Array.isArray(deptData)) {
          deptData.forEach((dept: any) => {
            deptMap[dept.id] = dept.name;
          });
        }

        // Now fetch employees
        const empResponse = await fetch(`${BACKEND_URL}/company-admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!empResponse.ok) {
          throw new Error(`Failed to fetch employees: ${empResponse.status} ${empResponse.statusText}`);
        }

        const empData = await empResponse.json();

        if (Array.isArray(empData)) {
          const employeeData: Employee[] = empData
            .filter((emp: any) => emp.role !== 'admin')
            .map((emp: any) => {
              const basicSalary = parseFloat(emp.basic_salary) || 0;
              const allowances = 0;
              const deductions = 0;
              const adjustedGrossSalary = basicSalary + allowances;

              const nssfContribution = calculateNSSF(adjustedGrossSalary);
              const shif = calculateSHIF(adjustedGrossSalary);
              const housingLevy = calculateHousingLevy(adjustedGrossSalary);
              const paye = calculatePAYE(adjustedGrossSalary, nssfContribution);

              const totalDeductions = paye + shif + nssfContribution + housingLevy + deductions;
              const netPay = adjustedGrossSalary - totalDeductions;

              const departmentName = deptMap[emp.department_id] || 'Unknown Department';

              let adjustedBasicSalary = basicSalary;
              let adjustedNetPay = netPay;
              let actualPaymentFrequency = emp.payment_frequency || 'monthly';
              let adjustedPaye = paye;
              let adjustedShif = shif;
              let adjustedNssfContribution = nssfContribution;
              let adjustedHousingLevy = housingLevy;

              if (actualPaymentFrequency === 'yearly') {
                adjustedBasicSalary = basicSalary / 12;
                const adjustedGrossSalary = adjustedBasicSalary + allowances;
                adjustedNssfContribution = calculateNSSF(adjustedGrossSalary);
                adjustedShif = calculateSHIF(adjustedGrossSalary);
                adjustedHousingLevy = calculateHousingLevy(adjustedGrossSalary);
                adjustedPaye = calculatePAYE(adjustedGrossSalary, adjustedNssfContribution);
                const adjustedTotalDeductions = adjustedPaye + adjustedShif + adjustedNssfContribution + adjustedHousingLevy + deductions;
                adjustedNetPay = adjustedGrossSalary - adjustedTotalDeductions;
              }

              return {
                id: emp.id,
                name: `${emp.first_name} ${emp.last_name}`,
                department: departmentName,
                position: emp.role || 'Staff',
                payment_frequency: actualPaymentFrequency,
                basic_salary: actualPaymentFrequency === 'yearly' ? adjustedBasicSalary : basicSalary,
                paye: actualPaymentFrequency === 'yearly' ? adjustedPaye : paye,
                shif: actualPaymentFrequency === 'yearly' ? adjustedShif : shif,
                nssf: actualPaymentFrequency === 'yearly' ? adjustedNssfContribution : nssfContribution,
                housing_levy: actualPaymentFrequency === 'yearly' ? adjustedHousingLevy : housingLevy,
                allowances: allowances,
                deductions: deductions,
                net_pay: actualPaymentFrequency === 'yearly' ? adjustedNetPay : netPay,
                status: 'pending',
                original_salary: basicSalary
              };
            });

          setEmployees(employeeData);

          // Fetch lateness/early leave from master payroll and merge into employees
          const attendanceMap = await fetchMasterPayroll(
            getMonthNumber(payrollMonth),
            payrollYear,
            selectedPaymentFrequency
          );
          // Map employee id to lateness/early leave
          const attendanceById: Record<number, { latenessDeduction?: number; earlyLeaveDeduction?: number }> = {};
          attendanceMap.forEach((emp: any) => {
            attendanceById[emp.id] = {
              latenessDeduction: emp.latenessDeduction || 0,
              earlyLeaveDeduction: emp.earlyLeaveDeduction || 0
            };
          });
          // Merge into employees
          const mergedEmployees = employeeData.map(emp => ({
            ...emp,
            latenessDeduction: attendanceById[emp.id]?.latenessDeduction || 0,
            earlyLeaveDeduction: attendanceById[emp.id]?.earlyLeaveDeduction || 0
          }));
          setEmployees(mergedEmployees);
        } else {
          setError('Invalid data format received from server');
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        setError('Failed to load employee data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentsAndEmployees();
    checkPayrollStatus();
  }, [payrollMonth, payrollYear, selectedPaymentFrequency]);

  // Modified handleProcessPayroll to support enhanced payroll system
  const handleProcessPayroll = async () => {
    if (onRunNow) {
      onRunNow(filteredEmployeesList);
      return;
    }

    // Check if payroll has already been processed successfully
    if (payrollStatus.status === 'processed') {
      toast.error('Payroll Already Processed', {
        description: `Payroll for ${payrollMonth} ${payrollYear} (${selectedPaymentFrequency}) has already been processed successfully on ${new Date(payrollStatus.processedAt!).toLocaleDateString()}`,
        duration: 5000
      });
      return;
    }

    try {
      setProcessingPayroll(true);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        setProcessingPayroll(false);
        return;
      }

      if (filteredEmployeesList.length === 0) {
        setError('No employees to process based on current filters');
        setProcessingPayroll(false);
        return;
      }

      // Send payroll data to backend for storage
      const response = await fetch(`${BACKEND_URL}/company-admin/payroll/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          payrollMonth,
          payrollYear,
          employees: filteredEmployeesList,
          paymentFrequency: selectedPaymentFrequency
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to process payroll: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update processed employees status to 'processed'
        const updatedEmployees = employees.map(emp => {
          const wasProcessed = filteredEmployeesList.some(filtered => filtered.id === emp.id);
          return {
            ...emp,
            status: wasProcessed ? 'processed' : emp.status
          };
        });

        setEmployees(updatedEmployees);

        // Update payroll status
        await checkPayrollStatus();

        toast.success('Payroll Processed Successfully!', {
          description: `Total amount: ${formatCurrency(data.totalAmount)} • ${data.employeeCount} employees processed`,
          duration: 5000
        });
      } else {
        toast.error('Failed to process payroll', {
          description: data.error || 'Unknown error',
          duration: 5000
        });
        setError('Failed to process payroll: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error processing payroll:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('already been processed successfully')) {
        toast.error('Payroll Already Processed', {
          description: 'This payroll period has already been processed successfully and cannot be processed again.',
          duration: 5000
        });
        // Refresh status
        checkPayrollStatus();
      } else if (errorMessage.includes('Insufficient wallet balance')) {
        toast.error('Insufficient Balance', {
          description: 'Your company wallet does not have enough funds to process payroll.',
          duration: 5000
        });
      } else {
        toast.error('Payroll Processing Failed', {
          description: errorMessage,
          duration: 5000
        });
      }

      setError('Failed to process payroll. Please try again.');
    } finally {
      setProcessingPayroll(false);
    }
  };

  // Generate payroll report
  const handleGenerateReport = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${BACKEND_URL}/company-admin/payroll/reports?reportType=${selectedPaymentFrequency}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.reports && data.reports.length > 0) {
          // Find the report for current period
          const currentReport = data.reports.find((report: any) => 
            report.report_period.includes(payrollMonth) && report.report_period.includes(payrollYear.toString())
          );
          
          if (currentReport) {
            toast.success('Report Generated', {
              description: `Payroll report for ${payrollMonth} ${payrollYear} (${selectedPaymentFrequency}) is available`,
              duration: 3000
            });
          } else {
            toast.info('No Report Available', {
              description: 'Generate payroll first to create a report',
              duration: 3000
            });
          }
        }
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    }
  };

  // New handler for Save and Run Later
  const handleSaveAndRunLater = () => {
    if (onSaveAndRunLater) {
      onSaveAndRunLater(filteredEmployeesList);
      return;
    }
  };

  // Filter employees based on search, department, and payment frequency
  const filteredEmployeesList = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;

      const matchesFrequency =
        selectedFrequency === 'all' ||
        (selectedFrequency === 'monthly' &&
          (employee.payment_frequency === 'monthly' || employee.payment_frequency === 'yearly')) ||
        employee.payment_frequency === selectedFrequency;

      return matchesSearch && matchesDepartment && matchesFrequency;
    });
  }, [employees, searchQuery, selectedDepartment, selectedFrequency]);

  // Calculate total payroll amount
  const totalPayrollAmount = useMemo(() => {
    return filteredEmployeesList.reduce((total, emp) => total + emp.net_pay, 0);
  }, [filteredEmployeesList]);

  // Get unique departments for filter
  const uniqueDepartments = ['all', ...new Set(employees.map(e => e.department))];

  // Get status badge
  const getStatusBadge = () => {
    switch (payrollStatus.status) {
      case 'processed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Processed</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="w-3 h-3 mr-1" />Not Processed</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            Process Payroll
            {getStatusBadge()}
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            {payrollMonth} {payrollYear} • {employees.length} employees
            {filteredEmployeesList.length > 0 && (
              <span className="ml-2">• Total Payroll: {formatCurrency(totalPayrollAmount)}</span>
            )}
            {payrollStatus.status === 'processed' && payrollStatus.processedAt && (
              <span className="ml-2">• Processed: {new Date(payrollStatus.processedAt).toLocaleDateString()}</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateReport}>
            <Download className="mr-2 h-4 w-4" />
            Generate Reports
          </Button>
          {onSaveAndRunLater && (
            <Button onClick={handleSaveAndRunLater} disabled={loading || employees.length === 0}>
              <Save className="mr-2 h-4 w-4" />
              Save and Run Later
            </Button>
          )}
          <Button 
            onClick={handleProcessPayroll} 
            disabled={loading || employees.length === 0 || processingPayroll || payrollStatus.status === 'processed'}
          >
            <Save className="mr-2 h-4 w-4" />
            {processingPayroll ? 'Processing...' : (onRunNow ? 'Run Now' : 'Process Payroll')}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>Close</Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading employees...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex gap-2 w-full md:w-auto">
                <Input 
                  placeholder="Search employees..." 
                  className="w-full md:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Payment Frequency Selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Payment Frequency:</label>
                <Select value={selectedPaymentFrequency} onValueChange={setSelectedPaymentFrequency}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <select
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>{dept === 'all' ? 'All Departments' : dept}</option>
                  ))}
                </select>
                
                <select 
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={selectedFrequency}
                  onChange={(e) => setSelectedFrequency(e.target.value as PaymentFrequencyFilter)}
                >
                  <option value="all">All Frequencies</option>
                  <option value="hourly">Hourly</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>
            
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>PAYE</TableHead>
                    <TableHead>SHIF</TableHead>
                    <TableHead>NSSF</TableHead>
                    <TableHead>Housing Levy</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployeesList.length > 0 ? (
                    filteredEmployeesList.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>{formatCurrency(employee.basic_salary)}</TableCell>
                        <TableCell className="text-red-600">{formatCurrency(employee.paye)}</TableCell>
                        <TableCell className="text-red-600">{formatCurrency(employee.shif)}</TableCell>
                        <TableCell className="text-red-600">{formatCurrency(employee.nssf)}</TableCell>
                        <TableCell className="text-red-600">{formatCurrency(employee.housing_levy)}</TableCell>
                        <TableCell className="text-green-600">{formatCurrency(employee.allowances)}</TableCell>
                        <TableCell className="text-red-600">{formatCurrency((employee.latenessDeduction || 0) + (employee.earlyLeaveDeduction || 0))}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(employee.net_pay)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-4">
                        No employees match the current filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="text-center text-gray-500 py-4">
                {loading ? 'Loading employees...' : filteredEmployeesList.length === 0 ? 'No employees match the current filters' : 'No employees found'}
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {/* Edit Payroll Modal */}
      {isEditModalOpen && selectedEmployee && (
        <EditPayrollModal
          employee={{
            ...selectedEmployee,
            payment_frequency: selectedEmployee.payment_frequency as 'hourly' | 'weekly' | 'monthly' | 'yearly'
          }}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updatedEmployee) => {
            setEmployees(employees.map(emp => 
              emp.id === updatedEmployee.id ? {
                ...updatedEmployee,
                payment_frequency: selectedEmployee.payment_frequency
              } : emp
            ));
            setIsEditModalOpen(false);
          }}
        />
      )}
    </Card>
  );
}
