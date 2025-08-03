import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Filter,
  Eye,
  FileText
} from 'lucide-react';
import { PayslipModal } from './PayslipModal';
import { BACKEND_URL } from '@/lib/config';

// Utility function for formatting currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2
  }).format(amount);
};

// Interfaces for payroll data from backend
interface PayrollHeader {
  id: number;
  payroll_month: string;
  payroll_year: number;
  created_at: string;
  employee_count: number;
  total_basic_salary: number;
  total_net_pay: number;
}

interface PayrollDetail {
  id: number;
  employee_id: number;
  employee_name: string;
  department_name: string;
  position: string;
  basic_salary: number;
  paye: number;
  shif: number;
  nssf: number;
  housing_levy: number;
  allowances: number;
  deductions: number;
  net_pay: number;
  allowance_reason: string;
  deduction_reason: string;
  payment_frequency: string;
  payroll_header_id: number;
  payroll_month: string;
  payroll_year: number;
}

interface PayrollEmployeeListProps {
  payrollMonth: string;
  payrollYear: number;
  totalEmployees: number;
}

export function PayrollEmployeeList({ payrollMonth, payrollYear, totalEmployees }: PayrollEmployeeListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // State for payroll data
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [payrollHistory, setPayrollHistory] = useState<PayrollHeader[]>([]);
  const [selectedPayrollId, setSelectedPayrollId] = useState<number | null>(null);
  const [payrollDetails, setPayrollDetails] = useState<PayrollDetail[]>([]);
  const [departmentsList, setDepartmentsList] = useState<string[]>(['all']);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  
  // State for payslip modal
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState<boolean>(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollDetail | null>(null);
  
  // Fetch payroll history when component mounts
  useEffect(() => {
    fetchPayrollHistory();
  }, []);
  
  // Fetch payroll history from backend
  const fetchPayrollHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/company-admin/payroll/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch payroll history');
      }
      
      const data = await response.json();
      
      // Handle the new response structure
      if (data.success && data.payrollHistory) {
        setPayrollHistory(data.payrollHistory);
        
        // If there is payroll history, select the most recent one
        if (data.payrollHistory.length > 0) {
          setSelectedPayrollId(data.payrollHistory[0].id);
          fetchPayrollDetails(data.payrollHistory[0].id);
        } else {
          setLoading(false);
        }
      } else if (Array.isArray(data)) {
        // Handle old response structure for backward compatibility
        setPayrollHistory(data);
        
        if (data.length > 0) {
          setSelectedPayrollId(data[0].id);
          fetchPayrollDetails(data[0].id);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };
  
  // Fetch payroll details for a specific payroll header
  const fetchPayrollDetails = async (payrollId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/company-admin/payroll/details/${payrollId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch payroll details');
      }
      
      const data = await response.json();
      
      // Handle the new response structure
      if (data.success && data.data && data.data.details) {
        const details = data.data.details.map((detail: any) => ({
          id: detail.id,
          employee_id: detail.employee_id,
          employee_name: `${detail.first_name} ${detail.last_name}`,
          department_name: detail.department_name || (detail.department_name === null ? 'No Department' : ''),
          position: detail.role || '',
          basic_salary: parseFloat(detail.basic_salary) || 0,
          paye: parseFloat(detail.paye) || 0,
          shif: parseFloat(detail.shif) || 0,
          nssf: parseFloat(detail.nssf) || 0,
          housing_levy: parseFloat(detail.housing_levy) || 0,
          allowances: parseFloat(detail.allowances) || 0,
          deductions: parseFloat(detail.deductions) || 0,
          net_pay: parseFloat(detail.net_pay) || 0,
          allowance_reason: detail.allowance_reason || '',
          deduction_reason: detail.deduction_reason || '',
          payment_frequency: detail.payment_frequency || 'monthly',
          payroll_header_id: detail.payroll_header_id,
          payroll_month: detail.payroll_month || payrollMonth,
          payroll_year: detail.payroll_year || payrollYear
        }));
        
        setPayrollDetails(details);
        
        // Extract unique departments for filtering
        const uniqueDepartments = ['all', ...new Set(details.map((item: PayrollDetail) => item.department_name || 'No Department'))];
        setDepartmentsList(uniqueDepartments as string[]);
      } else if (Array.isArray(data)) {
        // Handle old response structure for backward compatibility
        setPayrollDetails(data);
        
        // Extract unique departments for filtering
        const uniqueDepartments = ['all', ...new Set(data.map((item: PayrollDetail) => item.department_name || 'Unknown'))];
        setDepartmentsList(uniqueDepartments as string[]);
      } else {
        setPayrollDetails([]);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };
  
  // Filter payroll details based on search and filters
  const filteredPayrollDetails = payrollDetails.filter(employee => {
    // Search filter
    const matchesSearch = 
      employee.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (employee.department_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (employee.position || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Department filter
    const matchesDepartment = selectedDepartment === 'all' || employee.department_name === selectedDepartment;
    
    // Status filter - all payroll entries are considered 'paid'
    const matchesStatus = selectedStatus === 'all' || selectedStatus === 'paid';
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayrollDetails.slice(indexOfFirstItem, indexOfLastItem);
  
  // Handle page navigation
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Get payment status badge - all processed payroll entries are 'paid'
  const getStatusBadge = () => {
    return <Badge variant="success">Paid</Badge>;
  };
  
  // Open payslip modal with selected employee data
  const handleViewPayslip = (employee: PayrollDetail) => {
    setSelectedPayslip(employee);
    setIsPayslipModalOpen(true);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Payroll Employees - {payrollMonth} {payrollYear}</h3>
            <div className="text-sm text-muted-foreground">Total: {totalEmployees} employees</div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search employees..."
                className="w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                {departmentsList.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>PAYE</TableHead>
                  <TableHead>SHIF</TableHead>
                  <TableHead>NSSF</TableHead>
                  <TableHead>Housing Levy</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-4">
                      Loading payroll data...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-4 text-red-500">
                      Error: {error}
                    </TableCell>
                  </TableRow>
                ) : currentItems.length > 0 ? (
                  currentItems.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>{employee.employee_name}</TableCell>
                      <TableCell>{employee.department_name || 'N/A'}</TableCell>
                      <TableCell>{employee.position || 'N/A'}</TableCell>
                      <TableCell>{formatCurrency(employee.basic_salary)}</TableCell>
                      <TableCell>{formatCurrency(employee.paye)}</TableCell>
                      <TableCell>{formatCurrency(employee.shif)}</TableCell>
                      <TableCell>{formatCurrency(employee.nssf)}</TableCell>
                      <TableCell>{formatCurrency(employee.housing_levy)}</TableCell>
                      <TableCell>{formatCurrency(employee.allowances)}</TableCell>
                      <TableCell>{formatCurrency(employee.deductions)}</TableCell>
                      <TableCell>{formatCurrency(employee.net_pay)}</TableCell>
                      <TableCell>{getStatusBadge()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewPayslip(employee)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Payslip</span>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">Download Payslip</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-4">
                      No payroll data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {filteredPayrollDetails.length > itemsPerPage && (
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage * itemsPerPage >= filteredPayrollDetails.length}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Payslip Modal */}
      {isPayslipModalOpen && selectedPayslip && (
        <PayslipModal 
          isOpen={isPayslipModalOpen}
          onClose={() => setIsPayslipModalOpen(false)}
          payslipData={selectedPayslip}
        />
      )}
    </Card>
  );
}
