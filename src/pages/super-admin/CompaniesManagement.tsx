import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, ArrowUpDown, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data - in a real app, this would come from an API
const initialCompanies: Company[] = [
  {
    id: 1,
    name: 'Acme Corporation',
    domain: 'acme',
    plan: 'Enterprise',
    status: 'active',
    users: 45,
    joined: '2023-01-15',
    contact: 'john.doe@acme.com',
    contactName: 'John Doe',
    contactEmail: 'john.doe@acme.com',
    contactPhone: '+1 (555) 123-4567',
    address: '123 Business Ave',
    city: 'New York',
    country: 'United States',
    postalCode: '10001',
    taxId: '12-3456789',
    notes: 'Enterprise customer with premium support',
  },
  {
    id: 2,
    name: 'Tech Solutions Inc',
    domain: 'techsolutions',
    plan: 'Business',
    status: 'active',
    users: 28,
    joined: '2023-02-20',
    contact: 'sarah@techsolutions.io',
    contactName: 'Sarah Johnson',
    contactEmail: 'sarah@techsolutions.io',
    contactPhone: '+1 (555) 987-6543',
    address: '456 Tech Park',
    city: 'San Francisco',
    country: 'United States',
    postalCode: '94107',
    taxId: '98-7654321',
    notes: 'Fast-growing tech company'
  },
  {
    id: 3,
    name: 'Global Innovations',
    domain: 'globalinnovations',
    plan: 'Starter',
    status: 'suspended',
    users: 5,
    joined: '2023-03-10',
    contact: 'support@globalinnovations.co',
    contactName: 'Support Team',
    contactEmail: 'support@globalinnovations.co',
    contactPhone: '+1 (555) 111-2233',
    address: '789 Innovation Drive',
    city: 'Austin',
    country: 'United States',
    postalCode: '73301',
    taxId: '45-6789012',
    notes: 'Account suspended - payment overdue'
  },
  {
    id: 4,
    name: 'Data Systems Ltd',
    domain: 'datasystems',
    plan: 'Business',
    status: 'active',
    users: 32,
    joined: '2023-04-05',
    contact: 'admin@datasystems.io',
    contactName: 'Michael Chen',
    contactEmail: 'admin@datasystems.io',
    contactPhone: '+1 (555) 222-3344',
    address: '321 Data Street',
    city: 'Seattle',
    country: 'United States',
    postalCode: '98101',
    taxId: '34-5678901',
    notes: 'Enterprise data solutions provider'
  },
  {
    id: 5,
    name: 'Creative Minds',
    domain: 'creativeminds',
    plan: 'Starter',
    status: 'active',
    users: 3,
    joined: '2023-05-12',
    contact: 'hello@creativeminds.agency',
    contactName: 'Alex Rivera',
    contactEmail: 'hello@creativeminds.agency',
    contactPhone: '+1 (555) 333-4455',
    address: '159 Creative Lane',
    city: 'Portland',
    country: 'United States',
    postalCode: '97201',
    taxId: '56-7890123',
    notes: 'Small design agency with 5 employees'
  },
];

import { useNavigate } from 'react-router-dom';

interface Company {
  id: number;
  name: string;
  domain: string;
  plan: 'Starter' | 'Business' | 'Enterprise';
  status: 'active' | 'suspended';
  users: number;
  joined: string;
  contact: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  taxId: string;
  notes: string;
}

