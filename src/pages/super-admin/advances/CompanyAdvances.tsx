import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, DollarSign, Clock, CheckCircle2, XCircle } from 'lucide-react';

// Mock data - replace with real data from your API
const mockCompany = {
  id: '1',
  name: 'Acme Inc',
  totalAdvances: 5000,
  outstandingBalance: 2500,
  status: 'active',
  employees: 42,
  joinDate: '2023-01-15',
  contact: 'john.doe@acme.com',
  phone: '+1 (555) 123-4567',
};

const mockAdvances = [
  {
    id: 'ADV-001',
    employee: 'John Doe',
    amount: 1000,
    date: '2023-05-15',
    dueDate: '2023-06-15',
    status: 'pending',
    balance: 1000,
  },
  {
    id: 'ADV-002',
    employee: 'Jane Smith',
    amount: 1500,
    date: '2023-05-10',
    dueDate: '2023-06-10',
    status: 'repaid',
    balance: 0,
  },
  {
    id: 'ADV-003',
    employee: 'Bob Johnson',
    amount: 2500,
    date: '2023-04-20',
    dueDate: '2023-07-20',
    status: 'active',
    balance: 1500,
  },
];

export default function CompanyAdvances() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  
  // In a real app, you would fetch company and advances data using the companyId
  // For now, we'll use mock data but include the companyId in the console to show it's being used
  console.log('Viewing company ID:', companyId);
  const company = mockCompany;
  const advances = mockAdvances;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { text: 'Active', className: 'bg-green-100 text-green-800' };
      case 'pending':
        return { text: 'Pending', className: 'bg-yellow-100 text-yellow-800' };
      case 'repaid':
        return { text: 'Repaid', className: 'bg-blue-100 text-blue-800' };
      case 'overdue':
        return { text: 'Overdue', className: 'bg-red-100 text-red-800' };
      default:
        return { text: 'Unknown', className: 'bg-gray-100 text-gray-800' };
    }
  };

  const handleBack = () => {
    navigate('/super-admin/advances');
  };

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Company not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="space-x-2">
          <Button variant="outline" size="sm">
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            Send Reminder
          </Button>
          <Button size="sm">
            New Advance
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Advances</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${company.totalAdvances.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${company.outstandingBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active advances</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {company.status === 'active' ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{company.status}</div>
            <p className="text-xs text-muted-foreground">
              {company.status === 'active' ? 'Active account' : 'Account suspended'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Advance History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Advance ID</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advances.map((advance) => {
                const status = getStatusBadge(advance.status);
                return (
                  <TableRow key={advance.id}>
                    <TableCell className="font-medium">{advance.id}</TableCell>
                    <TableCell>{advance.employee}</TableCell>
                    <TableCell>${advance.amount.toLocaleString()}</TableCell>
                    <TableCell>{advance.date}</TableCell>
                    <TableCell>{advance.dueDate}</TableCell>
                    <TableCell>${advance.balance.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                        {status.text}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
