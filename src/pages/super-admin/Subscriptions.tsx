import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Plus, 
  Building2, 
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Receipt,
  RefreshCw,
  TrendingUp,
  Users,
  XCircle,
  Calendar,
  Check,
  X,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';

// Helper Components
const StatusBadge = ({ status }: { status: SubscriptionStatus }) => {
  const statusMap: Record<SubscriptionStatus, { text: string; icon: React.ReactNode; variant: string }> = {
    active: { 
      text: 'Active', 
      icon: <CheckCircle2 className="h-3 w-3" />, 
      variant: 'bg-green-100 text-green-800' 
    },
    trial: { 
      text: 'Trial', 
      icon: <Clock className="h-3 w-3" />, 
      variant: 'bg-blue-100 text-blue-800' 
    },
    past_due: { 
      text: 'Past Due', 
      icon: <AlertCircle className="h-3 w-3" />, 
      variant: 'bg-yellow-100 text-yellow-800' 
    },
    canceled: { 
      text: 'Canceled', 
      icon: <XCircle className="h-3 w-3" />, 
      variant: 'bg-gray-100 text-gray-800' 
    },
    paused: { 
      text: 'Paused', 
      icon: <Clock className="h-3 w-3" />, 
      variant: 'bg-gray-100 text-gray-800' 
    },
  };

  const { text, icon, variant } = statusMap[status] || { 
    text: status, 
    icon: <AlertCircle className="h-3 w-3" />, 
    variant: 'bg-gray-100 text-gray-800' 
  };

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variant}`}>
      {icon}
      <span className="ml-1">{text}</span>
    </div>
  );
};

const InvoiceStatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { text: string; variant: string }> = {
    paid: { text: 'Paid', variant: 'bg-green-100 text-green-800' },
    pending: { text: 'Pending', variant: 'bg-yellow-100 text-yellow-800' },
    failed: { text: 'Failed', variant: 'bg-red-100 text-red-800' },
    refunded: { text: 'Refunded', variant: 'bg-purple-100 text-purple-800' },
  };

  const { text, variant } = statusMap[status] || { text: status, variant: 'bg-gray-100 text-gray-800' };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variant}`}>
      {text}
    </span>
  );
};

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '—';
  return format(new Date(dateString), 'MMM d, yyyy');
};

// Type definitions
type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'canceled' | 'paused';
type BillingCycle = 'monthly' | 'yearly' | 'none';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  downloadUrl?: string;
  receiptUrl?: string;
}

interface Subscription {
  id: string;
  company: string;
  plan: string;
  status: SubscriptionStatus;
  users: number;
  amount: number;
  billingCycle: BillingCycle;
  nextBillingDate: string | null;
  startDate: string;
  endDate?: string;
  paymentMethod: string;
  trialEnds?: string;
  invoices: Invoice[];
}

