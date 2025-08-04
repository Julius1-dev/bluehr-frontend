import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { BACKEND_URL } from '@/lib/config';

export function MasterPayroll() {
  const [selectedEmployees, setSelectedEmployees] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [payrollMonth, setPayrollMonth] = useState<number>(7); // July
  const [payrollYear, setPayrollYear] = useState<number>(2025);
  const [paymentFrequency, setPaymentFrequency] = useState<string>('monthly');
  const [result, setResult] = useState<any>(null);

  // Fetch processed master payroll data (GET)
  useEffect(() => {
    const fetchMasterPayroll = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await fetch(
          `${BACKEND_URL}/company-admin/master-payroll?payrollMonth=${payrollMonth}&payrollYear=${payrollYear}&paymentFrequency=${paymentFrequency}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        if (response.ok) {
          const data = await response.json();
          setSelectedEmployees(data.processedEmployees || []);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchMasterPayroll();
  }, [payrollMonth, payrollYear, paymentFrequency]);

  // Process master payroll POST
  const handleProcessPayroll = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${BACKEND_URL}/company-admin/master-payroll/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ payrollMonth, payrollYear, paymentFrequency })
      });
      if (response.ok) {
        const data = await response.json();
        setResult(data);
        setSelectedEmployees(data.processedEmployees || []);
      }
    } catch (err) {
      // Optionally handle error
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Master Payroll</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div>
            <label>Month:</label>
            <input type="number" min={1} max={12} value={payrollMonth} onChange={e => setPayrollMonth(Number(e.target.value))} />
          </div>
          <div>
            <label>Year:</label>
            <input type="number" min={2020} max={2100} value={payrollYear} onChange={e => setPayrollYear(Number(e.target.value))} />
          </div>
          <div>
            <label>Frequency:</label>
            <select value={paymentFrequency} onChange={e => setPaymentFrequency(e.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Basic Salary</TableHead>
              <TableHead>Allowances</TableHead>
              <TableHead>PAYE</TableHead>
              <TableHead>NSSF</TableHead>
              <TableHead>SHIF</TableHead>
              <TableHead>Housing Levy</TableHead>
              <TableHead>Lateness</TableHead>
              <TableHead>Early Leave</TableHead>
              <TableHead>Total Deduction</TableHead>
              <TableHead>Net Pay</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedEmployees.map(emp => (
              <TableRow key={emp.id}>
                <TableCell>{emp.first_name} {emp.last_name}</TableCell>
                <TableCell>{emp.basic_salary}</TableCell>
                <TableCell>{emp.allowances}</TableCell>
                <TableCell>{emp.paye}</TableCell>
                <TableCell>{emp.nssf}</TableCell>
                <TableCell>{emp.shif}</TableCell>
                <TableCell>{emp.housing_levy}</TableCell>
                <TableCell>{emp.latenessDeduction}</TableCell>
                <TableCell>{emp.earlyLeaveDeduction}</TableCell>
                <TableCell>{emp.totalDeduction}</TableCell>
                <TableCell>{emp.net_pay}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 flex justify-between items-center">
          <Button onClick={handleProcessPayroll} disabled={processing}>
            {processing ? 'Processing...' : 'Process Master Payroll'}
          </Button>
          <Button variant="outline">
            Manage Exceptions
          </Button>
        </div>
        {result && result.success && (
          <div className="mt-4 text-green-600">Payroll processed successfully!</div>
        )}
      </CardContent>
    </Card>
  );
}
