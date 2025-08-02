import { useState } from 'react';
import { Company } from '@/types/advances';
import { formatCurrency } from '@/utils/advanceUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface CompaniesTableProps {
  companies: Company[];
  onSelectCompany: (company: Company) => void;
  onSuspendCompany: (company: Company) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function CompaniesTable({
  companies,
  onSelectCompany,
  onSuspendCompany,
  searchTerm,
  onSearchChange,
}: CompaniesTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Company; direction: 'asc' | 'desc' } | null>(null);

  const requestSort = (key: keyof Company) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      active: { label: 'Active', class: 'bg-green-100 text-green-800' },
      suspended: { label: 'Suspended', class: 'bg-yellow-100 text-yellow-800' },
      inactive: { label: 'Inactive', class: 'bg-gray-100 text-gray-800' },
    };
    return statusMap[status] || { label: 'Unknown', class: 'bg-gray-100 text-gray-800' };
  };

  const getSourceBadge = (source: string) => {
    const sourceMap: Record<string, { label: string; class: string }> = {
      bluehr: { label: 'BlueHR', class: 'bg-blue-100 text-blue-800' },
      company_wallet: { label: 'Company Wallet', class: 'bg-purple-100 text-purple-800' },
    };
    return sourceMap[source] || { label: 'Unknown', class: 'bg-gray-100 text-gray-800' };
  };

  const sortedCompanies = [...companies].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue === bValue) return 0;
    
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search companies..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center">
                  <span>Company</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-6 w-6 p-0"
                    onClick={() => requestSort('name')}
                  >
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end">
                  <span>Total Advances</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-6 w-6 p-0"
                    onClick={() => requestSort('totalAdvances')}
                  >
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end">
                  <span>Outstanding</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-6 w-6 p-0"
                    onClick={() => requestSort('outstandingBalance')}
                  >
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCompanies.length > 0 ? (
              sortedCompanies.map((company) => {
                const status = getStatusBadge(company.status);
                const source = getSourceBadge(company.source);
                
                return (
                  <TableRow 
                    key={company.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => onSelectCompany(company)}
                  >
                    <TableCell className="font-medium">
                      <div>{company.name}</div>
                      <div className="text-xs text-muted-foreground">{company.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={source.class}>
                        {source.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(company.totalAdvances)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(company.outstandingBalance)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={status.class}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onSelectCompany(company)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              onSuspendCompany(company);
                            }}
                            className={company.status === 'suspended' ? 'text-green-600' : 'text-yellow-600'}
                          >
                            {company.status === 'suspended' ? 'Activate Company' : 'Suspend Company'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No companies found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
