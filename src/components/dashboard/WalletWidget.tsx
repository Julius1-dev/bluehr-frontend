import React, { useEffect, useState } from 'react';
// Transaction type for advance statement
type Transaction = {
  id: string | number;
  type: 'deposit' | 'withdrawal';
  description: string;
  amount: number;
  date: string;
};
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Wallet as WalletIcon, ArrowRight, CreditCard, BarChart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '@/lib/config';

export function WalletWidget() {
  const navigate = useNavigate();
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [salary, setSalary] = useState<number | null>(null);

  useEffect(() => {
    const fetchAdvanceData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${BACKEND_URL}/employee/advances/data`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return;
      const result = await response.json();
      if (result.success && result.data) {
        setAvailableBalance(result.data.totalAdvanceBalance || null);
        setSalary(result.data.monthlyIncome || null);
      }
    };
    fetchAdvanceData();
  }, []);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
      async function fetchTransactions() {
        try {
          const res = await fetch("/employee/advances/statement", {
            credentials: "include",
          });
          if (!res.ok) throw new Error("Failed to fetch transactions");
          const data = await res.json();
          const mapped = (data.transactions || []).map((t: any) => ({
            id: t.id,
            type: t.type === 'Advance' ? 'deposit' : 'withdrawal',
            description: t.type === 'Advance' ? 'Salary Advance' : 'Repayment',
            amount: t.amount,
            date: t.date || t.createdAt || '',
          }));
          setTransactions(mapped);
        } catch (err) {
          setTransactions([]);
        }
      }
      fetchTransactions();
    }, []);

  // Calculate 33.33% of salary
  const advancePercent = 33.33;
  const availableForAdvance = salary ? (salary * advancePercent) / 100 : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Advance</CardTitle>
        <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => navigate('/advance')}>
          View All
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm opacity-90">Available Balance</div>
              <div className="text-2xl font-bold mt-1">
                {availableBalance !== null ? formatCurrency(availableBalance) : '--'}
              </div>
            </div>
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
              <WalletIcon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button 
              size="sm" 
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-none"
              onClick={() => navigate('/wallet')}
            >
              <CreditCard className="mr-1 h-4 w-4" />
              Top Up
            </Button>
            <Button 
              size="sm" 
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-none"
              onClick={() => navigate('/advance-statement')}
            >
              <BarChart className="mr-1 h-4 w-4" />
              Analytics
            </Button>
          </div>
        </div>
        {transactions.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Recent Transactions</h4>
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'deposit' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-amber-100 text-amber-600'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{transaction.description}</div>
                      <div className="text-xs text-gray-500">{transaction.date}</div>
                    </div>
                  </div>
                  <div className={`font-medium ${
                    transaction.type === 'deposit' ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {formatCurrency(Math.abs(transaction.amount))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Available for advance</span>
            <Badge variant="success">33.33% of salary</Badge>
          </div>
          <Button className="w-full" onClick={() => navigate('/wallet')}>
            Request Salary Advance
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}