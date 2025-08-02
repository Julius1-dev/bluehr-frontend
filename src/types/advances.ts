export type AdvanceStatus = 'pending' | 'approved' | 'rejected' | 'repaid' | 'forgiven';
export type AdvanceSource = 'bluehr' | 'company_wallet';

export interface Advance {
  id: string;
  employeeId: string;
  employeeName: string;
  companyId: string;
  companyName: string;
  amount: number;
  fee: number;
  totalAmount: number;
  status: AdvanceStatus;
  source: AdvanceSource;
  requestDate: Date;
  approvedDate?: Date;
  dueDate: Date;
  repaymentAmount?: number;
  repaymentDate?: Date;
  notes?: string;
}

export interface Company {
  id: string;
  name: string;
  advanceEnabled: boolean;
  source: AdvanceSource;
  totalAdvances: number;
  totalRepaid: number;
  outstandingBalance: number;
  lastAdvanceDate?: Date;
  nextRepaymentDate?: Date;
  status: 'active' | 'suspended' | 'inactive';
}

export const mockCompanies: Company[] = [
  {
    id: 'comp_001',
    name: 'Acme Inc',
    advanceEnabled: true,
    source: 'bluehr',
    totalAdvances: 125000,
    totalRepaid: 75000,
    outstandingBalance: 50000,
    lastAdvanceDate: new Date(2024, 4, 15),
    nextRepaymentDate: new Date(2024, 5, 15),
    status: 'active'
  },
  {
    id: 'comp_002',
    name: 'TechCorp',
    advanceEnabled: true,
    source: 'company_wallet',
    totalAdvances: 250000,
    totalRepaid: 200000,
    outstandingBalance: 50000,
    lastAdvanceDate: new Date(2024, 4, 10),
    nextRepaymentDate: new Date(2024, 5, 10),
    status: 'active'
  },
];

export const mockAdvances: Advance[] = [
  {
    id: 'adv_001',
    employeeId: 'emp_001',
    employeeName: 'John Doe',
    companyId: 'comp_001',
    companyName: 'Acme Inc',
    amount: 15000,
    fee: 900, // 6% of 15000
    totalAmount: 15900,
    status: 'approved',
    source: 'bluehr',
    requestDate: new Date(2024, 4, 1),
    approvedDate: new Date(2024, 4, 2),
    dueDate: new Date(2024, 5, 1),
    notes: 'Emergency advance'
  },
  {
    id: 'adv_002',
    employeeId: 'emp_002',
    employeeName: 'Jane Smith',
    companyId: 'comp_002',
    companyName: 'TechCorp',
    amount: 10000,
    fee: 100, // Fixed KSH 100 for company wallet
    totalAmount: 10100,
    status: 'approved',
    source: 'company_wallet',
    requestDate: new Date(2024, 4, 5),
    approvedDate: new Date(2024, 4, 5),
    dueDate: new Date(2024, 5, 5),
    notes: 'Salary advance'
  },
];
