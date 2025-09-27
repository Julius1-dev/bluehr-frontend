import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  RefreshCw,
  Pause,
} from "lucide-react";
import { PayrollProcessor } from "./PayrollProcessor";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { BACKEND_URL } from "@/lib/config";

// Mock utility function for formatting currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  }).format(amount);
};

// Mock utility function for formatting dates
const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
};

interface PayrollSchedulerProps {
  payrollData: {
    totalEmployees: number;
    totalSalary: number;
    averageSalary: number;
    nextPayrollDate: Date;
    payrollProcessingStatus: string;
  };
}

interface ScheduledPayroll {
  id: number;
  period: string;
  paymentFrequency: string;
  scheduleDate: string;
  status: string;
  createdAt: string;
  createdBy: string;
}

interface PayrollHistory {
  id: number;
  period: string;
  paymentFrequency: string;
  status: string;
  totalAmount: number;
  employeeCount: number;
  processedAt: string;
  processedBy: string;
}

export function PayrollScheduler({
  payrollData: _payrollData,
}: PayrollSchedulerProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [payrollDate, setPayrollDate] = useState("");
  const [payrollTime, setPayrollTime] = useState("09:00");
  const [isRecurring, setIsRecurring] = useState(true);
  const [scheduledPayrolls, setScheduledPayrolls] = useState<
    ScheduledPayroll[]
  >([]);
  const [_payrollHistory, setPayrollHistory] = useState<PayrollHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const [runningId, setRunningId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [_departments, setDepartments] = useState<any[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [_editEmployees, setEditEmployees] = useState<any[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [completedPayrolls, setCompletedPayrolls] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPaymentFrequency, setSelectedPaymentFrequency] =
    useState("monthly");
  const [_selectedFrequencyFilter, _setSelectedFrequencyFilter] =
    useState("all");

  // Fetch scheduled payrolls and history
  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      // Fetch scheduled payrolls
      try {
        const scheduledResponse = await fetch(
          `${BACKEND_URL}/company-admin/payroll/scheduled?paymentFrequency=${selectedFrequencyFilter}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (scheduledResponse.ok) {
          const scheduledData = await scheduledResponse.json();
          setScheduledPayrolls(scheduledData.scheduledPayrolls || []);
        } else if (scheduledResponse.status === 500) {
          // Handle case where scheduled payrolls table doesn't exist or has issues
          console.log(
            "Scheduled payrolls endpoint returned 500, setting empty array"
          );
          setScheduledPayrolls([]);
        } else {
          console.error(
            "Failed to fetch scheduled payrolls:",
            scheduledResponse.status
          );
          setScheduledPayrolls([]);
        }
      } catch (error) {
        console.error("Error fetching scheduled payrolls:", error);
        setScheduledPayrolls([]);
      }

      // Fetch payroll history
      try {
        const historyResponse = await fetch(
          `${BACKEND_URL}/company-admin/payroll/history?paymentFrequency=${selectedFrequencyFilter}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setPayrollHistory(historyData.payrollHistory || []);
        } else {
          console.error(
            "Failed to fetch payroll history:",
            historyResponse.status
          );
          setPayrollHistory([]);
        }
      } catch (error) {
        console.error("Error fetching payroll history:", error);
        setPayrollHistory([]);
      }
    } catch (error) {
      console.error("Error fetching payroll data:", error);
      toast.error("Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees and departments for payroll calculation
  const fetchEmployeesAndDepartments = async () => {
    try {
      setEditLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      // Fetch departments
      const deptRes = await fetch(`${BACKEND_URL}/company-admin/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const deptData = await deptRes.json();
      setDepartments(deptData);
      // Fetch employees
      const empRes = await fetch(`${BACKEND_URL}/company-admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const empData = await empRes.json();
      setEmployees(empData.filter((e: any) => e.role !== "admin"));
      setEditEmployees(empData.filter((e: any) => e.role !== "admin"));
    } catch (err: any) {
      setEditError(err.message || "Error fetching employees/departments");
    } finally {
      setEditLoading(false);
    }
  };

  // Fetch completed payrolls from backend
  const fetchCompletedPayrolls = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const res = await fetch(`${BACKEND_URL}/company-admin/payroll/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch completed payrolls");
      const data = await res.json();
      // Handle the response structure - data.payrollHistory or data directly
      const payrollHistory = data.payrollHistory || data || [];
      setCompletedPayrolls(Array.isArray(payrollHistory) ? payrollHistory : []);
    } catch (err) {
      console.error("Error fetching completed payrolls:", err);
      setCompletedPayrolls([]);
    }
  };

  useEffect(() => {
    fetchPayrollData();
    fetchEmployeesAndDepartments();
    fetchCompletedPayrolls();
  }, [selectedFrequencyFilter]);

  // Calculate payroll amount and employee count using real data and payroll logic
  const calculatePayrollSummary = () => {
    // Use the same logic as PayrollProcessor for each employee
    // (You may want to extract this to a shared util in the future)
    let totalSalary = 0;
    let totalEmployees = employees.length;
    employees.forEach((emp) => {
      let basicSalary = parseFloat(emp.basic_salary) || 0;
      let allowances = 0;
      let paymentFrequency = emp.payment_frequency || "monthly";
      if (paymentFrequency === "yearly") basicSalary = basicSalary / 12;
      const gross = basicSalary + allowances;
      const nssfVal = Math.min(
        4320,
        Math.min(8000, gross) * 0.06 +
          Math.max(0, Math.min(72000, gross) - 8000) * 0.06
      );
      const shifVal = Math.max(300, gross * 0.0275);
      const housingLevyVal = gross * 0.015;
      const taxableIncome = gross - nssfVal;
      let payeVal = 0;
      if (taxableIncome <= 24000) payeVal = taxableIncome * 0.1;
      else if (taxableIncome <= 32333)
        payeVal = 24000 * 0.1 + (taxableIncome - 24000) * 0.25;
      else if (taxableIncome <= 500000)
        payeVal =
          24000 * 0.1 + (32333 - 24000) * 0.25 + (taxableIncome - 32333) * 0.3;
      else if (taxableIncome <= 800000)
        payeVal =
          24000 * 0.1 +
          (32333 - 24000) * 0.25 +
          (500000 - 32333) * 0.3 +
          (taxableIncome - 500000) * 0.325;
      else
        payeVal =
          24000 * 0.1 +
          (32333 - 24000) * 0.25 +
          (500000 - 32333) * 0.3 +
          (800000 - 500000) * 0.325 +
          (taxableIncome - 800000) * 0.35;
      payeVal = Math.max(0, payeVal - 2400);
      const netPay = gross - (payeVal + shifVal + nssfVal + housingLevyVal);
      totalSalary += netPay;
    });
    return { totalSalary, totalEmployees };
  };
  const { totalSalary, totalEmployees } = calculatePayrollSummary();

  // Schedule a new payroll
  const handleSchedulePayroll = async () => {
    if (!selectedMonth || !selectedYear) {
      toast.error("Please select month and year");
      return;
    }

    try {
      setScheduling(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${BACKEND_URL}/company-admin/payroll/schedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            payrollMonth: selectedMonth,
            payrollYear: selectedYear,
            paymentFrequency: selectedPaymentFrequency,
          }),
        }
      );

      if (response.ok) {
        toast.success("Payroll scheduled successfully");
        setSelectedMonth("");
        setSelectedYear(new Date().getFullYear());
        setSelectedPaymentFrequency("monthly");
        fetchPayrollData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to schedule payroll");
      }
    } catch (error) {
      console.error("Error scheduling payroll:", error);
      toast.error("Failed to schedule payroll");
    } finally {
      setScheduling(false);
    }
  };

  // Run a scheduled payroll
  const handleRunNow = async (id: number) => {
    setRunningId(id);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const res = await fetch(
        `${BACKEND_URL}/company-admin/payroll/run-scheduled/${id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to run scheduled payroll");
      fetchPayrollData();
    } catch (err: any) {
      setError(err.message || "Error running payroll");
    } finally {
      setRunningId(null);
    }
  };

  // Edit modal handlers
  const handleOpenEditModal = () => {
    setEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };
  // Save and Run Later (store payroll data for scheduled run)
  const handleSaveAndRunLater = async (updatedEmployees: any[]) => {
    try {
      setEditLoading(true);
      setEditError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      // Store payroll data for scheduled run (use the same endpoint as PayrollProcessor)
      const res = await fetch(`${BACKEND_URL}/company-admin/payroll/store`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payrollMonth: new Date().toLocaleString("default", { month: "long" }),
          payrollYear: new Date().getFullYear(),
          employees: updatedEmployees,
        }),
      });
      if (!res.ok) throw new Error("Failed to save payroll data");
      setEditModalOpen(false);
      fetchPayrollData();
    } catch (err: any) {
      setEditError(err.message || "Error saving payroll data");
    } finally {
      setEditLoading(false);
    }
  };
  // Run Now (process payroll immediately)
  const handleRunNowFromEdit = async (updatedEmployees: any[]) => {
    try {
      setEditLoading(true);
      setEditError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      // Process payroll (use the same endpoint as PayrollProcessor)
      const res = await fetch(`${BACKEND_URL}/company-admin/payroll/process`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payrollMonth: new Date().toLocaleString("default", { month: "long" }),
          payrollYear: new Date().getFullYear(),
          employees: updatedEmployees,
        }),
      });
      if (!res.ok) throw new Error("Failed to process payroll");
      setEditModalOpen(false);
      fetchPayrollData();
    } catch (err: any) {
      setEditError(err.message || "Error processing payroll");
    } finally {
      setEditLoading(false);
    }
  };

  // Get status badge variant and icon
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return {
          variant: "success" as const,
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
          text: "Completed",
        };
      case "scheduled":
        return {
          variant: "outline" as const,
          icon: <Clock className="h-4 w-4 mr-1" />,
          text: "Scheduled",
        };
      case "processing":
        return {
          variant: "default" as const,
          icon: <RefreshCw className="h-4 w-4 mr-1 animate-spin" />,
          text: "Processing",
        };
      case "failed":
        return {
          variant: "danger" as const,
          icon: <AlertCircle className="h-4 w-4 mr-1" />,
          text: "Failed",
        };
      case "pending":
        return {
          variant: "warning" as const,
          icon: <Clock className="h-4 w-4 mr-1" />,
          text: "Pending",
        };
      case "cancelled":
        return {
          variant: "destructive" as const,
          icon: <Pause className="h-4 w-4 mr-1" />,
          text: "Cancelled",
        };
      default:
        return {
          variant: "outline" as const,
          icon: null,
          text: status,
        };
    }
  };

  // Merge scheduled and completed payrolls for display
  const allPayrolls = [
    ...(Array.isArray(scheduledPayrolls)
      ? scheduledPayrolls.map((p: any) => ({ ...p, type: "scheduled" }))
      : []),
    ...(Array.isArray(completedPayrolls)
      ? completedPayrolls.map((p: any) => ({ ...p, type: "completed" }))
      : []),
  ].sort((a, b) => {
    // Sort by next_run_at or created_at descending
    const aDate = a.next_run_at
      ? new Date(a.next_run_at)
      : new Date(a.created_at);
    const bDate = b.next_run_at
      ? new Date(b.next_run_at)
      : new Date(b.created_at);
    return bDate.getTime() - aDate.getTime();
  });

  // Download payroll statement as PDF
  const handleDownloadPayrollStatement = async (payrollId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const res = await fetch(
        `${BACKEND_URL}/company-admin/payroll/details/${payrollId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch payroll details");
      const details = await res.json();
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      let y = 40;
      doc.setFontSize(20);
      doc.setTextColor(41, 98, 255);
      doc.text("BlueHR Payroll Statement", 40, y);
      doc.setFontSize(13);
      doc.setTextColor(60, 60, 60);
      doc.text(`Payroll ID: ${payrollId}`, 40, y + 22);
      y += 50;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      if (details.length > 0) {
        const { payroll_month, payroll_year, company_name } = details[0];
        doc.text("Company:", 50, y);
        doc.text(company_name || "", 150, y);
        y += 20;
        doc.text("Payroll Month:", 50, y);
        doc.text(payroll_month || "", 150, y);
        y += 20;
        doc.text("Payroll Year:", 50, y);
        doc.text(String(payroll_year || ""), 150, y);
        y += 20;
      }
      y += 10;
      doc.setFontSize(13);
      doc.text("Employee Payroll Details:", 40, y);
      y += 20;
      doc.setFont("courier", "normal"); // Use monospaced font for table
      doc.setFontSize(10);
      // Wider column positions
      const colX = [50, 140, 230, 320, 410, 500, 590, 680, 770, 860, 950];
      // Table header
      const headers = [
        "Name",
        "Dept",
        "Role",
        "Basic",
        "PAYE",
        "SHIF",
        "NSSF",
        "H. Levy",
        "Allow",
        "Deduct",
        "Net",
      ];
      headers.forEach((header, i) => doc.text(header, colX[i], y));
      y += 15;
      details.forEach((row: any) => {
        const rowData = [
          String(row.employee_name),
          String(row.department_name),
          String(row.position),
          formatCurrency(row.basic_salary),
          formatCurrency(row.paye),
          formatCurrency(row.shif),
          formatCurrency(row.nssf),
          formatCurrency(row.housing_levy),
          formatCurrency(row.allowances),
          formatCurrency(row.deductions),
          formatCurrency(row.net_pay),
        ];
        rowData.forEach((cell, i) => doc.text(cell, colX[i], y));
        y += 15;
        if (y > 750) {
          doc.addPage();
          y = 40;
        }
      });
      doc.save(`Payroll_Statement_${payrollId}.pdf`);
    } catch {
      // Optionally show error
    }
  };

  // Delete scheduled payroll
  const _handleDeleteScheduled = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${BACKEND_URL}/company-admin/payroll/scheduled/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        toast.success("Scheduled payroll deleted");
        fetchPayrollData();
      } else {
        toast.error("Failed to delete scheduled payroll");
      }
    } catch (error) {
      console.error("Error deleting scheduled payroll:", error);
      toast.error("Failed to delete scheduled payroll");
    }
  };

  return (
    <div className="space-y-6">
      {/* Payroll Schedule Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Payroll Schedule</h2>
          <p className="text-gray-500">
            Manage and schedule your company's payroll runs
          </p>
        </div>
        <Button onClick={() => setShowScheduleModal(true)}>
          <Calendar className="mr-2 h-4 w-4" />
          Schedule New Payroll
        </Button>
      </div>

      {/* Next Payroll Summary */}
      {Array.isArray(scheduledPayrolls) && scheduledPayrolls.length > 0 && (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center">
                  <Calendar className="h-7 w-7 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Next Payroll Run</p>
                  <p className="text-2xl font-bold">
                    {formatDate(scheduledPayrolls[0].next_run_at)} at{" "}
                    {scheduledPayrolls[0].scheduled_date
                      ? new Date(
                          scheduledPayrolls[0].scheduled_date
                        ).toLocaleTimeString("en-KE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "09:00 AM"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {totalEmployees} employees • {formatCurrency(totalSalary)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleRunNow(scheduledPayrolls[0].id)}
                  disabled={runningId === scheduledPayrolls[0].id}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {runningId === scheduledPayrolls[0].id
                    ? "Running..."
                    : "Run Now"}
                </Button>
                <Button variant="outline" onClick={handleOpenEditModal}>
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled and Completed Payrolls */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              Loading scheduled payrolls...
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Recurring</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPayrolls.map((payroll) => {
                  const statusBadge = getStatusBadge(
                    payroll.status ||
                      (payroll.type === "completed" ? "completed" : "scheduled")
                  );
                  return (
                    <TableRow key={payroll.id}>
                      <TableCell>
                        {formatDate(
                          payroll.scheduled_date || payroll.created_at
                        )}{" "}
                        at{" "}
                        {payroll.scheduled_date
                          ? new Date(payroll.scheduled_date).toLocaleTimeString(
                              "en-KE",
                              { hour: "2-digit", minute: "2-digit" }
                            )
                          : payroll.created_at
                          ? new Date(payroll.created_at).toLocaleTimeString(
                              "en-KE",
                              { hour: "2-digit", minute: "2-digit" }
                            )
                          : "09:00 AM"}
                      </TableCell>
                      <TableCell>
                        {payroll.is_recurring ? (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            Monthly
                          </Badge>
                        ) : (
                          <Badge variant="outline">One-time</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusBadge.variant}
                          className="flex items-center w-fit"
                        >
                          {statusBadge.icon}
                          {statusBadge.text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {payroll.type === "scheduled" &&
                            payroll.status === "scheduled" && (
                              <Button
                                size="sm"
                                onClick={() => handleRunNow(payroll.id)}
                                disabled={runningId === payroll.id}
                              >
                                <Play className="mr-2 h-4 w-4" />
                                {runningId === payroll.id
                                  ? "Running..."
                                  : "Run Now"}
                              </Button>
                            )}
                          {payroll.type === "completed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleDownloadPayrollStatement(payroll.id)
                              }
                            >
                              Download Statement
                            </Button>
                          )}
                          {/* Future: Add Edit functionality if needed */}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Schedule Payroll Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Schedule New Payroll</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payroll Type
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value="regular"
                  disabled
                >
                  <option value="regular">Regular Monthly Payroll</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <Input
                  type="date"
                  value={payrollDate}
                  onChange={(e) => setPayrollDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <Input
                  type="time"
                  value={payrollTime}
                  onChange={(e) => setPayrollTime(e.target.value)}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="recurring"
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                />
                <label
                  htmlFor="recurring"
                  className="ml-2 text-sm text-gray-700"
                >
                  Make this a recurring monthly payroll
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowScheduleModal(false)}
                  disabled={scheduling}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSchedulePayroll}
                  disabled={scheduling || !payrollDate || !payrollTime}
                >
                  {scheduling ? "Scheduling..." : "Schedule Payroll"}
                </Button>
              </div>
              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Edit Payroll Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl">
            <PayrollProcessor
              payrollMonth={new Date().toLocaleString("default", {
                month: "long",
              })}
              payrollYear={new Date().getFullYear()}
              // Pass employees and departments as props if needed, or let PayrollProcessor fetch them
              // employees={editEmployees}
              // departments={departments}
              // Add handlers for save and run now
              onSaveAndRunLater={handleSaveAndRunLater}
              onRunNow={handleRunNowFromEdit}
              onClose={handleCloseEditModal}
            />
            {editLoading && <div className="text-center py-4">Saving...</div>}
            {editError && (
              <div className="text-center text-red-500 py-4">{editError}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
