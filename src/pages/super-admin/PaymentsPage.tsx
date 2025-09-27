import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Filter, Download, CheckCircle2, XCircle, Clock, AlertCircle, Eye, FileText } from 'lucide-react';
import { BACKEND_URL } from '@/lib/config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded';
type PaymentMethod = 'credit_card' | 'mpesa' | 'super_admin';

interface Payment {
  id: string;
  invoice_number: string;
  company_name: string;
  plan_name: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  date: string;
  notes: string;
  user_count: number;
  price_per_user: number;
  plan_price: number;
}

const PAYMENTS_API = `${BACKEND_URL}/super-admin/payments`;

const PaymentsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [dateRange, _setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(PAYMENTS_API, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch payments');
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'refunded':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getMethodBadge = (method: PaymentMethod) => {
    switch (method) {
      case 'credit_card':
        return 'Credit Card';
      case 'mpesa':
        return 'M-Pesa';
      case 'super_admin':
        return 'Super Admin';
      default:
        return 'Other';
    }
  };

  const handleViewInvoice = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowInvoice(true);
  };

  const handleDownloadPDF = async (payment: Payment) => {
    if (!invoiceRef.current) return;
    
    try {
      toast.loading('Generating PDF...');
      
      // Create a temporary container for the invoice
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '800px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '40px';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      document.body.appendChild(tempContainer);

      // Clone the invoice content
      const invoiceContent = invoiceRef.current.cloneNode(true) as HTMLElement;
      tempContainer.appendChild(invoiceContent);

      // Wait for any images or fonts to load
      await new Promise(resolve => setTimeout(resolve, 100));

      // Convert to canvas
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempContainer.scrollHeight
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      pdf.save(`invoice-${payment.invoice_number}.pdf`);
      
      toast.dismiss();
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      toast.dismiss();
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.invoice_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesDateRange = 
      (!dateRange.from || new Date(payment.date) >= dateRange.from) && 
      (!dateRange.to || new Date(payment.date) <= new Date(dateRange.to.getTime() + 86400000));
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const totalRevenue = filteredPayments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pendingAmount = filteredPayments
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">
          View and manage all payment transactions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">From {filteredPayments.filter(p => p.status === 'completed').length} payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">From {filteredPayments.filter(p => p.status === 'pending').length} payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredPayments.filter(p => p.status === 'failed').length}
            </div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All payment transactions are listed below</CardDescription>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search payments..."
                  className="pl-8 w-[150px] lg:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="mr-2 h-4 w-4" />
                    Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                    All Payments
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('failed')}>
                    Failed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('refunded')}>
                    Refunded
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className="h-9">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Invoice</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Loading payments...
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.invoice_number}</TableCell>
                      <TableCell>{payment.company_name}</TableCell>
                      <TableCell>{payment.plan_name}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>{getMethodBadge(payment.method)}</TableCell>
                      <TableCell>{formatDate(payment.date)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewInvoice(payment)}
                          className="h-8 px-2"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Invoice
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No payments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Modal */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Invoice - {selectedPayment?.invoice_number}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedPayment && handleDownloadPDF(selectedPayment)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPayment && (
            <div ref={invoiceRef} className="space-y-6 bg-white p-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-blue-600">BlueHR</h2>
                  <p className="text-sm text-gray-600">Human Resources Management System</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-semibold">INVOICE</h3>
                  <p className="text-sm text-gray-600">#{selectedPayment.invoice_number}</p>
                  <p className="text-sm text-gray-600">Date: {formatDate(selectedPayment.date)}</p>
                </div>
              </div>

              {/* Company Info */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Bill To:</h4>
                  <p className="font-medium">{selectedPayment.company_name}</p>
                </div>
                <div className="text-right">
                  <h4 className="font-semibold text-gray-700 mb-2">Payment Details:</h4>
                  <p className="text-sm">Method: {getMethodBadge(selectedPayment.method)}</p>
                  <p className="text-sm">Status: {selectedPayment.status}</p>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Price per User</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Users</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium">{selectedPayment.plan_name}</p>
                          <p className="text-sm text-gray-600">Subscription Plan</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">{formatCurrency(selectedPayment.price_per_user)}</td>
                      <td className="px-4 py-4 text-right">{selectedPayment.user_count}</td>
                      <td className="px-4 py-4 text-right font-medium">{formatCurrency(selectedPayment.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-lg">{formatCurrency(selectedPayment.amount)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedPayment.notes && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Notes:</h4>
                  <p className="text-sm text-gray-600">{selectedPayment.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="border-t pt-4 text-center text-sm text-gray-500">
                <p>Thank you for your business!</p>
                <p>BlueHR - Human Resources Management System</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsPage;
