import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download,
  FileSpreadsheet,
  Calendar,
  Users,
  DollarSign,
  ArrowLeft,
  Filter,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { BACKEND_URL } from '@/lib/config';

// Extend jsPDF with autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface PayrollReport {
  id: number;
  report_type: string;
  report_period: string;
  total_amount: number;
  employee_count: number;
  processed_at: string;
  report_data: any;
}

interface PayslipData {
  id: number;
  employee_name: string;
  department_name: string;
  position: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  paye: number;
  shif: number;
  nssf: number;
  housing_levy: number;
  net_pay: number;
  payment_frequency: string;
  payroll_month: string;
  payroll_year: number;
}

interface StatutoryData {
  month: string;
  year: number;
  paye: number;
  shif: number;
  nssf: number;
  housing_levy: number;
  total: number;
  status: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export function PayrollReports() {
  const [activeTab, setActiveTab] = useState<'reports' | 'payslips' | 'statutory'>('reports');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedReportType, setSelectedReportType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [payrollReports, setPayrollReports] = useState<PayrollReport[]>([]);
  const [payslips, setPayslips] = useState<PayslipData[]>([]);
  const [statutoryData, setStatutoryData] = useState<StatutoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Replace all hardcoded backend URLs with BACKEND_URL
  const REPORTS_API = `${BACKEND_URL}/company-admin/payroll-reports`;
  const EXPORT_API = `${BACKEND_URL}/company-admin/payroll-reports/export`;
  const EMPLOYEE_API = `${BACKEND_URL}/company-admin/employees`;
  const PAYROLL_API = `${BACKEND_URL}/company-admin/payrolls`;

  // Fetch payroll reports
  const fetchPayrollReports = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${REPORTS_API}?reportType=${selectedReportType === 'all' ? '' : selectedReportType}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPayrollReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching payroll reports:', error);
      toast.error('Failed to fetch payroll reports');
    }
  };

  // Fetch payslips for a specific period - use same data source as Employee section
  const fetchPayslips = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // First, get payroll history to find the most recent processed payroll
      const historyResponse = await fetch(`${BACKEND_URL}/company-admin/payroll/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!historyResponse.ok) {
        throw new Error('Failed to fetch payroll history');
      }

      const historyData = await historyResponse.json();
      let payrollHistory = [];
      
      if (historyData.success && historyData.payrollHistory) {
        payrollHistory = historyData.payrollHistory;
      } else if (Array.isArray(historyData)) {
        payrollHistory = historyData;
      }

      if (payrollHistory.length === 0) {
        setPayslips([]);
        return;
      }

      // Find the most recent processed payroll for the selected month/year
      let targetPayrollId = null;
      
      if (selectedMonth === 'all') {
        // If "all months" is selected, use the most recent payroll
        targetPayrollId = payrollHistory[0].id;
      } else {
        // Find payroll for the specific month/year
        const targetPayroll = payrollHistory.find(payroll => 
          payroll.payroll_month === selectedMonth && payroll.payroll_year === parseInt(selectedYear)
        );
        targetPayrollId = targetPayroll ? targetPayroll.id : payrollHistory[0].id;
      }

      // Now fetch the payroll details for this specific payroll
      const detailsResponse = await fetch(`${BACKEND_URL}/company-admin/payroll/details/${targetPayrollId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!detailsResponse.ok) {
        throw new Error('Failed to fetch payroll details');
      }

      const detailsData = await detailsResponse.json();
      let payrollDetails = [];

      if (detailsData.success && detailsData.data && detailsData.data.details) {
        payrollDetails = detailsData.data.details.map((detail: any) => ({
          id: detail.id,
          employee_name: `${detail.first_name} ${detail.last_name}`,
          department_name: detail.department_name || 'Unknown',
          position: detail.role || 'Staff',
          basic_salary: parseFloat(detail.basic_salary) || 0,
          allowances: parseFloat(detail.allowances) || 0,
          deductions: parseFloat(detail.deductions) || 0,
          paye: parseFloat(detail.paye) || 0,
          shif: parseFloat(detail.shif) || 0,
          nssf: parseFloat(detail.nssf) || 0,
          housing_levy: parseFloat(detail.housing_levy) || 0,
          net_pay: parseFloat(detail.net_pay) || 0,
          payment_frequency: detail.payment_frequency || 'monthly',
          payroll_month: detail.payroll_month,
          payroll_year: detail.payroll_year
        }));
      } else if (Array.isArray(detailsData)) {
        payrollDetails = detailsData.map((detail: any) => ({
          id: detail.id,
          employee_name: detail.employee_name,
          department_name: detail.department_name || 'Unknown',
          position: detail.position || 'Staff',
          basic_salary: parseFloat(detail.basic_salary) || 0,
          allowances: parseFloat(detail.allowances) || 0,
          deductions: parseFloat(detail.deductions) || 0,
          paye: parseFloat(detail.paye) || 0,
          shif: parseFloat(detail.shif) || 0,
          nssf: parseFloat(detail.nssf) || 0,
          housing_levy: parseFloat(detail.housing_levy) || 0,
          net_pay: parseFloat(detail.net_pay) || 0,
          payment_frequency: detail.payment_frequency || 'monthly',
          payroll_month: detail.payroll_month,
          payroll_year: detail.payroll_year
        }));
      }

      setPayslips(payrollDetails);
    } catch (error) {
      console.error('Error fetching payslips:', error);
      toast.error('Failed to fetch payslips');
      setPayslips([]);
    }
  };

  // Fetch statutory data
  const fetchStatutoryData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${BACKEND_URL}/company-admin/payroll/statutory/periods`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStatutoryData(data.periods || []);
      }
    } catch (error) {
      console.error('Error fetching statutory data:', error);
      toast.error('Failed to fetch statutory data');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPayrollReports(),
        fetchPayslips(),
        fetchStatutoryData()
      ]);
      setLoading(false);
    };
    fetchData();
  }, [selectedYear, selectedMonth, selectedReportType]);

  // Download payroll reports PDF
  const downloadPayrollReportsPDF = async () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      let y = 40;

      // Header
      doc.setFontSize(22);
      doc.setTextColor(0, 51, 102);
      doc.text('BlueHR Payroll Reports', 40, y);
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on ${formatDate(new Date().toISOString())}`, 40, y + 20);
      y += 50;

      // Reports table
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Payroll Reports Summary', 40, y);
      y += 30;

      const reportsData = payrollReports.map(report => [
        report.report_period,
        report.report_type,
        formatCurrency(report.total_amount),
        report.employee_count.toString(),
        formatDate(report.processed_at)
      ]);

      doc.autoTable({
        startY: y,
        head: [['Period', 'Type', 'Total Amount', 'Employees', 'Processed Date']],
        body: reportsData,
        theme: 'grid',
        headStyles: { fillColor: [0, 51, 102] },
        styles: { fontSize: 10 }
      });

      doc.save('payroll_reports.pdf');
      toast.success('Payroll reports PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  // Download payslips PDF
  const downloadPayslipsPDF = async () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      let y = 40;
      doc.setFontSize(22);
      doc.setTextColor(0, 51, 102);
      doc.text('BlueHR Payslips Report', 40, y);
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`${selectedMonth} ${selectedYear} • Generated on ${formatDate(new Date().toISOString())}`, 40, y + 20);
      y += 50;
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Employee Payslips', 40, y);
      y += 30;
      const payslipsData = payslips.map(payslip => [
        payslip.employee_name || '',
        payslip.department_name || '',
        payslip.position || '',
        formatCurrency(payslip.basic_salary || 0),
        formatCurrency(payslip.allowances || 0),
        formatCurrency(payslip.deductions || 0),
        formatCurrency(payslip.net_pay || 0),
        formatCurrency(payslip.paye || 0),
        formatCurrency(payslip.shif || 0),
        formatCurrency(payslip.nssf || 0),
        formatCurrency(payslip.housing_levy || 0),
        payslip.payment_frequency || '',
        payslip.payroll_month || '',
        payslip.payroll_year || ''
      ]);
      doc.autoTable({
        startY: y,
        head: [[
          'Employee', 'Department', 'Position', 'Basic Salary', 'Allowances', 'Deductions', 'Net Pay',
          'PAYE', 'SHIF', 'NSSF', 'Housing Levy', 'Payment Freq', 'Month', 'Year'
        ]],
        body: payslipsData,
        theme: 'grid',
        headStyles: { fillColor: [0, 51, 102] },
        styles: { fontSize: 9 }
      });
      doc.save(`payslips_${selectedMonth}_${selectedYear}.pdf`);
      toast.success('Payslips PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  // Download statutory data PDF
  const downloadStatutoryPDF = async () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      let y = 40;

      // Header
      doc.setFontSize(22);
      doc.setTextColor(0, 51, 102);
      doc.text('BlueHR Statutory Deductions Report', 40, y);
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on ${formatDate(new Date().toISOString())}`, 40, y + 20);
      y += 50;

      // Statutory data table
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Statutory Deductions Summary', 40, y);
      y += 30;

      const statutoryDataTable = statutoryData.map(stat => [
        `${stat.month} ${stat.year}`,
        formatCurrency(stat.paye),
        formatCurrency(stat.shif),
        formatCurrency(stat.nssf),
        formatCurrency(stat.housing_levy),
        formatCurrency(stat.total),
        stat.status
      ]);

      doc.autoTable({
        startY: y,
        head: [['Period', 'PAYE', 'SHIF', 'NSSF', 'Housing Levy', 'Total', 'Status']],
        body: statutoryDataTable,
        theme: 'grid',
        headStyles: { fillColor: [0, 51, 102] },
        styles: { fontSize: 10 }
      });

      doc.save('statutory_deductions_report.pdf');
      toast.success('Statutory deductions PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  // Filter reports based on search term
  const filteredReports = payrollReports.filter(report =>
    report.report_period.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.report_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter payslips based on search term
  const filteredPayslips = payslips.filter(payslip =>
    payslip.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payslip.department_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link to="/admin/payroll">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Payroll
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Payroll Reports & Analytics</h1>
            <p className="text-gray-500">Generate and download comprehensive payroll reports</p>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'reports' | 'payslips' | 'statutory')} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="reports">Payroll Reports</TabsTrigger>
          <TabsTrigger value="payslips">Payslips</TabsTrigger>
          <TabsTrigger value="statutory">Statutory Data</TabsTrigger>
        </TabsList>

        {/* Payroll Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payroll Reports</CardTitle>
              <div className="flex gap-2">
                <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={downloadPayrollReportsPDF} disabled={downloading || payrollReports.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  {downloading ? 'Generating...' : 'Download PDF'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading reports...</div>
              ) : payrollReports.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Processed Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.report_period}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{report.report_type}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{formatCurrency(report.total_amount)}</TableCell>
                        <TableCell>{report.employee_count}</TableCell>
                        <TableCell>{formatDate(report.processed_at)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No payroll reports available. Process payroll first to generate reports.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payslips Tab */}
        <TabsContent value="payslips" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Employee Payslips</CardTitle>
              <div className="flex gap-2">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    <SelectItem value="January">January</SelectItem>
                    <SelectItem value="February">February</SelectItem>
                    <SelectItem value="March">March</SelectItem>
                    <SelectItem value="April">April</SelectItem>
                    <SelectItem value="May">May</SelectItem>
                    <SelectItem value="June">June</SelectItem>
                    <SelectItem value="July">July</SelectItem>
                    <SelectItem value="August">August</SelectItem>
                    <SelectItem value="September">September</SelectItem>
                    <SelectItem value="October">October</SelectItem>
                    <SelectItem value="November">November</SelectItem>
                    <SelectItem value="December">December</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={downloadPayslipsPDF} disabled={downloading || payslips.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  {downloading ? 'Generating...' : 'Download PDF'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading payslips...</div>
              ) : payslips.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Basic Salary</TableHead>
                      <TableHead>Allowances</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead>PAYE</TableHead>
                      <TableHead>SHIF</TableHead>
                      <TableHead>NSSF</TableHead>
                      <TableHead>Housing Levy</TableHead>
                      <TableHead>Payment Freq</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Year</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayslips.map((payslip) => (
                      <TableRow key={payslip.id}>
                        <TableCell className="font-medium">{payslip.employee_name}</TableCell>
                        <TableCell>{payslip.department_name}</TableCell>
                        <TableCell>{payslip.position}</TableCell>
                        <TableCell>{formatCurrency(payslip.basic_salary)}</TableCell>
                        <TableCell>{formatCurrency(payslip.allowances)}</TableCell>
                        <TableCell>{formatCurrency(payslip.deductions)}</TableCell>
                        <TableCell className="font-semibold text-green-600">{formatCurrency(payslip.net_pay)}</TableCell>
                        <TableCell>{formatCurrency(payslip.paye)}</TableCell>
                        <TableCell>{formatCurrency(payslip.shif)}</TableCell>
                        <TableCell>{formatCurrency(payslip.nssf)}</TableCell>
                        <TableCell>{formatCurrency(payslip.housing_levy)}</TableCell>
                        <TableCell>{payslip.payment_frequency}</TableCell>
                        <TableCell>{payslip.payroll_month}</TableCell>
                        <TableCell>{payslip.payroll_year}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No payslips available for the selected period.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statutory Data Tab */}
        <TabsContent value="statutory" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Statutory Deductions</CardTitle>
              <Button onClick={downloadStatutoryPDF} disabled={downloading || statutoryData.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                {downloading ? 'Generating...' : 'Download PDF'}
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading statutory data...</div>
              ) : statutoryData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>PAYE</TableHead>
                      <TableHead>SHIF</TableHead>
                      <TableHead>NSSF</TableHead>
                      <TableHead>Housing Levy</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statutoryData.map((stat, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{stat.month} {stat.year}</TableCell>
                        <TableCell>{formatCurrency(stat.paye)}</TableCell>
                        <TableCell>{formatCurrency(stat.shif)}</TableCell>
                        <TableCell>{formatCurrency(stat.nssf)}</TableCell>
                        <TableCell>{formatCurrency(stat.housing_levy)}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(stat.total)}</TableCell>
                        <TableCell>
                          <Badge variant={stat.status === 'paid' ? 'default' : 'secondary'}>
                            {stat.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No statutory data available.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}