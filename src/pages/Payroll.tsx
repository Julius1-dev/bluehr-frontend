import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wallet, 
  Download, 
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Banknote,
  ReceiptText,
  Loader2
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TaxCalculator } from '@/components/payroll/TaxCalculator';
import { toast } from 'sonner';
import { BACKEND_URL } from '@/lib/config';

interface PayrollData {
  currentPay: {
    baseSalary: number;
    bonus: number;
    deductions: number;
    netPay: number;
    payDate: string;
  };
  paymentHistory: Array<{
    id: string;
    period: string;
    date: string;
    gross: number;
    net: number;
    status: string;
    paymentFrequency: string;
  }>;
  earnings: Array<{
    type: string;
    amount: number;
  }>;
  deductions: Array<{
    type: string;
    amount: number;
  }>;
  yearToDate: {
    earnings: number;
    tax: number;
    progress: number;
    annualTarget: number;
  };
  employee: {
    name: string;
    department: string;
    paymentFrequency: string;
  };
}

export function Payroll() {
  const [payrollData, setPayrollData] = useState<PayrollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch payroll data from backend
  useEffect(() => {
    const fetchPayrollData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${BACKEND_URL}/employee/payroll/data`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch payroll data');
        }

        const result = await response.json();
        if (result.success) {
          setPayrollData(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch payroll data');
        }
      } catch (err) {
        console.error('Error fetching payroll data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load payroll data');
        toast.error('Failed to load payroll data');
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollData();
  }, []);

  // Download payslip for current period
  const handleDownloadPayslip = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
      const currentYear = currentDate.getFullYear();

      const response = await fetch(
        `${BACKEND_URL}/employee/payroll/payslip/${currentMonth}/${currentYear}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error?.includes('not found')) {
          toast.error('No payslip available for current period');
        } else {
          toast.error('Failed to download payslip');
        }
        return;
      }

      const payslipData = await response.json();
      if (payslipData.success) {
        // Generate PDF content
        const payslip = payslipData.payslip;
        const pdfContent = `
          <html>
            <head>
              <title>Payslip - ${payslip.employee_name}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                .employee-info { margin-bottom: 20px; }
                .payslip-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .payslip-table th, .payslip-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .payslip-table th { background-color: #f2f2f2; }
                .total-row { font-weight: bold; background-color: #f9f9f9; }
                .deductions { color: #d32f2f; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>PAYSLIP</h1>
                <p>${payslip.payroll_month} ${payslip.payroll_year}</p>
              </div>
              
              <div class="employee-info">
                <h3>Employee Information</h3>
                <p><strong>Name:</strong> ${payslip.employee_name}</p>
                <p><strong>Department:</strong> ${payslip.department_name}</p>
                <p><strong>Position:</strong> ${payslip.position}</p>
                <p><strong>Payment Frequency:</strong> ${payslip.payment_frequency}</p>
              </div>
              
              <table class="payslip-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount (KES)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Basic Salary</td>
                    <td>${payslip.basic_salary.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Allowances</td>
                    <td>${payslip.allowances.toLocaleString()}</td>
                  </tr>
                  <tr class="total-row">
                    <td><strong>Gross Pay</strong></td>
                    <td><strong>${payslip.gross_pay.toLocaleString()}</strong></td>
                  </tr>
                  <tr class="deductions">
                    <td>PAYE</td>
                    <td>-${payslip.paye.toLocaleString()}</td>
                  </tr>
                  <tr class="deductions">
                    <td>NSSF</td>
                    <td>-${payslip.nssf.toLocaleString()}</td>
                  </tr>
                  <tr class="deductions">
                    <td>SHIF</td>
                    <td>-${payslip.shif.toLocaleString()}</td>
                  </tr>
                  <tr class="deductions">
                    <td>Housing Levy</td>
                    <td>-${payslip.housing_levy.toLocaleString()}</td>
                  </tr>
                  <tr class="deductions">
                    <td>Other Deductions</td>
                    <td>-${payslip.deductions.toLocaleString()}</td>
                  </tr>
                  <tr class="total-row">
                    <td><strong>Total Deductions</strong></td>
                    <td><strong>-${payslip.total_deductions.toLocaleString()}</strong></td>
                  </tr>
                  <tr class="total-row">
                    <td><strong>Net Pay</strong></td>
                    <td><strong>${payslip.net_pay.toLocaleString()}</strong></td>
                  </tr>
                </tbody>
              </table>
              
              <div style="margin-top: 30px;">
                <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Period:</strong> ${payslip.payroll_month} ${payslip.payroll_year}</p>
              </div>
            </body>
          </html>
        `;

        // Create blob and download
        const blob = new Blob([pdfContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payslip-${payslip.employee_name.replace(/\s+/g, '-')}-${payslip.payroll_month}-${payslip.payroll_year}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Payslip downloaded successfully');
      }
    } catch (error) {
      console.error('Error downloading payslip:', error);
      toast.error('Failed to download payslip');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading payroll data...</span>
        </div>
      </div>
    );
  }

  if (error || !payrollData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Failed to load payroll data'}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const { currentPay, paymentHistory, earnings, deductions, yearToDate, employee } = payrollData;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
        <h1 className="text-2xl font-bold">Payroll</h1>
          <p className="text-sm text-gray-500">
            {employee.name} • {employee.department} • {employee.paymentFrequency} payments
          </p>
        </div>
        <div className="flex gap-2">
          <TaxCalculator />
          <Button onClick={handleDownloadPayslip}>
            <Download className="mr-2 h-4 w-4" />
            Download Payslip
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Net Salary</p>
                <p className="text-2xl font-semibold">{formatCurrency(currentPay.netPay)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-gray-500">
              <Calendar className="mr-2 h-4 w-4" />
              Next payment on {formatDate(new Date(currentPay.payDate))}
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
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="text-2xl font-semibold">{formatCurrency(currentPay.baseSalary + currentPay.bonus)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <ArrowDownRight className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Deductions</p>
                <p className="text-2xl font-semibold">{formatCurrency(currentPay.deductions)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Banknote className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">YTD Earnings</p>
                <p className="text-2xl font-semibold">{formatCurrency(yearToDate.earnings)}</p>
                <p className="text-xs text-gray-400">Target: {formatCurrency(yearToDate.annualTarget)}</p>
              </div>
            </div>
            <Progress value={yearToDate.progress} className="h-2" />
            <p className="text-sm text-gray-500 mt-2">
              {yearToDate.progress}% of annual target
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {earnings.map((item) => (
                    <div key={item.type} className="flex justify-between">
                      <span className="text-sm text-gray-600">{item.type}</span>
                      <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Deductions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {deductions.map((item) => (
                    <div key={item.type} className="flex justify-between">
                      <span className="text-sm text-gray-600">{item.type}</span>
                      <span className="text-sm font-medium text-red-600">-{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {earnings.map((item) => (
                  <div key={item.type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{item.type}</p>
                        <p className="text-sm text-gray-500">Monthly earnings</p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold">{formatCurrency(item.amount)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deductions">
          <Card>
            <CardHeader>
              <CardTitle>Deductions Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deductions.map((item) => (
                  <div key={item.type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <ArrowDownRight className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">{item.type}</p>
                        <p className="text-sm text-gray-500">Statutory deduction</p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-red-600">-{formatCurrency(item.amount)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No payment history available</p>
                  </div>
                ) : (
                  paymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <ReceiptText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.period}</p>
                        <p className="text-sm text-gray-500">
                            {formatDate(new Date(payment.date))} • {payment.paymentFrequency}
                        </p>
                      </div>
                    </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(payment.net)}</p>
                        <p className="text-sm text-gray-500">Gross: {formatCurrency(payment.gross)}</p>
                        <Badge variant="outline" className="mt-1">{payment.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}