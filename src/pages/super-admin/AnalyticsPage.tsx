import { useState } from 'react';
import { format, subDays, addDays } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Search, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  Users, 
  UserPlus,
  UserX,
  Building2, 
  FileText, 
  DollarSign, 
  Filter,
  Calendar
} from 'lucide-react';

// Mock data - in a real app, this would come from an API
const mockCompanies = [
  { 
    id: 1, 
    name: 'Acme Inc', 
    users: 45, 
    activeUsers: 42, 
    newUsers: 5, 
    offboardedUsers: 2,
    mrr: 12500,
    arr: 150000,
    churnRate: 2.1,
    growthRate: 8.2,
    industry: 'Technology',
    plan: 'Enterprise',
    planName: 'Enterprise Plan',
    planRate: 25, // per user per month
    subscriptionStart: subDays(new Date(), 120),
    subscriptionEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    usersOnPlan: 42,
    lastPaymentDate: subDays(new Date(), 30),
    nextBillingDate: addDays(new Date(), 5), // Expiring soon
    status: 'active',
    // Advance program data
    advanceProgram: {
      totalAdvanced: 50000,
      totalRepaid: 45000,
      outstanding: 5000,
      lastAdvanceDate: subDays(new Date(), 15),
      nextRepaymentDate: addDays(new Date(), 15),
      withdrawalFees: 3000, // 6% of total advanced
      companyWallet: {
        balance: 10000,
        lastTransaction: subDays(new Date(), 5),
        transactionFee: 100 // KSH 100 per withdrawal
      }
    }
  },
  { 
    id: 2, 
    name: 'TechCorp', 
    users: 128, 
    activeUsers: 120, 
    newUsers: 15, 
    offboardedUsers: 3,
    mrr: 32500,
    arr: 390000,
    churnRate: 1.5,
    growthRate: 12.7,
    industry: 'Finance',
    plan: 'Business',
    planName: 'Business Pro',
    planRate: 20, // per user per month
    subscriptionStart: subDays(new Date(), 90),
    subscriptionEnd: new Date(new Date().setMonth(new Date().getMonth() + 6)),
    usersOnPlan: 120,
    lastPaymentDate: subDays(new Date(), 30),
    nextBillingDate: addDays(new Date(), 25),
    lastActive: new Date(),
    status: 'active',
    // Advance program data
    advanceProgram: {
      totalAdvanced: 120000,
      totalRepaid: 100000,
      outstanding: 20000,
      lastAdvanceDate: subDays(new Date(), 10),
      nextRepaymentDate: addDays(new Date(), 20),
      withdrawalFees: 7200, // 6% of total advanced
      companyWallet: {
        balance: 25000,
        lastTransaction: subDays(new Date(), 2),
        transactionFee: 100 // KSH 100 per withdrawal
      }
    }
  },
  { 
    id: 3, 
    name: 'Global Solutions', 
    users: 89, 
    activeUsers: 85, 
    newUsers: 8, 
    offboardedUsers: 1,
    mrr: 18750,
    arr: 225000,
    churnRate: 0.8,
    growthRate: 5.9,
    industry: 'Healthcare',
    plan: 'Professional',
    planName: 'Professional Plus',
    planRate: 15, // per user per month
    subscriptionStart: subDays(new Date(), 180),
    subscriptionEnd: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    usersOnPlan: 85,
    lastPaymentDate: subDays(new Date(), 30),
    nextBillingDate: addDays(new Date(), 2), // Expiring soon
    status: 'active',
    // Advance program data
    advanceProgram: {
      totalAdvanced: 35000,
      totalRepaid: 30000,
      outstanding: 5000,
      lastAdvanceDate: subDays(new Date(), 20),
      nextRepaymentDate: addDays(new Date(), 10),
      withdrawalFees: 2100, // 6% of total advanced
      companyWallet: {
        balance: 8000,
        lastTransaction: subDays(new Date(), 3),
        transactionFee: 100 // KSH 100 per withdrawal
      }
    }
  },
  { 
    id: 4, 
    name: 'Initech', 
    users: 156, 
    activeUsers: 145, 
    newUsers: 12, 
    offboardedUsers: 5,
    mrr: 23400,
    arr: 280800,
    churnRate: 1.2,
    growthRate: 9.5,
    industry: 'Technology',
    plan: 'Professional',
    planName: 'Professional Standard',
    planRate: 18, // per user per month
    subscriptionStart: subDays(new Date(), 60),
    subscriptionEnd: new Date(new Date().setMonth(new Date().getMonth() + 9)),
    usersOnPlan: 145,
    lastPaymentDate: subDays(new Date(), 30),
    nextBillingDate: addDays(new Date(), 15),
    lastActive: subDays(new Date(), 2),
    status: 'active',
    // Advance program data
    advanceProgram: {
      totalAdvanced: 75000,
      totalRepaid: 60000,
      outstanding: 15000,
      lastAdvanceDate: subDays(new Date(), 25),
      nextRepaymentDate: addDays(new Date(), 5),
      withdrawalFees: 4500, // 6% of total advanced
      companyWallet: {
        balance: 15000,
        lastTransaction: subDays(new Date(), 1),
        transactionFee: 100 // KSH 100 per withdrawal
      }
    }
  },
  { 
    id: 5, 
    name: 'Umbrella Corp',
    industry: 'Healthcare',
    plan: 'Enterprise',
    users: 320,
    activeUsers: 280,
    newUsers: 45,
    offboardedUsers: 15,
    mrr: 7999,
    churnRate: 1.8,
    growthRate: 9.2,
    status: 'active',
    lastActive: subDays(new Date(), 1),
  },
  {
    id: 6,
    name: 'Stark Industries',
    industry: 'Manufacturing',
    plan: 'Enterprise',
    users: 420,
    activeUsers: 380,
    newUsers: 65,
    offboardedUsers: 20,
    mrr: 9999,
    churnRate: 0.8,
    growthRate: 12.5,
    status: 'active',
    lastActive: new Date(),
  },
  {
    id: 7,
    name: 'Wayne Enterprises',
    industry: 'Technology',
    plan: 'Professional',
    users: 180,
    activeUsers: 120,
    newUsers: 15,
    offboardedUsers: 10,
    mrr: 3599,
    churnRate: 5.6,
    growthRate: 2.3,
    status: 'at_risk',
    lastActive: subDays(new Date(), 7),
  },
  {
    id: 8,
    name: 'Cyberdyne Systems',
    industry: 'Technology',
    plan: 'Starter',
    users: 65,
    activeUsers: 30,
    newUsers: 2,
    offboardedUsers: 8,
    mrr: 499,
    churnRate: 12.3,
    growthRate: -2.1,
    status: 'churned',
    lastActive: subDays(new Date(), 45),
  },
];

