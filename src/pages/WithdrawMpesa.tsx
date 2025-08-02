import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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

export function WithdrawMpesa() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

        const response = await fetch('http://localhost:4000/employee/advances/data', {
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

  const withdrawalLimit = advanceData?.availableAdvance || 1000.00;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !phoneNumber || !reason) {
      toast.error('Please fill in all fields');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amountValue > withdrawalLimit) {
      toast.error(`Amount cannot exceed ${formatCurrency(withdrawalLimit)}`);
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch('http://localhost:4000/employee/advances/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amountValue,
          method: 'mpesa',
          reason: reason
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Advance request submitted successfully!');
        // Reset form
        setAmount('');
        setPhoneNumber('');
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/wallet')} 
            className="rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Request Advance - M-Pesa</h1>
        </div>
      </div>

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
                  max={withdrawalLimit}
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
                <label className="text-sm font-medium">M-Pesa Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="254700000000"
                  pattern="254[0-9]{9}"
                  required
                />
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
                  <li>• Maximum advance: KES {formatCurrency(withdrawalLimit)}</li>
                  <li>• Source of funds: {advanceData.advanceSettings.sourceOfFunds === 'company_wallet' ? 'Company Wallet' : 'BlueHR'}</li>
                  {advanceData.advanceSettings.sourceOfFunds === 'blueHR' && (
                    <li>• Transaction fee: {advanceData.advanceSettings.transactionFeePercentage}% of advance amount</li>
                  )}
                  <li>• Advance will be deducted from your next salary</li>
                  <li>• You will receive an M-Pesa prompt for confirmation</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                <Phone className="mr-2 h-4 w-4" />
                    Request Advance via M-Pesa
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
              <CardTitle>Recent Advance Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: '2025-04-20', amount: 500, status: 'pending', method: 'M-Pesa' },
                  { date: '2025-04-15', amount: 1000, status: 'approved', method: 'M-Pesa' }
                ].map((request, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">
                        {formatCurrency(request.amount)}
                      </p>
                      <p className="text-xs text-gray-500">{request.date} • {request.method}</p>
                    </div>
                    <Badge variant={request.status === 'approved' ? 'success' : 'secondary'}>
                      {request.status}
                    </Badge>
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