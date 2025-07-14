import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, CheckCircle2, Clock, Check } from 'lucide-react';

type AdvanceStatus = 'approved' | 'disbursed' | 'repaid';

interface AdvanceRequest {
  id: string;
  company: string;
  employee: string;
  amount: number;
  date: string;
  status: AdvanceStatus;
  repaymentDate?: string;
}

export default function AdvanceRequests() {
  // Mock data - replace with real data from your API
  const mockRequests: AdvanceRequest[] = [
    {
      id: 'ADV-2023-001',
      company: 'Acme Inc',
      employee: 'John Doe',
      amount: 15000,
      date: '2023-06-01',
      status: 'approved',
      repaymentDate: '2023-07-31'
    },
    {
      id: 'ADV-2023-002',
      company: 'TechCorp',
      employee: 'Jane Smith',
      amount: 10000,
      date: '2023-06-05',
      status: 'disbursed',
      repaymentDate: '2023-07-31'
    },
    {
      id: 'ADV-2023-003',
      company: 'Acme Inc',
      employee: 'Mike Johnson',
      amount: 12000,
      date: '2023-05-25',
      status: 'repaid',
      repaymentDate: '2023-06-30'
    },
  ];

  const getStatusBadge = (status: AdvanceStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Approved
          </span>
        );
      case 'disbursed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Disbursed
          </span>
        );
      case 'repaid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="h-3.5 w-3.5 mr-1" />
            Repaid
          </span>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Advance Requests</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Advance ID</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Repayment Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-mono text-sm">{request.id}</TableCell>
                  <TableCell>{request.company}</TableCell>
                  <TableCell className="font-medium">{request.employee}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(request.amount)}</TableCell>
                  <TableCell>{formatDate(request.date)}</TableCell>
                  <TableCell>{request.repaymentDate ? formatDate(request.repaymentDate) : '-'}</TableCell>
                  <TableCell>
                    {getStatusBadge(request.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">View details</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Download</span>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {mockRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-muted-foreground/50">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <path d="M10 18v-6"></path>
                        <path d="M14 18v-6"></path>
                      </svg>
                      <p>No advance records found</p>
                      <p className="text-sm text-muted-foreground">Advances will appear here once requested</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
