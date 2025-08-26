import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  CreditCard, 
  Receipt, 
  ArrowUpRight,
  Calendar,
  DollarSign,
  Users,
  Clock,
  FileSpreadsheet
} from 'lucide-react';
import { CompanyWalletManager } from '@/components/payroll/CompanyWalletManager';
import { StatutoryDocuments } from '@/components/payroll/StatutoryDocuments';
import { PayrollScheduler } from '@/components/payroll/PayrollScheduler';
import { PayrollEmployeeList } from '@/components/payroll/PayrollEmployeeList';
import { AdvanceManagement } from '@/components/payroll/AdvanceManagement';
import { PayrollProcessor } from '@/components/payroll/PayrollProcessor';
import { MasterPayroll } from '@/components/payroll/MasterPayroll';
import { calculatePAYE, calculateSHIF, calculateNSSF, calculateHousingLevy } from '@/components/payroll/payrollCalculations';
import { BACKEND_URL } from '@/lib/config';
import { PayrollSummaryWidget } from '@/components/dashboard/PayrollSummaryWidget';





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

export function PayrollManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Advance settings state
  const [advanceSettings, setAdvanceSettings] = useState({
    autoApprove: false,
    adminApproval: true,
    advanceSource: 'company_wallet' as 'company_wallet' | 'blueHR'
  });
  
  // Real-time company wallet data from backend
  const [companyWallet, setCompanyWallet] = useState({
    balance: 0,
    pendingPayroll: 0,
    remainingAfterPayroll: 0,
    lastDeposit: {
      amount: 0,
      date: new Date()
    }
  });
  
  // Load advance settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('advanceSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setAdvanceSettings(parsedSettings);
      } catch (error) {
        console.error('Error parsing advance settings:', error);
      }
    }
  }, []);
  
  // Mock payroll summary data
  const payrollSummary = {
    totalEmployees: 48,
    totalSalary: 850000,
    averageSalary: 17708.33,
    highestSalary: 85000,
    lowestSalary: 12000,
    nextPayrollDate: new Date('2025-06-25'),
    payrollProcessingStatus: 'Scheduled'
  };

  // Fetch wallet data from backend
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          return;
        }
        
        // Extract company ID from JWT token
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const companyId = tokenPayload.company_id;
        
        if (!companyId) {
          console.error('No company ID found in token');
          return;
        }
        
        console.log('Fetching wallet data for company ID:', companyId);
        
        // Fetch wallet data from backend using company admin endpoint
        const response = await fetch(`${BACKEND_URL}/company-admin/wallet`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch wallet data: ${response.status} ${response.statusText}`);
        }
        
        const walletData = await response.json();
        console.log('Received wallet data:', walletData);
        
        // Update wallet state with real data
        setCompanyWallet({
          balance: parseFloat(walletData.balance) || 0,
          // These values would ideally come from the backend too
          // For now, we're calculating them based on payroll summary
          pendingPayroll: payrollSummary.totalSalary,
          remainingAfterPayroll: (parseFloat(walletData.balance) || 0) - payrollSummary.totalSalary,
          lastDeposit: {
            amount: 500000, // This would ideally come from transaction history
            date: new Date(walletData.updated_at || Date.now())
          }
        });
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        // Don't fallback to mock data, show actual zero balance if there's an error
        setCompanyWallet({
          balance: 0,
          pendingPayroll: payrollSummary.totalSalary,
          remainingAfterPayroll: -payrollSummary.totalSalary,
          lastDeposit: {
            amount: 0,
            date: new Date()
          }
        });
      }
    };
    
    fetchWalletData();
    
    // Refresh wallet data every 5 seconds to ensure real-time updates
    const intervalId = setInterval(fetchWalletData, 5000);
    
    return () => clearInterval(intervalId);
  }, [payrollSummary.totalSalary]); // Add payrollSummary.totalSalary as dependency
  
  // Mock statutory data
  const statutorySummary = {
    paye: 127500,
    nhif: 24000,
    nssf: 42500,
    totalDeductions: 194000,
    lastFilingDate: new Date('2025-05-15'),
    nextFilingDate: new Date('2025-06-15')
  };

  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [realSummary, setRealSummary] = useState({
    totalEmployees: 0,
    totalPayroll: 0,
    averageSalary: 0,
    statutoryDeductions: 0
  });

  // Fetch employees and departments, then calculate real summary
  useEffect(() => {
    const fetchEmployeesAndDepartments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        // Fetch departments
        const deptRes = await fetch(`${BACKEND_URL}/company-admin/departments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const deptData = await deptRes.json();
        setDepartments(deptData);
        // Fetch employees
        const empRes = await fetch(`${BACKEND_URL}/company-admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const empData = await empRes.json();
        const filtered = Array.isArray(empData) ? empData.filter((e: any) => e.role !== 'admin') : [];
        setEmployees(filtered);
        // Calculate payroll and statutory deductions
        let totalPayroll = 0;
        let totalEmployees = filtered.length;
        let totalPAYE = 0, totalSHIF = 0, totalNSSF = 0, totalHousingLevy = 0;
        filtered.forEach(emp => {
          let basicSalary = parseFloat(emp.basic_salary) || 0;
          let allowances = 0;
          let paymentFrequency = emp.payment_frequency || 'monthly';
          if (paymentFrequency === 'yearly') basicSalary = basicSalary / 12;
          const gross = basicSalary + allowances;
          const nssfVal = calculateNSSF(gross);
          const shifVal = calculateSHIF(gross);
          const housingLevyVal = calculateHousingLevy(gross);
          const payeVal = calculatePAYE(gross, nssfVal);
          totalPAYE += payeVal;
          totalSHIF += shifVal;
          totalNSSF += nssfVal;
          totalHousingLevy += housingLevyVal;
          const netPay = gross - (payeVal + shifVal + nssfVal + housingLevyVal);
          totalPayroll += netPay;
        });
        setRealSummary({
          totalEmployees,
          totalPayroll,
          averageSalary: totalEmployees > 0 ? totalPayroll / totalEmployees : 0,
          statutoryDeductions: totalPAYE + totalSHIF + totalNSSF + totalHousingLevy
        });
      } catch (err) {
        setEmployees([]);
        setDepartments([]);
        setRealSummary({ totalEmployees: 0, totalPayroll: 0, averageSalary: 0, statutoryDeductions: 0 });
      }
    };
    fetchEmployeesAndDepartments();
  }, []);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header Section - Mobile Responsive */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-gray-500">Manage payroll processing, employee payments, and company wallet.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <Button variant="outline" asChild>
            <Link to="/admin/settings">
              <CreditCard className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Settings</span>
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/payroll-reports">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Generate Reports</span>
              <span className="sm:hidden">Reports</span>
            </Link>
          </Button>
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Schedule Payroll</span>
            <span className="sm:hidden">Schedule</span>
          </Button>
        </div>
      </div>

      {/* Payroll Summary Cards - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Company Wallet</p>
                <p className="text-2xl font-semibold">{formatCurrency(companyWallet.balance)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-gray-500">
              <Calendar className="mr-2 h-4 w-4" />
              Last deposit: {formatDate(companyWallet.lastDeposit.date)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Employees</p>
                <p className="text-2xl font-semibold">{realSummary.totalEmployees}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-gray-500">
              <DollarSign className="mr-2 h-4 w-4" />
              Avg. Salary: {formatCurrency(realSummary.averageSalary)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Payroll</p>
                <p className="text-2xl font-semibold">{formatCurrency(realSummary.totalPayroll)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-gray-500">
              <Clock className="mr-2 h-4 w-4" />
              Next payroll: {formatDate(payrollSummary.nextPayrollDate)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Statutory Deductions</p>
                <p className="text-2xl font-semibold">{formatCurrency(realSummary.statutoryDeductions)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-gray-500">
              <Calendar className="mr-2 h-4 w-4" />
              Next filing: {formatDate(payrollSummary.nextPayrollDate)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-7 md:w-[840px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="master">Master Payroll</TabsTrigger>
          <TabsTrigger value="wallet">Company Wallet</TabsTrigger>
          <TabsTrigger value="statutory">Statutory</TabsTrigger>
          <TabsTrigger value="advances">Advances</TabsTrigger>
        </TabsList>

        {/* Tab content with our components */}
        <TabsContent value="overview" className="space-y-4">
          <PayrollSummaryWidget />
          <PayrollScheduler payrollData={payrollSummary} />
        </TabsContent>

        
        <TabsContent value="employees" className="space-y-4">
          <PayrollEmployeeList 
            payrollMonth="June"
            payrollYear={2025}
            totalEmployees={payrollSummary.totalEmployees}
          />
        </TabsContent>
        
        <TabsContent value="payroll" className="space-y-4">
          <PayrollProcessor 
            payrollMonth="June" 
            payrollYear={2025} 
          />
        </TabsContent>
        
        <TabsContent value="master" className="space-y-4">
          <MasterPayroll />
        </TabsContent>
        
        <TabsContent value="wallet" className="space-y-4">
          <CompanyWalletManager walletData={companyWallet} />
        </TabsContent>
        
        <TabsContent value="statutory" className="space-y-4">
          <StatutoryDocuments statutoryData={statutorySummary} />
        </TabsContent>
        
        <TabsContent value="advances" className="space-y-4">
          <AdvanceManagement advanceSettings={advanceSettings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
