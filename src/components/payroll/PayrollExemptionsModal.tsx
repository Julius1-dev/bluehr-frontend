import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PayrollExemptionsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PayrollExemptionsModal({ open, onClose }: PayrollExemptionsModalProps) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1); // JS months are 0-based
  const [year, setYear] = useState<number>(new Date().getFullYear());

  // Helper for month options
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  // Allow a range of years (e.g., current year +/- 2)
  const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  useEffect(() => {
    if (!open) return;
    // Fetch attendance records with deductions from backend
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({ month: String(month), year: String(year) });
        const res = await fetch(`http://localhost:4000/company-admin/payroll/attendance-deductions?${params.toString()}`,
          { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : []);
      } catch (err) {
        setRecords([]);
      }
      setLoading(false);
    };
    fetchRecords();
  }, [open, month, year]);

  const handleExempt = async (recordId: string) => {
    const reason = prompt('Enter exemption reason:');
    if (!reason) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:4000/company-admin/master-payroll/attendance-records/${recordId}/exempt`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      // Refresh records from backend after exemption
      setLoading(true);
      const params = new URLSearchParams({ month: String(month), year: String(year) });
      const res = await fetch(`http://localhost:4000/company-admin/payroll/attendance-deductions?${params.toString()}`,
        { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      alert('Failed to exempt record');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full p-2 sm:p-6">
        <DialogHeader>
          <DialogTitle>Payroll Exemptions</DialogTitle>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </DialogHeader>
        <Card>
          <CardContent className="pt-4">
            {/* Filter controls */}
            <div className="flex flex-wrap gap-4 mb-4 items-center">
              <label className="flex items-center gap-2">
                Month:
                <select value={month} onChange={e => setMonth(Number(e.target.value))} className="border rounded px-2 py-1">
                  {months.map((m, idx) => (
                    <option key={m} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2">
                Year:
                <select value={year} onChange={e => setYear(Number(e.target.value))} className="border rounded px-2 py-1">
                  {yearOptions.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="w-full max-h-[60vh] overflow-auto">
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : Array.isArray(records) && records.length === 0 ? (
                <div className="text-center py-8">No attendance deductions found.</div>
              ) : Array.isArray(records) ? (
                <table className="min-w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100 sticky top-0 z-10">
                      <th className="p-2 text-left whitespace-nowrap">Employee</th>
                      <th className="p-2 text-left whitespace-nowrap">Date</th>
                      <th className="p-2 text-left whitespace-nowrap">Type</th>
                      <th className="p-2 text-left whitespace-nowrap">Deduction</th>
                      <th className="p-2 text-left whitespace-nowrap">Status</th>
                      <th className="p-2 text-left whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(record => (
                      <tr key={record.id} className={record.exempted ? 'bg-green-50' : ''}>
                        <td className="p-2 whitespace-nowrap">{record.employeeName}</td>
                        <td className="p-2 whitespace-nowrap">{record.date}</td>
                        <td className="p-2 whitespace-nowrap">{record.type}</td>
                        <td className="p-2 whitespace-nowrap">{record.deductionAmount}</td>
                        <td className="p-2 whitespace-nowrap">{record.exempted ? `Exempted (${record.exemptionReason})` : 'Active'}</td>
                        <td className="p-2 whitespace-nowrap">
                          {!record.exempted && (
                            <Button size="sm" onClick={() => handleExempt(record.id)}>
                              Exempt
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">Error loading data.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
