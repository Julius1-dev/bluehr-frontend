import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { OffboardingApi } from '@/services/offboardingApi';
import { LeaveTypeApi } from '@/services/leaveTypeApi';

type OffboardingType = 'resignation' | 'retirement' | 'termination' | 'other';

interface NewOffboardingFormProps {
  onSuccess: () => void;
}

export default function NewOffboardingForm({ onSuccess }: NewOffboardingFormProps) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [offboardingType, setOffboardingType] = useState<OffboardingType>('resignation');
  const [lastWorkingDay, setLastWorkingDay] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch employees from backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await LeaveTypeApi.listEmployees();
        setEmployees(Array.isArray(data) ? data : []);
      } catch (err) {
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployee || !lastWorkingDay || !reason) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      await OffboardingApi.createRequest({
        employeeId: selectedEmployee,
        type: offboardingType,
        lastWorkingDay,
        reason,
        notes,
      });
      alert('Offboarding initiated successfully!');
      setSelectedEmployee('');
      setOffboardingType('resignation');
      setLastWorkingDay(undefined);
      setReason('');
      setNotes('');
      onSuccess();
    } catch (err) {
      alert('Failed to initiate offboarding.');
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employee Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="employee">Select Employee *</Label>
          <Select
            value={selectedEmployee}
            onValueChange={setSelectedEmployee}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an employee" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-md">
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>
                      {employee.first_name} {employee.last_name}
                      {employee.role ? ` - ${employee.role}` : ''}
                    </span>
                  </div>
                </SelectItem>
              ))}
              {employees.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No employees available for offboarding
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Type Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="type">Offboarding Type *</Label>
          <Select
            value={offboardingType}
            onValueChange={(value: OffboardingType) => setOffboardingType(value)}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-md">
              <SelectItem value="resignation">Resignation</SelectItem>
              <SelectItem value="retirement">Retirement</SelectItem>
              <SelectItem value="termination">Termination</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Last Working Day */}
        <div className="space-y-2">
          <Label>Last Working Day *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !lastWorkingDay && "text-muted-foreground"
                )}
                disabled={isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {lastWorkingDay ? (
                  format(lastWorkingDay, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white" align="start">
              <Calendar
                mode="single"
                selected={lastWorkingDay}
                onSelect={setLastWorkingDay}
                initialFocus
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Reason */}
      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Offboarding *</Label>
        <Textarea
          id="reason"
          placeholder="Please provide the reason for offboarding"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          disabled={isSubmitting}
          className="min-h-[100px]"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information about the offboarding"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSubmitting}
          className="min-h-[80px]"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !selectedEmployee || !lastWorkingDay || !reason}
        >
          {isSubmitting ? 'Processing...' : 'Initiate Offboarding'}
        </Button>
      </div>
    </form>
  );
}
