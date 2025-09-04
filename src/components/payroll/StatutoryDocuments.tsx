import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Clock,
  Lock
} from 'lucide-react';
import { calculatePAYE, calculateSHIF, calculateNSSF, calculateHousingLevy } from './payrollCalculations';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { BACKEND_URL } from '@/lib/config';

// Mock utility function for formatting currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2
  }).format(amount);
};

// Mock utility function for formatting dates
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

interface StatutoryDocumentsProps {
  statutoryData: {
    paye: number;
    nhif: number;
    nssf: number;
    totalDeductions: number;
    lastFilingDate: Date;
    nextFilingDate: Date;
  };
}

interface StatutoryPaymentStatus {
  canInitiate: boolean;
  message: string;
}

export function StatutoryDocuments({ statutoryData }: StatutoryDocumentsProps) {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('5'); // May
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  
  // Real-time statutory totals
  const [totals, setTotals] = useState({ paye: 0, shif: 0, nssf: 0, housingLevy: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'paye' | 'shif' | 'nssf' | 'housingLevy'>('paye');
  const [departmentsMap, setDepartmentsMap] = useState<{ [key: string]: string }>({});
  const [statutoryPayments, setStatutoryPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [initiating, setInitiating] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<StatutoryPaymentStatus>({ canInitiate: true, message: '' });
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Check statutory payment status for current month/year
  const checkStatutoryPaymentStatus = async () => {
    try {
      setCheckingStatus(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${BACKEND_URL}/company-admin/payroll/statutory/status?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPaymentStatus(data);
      }
    } catch (error) {
      console.error('Error checking statutory payment status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Fetch and calculate statutory data based on selected month/year
    const fetchAndCalculateStatutory = async () => {
    try {
      setLoading(true);
        const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch departments for mapping
      const deptRes = await fetch(`${BACKEND_URL}/company-admin/departments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      const deptData = await deptRes.json();
        const deptMap: { [key: string]: string } = {};
        if (Array.isArray(deptData)) {
          deptData.forEach((dept: any) => {
            deptMap[dept.id] = dept.name;
          });
        }
        setDepartmentsMap(deptMap);

        // Fetch employees
      const empRes = await fetch(`${BACKEND_URL}/company-admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      const empData = await empRes.json();

        let paye = 0, shif = 0, nssf = 0, housingLevy = 0;
        const realEmployees: any[] = [];

        if (Array.isArray(empData)) {
          empData.filter((emp: any) => emp.status === 'active' && emp.role !== 'admin').forEach((emp: any) => {
            let basicSalary = parseFloat(emp.basic_salary) || 0;
            let allowances = 0;
            let paymentFrequency = emp.payment_frequency || 'monthly';
            if (paymentFrequency === 'yearly') {
              basicSalary = basicSalary / 12;
            }
            const adjustedGrossSalary = basicSalary + allowances;
            const nssfVal = calculateNSSF(adjustedGrossSalary);
            const shifVal = calculateSHIF(adjustedGrossSalary);
            const housingLevyVal = calculateHousingLevy(adjustedGrossSalary);
            const payeVal = calculatePAYE(adjustedGrossSalary, nssfVal);
            paye += payeVal;
            shif += shifVal;
            nssf += nssfVal;
            housingLevy += housingLevyVal;
            realEmployees.push({
              id: emp.id,
              name: `${emp.first_name} ${emp.last_name}`,
              department: deptMap[emp.department_id] || 'Unknown',
              position: emp.role || 'Staff',
              paye: payeVal,
              shif: shifVal,
              nssf: nssfVal,
              housingLevy: housingLevyVal,
            });
          });
        }
        setTotals({ paye, shif, nssf, housingLevy, total: paye + shif + nssf + housingLevy });
        setEmployees(realEmployees);
      } catch (err) {
        setTotals({ paye: 0, shif: 0, nssf: 0, housingLevy: 0, total: 0 });
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchAndCalculateStatutory();
    checkStatutoryPaymentStatus();
  }, [selectedMonth, selectedYear]);

  // Fetch statutory payments for selected period
  const fetchStatutoryPayments = async () => {
    setLoadingPayments(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const res = await fetch(`${BACKEND_URL}/company-admin/payroll/statutory/payments?month=${selectedMonth}&year=${selectedYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch statutory payments');
      const data = await res.json();
      setStatutoryPayments(data.payments || []);
    } catch (err) {
      setStatutoryPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    fetchStatutoryPayments();
    checkStatutoryPaymentStatus();
  }, [selectedMonth, selectedYear]);

  // Initiate statutory payment with restrictions
  const handleInitiateStatutoryPayment = async () => {
    // Check if payments can be initiated
    if (!paymentStatus.canInitiate) {
      toast.error('Cannot Initiate Payments', {
        description: paymentStatus.message,
        duration: 5000
      });
      return;
    }

    setInitiating(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      
      const res = await fetch(`${BACKEND_URL}/company-admin/payroll/statutory/initiate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          month: parseInt(selectedMonth),
          year: parseInt(selectedYear)
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to initiate statutory payments');
      }

      const data = await res.json();
      if (data.success) {
        setStatutoryPayments(data.payments);
        toast.success('Statutory Payments Initiated', {
          description: `PAYE, NSSF, SHIF, and Housing Levy payments for ${selectedMonth}/${selectedYear} have been initiated`,
          duration: 5000
        });
        
        // Update payment status
        setPaymentStatus({
          canInitiate: false,
          message: `Statutory payments for ${selectedMonth}/${selectedYear} have already been initiated`
        });
      }
    } catch (error) {
      console.error('Error initiating statutory payments:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('already been initiated')) {
        toast.error('Payments Already Initiated', {
          description: 'Statutory payments for this period have already been initiated or paid',
          duration: 5000
        });
        // Refresh status
        checkStatutoryPaymentStatus();
      } else if (errorMessage.includes('Insufficient wallet balance')) {
        toast.error('Insufficient Balance', {
          description: 'Your company wallet does not have enough funds to initiate statutory payments',
          duration: 5000
        });
      } else {
        toast.error('Failed to Initiate Payments', {
          description: errorMessage,
          duration: 5000
        });
      }
    } finally {
      setInitiating(false);
    }
  };

  // Download PDF statement for a statutory payment
  const handleDownloadPaymentStatement = async (paymentId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch(`${BACKEND_URL}/company-admin/payroll/statutory/payment/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;
    const payment = await res.json();
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    let y = 40;
    doc.setFontSize(20);
    doc.setTextColor(41, 98, 255);
    doc.text('BlueHR Statutory Payment Statement', 40, y);
    doc.setFontSize(13);
    doc.setTextColor(60, 60, 60);
    doc.text(payment.deduction_type + ' Payment', 40, y + 22);
    y += 50;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Deduction:', 50, y); doc.text(payment.deduction_type, 150, y);
    y += 20;
    doc.text('Description:', 50, y); doc.text(payment.description || '', 150, y);
    y += 20;
    doc.text('Amount:', 50, y); doc.text(formatCurrency(payment.amount), 150, y);
    y += 20;
    doc.text('Due Date:', 50, y); doc.text(payment.due_date ? String(payment.due_date).slice(0, 10) : '', 150, y);
    y += 20;
    doc.text('Paid At:', 50, y); doc.text(payment.paid_at ? String(payment.paid_at).slice(0, 19).replace('T', ' ') : '', 150, y);
    y += 20;
    doc.text('Status:', 50, y); doc.text(payment.status, 150, y);
    y += 40;
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text('This is a computer-generated document. No signature is required.', 300, 820, { align: 'center' });
    doc.save(`statutory_payment_${payment.deduction_type}_${payment.id}.pdf`);
  };

  // PDF export function for the current tab
  const handleDownloadPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    let y = 40;
    doc.setFontSize(20);
    doc.setTextColor(41, 98, 255);
    doc.text('BlueHR Statutory Deductions', 40, y);
    doc.setFontSize(13);
    doc.setTextColor(60, 60, 60);
    doc.text(
      activeTab === 'paye' ? 'PAYE (KRA) Deductions' :
      activeTab === 'shif' ? 'SHIF Deductions' :
      activeTab === 'nssf' ? 'NSSF Deductions' :
      'Housing Levy Deductions',
      40, y + 22
    );
    y += 50;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    // Table header with more spacing
    const colX = [50, 220, 370, 520]; // Employee, Department, Role, Deduction
    doc.setFillColor(240, 240, 240);
    doc.rect(40, y, 500, 24, 'F');
    doc.text('Employee', colX[0], y + 16);
    doc.text('Department', colX[1], y + 16);
    doc.text('Role', colX[2], y + 16);
    doc.text(
      activeTab === 'paye' ? 'PAYE' :
      activeTab === 'shif' ? 'SHIF' :
      activeTab === 'nssf' ? 'NSSF' :
      'Housing Levy',
      colX[3], y + 16
    );
    y += 32;
    employees.forEach((emp, idx) => {
      // Alternating row background
      if (idx % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(40, y - 12, 500, 22, 'F');
      }
      doc.setTextColor(0, 0, 0);
      doc.text(emp.name, colX[0], y);
      doc.text(String(emp.department), colX[1], y);
      doc.text(String(emp.position), colX[2], y);
      let value = 0;
      if (activeTab === 'paye') value = emp.paye;
      if (activeTab === 'shif') value = emp.shif;
      if (activeTab === 'nssf') value = emp.nssf;
      if (activeTab === 'housingLevy') value = emp.housingLevy;
      doc.setTextColor(41, 98, 255);
      doc.text(formatCurrency(value), colX[3], y);
      doc.setTextColor(0, 0, 0);
      y += 22;
      if (y > 750) {
        doc.addPage();
        y = 40;
      }
    });
    doc.save(`statutory_${activeTab}_deductions.pdf`);
  };

  // Mock statutory documents
  const statutoryDocuments = [
    {
      id: 1,
      name: 'PAYE Returns',
      description: 'Monthly PAYE tax returns for KRA',
      dueDate: new Date('2025-06-09'),
      status: 'pending',
      amount: statutoryData.paye
    },
    {
      id: 2,
      name: 'NHIF Contributions',
      description: 'Monthly National Hospital Insurance Fund contributions',
      dueDate: new Date('2025-06-09'),
      status: 'pending',
      amount: statutoryData.nhif
    },
    {
      id: 3,
      name: 'NSSF Contributions',
      description: 'Monthly National Social Security Fund contributions',
      dueDate: new Date('2025-06-15'),
      status: 'pending',
      amount: statutoryData.nssf
    },
    {
      id: 4,
      name: 'PAYE Returns',
      description: 'Monthly PAYE tax returns for KRA',
      dueDate: new Date('2025-05-09'),
      status: 'completed',
      amount: 125000,
      filingDate: new Date('2025-05-07')
    },
    {
      id: 5,
      name: 'NHIF Contributions',
      description: 'Monthly National Hospital Insurance Fund contributions',
      dueDate: new Date('2025-05-09'),
      status: 'completed',
      amount: 23500,
      filingDate: new Date('2025-05-07')
    },
    {
      id: 6,
      name: 'NSSF Contributions',
      description: 'Monthly National Social Security Fund contributions',
      dueDate: new Date('2025-05-15'),
      status: 'completed',
      amount: 42000,
      filingDate: new Date('2025-05-07')
    }
  ];
  
  // Mock P9 forms data
  const p9FormsData = [
    {
      id: 1,
      employeeId: 'EMP001',
      employeeName: 'John Kamau',
      taxYear: '2024',
      status: 'available',
      generatedDate: new Date('2025-01-15')
    },
    {
      id: 2,
      employeeId: 'EMP002',
      employeeName: 'Mary Wanjiku',
      taxYear: '2024',
      status: 'available',
      generatedDate: new Date('2025-01-15')
    },
    {
      id: 3,
      employeeId: 'EMP003',
      employeeName: 'James Omondi',
      taxYear: '2024',
      status: 'available',
      generatedDate: new Date('2025-01-15')
    }
  ];
  
  // Filter documents based on selected month and year
  const filteredDocuments = statutoryDocuments.filter(doc => {
    const docMonth = doc.dueDate.getMonth() + 1; // JavaScript months are 0-indexed
    const docYear = doc.dueDate.getFullYear();
    
    return docMonth.toString() === selectedMonth && docYear.toString() === selectedYear;
  });
  
  // Get status badge variant and icon
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { 
          variant: 'success' as const, 
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
          text: 'Completed'
        };
      case 'pending':
        return { 
          variant: 'outline' as const, 
          icon: <Clock className="h-4 w-4 mr-1" />,
          text: 'Pending'
        };
      case 'overdue':
        return { 
          variant: 'danger' as const, 
          icon: <AlertCircle className="h-4 w-4 mr-1" />,
          text: 'Overdue'
        };
      default:
        return { 
          variant: 'outline' as const, 
          icon: null,
          text: status
        };
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Statutory Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">PAYE (KRA)</p>
                <p className="text-2xl font-bold">{loading ? 'Loading...' : formatCurrency(totals.paye)}</p>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Due by {formatDate(new Date('2025-06-09'))}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                <FileText className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">SHIF</p>
                <p className="text-2xl font-bold">{loading ? 'Loading...' : formatCurrency(totals.shif)}</p>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Due by {formatDate(new Date('2025-06-09'))}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center">
                <FileText className="h-7 w-7 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">NSSF</p>
                <p className="text-2xl font-bold">{loading ? 'Loading...' : formatCurrency(totals.nssf)}</p>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Due by {formatDate(new Date('2025-06-15'))}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-pink-100 flex items-center justify-center">
                <FileText className="h-7 w-7 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Housing Levy</p>
                <p className="text-2xl font-bold">{loading ? 'Loading...' : formatCurrency(totals.housingLevy)}</p>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Due by {formatDate(new Date('2025-06-09'))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <select 
            className="border border-gray-300 rounded-md px-3 py-1.5"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
          <select 
            className="border border-gray-300 rounded-md px-3 py-1.5"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>
      </div>
      
      {/* Monthly Statutory Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Monthly Statutory Documents</CardTitle>
          {/* <Button onClick={handleInitiateStatutoryPayment} disabled={initiating || !paymentStatus.canInitiate || checkingStatus} variant={paymentStatus.canInitiate ? 'default' : 'outline'}>
            {initiating ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Initiating...
              </>
            ) : !paymentStatus.canInitiate ? (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Already Initiated
              </>
            ) : (
              <>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Initiate Payments
              </>
            )}
          </Button> */}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingPayments ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">Loading...</TableCell>
                </TableRow>
              ) : statutoryPayments.length > 0 ? (
                statutoryPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.deduction_type}</TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell>{payment.due_date ? String(payment.due_date).slice(0, 10) : ''}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell><Badge variant={payment.status === 'paid' ? 'success' : 'outline'}>
                      {payment.status}
                    </Badge></TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadPaymentStatement(payment.id)}>
                        <Download className="h-4 w-4 mr-1" /> Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                    No statutory payments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* P9 Forms Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>P9 Tax Forms</CardTitle>
          <Button>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Generate P9 Forms
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select 
              className="border border-gray-300 rounded-md px-3 py-1.5 w-full md:w-64"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="all">All Employees</option>
              <option value="EMP001">John Kamau</option>
              <option value="EMP002">Mary Wanjiku</option>
              <option value="EMP003">James Omondi</option>
            </select>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Tax Year</TableHead>
                <TableHead>Generated Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {p9FormsData
                .filter(form => selectedEmployee === 'all' || form.employeeId === selectedEmployee)
                .map((form) => (
                  <TableRow key={form.id}>
                    <TableCell className="font-medium">{form.employeeName}</TableCell>
                    <TableCell>{form.taxYear}</TableCell>
                    <TableCell>{formatDate(form.generatedDate)}</TableCell>
                    <TableCell>
                      <Badge variant="success" className="flex items-center w-fit">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Available
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" /> Download P9
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Payment Status Alert */}
      {!paymentStatus.canInitiate && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800">{paymentStatus.message}</p>
          </div>
        </div>
      )}
      
      {/* Statutory Tabs */}
      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)} className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="paye">PAYE</TabsTrigger>
          <TabsTrigger value="shif">SHIF</TabsTrigger>
          <TabsTrigger value="nssf">NSSF</TabsTrigger>
          <TabsTrigger value="housingLevy">Housing Levy</TabsTrigger>
        </TabsList>
        <TabsContent value="paye">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>PAYE Deductions</CardTitle>
              <Button onClick={handleDownloadPDF} variant="outline">Download PDF</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>PAYE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map(emp => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.position}</TableCell>
                      <TableCell className="text-blue-600 font-semibold">{formatCurrency(emp.paye)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="shif">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>SHIF Deductions</CardTitle>
              <Button onClick={handleDownloadPDF} variant="outline">Download PDF</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>SHIF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map(emp => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.position}</TableCell>
                      <TableCell className="text-green-600 font-semibold">{formatCurrency(emp.shif)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="nssf">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>NSSF Deductions</CardTitle>
              <Button onClick={handleDownloadPDF} variant="outline">Download PDF</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>NSSF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map(emp => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.position}</TableCell>
                      <TableCell className="text-amber-600 font-semibold">{formatCurrency(emp.nssf)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="housingLevy">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Housing Levy Deductions</CardTitle>
              <Button onClick={handleDownloadPDF} variant="outline">Download PDF</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Housing Levy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map(emp => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.position}</TableCell>
                      <TableCell className="text-pink-600 font-semibold">{formatCurrency(emp.housingLevy)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
