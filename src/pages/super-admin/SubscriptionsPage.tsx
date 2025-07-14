import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Search, Filter, CreditCard, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type SubscriptionStatus = 'active' | 'expiring_soon' | 'expired' | 'suspended' | 'pending_payment';

interface Subscription {
  id: string;
  company: string;
  companyId: string;
  plan: string;
  planId: string;
  users: number;
  amount: number;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  lastPaymentDate?: Date;
  nextBillingDate: Date;
  autoRenew: boolean;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  paymentMethod?: string;
  notes?: string;
  createdBy: string;
  updatedAt: Date;
}

const COMPANIES_API = 'http://localhost:4000/super-admin/companies';
const USERS_API = 'http://localhost:4000/super-admin/users';
const PLANS_API = 'http://localhost:4000/super-admin/plans';

const SubscriptionsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        // Fetch companies
        const companiesRes = await fetch(COMPANIES_API, { headers: { 'Authorization': `Bearer ${token}` } });
        const companies = await companiesRes.json();
        // Fetch users
        const usersRes = await fetch(USERS_API, { headers: { 'Authorization': `Bearer ${token}` } });
        const users = await usersRes.json();
        // Fetch plans
        const plansRes = await fetch(PLANS_API, { headers: { 'Authorization': `Bearer ${token}` } });
        const plansData = await plansRes.json();
        setPlans(plansData);
        // Map companies to subscriptions
        const mapped = companies.map((company: any) => {
          const plan = plansData.find((p: any) => p.name === company.plan);
          const companyUsers = users.filter((u: any) => u.company_id === company.id);
          
          // Calculate payment status based on plan dates
          const now = new Date();
          const endDate = company.plan_end_date ? new Date(company.plan_end_date) : null;
          let paymentStatus: 'paid' | 'pending' | 'overdue' = 'pending';
          
          if (endDate) {
            if (endDate < now) {
              paymentStatus = 'overdue';
            } else {
              paymentStatus = 'paid';
            }
          }
          
          return {
            id: company.id,
            company: company.company_name,
            companyId: company.id,
            plan: company.plan,
            planId: plan ? plan.id : '',
            users: companyUsers.length,
            amount: plan ? plan.price : 0,
            status: company.status,
            startDate: company.plan_start_date ? new Date(company.plan_start_date) : new Date(),
            endDate: company.plan_end_date ? new Date(company.plan_end_date) : new Date(),
            lastPaymentDate: undefined,
            nextBillingDate: company.next_billing_date ? new Date(company.next_billing_date) : new Date(),
            autoRenew: false,
            paymentStatus: paymentStatus,
            paymentMethod: 'Bank Transfer',
            notes: '',
            createdBy: '',
            updatedAt: company.updated_at ? new Date(company.updated_at) : new Date()
          };
        });
        setSubscriptions(mapped);
      } catch (err) {
        // handle error
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper functions
  const getDaysRemaining = (endDate: Date | null | undefined) => {
    if (!endDate) return 0;
    const today = new Date();
    const timeDiff = endDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const getStatusBadge = (status: SubscriptionStatus, paymentStatus: 'paid' | 'pending' | 'overdue', endDate: Date) => {
    const daysRemaining = getDaysRemaining(endDate);
    
    if (status === 'active') {
      if (paymentStatus === 'overdue') {
        return { 
          label: 'Payment Overdue', 
          class: 'bg-red-100 text-red-800',
          daysText: `${daysRemaining} days remaining`
        };
      }
      return { 
        label: 'Active', 
        class: 'bg-green-100 text-green-800',
        daysText: `${daysRemaining} days remaining`
      };
    }
    
    const statusMap = {
      expiring_soon: { 
        label: 'Expiring Soon', 
        class: 'bg-yellow-100 text-yellow-800',
        daysText: `Expires in ${daysRemaining} days`
      },
      expired: { 
        label: 'Expired', 
        class: 'bg-red-100 text-red-800',
        daysText: 'Expired'
      },
      suspended: { 
        label: 'Suspended', 
        class: 'bg-gray-100 text-gray-800',
        daysText: 'Suspended'
      },
      pending_payment: { 
        label: 'Pending Payment', 
        class: 'bg-blue-100 text-blue-800',
        daysText: 'Awaiting payment'
      },
    };
    
    return statusMap[status] || { label: 'Unknown', class: 'bg-gray-100 text-gray-800', daysText: '' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Event handlers
  const handleRenewSubscription = (subscriptionId: string) => {
    console.log('Renew subscription:', subscriptionId);
  };

  const handleSendReminder = async (subscription: Subscription) => {
    setIsProcessing(prev => ({ ...prev, [subscription.id + '-reminder']: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Reminder sent to ${subscription.company}`);
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send reminder');
    } finally {
      setIsProcessing(prev => ({ ...prev, [subscription.id + '-reminder']: false }));
    }
  };

  const refreshSubscriptions = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const companiesRes = await fetch(COMPANIES_API, { headers: { 'Authorization': `Bearer ${token}` } });
      const companies = await companiesRes.json();
      const usersRes = await fetch(USERS_API, { headers: { 'Authorization': `Bearer ${token}` } });
      const users = await usersRes.json();
      const plansRes = await fetch(PLANS_API, { headers: { 'Authorization': `Bearer ${token}` } });
      const plansData = await plansRes.json();
      setPlans(plansData);
      const mapped = companies.map((company: any) => {
        const plan = plansData.find((p: any) => p.name === company.plan);
        const companyUsers = users.filter((u: any) => u.company_id === company.id);
        
        // Calculate payment status based on plan dates
        const now = new Date();
        const endDate = company.plan_end_date ? new Date(company.plan_end_date) : null;
        let paymentStatus: 'paid' | 'pending' | 'overdue' = 'pending';
        
        if (endDate) {
          if (endDate < now) {
            paymentStatus = 'overdue';
          } else {
            paymentStatus = 'paid';
          }
        }
        
        return {
          id: company.id,
          company: company.company_name,
          companyId: company.id,
          plan: company.plan,
          planId: plan ? plan.id : '',
          users: companyUsers.length,
          amount: plan ? plan.price : 0,
          status: company.status,
          startDate: company.plan_start_date ? new Date(company.plan_start_date) : new Date(),
          endDate: company.plan_end_date ? new Date(company.plan_end_date) : new Date(),
          lastPaymentDate: undefined,
          nextBillingDate: company.next_billing_date ? new Date(company.next_billing_date) : new Date(),
          autoRenew: false,
          paymentStatus: paymentStatus,
          paymentMethod: 'Bank Transfer',
          notes: '',
          createdBy: '',
          updatedAt: company.updated_at ? new Date(company.updated_at) : new Date()
        };
      });
      setSubscriptions(mapped);
    } catch (err) {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };
      
  const handleRecordPayment = async (companyId: string) => {
    setIsProcessing(prev => ({ ...prev, [companyId]: true }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${COMPANIES_API}/${companyId}/record-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ months: 1 })
      });
      if (!res.ok) throw new Error('Failed to record payment');
      await refreshSubscriptions();
      toast.success('Payment recorded');
    } catch (err) {
      toast.error('Failed to record payment');
    } finally {
      setIsProcessing(prev => ({ ...prev, [companyId]: false }));
    }
  };

  const handleChangePlan = async (companyId: string, newPlan: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${COMPANIES_API}/${companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ plan: newPlan })
      });
      if (!res.ok) throw new Error('Failed to change plan');
      await refreshSubscriptions();
      toast.success('Plan changed');
    } catch (err) {
      toast.error('Failed to change plan');
    }
  };

  // Filter subscriptions based on search and status
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        subscription.plan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage company subscriptions and billing
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/super-admin/pricing-plans')}
          >
            <Wallet className="mr-2 h-4 w-4" />
            Pricing Plans
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/super-admin/payments')}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            View Payments
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search subscriptions..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="pending_payment">Pending Payment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subscription List */}
      <div className="space-y-4">
        {filteredSubscriptions.map((subscription) => {
          const daysRemaining = getDaysRemaining(subscription.endDate);
          const isExpiringSoon = daysRemaining <= 30 && subscription.status !== 'expired';
          const status = getStatusBadge(subscription.status, subscription.paymentStatus, subscription.endDate || new Date());
          
          return (
            <Card key={subscription.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">{subscription.company}</h3>
                    <p className="text-sm text-muted-foreground">
                      {subscription.plan} • {subscription.users} users
                    </p>
                    <div className="flex items-center space-x-2 text-sm">
                      <Badge className={status.class}>
                        {status.label}
                      </Badge>
                      <span className="text-muted-foreground">
                        {formatDate(subscription.startDate || new Date())} - {formatDate(subscription.endDate || new Date())}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(subscription.amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {subscription.paymentStatus} • Next billing: {formatDate(subscription.nextBillingDate || new Date())}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleRecordPayment(subscription.id)}
                        disabled={isProcessing[subscription.id] || subscription.paymentStatus === 'paid'}
                      >
                        {isProcessing[subscription.id] ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          'Record Payment'
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSendReminder(subscription)}
                        disabled={isProcessing[subscription.id + '-reminder']}
                      >
                        {isProcessing[subscription.id + '-reminder'] ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          'Send Reminder'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/super-admin/amend-plan/${subscription.companyId}`)}
                      >
                        Amend Plan
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredSubscriptions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No subscriptions found</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsPage;
