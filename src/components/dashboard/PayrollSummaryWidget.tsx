import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { DollarSign, ArrowRight, FileText, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import { BACKEND_URL } from '@/lib/config';

export function PayrollSummaryWidget() {
  const navigate = useNavigate();

  // Real payroll data state
  const [payrollSummary, setPayrollSummary] = useState<any>({
    totalSalaries: 0,
    totalBonuses: 0,
    totalDeductions: 0,
    netPayable: 0,
    payrollDate: '',
    pendingApprovals: 0,
    upcomingPayments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayrollSummary = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No auth token');
        // Fetch pending payroll total
        const res = await fetch(`${BACKEND_URL}/company-admin/payroll/pending-total`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        // Optionally fetch more payroll info (history, bonuses, deductions, etc) here
        setPayrollSummary((prev: any) => ({
          ...prev,
          netPayable: data.total || 0,
          payrollDate: new Date().toISOString().slice(0, 10),
        }));
      } catch (err: any) {
        setError(err.message || 'Failed to load payroll summary');
      } finally {
        setLoading(false);
      }
    };
    fetchPayrollSummary();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Payroll Summary</CardTitle>
        <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => navigate('/admin/payroll')}>
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-700">Next Payroll</p>
              <p className="text-sm font-medium">{payrollSummary.payrollDate ? new Date(payrollSummary.payrollDate).toLocaleDateString() : '-'}</p>
            </div>
            <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(payrollSummary.netPayable)}</p>
            {payrollSummary.pendingApprovals > 0 && (
              <div className="flex items-center gap-1.5 mt-2 text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs">
                <AlertCircle className="h-3 w-3" />
                <span>{payrollSummary.pendingApprovals} pending approvals</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Total Salaries</p>
              <p className="text-base font-semibold">{formatCurrency(payrollSummary.totalSalaries)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Total Deductions</p>
              <p className="text-base font-semibold">{formatCurrency(payrollSummary.totalDeductions)}</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Upcoming Payments</h3>
            <div className="space-y-2">
              {/* Optionally map real upcoming payments here if available */}
              {Array.isArray(payrollSummary.upcomingPayments) && payrollSummary.upcomingPayments.length > 0 ? (
                payrollSummary.upcomingPayments.map((payment: any) => (
                  <div key={payment.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">{payment.name}</p>
                      <div className={`text-xs px-2 py-0.5 rounded-full ${
                        payment.status === 'pending' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {payment.status === 'pending' ? 'Pending' : 'Scheduled'}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">{new Date(payment.date).toLocaleDateString()}</p>
                      <p className="text-sm font-semibold">{formatCurrency(payment.amount)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400">No upcoming payments</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/admin/payroll')}>
          <FileText className="mr-2 h-4 w-4" />
          Run Payroll
        </Button>
      </CardFooter>
    </Card>
  );
}
