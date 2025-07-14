import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';

// Extend jsPDF with autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface PayslipData {
  id: number;
  employee_name: string;
  department_name: string;
  position: string;
  basic_salary: number;
  paye: number;
  shif: number;
  nssf: number;
  housing_levy: number;
  allowances: number;
  deductions: number;
  net_pay: number;
  allowance_reason: string;
  deduction_reason: string;
  payment_frequency: string;
  payroll_month: string;
  payroll_year: number;
  company_name?: string;
}

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payslipData: PayslipData | null;
}

// Utility function for formatting currency
const formatCurrency = (amount: number): string => {
  // Ensure amount is a valid number
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2
  }).format(safeAmount);
};

export function PayslipModal({ isOpen, onClose, payslipData }: PayslipModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!payslipData) return null;

  // Ensure all fields are numbers and fallback to 0 if not
  const basicSalary = typeof payslipData.basic_salary === 'number' && !isNaN(payslipData.basic_salary) ? payslipData.basic_salary : 0;
  const allowances = typeof payslipData.allowances === 'number' && !isNaN(payslipData.allowances) ? payslipData.allowances : 0;
  const paye = typeof payslipData.paye === 'number' && !isNaN(payslipData.paye) ? payslipData.paye : 0;
  const shif = typeof payslipData.shif === 'number' && !isNaN(payslipData.shif) ? payslipData.shif : 0;
  const nssf = typeof payslipData.nssf === 'number' && !isNaN(payslipData.nssf) ? payslipData.nssf : 0;
  const housingLevy = typeof payslipData.housing_levy === 'number' && !isNaN(payslipData.housing_levy) ? payslipData.housing_levy : 0;
  const deductions = typeof payslipData.deductions === 'number' && !isNaN(payslipData.deductions) ? payslipData.deductions : 0;
  const netPay = typeof payslipData.net_pay === 'number' && !isNaN(payslipData.net_pay) ? payslipData.net_pay : 0;

  const totalStatutoryDeductions = paye + shif + nssf + housingLevy;

  const downloadPayslip = () => {
    setIsDownloading(true);
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      let y = 40;
      // Header
      doc.setFontSize(22);
      doc.setTextColor(0, 51, 102);
      doc.text('BlueHR', 40, y);
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('Payroll Management System', 40, y + 20);
      if (payslipData.company_name) {
        doc.setFontSize(13);
        doc.setTextColor(60, 60, 60);
        doc.text(payslipData.company_name, 40, y + 38);
      }
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Generated on ${format(new Date(), 'dd MMM yyyy')}`, 420, y + 20);
      doc.text(`${payslipData.payroll_month} ${payslipData.payroll_year}`, 420, y + 38);
      y += 60;
      // Card border
      doc.setDrawColor(41, 98, 255);
      doc.setLineWidth(2);
      doc.roundedRect(30, y, 530, 350, 8, 8, 'S');
      y += 30;
      // Employee/Dept/Position/Payment Freq
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text('Employee:', 50, y);
      doc.setFont('helvetica', 'bold');
      doc.text(payslipData.employee_name, 120, y);
      doc.setFont('helvetica', 'normal');
      doc.text('Department:', 320, y);
      doc.setFont('helvetica', 'bold');
      doc.text(payslipData.department_name, 400, y);
      doc.setFont('helvetica', 'normal');
      y += 22;
      doc.text('Position:', 50, y);
      doc.setFont('helvetica', 'bold');
      doc.text(payslipData.position, 120, y);
      doc.setFont('helvetica', 'normal');
      doc.text('Payment Frequency:', 320, y);
      doc.setFont('helvetica', 'bold');
      doc.text(payslipData.payment_frequency, 440, y);
      doc.setFont('helvetica', 'normal');
      y += 30;
      // Earnings
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text('Earnings', 50, y);
      doc.setDrawColor(220, 220, 220);
      doc.line(50, y + 2, 260, y + 2);
      // Deductions
      doc.text('Deductions', 320, y);
      doc.line(320, y + 2, 540, y + 2);
      y += 18;
      // Earnings values
      doc.setFontSize(12);
      doc.text('Basic Salary', 50, y);
      doc.text(formatCurrency(basicSalary), 200, y, { align: 'right' });
      doc.text('Allowances', 50, y + 18);
      doc.setTextColor(0, 153, 51);
      doc.text('+' + formatCurrency(allowances), 200, y + 18, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Gross Pay', 50, y + 36);
      doc.text(formatCurrency(basicSalary + allowances), 200, y + 36, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      // Deductions values
      doc.setTextColor(220, 38, 38);
      doc.text('PAYE', 320, y);
      doc.text('-' + formatCurrency(paye), 540, y, { align: 'right' });
      doc.text('SHIF', 320, y + 18);
      doc.text('-' + formatCurrency(shif), 540, y + 18, { align: 'right' });
      doc.text('NSSF', 320, y + 36);
      doc.text('-' + formatCurrency(nssf), 540, y + 36, { align: 'right' });
      doc.text('Housing Levy', 320, y + 54);
      doc.text('-' + formatCurrency(housingLevy), 540, y + 54, { align: 'right' });
      doc.text('Custom Deductions', 320, y + 72);
      doc.text('-' + formatCurrency(deductions), 540, y + 72, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.text('Total Deductions', 320, y + 90);
      doc.text('-' + formatCurrency(totalStatutoryDeductions + deductions), 540, y + 90, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      // Net Pay
      y += 120;
      doc.setDrawColor(220, 220, 220);
      doc.line(50, y, 540, y);
      y += 24;
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text('Net Pay', 50, y);
      doc.text(formatCurrency(netPay), 540, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      // Notes
      if (payslipData.allowance_reason || payslipData.deduction_reason) {
        y += 30;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Notes:', 50, y);
        doc.setFont('helvetica', 'normal');
        if (payslipData.allowance_reason) {
          doc.text('Allowance: ' + payslipData.allowance_reason, 50, y + 16);
          y += 16;
        }
        if (payslipData.deduction_reason) {
          doc.text('Deduction: ' + payslipData.deduction_reason, 50, y + 16);
        }
      }
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text('This is a computer-generated document. No signature is required.', 300, 820, { align: 'center' });
      // Save the PDF
      doc.save(`payslip_${payslipData.employee_name.replace(/\s+/g, '_')}_${payslipData.payroll_month}_${payslipData.payroll_year}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Employee Payslip</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">BlueHR</h3>
              <p className="text-sm text-gray-500">Payroll Management System</p>
              {payslipData.company_name && (
                <p className="text-sm text-gray-700 font-medium mt-1">{payslipData.company_name}</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-medium">{payslipData.payroll_month} {payslipData.payroll_year}</p>
              <p className="text-sm text-gray-500">Generated on {format(new Date(), 'dd MMM yyyy')}</p>
            </div>
          </div>
          
          <Card className="p-6 border-t-4 border-blue-600">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Employee</h4>
                <p className="font-semibold">{payslipData.employee_name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Department</h4>
                <p>{payslipData.department_name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Position</h4>
                <p>{payslipData.position}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Payment Frequency</h4>
                <p>{payslipData.payment_frequency}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium border-b pb-2 mb-2">Earnings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Basic Salary</span>
                    <span>{formatCurrency(basicSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Allowances</span>
                    <span className="text-green-600">+{formatCurrency(allowances)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Gross Pay</span>
                    <span>{formatCurrency(basicSalary + allowances)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium border-b pb-2 mb-2">Deductions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>PAYE</span>
                    <span className="text-red-600">-{formatCurrency(paye)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SHIF</span>
                    <span className="text-red-600">-{formatCurrency(shif)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>NSSF</span>
                    <span className="text-red-600">-{formatCurrency(nssf)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Housing Levy</span>
                    <span className="text-red-600">-{formatCurrency(housingLevy)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custom Deductions</span>
                    <span className="text-red-600">-{formatCurrency(deductions)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total Deductions</span>
                    <span className="text-red-600">-{formatCurrency(totalStatutoryDeductions + deductions)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between font-bold text-lg">
                <span>Net Pay</span>
                <span>{formatCurrency(netPay)}</span>
              </div>
            </div>
            
            {(payslipData.allowance_reason || payslipData.deduction_reason) && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium mb-2">Notes</h4>
                {payslipData.allowance_reason && (
                  <p className="text-sm"><span className="font-medium">Allowance:</span> {payslipData.allowance_reason}</p>
                )}
                {payslipData.deduction_reason && (
                  <p className="text-sm"><span className="font-medium">Deduction:</span> {payslipData.deduction_reason}</p>
                )}
              </div>
            )}
          </Card>
          
          <div className="flex justify-end">
            <Button onClick={downloadPayslip} disabled={isDownloading}>
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
