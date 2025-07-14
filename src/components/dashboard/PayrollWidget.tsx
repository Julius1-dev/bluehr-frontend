import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { FileText, ArrowRight, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function PayrollWidget() {
  const navigate = useNavigate();
  const [netSalary, setNetSalary] = useState<number | null>(null);
  const [recentPayslips, setRecentPayslips] = useState<any[]>([]);

  useEffect(() => {
    const fetchPayrollData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('http://localhost:4000/employee/payroll/data', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return;
      const result = await response.json();
      if (result.success && result.data) {
        setNetSalary(result.data.currentPay?.netPay || null);
        // Get two most recent payslips
        if (Array.isArray(result.data.paymentHistory)) {
          setRecentPayslips(result.data.paymentHistory.slice(0, 2));
        }
      }
    };
    fetchPayrollData();
  }, []);

  // Download payslip for a given period
  const handleDownloadPayslip = async (period: string, year: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`http://localhost:4000/employee/payroll/payslip/${period}/${year}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return;
      const payslipData = await response.json();
      if (payslipData.success && payslipData.payslip) {
        // Download as HTML (as in Payroll.tsx)
        const payslip = payslipData.payslip;
        const pdfContent = `
          <html><head><title>Payslip - ${payslip.employee_name}</title></head><body>
          <h1>Payslip for ${payslip.employee_name}</h1>
          <p>Period: ${payslip.payroll_month} ${payslip.payroll_year}</p>
          <p>Net Pay: ${payslip.net_pay}</p>
          </body></html>
        `;
        const blob = new Blob([pdfContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payslip-${payslip.employee_name.replace(/\s+/g, '-')}-${payslip.payroll_month}-${payslip.payroll_year}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      // Optionally show error
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Payroll</CardTitle>
        <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => navigate('/payroll')}>
          View All
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-500">Net Salary</div>
            <div className="text-2xl font-semibold">{netSalary !== null ? formatCurrency(netSalary) : '--'}</div>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Recent Payslips</h4>
          {recentPayslips.length === 0 && <div className="text-xs text-gray-400">No payslips found.</div>}
          {recentPayslips.map((payslip, idx) => (
            <div 
              key={payslip.id || idx}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <div className="font-medium text-sm">{payslip.period}</div>
                <div className="text-xs text-gray-500">Paid on {payslip.date}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium">
                  {formatCurrency(payslip.net)}
                </span>
                {/* Download button removed as requested */}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button variant="outline" className="w-full" onClick={() => navigate('/payroll')}>
          <FileText className="mr-2 h-4 w-4" />
          View Tax Documents
        </Button>
      </CardFooter>
    </Card>
  );
}