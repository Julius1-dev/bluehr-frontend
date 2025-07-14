import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface BankTransferRequest {
  id: string;
  company_id: string;
  company_name: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'rejected';
  reference: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  branch: string;
  reason?: string;
  requested_at: string;
  processed_at?: string;
  processed_by_email?: string;
}

const WALLETS_API = 'http://localhost:4000/super-admin/wallets';

export default function WalletManagement() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<BankTransferRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchBankTransferRequests();
  }, []);

  const fetchBankTransferRequests = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${WALLETS_API}/bank-transfers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch bank transfer requests');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching bank transfer requests:', error);
      toast.error('Failed to load bank transfer requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (transactionId: string) => {
    setProcessingId(transactionId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${WALLETS_API}/bank-transfers/${transactionId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to approve transaction');
      
      toast.success('Transaction approved successfully');
      await fetchBankTransferRequests(); // Refresh the list
    } catch (error) {
      console.error('Error approving transaction:', error);
      toast.error('Failed to approve transaction');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (transactionId: string) => {
    const reason = prompt('Please specify the reason for rejection:');
    if (!reason) return;
    
    setProcessingId(transactionId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${WALLETS_API}/bank-transfers/${transactionId}/reject`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) throw new Error('Failed to reject transaction');
      
      toast.success('Transaction rejected successfully');
      await fetchBankTransferRequests(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      toast.error('Failed to reject transaction');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesSearch = 
      transaction.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bank Transfer Approvals</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by company, reference..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Bank Details</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Loading bank transfer requests...
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="font-medium">TXN-{transaction.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.company_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{transaction.bank_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {transaction.account_number}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {transaction.account_name}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {new Intl.NumberFormat('en-KE', {
                          style: 'currency',
                          currency: transaction.currency,
                        }).format(transaction.amount)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {transaction.reference}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(transaction.requested_at), 'MMM d, yyyy')}
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(transaction.requested_at), 'HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {transaction.status === 'pending' ? (
                          <div className="flex flex-col sm:flex-row gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                              onClick={() => handleApprove(transaction.id)}
                              disabled={processingId === transaction.id}
                            >
                              {processingId === transaction.id ? 'Processing...' : 'Approve'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleReject(transaction.id)}
                              disabled={processingId === transaction.id}
                            >
                              {processingId === transaction.id ? 'Processing...' : 'Reject'}
                            </Button>
                          </div>
                        ) : transaction.status === 'rejected' ? (
                          <div className="text-sm text-muted-foreground text-right">
                            <div className="font-medium">Reason:</div>
                            <div>{transaction.reason}</div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Approved by {transaction.processed_by_email?.split('@')[0] || 'Super Admin'}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No bank transfer transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
