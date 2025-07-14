import { useState } from 'react';
// Import calculation functions
import { calculatePAYE, calculateSHIF, calculateNSSF, calculateHousingLevy } from './payrollCalculations';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';

// Mock utility function for formatting currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2
  }).format(amount);
};

interface Allowance {
  id: number;
  name: string;
  amount: number;
}

interface Deduction {
  id: number;
  name: string;
  amount: number;
}

interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
  payment_frequency: 'hourly' | 'weekly' | 'monthly' | 'yearly';
  basic_salary: number;
  paye: number;
  shif: number;
  nssf: number;
  housing_levy: number;
  allowances: number;
  deductions: number;
  net_pay: number;
  status: string;
}

interface EditPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  onSave?: (updatedEmployee: Employee) => void;
}

export function EditPayrollModal({ isOpen, onClose, employee, onSave }: EditPayrollModalProps) {
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [newAllowanceName, setNewAllowanceName] = useState('');
  const [newAllowanceAmount, setNewAllowanceAmount] = useState('');
  const [newDeductionName, setNewDeductionName] = useState('');
  const [newDeductionAmount, setNewDeductionAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAddAllowance = () => {
    if (newAllowanceName && newAllowanceAmount) {
      const amount = parseFloat(newAllowanceAmount);
      if (!isNaN(amount)) {
        setAllowances([
          ...allowances,
          {
            id: Date.now(),
            name: newAllowanceName,
            amount: amount
          }
        ]);
        setNewAllowanceName('');
        setNewAllowanceAmount('');
      }
    }
  };

  const handleAddDeduction = () => {
    if (newDeductionName && newDeductionAmount) {
      const amount = parseFloat(newDeductionAmount);
      if (!isNaN(amount)) {
        setDeductions([
          ...deductions,
          {
            id: Date.now(),
            name: newDeductionName,
            amount: amount
          }
        ]);
        setNewDeductionName('');
        setNewDeductionAmount('');
      }
    }
  };

  const handleRemoveAllowance = (id: number) => {
    setAllowances(allowances.filter(allowance => allowance.id !== id));
  };

  const handleRemoveDeduction = (id: number) => {
    setDeductions(deductions.filter(deduction => deduction.id !== id));
  };

  const totalAllowances = allowances.reduce((sum, item) => sum + item.amount, 0);
  const totalCustomDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate the adjusted gross salary (basic + allowances)
  const adjustedGrossSalary = employee.basic_salary + totalAllowances;
  
  // Recalculate statutory deductions based on the adjusted gross salary
  const paye = calculatePAYE(adjustedGrossSalary, calculateNSSF(adjustedGrossSalary));
  const shif = calculateSHIF(adjustedGrossSalary);
  const nssf = calculateNSSF(adjustedGrossSalary);
  const housingLevy = calculateHousingLevy(adjustedGrossSalary);
  
  // Calculate total statutory deductions
  const statutoryDeductions = paye + shif + nssf + housingLevy;
  
  // Calculate new net pay (adjusted gross - statutory deductions - custom deductions)
  const newNetPay = adjustedGrossSalary - statutoryDeductions - totalCustomDeductions;
  
  // Handle save changes
  const handleSaveChanges = () => {
    setIsSaving(true);
    
    // In a real implementation, this would be an API call to update the employee's payroll
    // For now, we'll simulate an API call with a timeout
    setTimeout(() => {
      // Update the employee object with new values (in a real app, this would be done via API)
      const updatedEmployee = {
        ...employee,
        allowances: totalAllowances,
        deductions: totalCustomDeductions,
        paye: paye,
        shif: shif,
        nssf: nssf,
        housing_levy: housingLevy,
        net_pay: newNetPay,
        allowanceItems: allowances, // Store the detailed allowance items
        deductionItems: deductions, // Store the detailed deduction items
      };
      
      // Call the onSave callback if it exists
      if (onSave) {
        onSave(updatedEmployee);
      }
      
      // Show success message
      setSaveSuccess(true);
      setIsSaving(false);
      
      // Close modal after a brief delay to show success state
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    }, 800);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[800px] bg-white/95">
        <DialogHeader>
          <DialogTitle>Edit Payroll - {employee.name}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <Label>Basic Salary</Label>
              <div className="font-semibold">{formatCurrency(employee.basic_salary)}</div>
            </div>
            <div>
              <Label>Department</Label>
              <div className="font-semibold">{employee.department}</div>
            </div>
            <div>
              <Label>Role</Label>
              <div className="font-semibold">{employee.position}</div>
            </div>
          </div>
          
          {/* Main content - side by side layout */}
          <div className="grid grid-cols-2 gap-6 mt-4">
            {/* Allowances Section - Left side */}
            <div>
              <h3 className="text-lg font-medium mb-2">Allowances</h3>
              <div className="rounded-md border mb-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="w-[80px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allowances.length > 0 ? (
                      allowances.map(allowance => (
                        <TableRow key={allowance.id}>
                          <TableCell>{allowance.name}</TableCell>
                          <TableCell className="text-green-600">
                            {formatCurrency(allowance.amount)}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveAllowance(allowance.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-2">
                          No allowances added
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor="allowanceName">Allowance Name</Label>
                  <Input 
                    id="allowanceName"
                    value={newAllowanceName}
                    onChange={(e) => setNewAllowanceName(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="allowanceAmount">Amount (KES)</Label>
                  <Input 
                    id="allowanceAmount"
                    type="number"
                    value={newAllowanceAmount}
                    onChange={(e) => setNewAllowanceAmount(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddAllowance}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
            
            {/* Deductions Section - Right side */}
            <div>
              <h3 className="text-lg font-medium mb-2">Deductions</h3>
              <div className="rounded-md border mb-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="w-[80px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deductions.length > 0 ? (
                      deductions.map(deduction => (
                        <TableRow key={deduction.id}>
                          <TableCell>{deduction.name}</TableCell>
                          <TableCell className="text-red-600">
                            {formatCurrency(deduction.amount)}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveDeduction(deduction.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-2">
                          No deductions added
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor="deductionName">Deduction Name</Label>
                  <Input 
                    id="deductionName"
                    value={newDeductionName}
                    onChange={(e) => setNewDeductionName(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="deductionAmount">Amount (KES)</Label>
                  <Input 
                    id="deductionAmount"
                    type="number"
                    value={newDeductionAmount}
                    onChange={(e) => setNewDeductionAmount(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddDeduction}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>
          {/* Summary Section */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <Label>Total Allowances</Label>
              <div className="text-lg font-semibold text-green-600">
                +{formatCurrency(totalAllowances)}
              </div>
            </div>
            <div>
              <Label>Total Custom Deductions</Label>
              <div className="text-lg font-semibold text-red-600">
                -{formatCurrency(totalCustomDeductions)}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Label>New Net Pay</Label>
            <div className="text-xl font-bold">
              {formatCurrency(newNetPay)}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button 
            onClick={handleSaveChanges} 
            disabled={isSaving}
            className={saveSuccess ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : saveSuccess ? (
              <>✓ Saved!</>
            ) : (
              <>Save Changes</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
