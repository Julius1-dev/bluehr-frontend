import { format } from 'date-fns';
import { Advance, Company, AdvanceStatus } from '@/types/advances';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return format(date, 'MMM d, yyyy');
};

export const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; class: string }> = {
    active: { label: 'Active', class: 'bg-green-100 text-green-800' },
    suspended: { label: 'Suspended', class: 'bg-yellow-100 text-yellow-800' },
    inactive: { label: 'Inactive', class: 'bg-gray-100 text-gray-800' },
    pending: { label: 'Pending', class: 'bg-blue-100 text-blue-800' },
    approved: { label: 'Approved', class: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejected', class: 'bg-red-100 text-red-800' },
    repaid: { label: 'Repaid', class: 'bg-purple-100 text-purple-800' },
    forgiven: { label: 'Forgiven', class: 'bg-gray-100 text-gray-800' },
  };
  return statusMap[status] || { label: 'Unknown', class: 'bg-gray-100 text-gray-800' };
};

export const getSourceBadge = (source: string) => {
  const sourceMap: Record<string, { label: string; class: string }> = {
    bluehr: { label: 'BlueHR', class: 'bg-blue-100 text-blue-800' },
    company_wallet: { label: 'Company Wallet', class: 'bg-purple-100 text-purple-800' },
  };
  return sourceMap[source] || { label: 'Unknown', class: 'bg-gray-100 text-gray-800' };
};

export const calculateTotals = (companies: Company[]) => {
  return companies.reduce(
    (totals, company) => {
      totals.totalAdvances += company.totalAdvances;
      totals.totalRepaid += company.totalRepaid;
      totals.outstandingBalance += company.outstandingBalance;
      
      if (company.source === 'bluehr') {
        totals.bluehrAdvances += company.totalAdvances;
        totals.bluehrFees += company.totalAdvances * 0.06; // 6% fee
      } else {
        totals.walletAdvances += company.totalAdvances;
        totals.walletFees += 100; // KSH 100 per company
      }
      
      return totals;
    },
    {
      totalAdvances: 0,
      totalRepaid: 0,
      outstandingBalance: 0,
      bluehrAdvances: 0,
      walletAdvances: 0,
      bluehrFees: 0,
      walletFees: 0,
    }
  );
};
