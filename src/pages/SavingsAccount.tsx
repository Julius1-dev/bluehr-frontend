import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, Plus, Minus, ArrowRight, History, PiggyBank } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function SavingsAccount() {
  // Mock data for savings account
  const savingsData = {
    balance: 25000.00,
    interestRate: 7.5,
    interestEarned: 1560.25,
    lastInterestDate: new Date('2025-05-31'),
    nextInterestDate: new Date('2025-06-30')
  };

  // Mock transactions
  const transactions = [
    {
      id: 1,
      type: 'deposit',
      amount: 5000.00,
      date: new Date('2025-05-28'),
      description: 'Monthly savings',
      status: 'completed'
    },
    {
      id: 2,
      type: 'interest',
      amount: 1560.25,
      date: new Date('2025-05-31'),
      description: 'Monthly interest',
      status: 'completed'
    },
    {
      id: 3,
      type: 'withdrawal',
      amount: -2000.00,
      date: new Date('2025-05-15'),
      description: 'Emergency fund',
      status: 'completed'
    },
    {
      id: 4,
      type: 'deposit',
      amount: 10000.00,
      date: new Date('2025-04-30'),
      description: 'Initial deposit',
      status: 'completed'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Savings Account</h1>
        <div className="flex gap-2">
          <AddFundsDialog />
          <WithdrawFundsDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Savings Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Current Balance</p>
                  <p className="text-3xl font-bold">{formatCurrency(savingsData.balance)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <PiggyBank className="h-6 w-6 text-blue-600" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-500">Interest Rate</p>
                  <p className="text-xl font-semibold">{savingsData.interestRate}% p.a.</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-gray-500">Interest Earned</p>
                  <p className="text-xl font-semibold">{formatCurrency(savingsData.interestEarned)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Last Interest</p>
                  <p className="font-medium">{formatDate(savingsData.lastInterestDate)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Next Interest</p>
                  <p className="font-medium">{formatDate(savingsData.nextInterestDate)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-between">
              <span>Set Savings Goal</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              <span>Auto Save</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              <span>View Statements</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaction History</CardTitle>
            <Button variant="ghost" size="sm">
              <History className="mr-2 h-4 w-4" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    txn.type === 'deposit' ? 'bg-green-100 text-green-600' : 
                    txn.type === 'withdrawal' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {txn.type === 'deposit' ? (
                      <ArrowDown className="h-5 w-5" />
                    ) : txn.type === 'withdrawal' ? (
                      <ArrowUp className="h-5 w-5" />
                    ) : (
                      <PiggyBank className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{txn.description}</p>
                    <p className="text-sm text-gray-500">{formatDate(txn.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    txn.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {txn.amount > 0 ? '+' : ''}{formatCurrency(txn.amount)}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {txn.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AddFundsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Funds
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Funds to Savings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (KES)</Label>
            <Input id="amount" type="number" placeholder="Enter amount" />
          </div>
          <div className="space-y-2">
            <Label>Source Account</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wallet">Digital Wallet (KES 8,500.75)</SelectItem>
                <SelectItem value="bank">Equity Bank - ****4589</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full mt-4">
            Transfer to Savings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WithdrawFundsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Minus className="mr-2 h-4 w-4" />
          Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw from Savings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="withdrawAmount">Amount (KES)</Label>
            <Input id="withdrawAmount" type="number" placeholder="Enter amount" />
          </div>
          <div className="space-y-2">
            <Label>Destination</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wallet">Digital Wallet</SelectItem>
                <SelectItem value="bank">Equity Bank - ****4589</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="destructive" className="w-full mt-4">
            Withdraw Funds
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