export function CompaniesManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [isSuspending, setIsSuspending] = useState(false);
  // Removed duplicate state

  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  
  const filteredCompanies = companies
    .filter((company: Company) => {
      const matchesSearch = 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.contact.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || company.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!currentCompany) return;
    const { name, value } = e.target;
    setCurrentCompany({
      ...currentCompany,
      [name]: value
    });
  };

  const handleSelectChange = (name: keyof Company, value: string) => {
    if (!currentCompany) return;
    setCurrentCompany({
      ...currentCompany,
      [name]: value
    });
  };

  const handleEdit = (company: Company) => {
    setCurrentCompany({
      ...company,
      // Ensure all fields have default values if undefined
      contactName: company.contactName || '',
      contactEmail: company.contactEmail || company.contact,
      contactPhone: company.contactPhone || '',
      address: company.address || '',
      city: company.city || '',
      country: company.country || '',
      postalCode: company.postalCode || '',
      taxId: company.taxId || '',
      notes: company.notes || ''
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!currentCompany?.name || !currentCompany?.contactEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Simulate API call
    setIsSuspending(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCompanies((prev: Company[]) => 
      prev.map((company: Company) => 
        company.id === currentCompany.id 
          ? { 
              ...currentCompany,
              contact: currentCompany.contactEmail, // Keep contact in sync
              updatedAt: new Date().toISOString()
            } 
          : company
      )
    );
    
    toast.success('Company updated successfully');
    setEditDialogOpen(false);
    setIsSuspending(false);
  };

  const handleSuspendToggle = async (company: Company) => {
    setIsSuspending(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newStatus = company.status === 'active' ? 'suspended' : 'active';
    
    setCompanies((prev: Company[]) => 
      prev.map((c: Company) => 
        c.id === company.id ? { ...c, status: newStatus } : c
      )
    );
    
    toast.success(`Company ${newStatus === 'suspended' ? 'suspended' : 'unsuspended'} successfully`);
    setIsSuspending(false);
  };

  return (
    <div className="space-y-6">
      {/* Edit Company Dialog */}
      {currentCompany && (
        <div className={`fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto ${editDialogOpen ? 'block' : 'hidden'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-3xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Edit Company</h3>
              <button 
                onClick={() => setEditDialogOpen(false)} 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-8">
              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input
                        name="name"
                        value={currentCompany.name}
                        onChange={handleInputChange}
                        placeholder="Acme Corporation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Domain</Label>
                      <Input
                        name="domain"
                        value={currentCompany.domain}
                        onChange={handleInputChange}
                        placeholder="acme"
                        className="pl-20"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Subscription Plan</Label>
                      <Select
                        value={currentCompany.plan}
                        onValueChange={(value) => handleSelectChange('plan', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Starter">Starter</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tax ID</Label>
                      <Input
                        name="taxId"
                        value={currentCompany.taxId}
                        onChange={handleInputChange}
                        placeholder="12-3456789"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={currentCompany.status}
                        onValueChange={(value) => handleSelectChange('status', value as 'active' | 'suspended')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Contact Name</Label>
                      <Input
                        name="contactName"
                        value={currentCompany.contactName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        name="contactEmail"
                        type="email"
                        value={currentCompany.contactEmail}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        name="contactPhone"
                        type="tel"
                        value={currentCompany.contactPhone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Street Address</Label>
                    <Input
                      name="address"
                      value={currentCompany.address}
                      onChange={handleInputChange}
                      placeholder="123 Main St"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        name="city"
                        value={currentCompany.city}
                        onChange={handleInputChange}
                        placeholder="New York"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Input
                        name="country"
                        value={currentCompany.country}
                        onChange={handleInputChange}
                        placeholder="United States"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Postal Code</Label>
                      <Input
                        name="postalCode"
                        value={currentCompany.postalCode}
                        onChange={handleInputChange}
                        placeholder="10001"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      name="notes"
                      value={currentCompany.notes}
                      onChange={handleInputChange}
                      placeholder="Any additional information about this company..."
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleSave}
                  disabled={!currentCompany.name || !currentCompany.contactEmail}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            Manage all organizations using the platform
          </p>
        </div>
        <Button 
          className="mt-4 md:mt-0"
          onClick={() => navigate('/super-admin/companies/add')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search companies..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    {statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : 'Status'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                    All Statuses
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('suspended')}>
                    Suspended
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">
                    <button
                      type="button"
                      className="flex items-center font-medium"
                      onClick={() => handleSort('name')}
                    >
                      Company
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                  </TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{company.name}</span>
                          <span className="text-sm text-muted-foreground">{company.domain}</span>
                        </div>
                      </TableCell>
                      <TableCell>{company.plan}</TableCell>
                      <TableCell>{getStatusBadge(company.status)}</TableCell>
                      <TableCell>{company.users}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(company.joined).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {company.contact}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/super-admin/companies/${company.id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(company)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className={company.status === 'suspended' ? 'text-green-600' : 'text-destructive'}
                              onClick={() => handleSuspendToggle(company)}
                              disabled={isSuspending}
                            >
                              {company.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No companies found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>Showing {filteredCompanies.length} of {companies.length} companies</div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
