import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertCircle, Banknote, Loader2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BACKEND_URL } from '@/lib/config';

interface AdvanceData {
  totalAdvanceBalance: number;
  monthlyIncome: number;
  availableAdvance: number;
  totalAdvanceTaken: number;
  remainingAdvance: number;
  advanceSettings: {
    sourceOfFunds: string;
    transactionFeePercentage: number;
    maxAdvancePercentage: number;
  };
}

interface BankingInfo {
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  maskedAccountNumber: string;
  accountName: string;
  isComplete: boolean;
}

export function TransferToBank() {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [advanceData, setAdvanceData] = useState<AdvanceData | null>(null);
  const [bankingInfo, setBankingInfo] = useState<BankingInfo | null>(null);
  const navigate = useNavigate();

  // Fetch advance data and banking info from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Authentication token not found');
          setLoading(false);
          return;
        }

        // Fetch advance data
        const advanceResponse = await fetch(`${BACKEND_URL}/employee/advances/data`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!advanceResponse.ok) {
          throw new Error('Failed to fetch advance data');
        }

        const advanceResult = await advanceResponse.json();
        if (advanceResult.success) {
          setAdvanceData(advanceResult.data);
        } else {
          throw new Error(advanceResult.error || 'Failed to fetch advance data');
        }

        // Fetch banking information
        const bankingResponse = await fetch(`${BACKEND_URL}/employee/advances/banking-info`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!bankingResponse.ok) {
          throw new Error('Failed to fetch banking information');
        }

        const bankingResult = await bankingResponse.json();
        if (bankingResult.success) {
          setBankingInfo(bankingResult.data);
        } else {
          throw new Error(bankingResult.error || 'Failed to fetch banking information');
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const transferLimit = advanceData?.availableAdvance || 50000.00;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !reason) {
      toast.error('Please fill in all fields');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amountValue > transferLimit) {
      toast.error(`Amount cannot exceed ${formatCurrency(transferLimit)}`);
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/employee/advances/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amountValue,
          method: 'bank_transfer',
          reason: reason
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Advance request submitted successfully!');
        // Reset form
        setAmount('');
        setReason('');
        // Navigate back to wallet
        navigate('/wallet');
      } else {
        toast.error(result.error || 'Failed to submit advance request');
      }
    } catch (error) {
      console.error('Error requesting advance:', error);
      toast.error('Failed to submit advance request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading data...</span>
        </div>
      </div>
    );
  }

  if (!advanceData || !bankingInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/wallet')} 
          className="rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Request Advance - Bank Transfer</h1>
      </div>

      {!bankingInfo.isComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm font-medium">Banking Information Incomplete</p>
          </div>
          <p className="mt-2 text-sm text-amber-700">
            Your banking information is incomplete. Please contact your administrator to update your bank details before requesting an advance.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Advance Request Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Advance Amount (KES)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter amount"
                  min="100"
                  max={transferLimit}
                  required
                />
                <p className="text-sm text-gray-500">
                  Available for advance: {formatCurrency(advanceData.availableAdvance)}
                </p>
                {advanceData.advanceSettings.sourceOfFunds === 'blueHR' && amount && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">
                      Transaction fee (6%): {formatCurrency((parseFloat(amount) * advanceData.advanceSettings.transactionFeePercentage) / 100)}
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      Amount you will receive: {formatCurrency(parseFloat(amount) - (parseFloat(amount) * advanceData.advanceSettings.transactionFeePercentage) / 100)}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      You will repay the full amount: {formatCurrency(parseFloat(amount))}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bank Account</label>
                <div className="p-3 border rounded-md bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{bankingInfo.bankName}</p>
                      <p className="text-sm text-gray-500">
                        {bankingInfo.bankBranch} • {bankingInfo.maskedAccountNumber}
                      </p>
                      <p className="text-sm text-gray-500">{bankingInfo.accountName}</p>
                    </div>
                    <Badge variant="secondary">Primary</Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  This is your registered bank account for payroll
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for Advance</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Brief reason for advance request"
                  rows={3}
                  required
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">Important Notice</p>
                </div>
                <ul className="mt-2 text-sm text-amber-700 space-y-1">
                  <li>• Minimum advance: KES 100</li>
                  <li>• Maximum advance: KES {formatCurrency(transferLimit)}</li>
                  <li>• Advances are processed within 1-3 business days</li>
                  <li>• Source of funds: {advanceData.advanceSettings.sourceOfFunds === 'company_wallet' ? 'Company Wallet' : 'BlueHR'}</li>
                  {advanceData.advanceSettings.sourceOfFunds === 'blueHR' && (
                    <li>• Transaction fee: {advanceData.advanceSettings.transactionFeePercentage}% of advance amount</li>
                  )}
                  <li>• Advance will be deducted from your next salary</li>
                  <li>• Payment will be sent to: {bankingInfo.bankName} - {bankingInfo.maskedAccountNumber}</li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitting || !bankingInfo.isComplete}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                <Banknote className="mr-2 h-4 w-4" />
                    Request Advance via Bank Transfer
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Advance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(advanceData.availableAdvance)}</div>
              <p className="text-sm text-gray-500 mt-1">Based on your monthly income</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(advanceData.monthlyIncome)}</div>
              <p className="text-sm text-gray-500 mt-1">Your basic salary</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bank Account Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Bank</p>
                  <p className="font-medium">{bankingInfo.bankName || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Branch</p>
                  <p className="font-medium">{bankingInfo.bankBranch || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Number</p>
                  <p className="font-medium">{bankingInfo.maskedAccountNumber || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Name</p>
                  <p className="font-medium">{bankingInfo.accountName || 'Not set'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Advance Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: '2025-04-20', amount: 15000, status: 'pending', method: 'Bank Transfer' },
                  { date: '2025-04-15', amount: 5000, status: 'approved', method: 'Bank Transfer' }
                ].map((request, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">
                        {formatCurrency(request.amount)}
                      </p>
                      <Badge variant={request.status === 'approved' ? 'success' : 'secondary'}>
                        {request.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{request.date}</span>
                      <span>{request.method}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
