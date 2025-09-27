import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function AdvanceStatementPage() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  const statementData = {
    summary: {
      totalAdvanceTaken: 2500.0,
      totalRepaidBySelf: 800.0,
      totalRepaidByPayroll: 850.0,
      remainingBalance: 850.0,
      currentMonthAdvance: 500.0,
      currentMonthRepaid: 200.0,
    },
    transactions: [
      {
        id: 1,
        type: "advance_taken",
        description: "Salary Advance",
        amount: 500.0,
        date: new Date("2025-04-20"),
        method: "Direct Transfer",
        status: "completed",
        category: "advance_taken",
      },
      {
        id: 2,
        type: "repayment_self",
        description: "Mpesa Repayment",
        amount: -200.0,
        date: new Date("2025-04-18"),
        method: "Mpesa",
        status: "completed",
        category: "repayment_self",
      },
      {
        id: 3,
        type: "repayment_payroll",
        description: "Payroll Deduction",
        amount: -300.0,
        date: new Date("2025-04-15"),
        method: "Payroll",
        status: "completed",
        category: "repayment_payroll",
      },
      {
        id: 4,
        type: "advance_taken",
        description: "Emergency Advance",
        amount: 300.0,
        date: new Date("2025-04-12"),
        method: "Direct Transfer",
        status: "completed",
        category: "advance_taken",
      },
      {
        id: 5,
        type: "repayment_self",
        description: "Bank Transfer Repayment",
        amount: -150.0,
        date: new Date("2025-04-10"),
        method: "Bank Transfer",
        status: "completed",
        category: "repayment_self",
      },
      {
        id: 6,
        type: "repayment_payroll",
        description: "Payroll Deduction",
        amount: -250.0,
        date: new Date("2025-04-05"),
        method: "Payroll",
        status: "completed",
        category: "repayment_payroll",
      },
      {
        id: 7,
        type: "advance_taken",
        description: "Monthly Advance",
        amount: 400.0,
        date: new Date("2025-04-01"),
        method: "Direct Transfer",
        status: "completed",
        category: "advance_taken",
      },
      {
        id: 8,
        type: "repayment_self",
        description: "Mpesa Repayment",
        amount: -100.0,
        date: new Date("2025-03-28"),
        method: "Mpesa",
        status: "completed",
        category: "repayment_self",
      },
    ],
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "advance_taken":
        return <ArrowUpRight className="h-5 w-5 text-green-600" />;
      case "repayment_self":
        return <ArrowDownRight className="h-5 w-5 text-blue-600" />;
      case "repayment_payroll":
        return <ArrowDownRight className="h-5 w-5 text-amber-600" />;
      default:
        return <Receipt className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "advance_taken":
        return "bg-green-100 text-green-600";
      case "repayment_self":
        return "bg-blue-100 text-blue-600";
      case "repayment_payroll":
        return "bg-amber-100 text-amber-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "advance_taken":
        return "Advance Taken";
      case "repayment_self":
        return "Self Repayment";
      case "repayment_payroll":
        return "Payroll Repayment";
      default:
        return "Other";
    }
  };

  const filteredTransactions =
    selectedPeriod === "all"
      ? statementData.transactions
      : statementData.transactions.filter((t) => {
          const transactionDate = new Date(t.date);
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

          switch (selectedPeriod) {
            case "current_month":
              return transactionDate >= monthStart;
            case "last_month": {
              const lastMonthStart = new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                1
              );
              const lastMonthEnd = new Date(
                now.getFullYear(),
                now.getMonth(),
                0
              );
              return (
                transactionDate >= lastMonthStart &&
                transactionDate <= lastMonthEnd
              );
            }
            default:
              return true;
          }
        });

  const handleDownloadStatement = () => {
    // Mock download functionality
    console.log("Downloading statement...");
    alert("Statement download started. Check your downloads folder.");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/wallet")}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Advance Statement</h1>
            <p className="text-gray-500">
              Detailed view of your advance transactions
            </p>
          </div>
        </div>
        <Button onClick={handleDownloadStatement}>
          <Download className="mr-2 h-4 w-4" />
          Download Statement
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Advance Taken</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(statementData.summary.totalAdvanceTaken)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Repaid by Self</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(statementData.summary.totalRepaidBySelf)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Repaid by Payroll</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(statementData.summary.totalRepaidByPayroll)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Remaining Balance</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(statementData.summary.remainingBalance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex gap-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Time</option>
                <option value="current_month">Current Month</option>
                <option value="last_month">Last Month</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${getCategoryColor(
                      transaction.category
                    )}`}
                  >
                    {getCategoryIcon(transaction.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{transaction.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(transaction.category)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(transaction.date)} • {transaction.method}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`font-semibold ${
                      transaction.type.includes("advance")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type.includes("advance") ? "+" : ""}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </span>
                  <Badge
                    variant={
                      transaction.status === "completed" ? "success" : "default"
                    }
                  >
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