const companyActivity = [
  { name: 'Logins', value: 85 },
  { name: 'Active Users', value: 65 },
  { name: 'Inactive Users', value: 20 },
];

// Industry data for charts
const INDUSTRY_DATA = [
  { name: 'Technology', value: 35 },
  { name: 'Healthcare', value: 25 },
  { name: 'Finance', value: 20 },
  { name: 'Retail', value: 15 },
  { name: 'Education', value: 5 }
] as const;

const AnalyticsPage = () => {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('monthly');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [dateRange, setDateRange] = useState('last12months');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate monthly data for the past 12 months
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i)); // Go back 11 months from current
    return {
      month: format(date, 'MMM yyyy'),
      onboarded: Math.floor(Math.random() * 20) + 5,
      offboarded: Math.floor(Math.random() * 8) + 1,
      activeUsers: Math.floor(Math.random() * 200) + 50,
    };
  });

  // Generate yearly data for the past 5 years
  const currentYear = new Date().getFullYear();
  const yearlyData = Array.from({ length: 5 }, (_, i) => ({
    year: (currentYear - 4 + i).toString(),
    onboarded: Math.floor(Math.random() * 100) + 50,
    offboarded: Math.floor(Math.random() * 40) + 10,
    activeUsers: Math.floor(Math.random() * 1000) + 500,
  }));

  const chartData = timeRange === 'monthly' ? monthlyData : yearlyData;

  // Filter companies based on search and selection
  const filteredCompanies = mockCompanies.filter(company => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = company.name.toLowerCase().includes(searchLower) ||
                       (company.industry || '').toLowerCase().includes(searchLower);
    const matchesCompany = selectedCompany === 'all' || company.id.toString() === selectedCompany;
    return matchesSearch && matchesCompany;
  });

  // Calculate metrics
  const totalUsers = mockCompanies.reduce((sum, company) => sum + company.users, 0);
  const totalActiveUsers = mockCompanies.reduce((sum, company) => sum + company.activeUsers, 0);
  const totalNewUsers = mockCompanies.reduce((sum, company) => sum + company.newUsers, 0);
  const totalOffboarded = mockCompanies.reduce((sum, company) => sum + company.offboardedUsers, 0);
  const totalMrr = mockCompanies.reduce((sum, company) => sum + company.mrr, 0);
  const avgChurnRate = mockCompanies.reduce((sum, company) => sum + company.churnRate, 0) / mockCompanies.length;
  const avgGrowthRate = mockCompanies.reduce((sum, company) => sum + company.growthRate, 0) / mockCompanies.length;

  // Calculate company health score
  const calculateHealthScore = (company: any) => {
    const activityScore = (company.activeUsers / company.users) * 40;
    const growthScore = Math.min(company.growthRate * 2, 30);
    const churnPenalty = company.churnRate * 5;
    const recencyPenalty = company.lastActive > subDays(new Date(), 7) ? 0 : 10;
    return Math.max(0, Math.min(100, activityScore + growthScore - churnPenalty - recencyPenalty));
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Refresh data (simulated)
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      active: { label: 'Active', class: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inactive', class: 'bg-gray-100 text-gray-800' },
      at_risk: { label: 'At Risk', class: 'bg-yellow-100 text-yellow-800' },
      churned: { label: 'Churned', class: 'bg-red-100 text-red-800' }
    };
    return statusMap[status] || { label: 'Unknown', class: 'bg-gray-100 text-gray-800' };
  };

  // Generate chart data for industries distribution
  const industryData = INDUSTRY_DATA.map((industry, index) => ({
    ...industry,
    color: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A4DE6C', '#D0ED57', '#FFC658'][index % 7] || '#999999'
  }));

  // Add type for the industry data
  type IndustryData = typeof industryData[number];

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalMrr)}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+12.5%</span> from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockCompanies.length}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+2</span> from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Churn Rate</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercent(avgChurnRate)}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-red-500">+0.5%</span> from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Growth Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercent(avgGrowthRate)}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+3.2%</span> from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>MRR Overview</CardTitle>
                  <CardDescription>Monthly Recurring Revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>New vs. Active Users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="activeUsers" fill="#8884d8" name="Active Users" />
                        <Bar dataKey="newUsers" fill="#82ca9d" name="New Users" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'companies':
        return (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search companies..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="at_risk">At Risk</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRR</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health Score</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCompanies.map((company) => (
                      <tr key={company.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{company.name}</div>
                              <div className="text-sm text-gray-500">{company.plan}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{company.industry}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(company.mrr)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{company.users}</div>
                          <div className="text-xs text-gray-500">{company.activeUsers} active</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusBadge(company.status).class}>
                            {getStatusBadge(company.status).label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  calculateHealthScore(company) > 70 ? 'bg-green-500' : 
                                  calculateHealthScore(company) > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${calculateHealthScore(company)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500">{Math.round(calculateHealthScore(company))}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );
      case 'revenue':
        // Calculate revenue metrics
        const totalArr = mockCompanies.reduce((sum, company) => sum + (company.arr || 0), 0);
        const totalAdvanceFees = mockCompanies.reduce(
          (sum, company) => sum + (company.advanceProgram?.withdrawalFees || 0), 0
        );
        const totalWalletFees = mockCompanies.reduce(
          (sum, company) => sum + (company.advanceProgram?.companyWallet?.transactionFee || 0), 0
        );
        const totalRevenue = totalMrr + totalAdvanceFees + totalWalletFees;
        
        // Get companies with expiring subscriptions (within 30 days)
        const expiringSoon = mockCompanies.filter(company => {
          return company.nextBillingDate && 
                 company.nextBillingDate <= addDays(new Date(), 30) &&
                 company.status === 'active';
        });

        // Revenue by source data for pie chart
        const revenueBySource = [
          { name: 'Subscriptions', value: totalMrr, color: '#0088FE' },
          { name: 'Advance Fees (6%)', value: totalAdvanceFees, color: '#00C49F' },
          { name: 'Wallet Fees (KSH 100)', value: totalWalletFees, color: '#FFBB28' },
        ];

        // Monthly revenue data for area chart
        const monthlyRevenueData = Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (11 - i));
          const month = format(date, 'MMM yyyy');
          
          // Simulate monthly revenue with some variance
          const baseRevenue = totalMrr / 12;
          const variance = 0.2 * baseRevenue * (Math.random() - 0.5);
          const monthlyRevenue = Math.max(0, baseRevenue + variance);
          
          return {
            month,
            revenue: Math.round(monthlyRevenue),
            advanceFees: Math.round((totalAdvanceFees / 12) * (0.8 + Math.random() * 0.4)),
            walletFees: Math.round((totalWalletFees / 12) * (0.8 + Math.random() * 0.4))
          };
        });

        return (
          <div className="space-y-6">
            {/* Revenue Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalMrr)}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+12.5%</span> from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total ARR</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalArr)}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+8.2%</span> from last year
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Advance Program Fees</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalAdvanceFees)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(totalWalletFees)} from wallet fees
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+15.3%</span> from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Charts */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Monthly recurring revenue and fees</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" name="Subscription Revenue" stroke="#0088FE" fill="#0088FE" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="advanceFees" name="Advance Fees (6%)" stroke="#00C49F" fill="#00C49F" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="walletFees" name="Wallet Fees (KSH 100)" stroke="#FFBB28" fill="#FFBB28" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Source</CardTitle>
                  <CardDescription>Breakdown of total revenue</CardDescription>
                </CardHeader>
                <CardContent className="h-80 flex flex-col items-center justify-center">
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={revenueBySource}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {revenueBySource.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Expiring Subscriptions */}
            <Card>
              <CardHeader>
                <CardTitle>Expiring Subscriptions</CardTitle>
                <CardDescription>
                  Companies with subscriptions expiring in the next 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {expiringSoon.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renewal Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {expiringSoon.map((company) => (
                          <tr key={company.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <Building2 className="h-5 w-5 text-gray-500" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{company.name}</div>
                                  <div className="text-sm text-gray-500">{company.industry}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{company.planName || company.plan}</div>
                              <div className="text-sm text-gray-500">{company.usersOnPlan} users</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {company.nextBillingDate ? format(company.nextBillingDate, 'MMM d, yyyy') : 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {company.nextBillingDate ? 
                                  `${Math.ceil((company.nextBillingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days` : 
                                  'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatCurrency(company.mrr)}</div>
                              <div className="text-sm text-gray-500">
                                {company.planRate ? `${formatCurrency(company.planRate)}/user` : ''}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={getStatusBadge(company.status).class}>
                                {getStatusBadge(company.status).label}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No subscriptions expiring in the next 30 days
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of platform usage and business metrics
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="last3months">Last 3 months</SelectItem>
              <SelectItem value="last12months">Last 12 months</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart2 className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="companies">
            <Building2 className="mr-2 h-4 w-4" />
            Companies
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="revenue">
            <DollarSign className="mr-2 h-4 w-4" />
            Revenue
          </TabsTrigger>
        </TabsList>
        
        <div className="space-y-4">
          {renderTabContent()}
        </div>
      </Tabs>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{totalNewUsers} from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserPlus className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((totalActiveUsers / totalUsers) * 100).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalNewUsers}</div>
            <p className="text-xs text-muted-foreground">
              {((totalNewUsers / totalUsers) * 100).toFixed(1)}% user growth
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offboarded Users</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOffboarded}</div>
            <p className="text-xs text-muted-foreground">
              {((totalOffboarded / totalUsers) * 100).toFixed(1)}% churn rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* User Growth Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>User Activity</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant={timeRange === 'monthly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange('monthly')}
                >
                  Monthly
                </Button>
                <Button
                  variant={timeRange === 'yearly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange('yearly')}
                >
                  Yearly
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey={timeRange === 'monthly' ? 'month' : 'year'} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="onboarded" name="Onboarded" fill="#0088FE" />
                <Bar dataKey="offboarded" name="Offboarded" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Company Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Company Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex flex-col items-center justify-center">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={companyActivity}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {industryData.map((industry: IndustryData, index: number) => (
                      <Cell key={`cell-${index}`} fill={industry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company-wise Analytics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Company-wise Analytics</CardTitle>
            <div className="w-64">
              <Select 
                value={selectedCompany} 
                onValueChange={setSelectedCompany}
              >
                <SelectTrigger>
                  <Building2 className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {mockCompanies.map(company => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-muted-foreground border-b">
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4 text-right">Total Users</th>
                  <th className="py-3 px-4 text-right">Active Users</th>
                  <th className="py-3 px-4 text-right">New Users</th>
                  <th className="py-3 px-4 text-right">Offboarded</th>
                  <th className="py-3 px-4 text-right">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{company.name}</td>
                    <td className="py-3 px-4 text-right">{company.users}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-medium">{company.activeUsers}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({(company.activeUsers / company.users * 100).toFixed(0)}%)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-green-600">
                      +{company.newUsers}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600">
                      -{company.offboardedUsers}
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${(company.activeUsers / company.users) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
