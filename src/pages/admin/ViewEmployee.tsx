import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const USER_API = 'http://localhost:4000/company-admin/users';
const DEPARTMENTS_API = 'http://localhost:4000/company-admin/departments';

export default function ViewEmployee() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [userRes, deptRes] = await Promise.all([
          fetch(`${USER_API}/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(DEPARTMENTS_API, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (!userRes.ok) throw new Error('Failed to fetch employee');
        if (!deptRes.ok) throw new Error('Failed to fetch departments');
        const userData = await userRes.json();
        const deptData = await deptRes.json();
        setEmployee(userData);
        setDepartments(deptData);
      } catch (err) {
        setEmployee(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!employee) return <div>Employee not found.</div>;
  const department = departments.find((d) => d.id?.toString() === employee.department_id?.toString());

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          Back
        </Button>
        <h1 className="text-3xl font-bold">Employee Details</h1>
      </div>
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Employee's personal details</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2"><strong>First Name:</strong> {employee.first_name || ''}</div>
          <div className="space-y-2"><strong>Middle Name:</strong> {employee.middle_name || ''}</div>
          <div className="space-y-2"><strong>Last Name:</strong> {employee.last_name || ''}</div>
          <div className="space-y-2"><strong>Email:</strong> {employee.email || ''}</div>
          <div className="space-y-2"><strong>Phone:</strong> {employee.phone || ''}</div>
          <div className="space-y-2"><strong>Date of Birth:</strong> {employee.date_of_birth ? format(new Date(employee.date_of_birth), 'PPP') : ''}</div>
          <div className="space-y-2"><strong>Gender:</strong> {employee.gender || ''}</div>
          <div className="space-y-2"><strong>National ID/Passport:</strong> {employee.national_id || ''}</div>
        </CardContent>
      </Card>
      {/* Employment Details */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Employment Details</CardTitle>
          <CardDescription>Employee's work-related information</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2"><strong>Joining Date:</strong> {employee.joining_date ? format(new Date(employee.joining_date), 'PPP') : ''}</div>
          <div className="space-y-2"><strong>Department:</strong> {department ? department.name : ''}</div>
          <div className="space-y-2"><strong>Role/Position:</strong> {employee.role || ''}</div>
          <div className="space-y-2"><strong>Employment Type:</strong> {employee.employment_type || ''}</div>
          <div className="space-y-2"><strong>Payment Frequency:</strong> {employee.payment_frequency ? employee.payment_frequency.charAt(0).toUpperCase() + employee.payment_frequency.slice(1) : 'Monthly'}</div>
          <div className="space-y-2"><strong>Basic Salary (KES):</strong> {employee.basic_salary || ''}</div>
          <div className="space-y-2"><strong>Status:</strong> <Badge>{employee.status || ''}</Badge></div>
        </CardContent>
      </Card>
      {/* Banking Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Banking Information</CardTitle>
          <CardDescription>Employee's bank account details for payroll</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2"><strong>Bank Name:</strong> {employee.bank_name || ''}</div>
          <div className="space-y-2"><strong>Branch Name:</strong> {employee.bank_branch || ''}</div>
          <div className="space-y-2"><strong>Account Number:</strong> {employee.account_number || ''}</div>
          <div className="space-y-2"><strong>Account Name:</strong> {employee.account_name || ''}</div>
        </CardContent>
      </Card>
      {/* Emergency Contact */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
          <CardDescription>Person to contact in case of emergency</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2"><strong>Full Name:</strong> {employee.emergency_contact_name || ''}</div>
          <div className="space-y-2"><strong>Phone Number:</strong> {employee.emergency_contact_phone || ''}</div>
          <div className="space-y-2"><strong>Relationship:</strong> {employee.emergency_contact_relationship || ''}</div>
        </CardContent>
      </Card>
      {/* Tax & Statutory Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Tax & Statutory Information</CardTitle>
          <CardDescription>Employee's tax and government registration details</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2"><strong>KRA PIN:</strong> {employee.kra_pin || ''}</div>
          <div className="space-y-2"><strong>NSSF Number:</strong> {employee.nssf_number || ''}</div>
          <div className="space-y-2"><strong>NHIF Number:</strong> {employee.nhif_number || ''}</div>
        </CardContent>
      </Card>
    </div>
  );
} 