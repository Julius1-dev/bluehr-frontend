import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, ArrowLeft, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EmployeeFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: Date; // allow Date or undefined
  gender: string;
  nationalId: string;
  kraPin: string;
  nssfNumber: string;
  nhifNumber: string;
  joiningDate: Date;
  departmentId: string;
  role: string;
  employmentType: string;
  paymentFrequency: string;
  basicSalary: string;
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  accountName: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  status: string;
}


// Using browser alert instead of toast for now

const DEPARTMENTS_API = 'http://localhost:4000/company-admin/departments';

const employmentTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Temporary',
  'Internship'
];

const paymentFrequencies = [
  'Hourly',
  'Weekly',
  'Monthly',
  'Yearly'
];

interface AddEmployeePageProps {
  isEditMode?: boolean;
}

export function AddEmployeePage({ isEditMode = false }: AddEmployeePageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  
  // If isEditMode prop is not provided, check the URL params
  const editMode = isEditMode || !!id;
  
  const [formData, setFormData] = useState<EmployeeFormData>({
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: undefined,
  gender: 'prefer-not-to-say',
  nationalId: '',
  kraPin: '',
  nssfNumber: '',
  nhifNumber: '',
  joiningDate: new Date(),
  departmentId: '',
  role: '',
  employmentType: 'full-time',
  paymentFrequency: 'monthly',
  basicSalary: '',
  bankName: '',
  bankBranch: '',
  accountNumber: '',
  accountName: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  status: 'active',
});

  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(DEPARTMENTS_API, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch departments');
        const data = await res.json();
        setDepartments(data);
      } catch (err) {
        setDepartments([]);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (editMode && id) {
      const fetchEmployee = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`http://localhost:4000/company-admin/users/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Failed to fetch employee');
          const data = await res.json();
          setFormData({
            firstName: data.first_name || '',
            middleName: data.middle_name || '',
            lastName: data.last_name || '',
            email: data.email || '',
            phone: data.phone || '',
            dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
            gender: data.gender || 'prefer-not-to-say',
            nationalId: data.national_id || '',
            kraPin: data.kra_pin || '',
            nssfNumber: data.nssf_number || '',
            nhifNumber: data.nhif_number || '',
            joiningDate: data.joining_date ? new Date(data.joining_date) : new Date(),
            departmentId: data.department_id ? data.department_id.toString() : '',
            role: data.role || '',
            employmentType: data.employment_type || 'full-time',
            paymentFrequency: data.payment_frequency || 'monthly',
            basicSalary: data.basic_salary || '',
            bankName: data.bank_name || '',
            bankBranch: data.bank_branch || '',
            accountNumber: data.account_number || '',
            accountName: data.account_name || '',
            emergencyContactName: data.emergency_contact_name || '',
            emergencyContactPhone: data.emergency_contact_phone || '',
            emergencyContactRelationship: data.emergency_contact_relationship || '',
            status: data.status || 'active',
          });
          // Set roles for department
          const dept = departments.find((d: any) => d.id.toString() === (data.department_id || '').toString());
          setRoles(dept && Array.isArray(dept.roles) ? dept.roles : (dept && dept.roles ? JSON.parse(dept.roles) : []));
        } catch (err) {}
      };
      fetchEmployee();
    }
  }, [editMode, id, departments]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateSelect = (date: Date | undefined, field: keyof typeof formData) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleDepartmentChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      departmentId: value,
      role: ''
    }));
    const dept = departments.find((d: any) => d.id.toString() === value);
    setRoles(dept && Array.isArray(dept.roles) ? dept.roles : (dept && dept.roles ? JSON.parse(dept.roles) : []));
  };

  const API_URL = 'http://localhost:4000/company-admin/users';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        employment_type: formData.employmentType,
        payment_frequency: formData.paymentFrequency,
        basic_salary: formData.basicSalary,
        joiningDate: formData.joiningDate,
      };
      const res = await fetch(editMode ? `${API_URL}/${id}` : API_URL, {
        method: editMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save employee');
      alert(editMode ? 'Employee updated successfully!' : 'Employee added successfully!');
      navigate('/admin/team');
    } catch (err: any) {
      alert('Error saving employee: ' + (err.message || 'Unknown error'));
    }
  };
  
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">
          {editMode ? 'Edit Employee' : 'Add New Employee'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Employee's personal details</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input 
                id="firstName" 
                name="firstName" 
                value={formData.firstName}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input 
                id="middleName" 
                name="middleName" 
                value={formData.middleName}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input 
                id="lastName" 
                name="lastName" 
                value={formData.lastName}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input 
                id="phone" 
                name="phone" 
                type="tel" 
                value={formData.phone}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            {/* Date of Birth Field */}
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateOfBirth ? (
                      format(formData.dateOfBirth, 'PPP') // Properly formatted date
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dateOfBirth}
                    onSelect={(date) => handleDateSelect(date, 'dateOfBirth')}
                    initialFocus
                    fromYear={1900}
                    toYear={new Date().getFullYear() - 18} // Typically employees should be at least 18
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
           {/* Gender Field */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select 
                value={formData.gender}
                onValueChange={(value) => setFormData({...formData, gender: value})}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select gender">
                    {formData.gender === 'male' ? 'Male' :
                    formData.gender === 'female' ? 'Female' :
                    formData.gender === 'other' ? 'Other' :
                    formData.gender === 'prefer-not-to-say' ? 'Prefer not to say' :
                    'Select gender'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
                        
            <div className="space-y-2">
              <Label htmlFor="nationalId">National ID/Passport</Label>
              <Input 
                id="nationalId" 
                name="nationalId" 
                value={formData.nationalId}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
            <CardDescription>Employee's work-related information</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Joining Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.joiningDate && !isNaN(new Date(formData.joiningDate).getTime())
                      ? format(new Date(formData.joiningDate), 'PPP')
                      : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.joiningDate}
                    onSelect={(date) => handleDateSelect(date, 'joiningDate')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="departmentId">Department *</Label>
              <Select 
                value={formData.departmentId}
                onValueChange={handleDepartmentChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role/Position *</Label>
              <Select 
                value={formData.role}
                onValueChange={(value) => setFormData({...formData, role: value})}
                disabled={!formData.departmentId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.departmentId ? "Select role" : "Select department first"} />
                </SelectTrigger>
                <SelectContent>
                  {formData.departmentId && roles.map((role: string, index: number) => (
                    <SelectItem key={index} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employmentType">Employment Type *</Label>
              <Select 
                value={formData.employmentType}
                onValueChange={(value) => setFormData({...formData, employmentType: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type">
                    {formData.employmentType ? formData.employmentType.charAt(0).toUpperCase() + formData.employmentType.slice(1) : ''}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {employmentTypes.map(type => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentFrequency">Payment Frequency *</Label>
              <Select 
                value={formData.paymentFrequency}
                onValueChange={(value) => setFormData({...formData, paymentFrequency: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment frequency">
                    {formData.paymentFrequency ? formData.paymentFrequency.charAt(0).toUpperCase() + formData.paymentFrequency.slice(1) : ''}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {paymentFrequencies.map(frequency => (
                    <SelectItem key={frequency} value={frequency.toLowerCase()}>
                      {frequency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="basicSalary">Basic Salary (KES) *</Label>
              <Input 
                id="basicSalary" 
                name="basicSalary" 
                type="number" 
                value={formData.basicSalary}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                  <SelectItem value="probation">Probation</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Banking Information</CardTitle>
            <CardDescription>Employee's bank account details for payroll</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name *</Label>
              <Input 
                id="bankName" 
                name="bankName" 
                value={formData.bankName}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bankBranch">Branch Name *</Label>
              <Input 
                id="bankBranch" 
                name="bankBranch" 
                value={formData.bankBranch}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input 
                id="accountNumber" 
                name="accountNumber" 
                value={formData.accountNumber}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name *</Label>
              <Input 
                id="accountName" 
                name="accountName" 
                value={formData.accountName}
                onChange={handleInputChange}
                required 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
            <CardDescription>Person to contact in case of emergency</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Full Name *</Label>
              <Input 
                id="emergencyContactName" 
                name="emergencyContactName" 
                value={formData.emergencyContactName}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Phone Number *</Label>
              <Input 
                id="emergencyContactPhone" 
                name="emergencyContactPhone" 
                type="tel" 
                value={formData.emergencyContactPhone}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emergencyContactRelationship">Relationship *</Label>
              <Input 
                id="emergencyContactRelationship" 
                name="emergencyContactRelationship" 
                placeholder="e.g., Spouse, Parent, Sibling"
                value={formData.emergencyContactRelationship}
                onChange={handleInputChange}
                required 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax & Statutory Information</CardTitle>
            <CardDescription>Employee's tax and government registration details</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="kraPin">KRA PIN</Label>
              <Input 
                id="kraPin" 
                name="kraPin" 
                placeholder="e.g., A123456789B"
                value={formData.kraPin}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nssfNumber">NSSF Number</Label>
              <Input 
                id="nssfNumber" 
                name="nssfNumber" 
                placeholder="e.g., 1234567"
                value={formData.nssfNumber}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nhifNumber">NHIF Number</Label>
              <Input 
                id="nhifNumber" 
                name="nhifNumber" 
                placeholder="e.g., 12345678"
                value={formData.nhifNumber}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button type="submit" className="gap-2">
            <UserPlus className="h-4 w-4" />
            {editMode ? 'Edit Employee' : 'Add Employee'}
          </Button>
        </div>
      </form>
    </div>
  );
}
