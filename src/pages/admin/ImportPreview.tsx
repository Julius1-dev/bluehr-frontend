import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BACKEND_URL } from '@/lib/config';

const IMPORT_API = `${BACKEND_URL}/company-admin/import-preview`;

export default function ImportPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { csvData = [], csvHeaders = [] } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rowErrors, setRowErrors] = useState<{ [key: number]: string }>({});

  const handleUpload = async () => {
    setLoading(true);
    setError('');
    setRowErrors({});
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(IMPORT_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(csvData)
      });
      const result = await res.json();
      if (result.results && result.results.some((r: any) => !r.success)) {
        // Map errors to row indices
        const errors: { [key: number]: string } = {};
        result.results.forEach((r: any, idx: number) => {
          if (!r.success) {
            errors[idx] = r.error || 'Unknown error';
          }
        });
        setRowErrors(errors);
        setError('Some rows failed to upload. Please check the errors below.');
      } else {
        navigate('/admin/team');
      }
    } catch (err) {
      setError('Bulk upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const hasDeptError = csvData.some((row: any) => row._deptError);
  const hasRowErrors = Object.keys(rowErrors).length > 0;

  if (!csvData.length) {
    return <div className="p-8">No data to preview. <Button onClick={() => navigate('/admin/team')}>Back</Button></div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl relative">
      <h1 className="text-3xl font-bold mb-6">Bulk Import Preview</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-32">
        {csvData.map((employee: any, idx: number) => (
          <Card key={idx} className={(employee._deptError || rowErrors[idx]) ? 'border-red-500' : ''}>
            <CardHeader>
              <CardTitle>{employee.first_name} {employee.last_name}</CardTitle>
              <CardDescription>{employee.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {employee._deptError && (
                <div className="text-red-600 font-semibold">Department not found: "{employee.department_name}"</div>
              )}
              {rowErrors[idx] && (
                <div className="text-red-600 font-semibold">Upload error: {rowErrors[idx]}</div>
              )}
              <div><strong>Phone:</strong> {employee.phone}</div>
              <div><strong>Date of Birth:</strong> {employee.date_of_birth}</div>
              <div><strong>Gender:</strong> {employee.gender}</div>
              <div><strong>National ID:</strong> {employee.national_id}</div>
              <div><strong>KRA PIN:</strong> {employee.kra_pin}</div>
              <div><strong>NSSF Number:</strong> {employee.nssf_number}</div>
              <div><strong>NHIF Number:</strong> {employee.nhif_number}</div>
              <div><strong>Joining Date:</strong> {employee.joining_date}</div>
              <div><strong>Department Name:</strong> {employee.department_name}</div>
              <div><strong>Role:</strong> {employee.role}</div>
              <div><strong>Employment Type:</strong> {employee.employment_type}</div>
              <div><strong>Payment Frequency:</strong> {employee.payment_frequency}</div>
              <div><strong>Basic Salary:</strong> {employee.basic_salary}</div>
              <div><strong>Bank Name:</strong> {employee.bank_name}</div>
              <div><strong>Bank Branch:</strong> {employee.bank_branch}</div>
              <div><strong>Account Number:</strong> {employee.account_number}</div>
              <div><strong>Account Name:</strong> {employee.account_name}</div>
              <div><strong>Emergency Contact Name:</strong> {employee.emergency_contact_name}</div>
              <div><strong>Emergency Contact Phone:</strong> {employee.emergency_contact_phone}</div>
              <div><strong>Emergency Contact Relationship:</strong> {employee.emergency_contact_relationship}</div>
              <div><strong>Status:</strong> <Badge>{employee.status}</Badge></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 w-full bg-white border-t py-4 flex justify-center z-50">
        <Button onClick={handleUpload} disabled={loading || hasDeptError || hasRowErrors}>{loading ? 'Uploading...' : 'Upload All'}</Button>
        <Button variant="outline" className="ml-4" onClick={() => navigate('/admin/team')}>Cancel</Button>
      </div>
    </div>
  );
}