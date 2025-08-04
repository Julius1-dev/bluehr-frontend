import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownRight, Ban as Bank, Receipt, PiggyBank, Banknote, ArrowRight, Phone, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BACKEND_URL } from '@/lib/config';
import { useNavigate } from 'react-router-dom';
import { LinkBankAccountDialog } from '@/components/wallet/LinkBankAccountDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface AdvanceData {
  totalAdvanceBalance: number;
  monthlyIncome: number;
  availableAdvance: number;
  totalAdvanceTaken: number;
  remainingAdvance: number;
  recentTransactions: Array<{
    id: string;
    type: string;
    description: string;
    amount: number;
    date: string;
    status: string;
    method?: string;
    transactionFee?: number;
    sourceOfFunds?: string;
    approvedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
  }>;
}

export function WalletPage() {
  const navigate = useNavigate();
  const [repayDialogOpen, setRepayDialogOpen] = useState(false);
  const [repayAmount, setRepayAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [advanceData, setAdvanceData] = useState<AdvanceData | null>(null);

  // Fetch advance data from backend
  useEffect(() => {
    const fetchAdvanceData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Authentication token not found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${BACKEND_URL}/employee/advances/data`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch advance data');
        }

        const result = await response.json();
        if (result.success) {
          setAdvanceData(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch advance data');
        }
      } catch (err) {
        console.error('Error fetching advance data:', err);
        toast.error('Failed to load advance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdvanceData();
  }, []);

  const handleRepayAdvance = () => {
    if (!repayAmount || !phoneNumber) {
      toast.error('Please enter both amount and phone number');
      return;
    }
    
    // Mock repayment logic
    console.log('Repaying advance:', { amount: repayAmount, phone: phoneNumber });
    toast.success('Repayment request submitted successfully! You will receive an Mpesa prompt shortly.');
    
    // Reset form and close dialog
    setRepayAmount('');
    setPhoneNumber('');
    setRepayDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading advance data...</span>
        </div>
      </div>
    );
  }

  if (!advanceData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load advance data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const linkedAccounts = [
    {
      id: 1,
      bank: 'Chase Bank',
      accountType: 'Checking',
      accountNumber: '****4589',
      primary: true
    },
    {
      id: 2,
      bank: 'Wells Fargo',
      accountType: 'Savings',
      accountNumber: '****7823',
      primary: false
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Advances</h1>
        <div className="flex gap-2">
          <LinkBankAccountDialog />
          <Button onClick={() => setRepayDialogOpen(true)}>
            <CreditCard className="mr-2 h-4 w-4" />
            Repay Advance
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-blue-100">Total Advance Balance Remaining</p>
                <h2 className="text-3xl font-bold mt-1">{formatCurrency(advanceData.totalAdvanceBalance)}</h2>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm text-blue-100">Monthly Income</div>
                <div className="text-xl font-semibold mt-1">{formatCurrency(advanceData.monthlyIncome)}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm text-blue-100">Available for Advance</div>
                <div className="text-xl font-semibold mt-1">{formatCurrency(advanceData.availableAdvance)}</div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => {
                  console.log('Transfer to Bank button clicked');
                  try {
                    navigate('/transfer-to-bank');
                    console.log('Navigation to /transfer-to-bank triggered');
                  } catch (error) {
                    console.error('Navigation error:', error);
                  }
                }}
              >
                <Banknote className="mr-2 h-4 w-4" />
                Transfer to Bank
              </Button>
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => {
                  console.log('Withdraw to Mpesa button clicked');
                  try {
                    navigate('/withdraw-mpesa');
                    console.log('Navigation to /withdraw-mpesa triggered');
                  } catch (error) {
                    console.error('Navigation error:', error);
                  }
                }}
              >
                <PiggyBank className="mr-2 h-4 w-4" />
                Withdraw to Mpesa
              </Button>
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => navigate('/advance-statement')}
              >
                <Receipt className="mr-2 h-4 w-4" />
                View Statement
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Advance Taken</p>
                  <p className="text-2xl font-semibold">{formatCurrency(advanceData.totalAdvanceTaken)}</p>
                </div>
              </div>
              <Progress 
                value={advanceData.totalAdvanceTaken > 0 ? (advanceData.remainingAdvance / advanceData.totalAdvanceTaken) * 100 : 0} 
                className="h-2" 
              />
              <p className="text-sm text-gray-500">
                {advanceData.totalAdvanceTaken > 0 ? Math.round((advanceData.remainingAdvance / advanceData.totalAdvanceTaken) * 100) : 0}% remaining to repay
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="accounts">Linked Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Transaction History</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {advanceData.recentTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent transactions</p>
                  </div>
                ) : (
                  advanceData.recentTransactions.map((transaction) => (
                    <div 
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'advance' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-amber-100 text-amber-600'
                        }`}>
                          {transaction.type === 'advance' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(new Date(transaction.date))} • {transaction.method || 'N/A'}
                            {transaction.status === 'approved' && transaction.approvedAt && (
                              <span className="ml-2 text-green-600">✓ Approved</span>
                            )}
                            {transaction.status === 'rejected' && transaction.rejectedAt && (
                              <span className="ml-2 text-red-600">✗ Rejected</span>
                            )}
                          </p>
                          {transaction.rejectionReason && (
                            <p className="text-xs text-red-500 mt-1">
                              Reason: {transaction.rejectionReason}
                            </p>
                          )}
                          {transaction.transactionFee && transaction.transactionFee > 0 && (
                            <p className="text-xs text-blue-500 mt-1">
                              Fee: {formatCurrency(transaction.transactionFee)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-semibold ${
                          transaction.type === 'advance' ? 'text-green-600' : 'text-amber-600'
                        }`}>
                          {transaction.type === 'advance' ? '+' : '-'}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </span>
                        <Badge variant={transaction.status === 'completed' ? 'success' : 'default'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Linked Bank Accounts</CardTitle>
                <Button variant="outline" size="sm">
                  <Bank className="mr-2 h-4 w-4" />
                  Link New Account
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {linkedAccounts.map((account) => (
                  <div 
                    key={account.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Bank className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{account.bank}</p>
                        <p className="text-sm text-gray-500">
                          {account.accountType} • {account.accountNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {account.primary && (
                        <Badge variant="secondary">Primary</Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Repay Advance Dialog */}
      <Dialog open={repayDialogOpen} onOpenChange={setRepayDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white">
          <DialogHeader>
            <DialogTitle>Repay Advance via Mpesa</DialogTitle>
            <DialogDescription>
              Enter the amount you want to repay and your Mpesa phone number. You will receive a payment prompt.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES)</Label>
              <Input
                id="amount" 
                type="number"
                placeholder="Enter amount to repay" 
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Mpesa Phone Number</Label>
              <Input
                id="phone" 
                placeholder="e.g. 254700000000" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRepayDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRepayAdvance} className="bg-green-600 hover:bg-green-700">
              <Phone className="mr-2 h-4 w-4" />
              Repay via Mpesa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}