import { useState } from "react";
import { Advance } from "@/types/advances";
import {
  formatCurrency,
  formatDate,
  getStatusBadge,
} from "@/utils/advanceUtils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, CheckCircle2, XCircle, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdvancesTableProps {
  advances: Advance[];
  onForgiveAdvance: (advance: Advance) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function AdvancesTable({
  advances,
  onForgiveAdvance,
  searchTerm,
  onSearchChange,
}: AdvancesTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Advance;
    direction: "asc" | "desc";
  } | null>(null);

  const _requestSort = (key: keyof Advance) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "forgiven":
        return <CheckCircle2 className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const sortedAdvances = [...advances].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === bValue) return 0;

    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <input
            type="search"
            placeholder="Search advances..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Advance ID</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAdvances.length > 0 ? (
              sortedAdvances.map((advance) => {
                const status = getStatusBadge(advance.status);
                const statusIcon = getStatusIcon(advance.status);

                return (
                  <TableRow key={advance.id}>
                    <TableCell className="font-medium">
                      <div>{advance.employeeName}</div>
                      <div className="text-xs text-muted-foreground">
                        {advance.employeeId}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {advance.id}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(advance.amount)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(advance.fee)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {statusIcon}
                        <Badge variant="outline" className={status.class}>
                          {status.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(advance.requestDate)}</TableCell>
                    <TableCell>{formatDate(advance.dueDate)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          {advance.status === "approved" &&
                            advance.source === "bluehr" && (
                              <DropdownMenuItem
                                onClick={() => onForgiveAdvance(advance)}
                                className="text-purple-600"
                              >
                                Forgive Advance
                              </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No advances found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
