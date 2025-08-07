import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Download
} from 'lucide-react';
import { calculatePAYE, calculateSHIF, calculateNSSF, calculateHousingLevy } from './payrollCalculations';
import { BACKEND_URL } from '@/lib/config';

// Mock utility function for formatting currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2
  }).format(amount);
};

// Mock utility function for formatting dates
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

interface CompanyWalletManagerProps {
  walletData: {
    balance: number;
    pendingPayroll: number;
    remainingAfterPayroll: number;
    lastDeposit: {
      amount: number;
      date: Date;
    };
  };
}

type PaymentMethod = 'bank' | 'mpesa';

export function CompanyWalletManager({ walletData }: CompanyWalletManagerProps) {
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Real transaction history state
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  // Real pending payroll state
  const [pendingPayroll, setPendingPayroll] = useState<number | null>(null);
  const [loadingPendingPayroll, setLoadingPendingPayroll] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoadingTransactions(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        const response = await fetch(`${BACKEND_URL}/company-admin/wallet/transactions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch transactions');
        const data = await response.json();
        setTransactions(data.map((tx: any) => ({
          id: tx.id,
          type: tx.transaction_type === 'credit' ? 'deposit' : 'withdrawal',
          amount: parseFloat(tx.amount),
          date: new Date(tx.created_at),
          description: tx.description,
          status: 'completed',
        })));
      } catch (err) {
        setTransactions([]);
      } finally {
        setLoadingTransactions(false);
      }
    };
    fetchTransactions();
  }, []);

  useEffect(() => {
    const fetchAndCalculatePendingPayroll = async () => {
      setLoadingPendingPayroll(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        // Fetch employees
        const empResponse = await fetch(`${BACKEND_URL}/company-admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!empResponse.ok) throw new Error('Failed to fetch employees');
        const empData = await empResponse.json();
        // Calculate total pending payroll (sum of net pay for all active, non-admin employees)
        let total = 0;
        if (Array.isArray(empData)) {
          empData.filter((emp: any) => emp.status === 'active' && emp.role !== 'admin').forEach((emp: any) => {
            let basicSalary = parseFloat(emp.basic_salary) || 0;
            let allowances = 0; // Default to 0, can be extended if needed
            let deductions = 0; // Default to 0, can be extended if needed
            let paymentFrequency = emp.payment_frequency || 'monthly';
            // Adjust for yearly workers
            if (paymentFrequency === 'yearly') {
              basicSalary = basicSalary / 12;
            }
            const adjustedGrossSalary = basicSalary + allowances;
            const nssf = calculateNSSF(adjustedGrossSalary);
            const shif = calculateSHIF(adjustedGrossSalary);
            const housingLevy = calculateHousingLevy(adjustedGrossSalary);
            const paye = calculatePAYE(adjustedGrossSalary, nssf);
            const netPay = adjustedGrossSalary - (paye + shif + nssf + housingLevy + deductions);
            total += netPay;
          });
        }
        setPendingPayroll(total);
      } catch (err) {
        setPendingPayroll(null);
      } finally {
        setLoadingPendingPayroll(false);
      }
    };
    fetchAndCalculatePendingPayroll();
  }, []);

  // State for tracking request submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleAddFunds = async () => {
    if (paymentMethod === 'bank' && !referenceNumber.trim()) {
      alert('Please enter a transaction reference number');
      return;
    }
    
    if (paymentMethod === 'mpesa' && !phoneNumber.trim()) {
      alert('Please enter your M-Pesa phone number');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (paymentMethod === 'bank') {
      try {
        setIsSubmitting(true);
        setRequestStatus(null);
        
        // Get auth token (must be present from sign-in)
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found. Please sign in again.');
        }
        
        // Decode JWT token to get user information including company_id
        let companyId;
        try {
          // JWT token is in format: header.payload.signature
          // We need the payload part which is the second part
          const tokenParts = token.split('.');
          if (tokenParts.length !== 3) {
            throw new Error('Invalid token format');
          }
          
          // Decode the base64 payload
          const payload = JSON.parse(atob(tokenParts[1]));
          companyId = payload.company_id;
          
          if (!companyId) {
            throw new Error('Company ID not found in token. Please sign in again.');
          }
        } catch (e) {
          console.error('Error extracting company ID from token:', e);
          throw new Error('Failed to extract company ID from authentication token. Please sign in again.');
        }
        
        // Send bank transfer request to backend
        const response = await fetch(`${BACKEND_URL}/super-admin/wallets/bank-transfers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            companyId,
            amount: parseFloat(amount),
            currency: 'KES',
            reference: referenceNumber,
            // Bank details are set by default in the backend
            // but we can override them here if needed
            bankName: 'Equity',
            accountNumber: '0930286204283',
            accountName: 'BlueCollar Technologies',
            branch: 'Githunguri'
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.message || 'Failed to create bank transfer request');
        }
        
        setRequestStatus({
          success: true,
          message: 'Bank transfer request submitted successfully. It will be processed by the admin.'
        });
        
        // Reset form after short delay
        setTimeout(() => {
          setShowAddFundsModal(false);
          setAmount('');
          setReferenceNumber('');
          setRequestStatus(null);
        }, 3000);
        
      } catch (error) {
        console.error('Error creating bank transfer request:', error);
        setRequestStatus({
          success: false,
          message: error instanceof Error ? error.message : 'An error occurred while processing your request'
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // M-Pesa integration would go here
      try {
        setIsSubmitting(true);
        setRequestStatus(null);

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found');

        const response = await fetch(`${BACKEND_URL}/company-admin/mpesa/deposit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            phone: phoneNumber
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'M-Pesa payment failed');
        }

        setRequestStatus({
          success: true,
          message: 'M-Pesa STK push sent. Complete the payment on your phone.'
        });

        setTimeout(() => {
          setShowAddFundsModal(false);
          setAmount('');
          setPhoneNumber('');
          setRequestStatus(null);
        }, 5000);

      } catch (error) {
        console.error('M-Pesa error:', error);
        setRequestStatus({
          success: false,
          message: error instanceof Error ? error.message : 'An error occurred during M-Pesa payment'
        });
      } finally {
        setIsSubmitting(false);
      }
      
      // Reset form
      setShowAddFundsModal(false);
      setAmount('');
      setPhoneNumber('');
    }
  };
  
  // PDF download for transaction statement
  const handleDownloadStatement = (transaction: any) => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      let y = 40;
      doc.setFontSize(22);
      doc.setTextColor(0, 51, 102);
      doc.text('BlueHR', 40, y);
      doc.setFontSize(13);
      doc.setTextColor(60, 60, 60);
      doc.text('Company Wallet Transaction Statement', 40, y + 20);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Generated on ${formatDate(new Date())}`, 420, y + 20);
      y += 60;
      doc.setDrawColor(41, 98, 255);
      doc.setLineWidth(2);
      doc.roundedRect(30, y, 530, 220, 8, 8, 'S');
      y += 30;
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text('Transaction ID:', 50, y);
      doc.setFont('helvetica', 'bold');
      doc.text(String(transaction.id), 160, y);
      doc.setFont('helvetica', 'normal');
      doc.text('Date:', 320, y);
      doc.setFont('helvetica', 'bold');
      doc.text(formatDate(transaction.date), 370, y);
      doc.setFont('helvetica', 'normal');
      y += 22;
      doc.text('Type:', 50, y);
      doc.setFont('helvetica', 'bold');
      doc.text(transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal', 160, y);
      doc.setFont('helvetica', 'normal');
      doc.text('Status:', 320, y);
      doc.setFont('helvetica', 'bold');
      doc.text(transaction.status, 370, y);
      doc.setFont('helvetica', 'normal');
      y += 22;
      doc.text('Amount:', 50, y);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(transaction.amount), 160, y);
      doc.setFont('helvetica', 'normal');
      y += 22;
      doc.text('Description:', 50, y);
      doc.setFont('helvetica', 'bold');
      doc.text(transaction.description, 160, y, { maxWidth: 380 });
      doc.setFont('helvetica', 'normal');
      y += 40;
      doc.setDrawColor(220, 220, 220);
      doc.line(50, y, 540, y);
      y += 24;
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text('Thank you for using BlueHR Wallet.', 50, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text('This is a computer-generated document. No signature is required.', 300, 820, { align: 'center' });
      doc.save(`transaction_statement_${transaction.id}.pdf`);
    });
  };

  return (
    <div className="space-y-6">
      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center">
                <Wallet className="h-7 w-7 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Available Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(walletData.balance)}</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowAddFundsModal(true)}
              className="w-full mt-4"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Money to Wallet
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center">
                <ArrowDownRight className="h-7 w-7 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Payroll</p>
                <p className="text-2xl font-bold">
                  {loadingPendingPayroll
                    ? 'Loading...'
                    : formatCurrency(pendingPayroll ?? 0)}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Next payroll scheduled for {formatDate(new Date('2025-06-25'))}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                <ArrowUpRight className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Remaining After Payroll</p>
                <p className="text-2xl font-bold">{formatCurrency(walletData.remainingAfterPayroll)}</p>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                {walletData.remainingAfterPayroll < 200000 ? 
                  "Low balance warning" : 
                  "Balance is sufficient"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingTransactions ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">Loading...</TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">No transactions found</TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={transaction.type === 'deposit' ? 'success' : 'destructive'}
                      >
                        {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                      </Badge>
                    </TableCell>
                    <TableCell className={transaction.type === 'deposit' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadStatement(transaction)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add Funds Modal */}
      {showAddFundsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add Money to Company Wallet</h3>
            
            <div className="space-y-4">
              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      paymentMethod === 'bank'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">Bank Transfer</div>
                    <div className="text-xs text-gray-500 mt-1">1-3 business days</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mpesa')}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      paymentMethod === 'mpesa'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">M-Pesa</div>
                    <div className="text-xs text-gray-500 mt-1">Instant</div>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (KES)
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full"
                  min="1"
                />
              </div>
              
              {/* Payment Method Specific Fields */}
              {paymentMethod === 'bank' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction Reference Number
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter bank transfer reference number"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Please enter the reference number from your bank transfer
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                    <p className="text-sm text-blue-700 font-medium mb-2">
                      Make a bank transfer to:
                    </p>
                    <div className="space-y-1 text-sm bg-white p-3 rounded border border-blue-200">
                      <p className="font-mono">Bank: Equity</p>
                      <p className="font-mono">Account Name: BlueCollar Technologies</p>
                      <p className="font-mono">Account Number: 0930286204283</p>
                      <p className="font-mono">Branch: Githunguri</p>
                      <p className="font-mono pt-2 border-t border-gray-100">
                        Amount: <span className="font-semibold">{amount ? `${formatCurrency(parseFloat(amount))}` : '______'}</span>
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      M-Pesa Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="e.g., 0712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter the phone number registered with M-Pesa
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-md border border-green-100">
                    <p className="text-sm text-green-700 font-medium mb-2">
                      Payment Instructions:
                    </p>
                    <ol className="text-sm space-y-1.5 list-decimal list-inside">
                      <li>Ensure you have sufficient funds in your M-Pesa account</li>
                      <li>You will receive an M-Pesa prompt on your phone</li>
                      <li>Enter your M-Pesa PIN to complete the payment</li>
                    </ol>
                    <p className="mt-2 text-sm font-medium">
                      Amount to pay: {amount ? formatCurrency(parseFloat(amount)) : '______'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Status message */}
              {requestStatus && (
                <div className={`p-3 rounded-md mb-3 ${requestStatus.success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                  {requestStatus.message}
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddFundsModal(false);
                    setAmount('');
                    setReferenceNumber('');
                    setPhoneNumber('');
                    setRequestStatus(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddFunds}
                  disabled={
                    isSubmitting ||
                    !amount || 
                    parseFloat(amount) <= 0 || 
                    (paymentMethod === 'bank' && !referenceNumber.trim()) ||
                    (paymentMethod === 'mpesa' && !phoneNumber.trim())
                  }
                  className={paymentMethod === 'mpesa' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {isSubmitting ? 'Processing...' : (paymentMethod === 'mpesa' ? 'Pay with M-Pesa' : 'Confirm Bank Transfer')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