// Main component
export default function Subscriptions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Subscription; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  // Keep this state for future use with subscription actions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const itemsPerPage = 10;

  // Toggle row expansion
  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Filter subscriptions
  const filteredSubscriptions = mockSubscriptions.filter(subscription => {
    const matchesSearch = 
      subscription.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.plan.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    const matchesPlan = planFilter === 'all' || subscription.plan.toLowerCase() === planFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Sort subscriptions
  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key as keyof Subscription];
    const bValue = b[sortConfig.key as keyof Subscription];
    
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedSubscriptions.length / itemsPerPage);
  const paginatedSubscriptions = sortedSubscriptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const requestSort = (key: keyof Subscription) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePlanFilterChange = (value: string) => {
    setPlanFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleInvoiceDownload = (invoiceId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log(`Downloading invoice ${invoiceId}`);
    // In a real app, this would trigger a file download
  };

  const handleInvoiceView = (invoiceId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log(`Viewing invoice ${invoiceId}`);
    // In a real app, this would open a modal or navigate to a receipt page
  };

  // Commented out unused function
  // const handleSubscriptionAction = (action: string, subscriptionId: string, event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   console.log(`${action} subscription ${subscriptionId}`);
  //   // In a real app, this would trigger the appropriate action
  // };

  // Calculate summary metrics
  const totalMRR = mockSubscriptions
    .filter(sub => sub.status === 'active' || sub.status === 'trial')
    .reduce((sum, sub) => sum + (sub.amount || 0), 0);

  const activeSubscriptions = mockSubscriptions.filter(sub => sub.status === 'active').length;
  const trialSubscriptions = mockSubscriptions.filter(sub => sub.status === 'trial').length;
  const pastDueSubscriptions = mockSubscriptions.filter(sub => sub.status === 'past_due').length;

  // Unique plans for filter dropdown
  const uniquePlans = Array.from(new Set(mockSubscriptions.map(sub => sub.plan)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage company subscriptions and billing
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Subscription
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMRR)}</div>
            <p className="text-xs text-muted-foreground">
              Monthly Recurring Revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Active Subscriptions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Trials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trialSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Active Trials
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Past Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastDueSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Subscriptions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search subscriptions..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={planFilter} onValueChange={handlePlanFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  {uniquePlans.map(plan => (
                    <SelectItem key={plan} value={plan.toLowerCase()}>
                      {plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Subscriptions Table */}
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('company')}
                  >
                    <div className="flex items-center">
                      Company
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('nextBillingDate')}
                  >
                    <div className="flex items-center">
                      Next Billing
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-10">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSubscriptions.length > 0 ? (
                  paginatedSubscriptions.map((subscription) => (
                    <React.Fragment key={subscription.id}>
                      <TableRow 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleRow(subscription.id)}
                      >
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(subscription.id);
                            }}
                          >
                            {expandedRows.has(subscription.id) ? (
                              <ChevronUpIcon className="h-4 w-4" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4" />
                            )}
                            <span className="sr-only">Toggle</span>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium">{subscription.company}</div>
                              <div className="text-sm text-gray-500">
                                {subscription.billingCycle === 'yearly' ? 'Annual' : 'Monthly'} • {subscription.paymentMethod}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-purple-100 text-purple-800">
                            {subscription.plan}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {subscription.amount > 0 ? (
                            <>
                              {formatCurrency(subscription.amount)}
                              <span className="text-xs text-gray-500 ml-1">
                                /{subscription.billingCycle === 'yearly' ? 'yr' : 'mo'}
                              </span>
                            </>
                          ) : (
                            'Free'
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={subscription.status} />
                        </TableCell>
                        <TableCell>
                          {subscription.nextBillingDate ? (
                            <div className="text-sm">
                              {formatDate(subscription.nextBillingDate)}
                              {subscription.status === 'trial' && subscription.trialEnds && (
                                <div className="text-xs text-amber-600">
                                  Trial ends {formatDate(subscription.trialEnds)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubscription(subscription);
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded row with invoice details */}
                      {expandedRows.has(subscription.id) && (
                        <TableRow className="bg-gray-50">
                          <TableCell colSpan={7} className="p-0">
                            <div className="px-6 py-4">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="font-medium">Billing History</h4>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Refresh
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export All
                                  </Button>
                                </div>
                              </div>
                              
                              {subscription.invoices.length > 0 ? (
                                <div className="border rounded-md overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Invoice</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-20"></TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {subscription.invoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                          <TableCell className="font-medium">
                                            <div className="flex items-center">
                                              <FileText className="h-4 w-4 mr-2 text-gray-400" />
                                              {invoice.id}
                                            </div>
                                          </TableCell>
                                          <TableCell>{formatDate(invoice.date)}</TableCell>
                                          <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                                          <TableCell>
                                            <InvoiceStatusBadge status={invoice.status} />
                                          </TableCell>
                                          <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                              {invoice.receiptUrl && (
                                                <Button 
                                                  variant="ghost" 
                                                  size="icon" 
                                                  className="h-8 w-8"
                                                  onClick={(e) => handleInvoiceView(invoice.id, e)}
                                                >
                                                  <Receipt className="h-4 w-4" />
                                                  <span className="sr-only">View Receipt</span>
                                                </Button>
                                              )}
                                              <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8"
                                                onClick={(e) => handleInvoiceDownload(invoice.id, e)}
                                              >
                                                <Download className="h-4 w-4" />
                                                <span className="sr-only">Download</span>
                                              </Button>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  <p>No billing history found for this subscription.</p>
                                </div>
                              )}
                              
                              <div className="mt-6 flex justify-end space-x-3">
                                <Button variant="outline" size="sm">
                                  <X className="mr-2 h-4 w-4" />
                                  Cancel Subscription
                                </Button>
                                <Button variant="outline" size="sm">
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Update Payment Method
                                </Button>
                                <Button size="sm">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Create Invoice
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No subscriptions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredSubscriptions.length)}
              </span>{' '}
              of <span className="font-medium">{filteredSubscriptions.length}</span> subscriptions
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-2 text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Mock data for subscriptions
const mockSubscriptions: Subscription[] = [
  {
    id: 'sub_1',
    company: 'Acme Corporation',
    plan: 'Enterprise',
    status: 'active',
    users: 245,
    amount: 2499,
    billingCycle: 'monthly',
    nextBillingDate: '2023-07-01T00:00:00Z',
    startDate: '2023-01-15T00:00:00Z',
    paymentMethod: 'Visa •••• 4242',
    invoices: [
      { id: 'inv_1', date: '2023-06-01T00:00:00Z', amount: 2499, status: 'paid', downloadUrl: '#', receiptUrl: '#' },
      { id: 'inv_2', date: '2023-05-01T00:00:00Z', amount: 2499, status: 'paid', downloadUrl: '#', receiptUrl: '#' },
    ],
  },
  {
    id: 'sub_2',
    company: 'Tech Solutions Inc.',
    plan: 'Business',
    status: 'active',
    users: 87,
    amount: 999,
    billingCycle: 'monthly',
    nextBillingDate: '2023-07-05T00:00:00Z',
    startDate: '2023-03-22T00:00:00Z',
    paymentMethod: 'Mastercard •••• 5678',
    invoices: [
      { id: 'inv_3', date: '2023-06-05T00:00:00Z', amount: 999, status: 'paid', downloadUrl: '#', receiptUrl: '#' },
      { id: 'inv_4', date: '2023-05-05T00:00:00Z', amount: 999, status: 'paid', downloadUrl: '#', receiptUrl: '#' },
    ],
  },
  {
    id: 'sub_3',
    company: 'Global Systems',
    plan: 'Starter',
    status: 'trial',
    users: 12,
    amount: 0,
    billingCycle: 'monthly',
    nextBillingDate: '2023-06-25T00:00:00Z',
    startDate: '2023-05-25T00:00:00Z',
    paymentMethod: 'Trial',
    trialEnds: '2023-06-25T00:00:00Z',
    invoices: [],
  },
  {
    id: 'sub_4',
    company: 'InnoTech',
    plan: 'Business',
    status: 'past_due',
    users: 154,
    amount: 1998,
    billingCycle: 'yearly',
    nextBillingDate: '2024-02-28T00:00:00Z',
    startDate: '2023-02-28T00:00:00Z',
    paymentMethod: 'Amex •••• 9012',
    invoices: [
      { id: 'inv_5', date: '2023-06-28T00:00:00Z', amount: 1998, status: 'failed', downloadUrl: '#' },
      { id: 'inv_6', date: '2022-02-28T00:00:00Z', amount: 1998, status: 'paid', downloadUrl: '#', receiptUrl: '#' },
    ],
  },
  {
    id: 'sub_5',
    company: 'DataSphere',
    plan: 'Enterprise',
    status: 'canceled',
    users: 0,
    amount: 0,
    billingCycle: 'none',
    nextBillingDate: null,
    startDate: '2022-11-15T00:00:00Z',
    endDate: '2023-05-15T00:00:00Z',
    paymentMethod: 'None',
    invoices: [
      { id: 'inv_7', date: '2023-04-15T00:00:00Z', amount: 2499, status: 'paid', downloadUrl: '#', receiptUrl: '#' },
      { id: 'inv_8', date: '2023-03-15T00:00:00Z', amount: 2499, status: 'paid', downloadUrl: '#', receiptUrl: '#' },
    ],
  },
];
