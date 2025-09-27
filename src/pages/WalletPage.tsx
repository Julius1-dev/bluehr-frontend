import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownRight, Ban as Bank, Receipt, PiggyBank, ArrowRight, Phone } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function WalletPage() {
  const navigate = useNavigate();
  const walletInfo = {
    balance: 850.75,
    monthlyIncome: 4200.00,
    availableAdvance: 2520.00,
    savingsGoal: 5000.00,
    currentSavings: 3250.00
  };

  const recentTransactions = [
    {
      id: 1,
      type: 'deposit',
      description: 'Salary Advance',
      amount: 500.00,
      date: new Date('2025-04-20'),
      status: 'completed'
    },
    {
      id: 2,
      type: 'withdrawal',
      description: 'Bank Transfer',
      amount: -200.00,
      date: new Date('2025-04-18'),
      status: 'completed'
    },
    {
      id: 3,
      type: 'deposit',
      description: 'Expense Reimbursement',
      amount: 150.00,
      date: new Date('2025-04-15'),
      status: 'completed'
    }
  ];

  const savingsGoals = [
    {
      id: 1,
      name: 'Emergency Fund',
      target: 5000.00,
      current: 3250.00,
      deadline: new Date('2025-12-31')
    },
    {
      id: 2,
      name: 'Vacation Fund',
      target: 2000.00,
      current: 800.00,
      deadline: new Date('2025-08-31')
    }
  ];

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
        <h1 className="text-2xl font-bold">Digital Wallet</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bank className="mr-2 h-4 w-4" />
            Link Bank Account
          </Button>
          <Button>
            <CreditCard className="mr-2 h-4 w-4" />
            Add Money
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-blue-100">Available Balance</p>
                <h2 className="text-3xl font-bold mt-1">{formatCurrency(walletInfo.balance)}</h2>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm text-blue-100">Monthly Income</div>
                <div className="text-xl font-semibold mt-1">{formatCurrency(walletInfo.monthlyIncome)}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm text-blue-100">Available for Advance</div>
                <div className="text-xl font-semibold mt-1">{formatCurrency(walletInfo.availableAdvance)}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Bank className="mr-2 h-4 w-4" />
                Transfer to Bank
              </Button>
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Receipt className="mr-2 h-4 w-4" />
                View Statement
              </Button>
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => navigate('/withdraw-mpesa')}
              >
                <Phone className="mr-2 h-4 w-4" />
                Transfer to M-Pesa
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Savings Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <PiggyBank className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Savings</p>
                  <p className="text-2xl font-semibold">{formatCurrency(walletInfo.currentSavings)}</p>
                </div>
              </div>
              <Progress 
                value={(walletInfo.currentSavings / walletInfo.savingsGoal) * 100} 
                className="h-2" 
              />
              <p className="text-sm text-gray-500">
                {Math.round((walletInfo.currentSavings / walletInfo.savingsGoal) * 100)}% of {formatCurrency(walletInfo.savingsGoal)} goal
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="savings">Savings Goals</TabsTrigger>
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
                {recentTransactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'deposit' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-amber-100 text-amber-600'
                      }`}>
                        {transaction.type === 'deposit' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-semibold ${
                        transaction.type === 'deposit' ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {transaction.type === 'deposit' ? '+' : '-'}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </span>
                      <Badge variant={transaction.status === 'completed' ? 'success' : 'default'}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="savings">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Savings Goals</CardTitle>
                <Button variant="outline" size="sm">
                  <PiggyBank className="mr-2 h-4 w-4" />
                  New Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savingsGoals.map((goal) => (
                  <div 
                    key={goal.id}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{goal.name}</h3>
                        <p className="text-sm text-gray-500">
                          Target date: {formatDate(goal.deadline)}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {Math.round((goal.current / goal.target) * 100)}%
                      </Badge>
                    </div>
                    <Progress 
                      value={(goal.current / goal.target) * 100} 
                      className="h-2 mb-2" 
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        {formatCurrency(goal.current)} saved
                      </span>
                      <span className="font-medium">
                        Goal: {formatCurrency(goal.target)}
                      </span>
                    </div>
                  </div>
                ))}
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
    </div>
  );
}