import { useState } from 'react';
import { format, addHours } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MaintenanceSchedulerProps {
  onSchedule: (window: {
    startTime: Date;
    endTime: Date;
    reason: string;
  }) => void;
  onCancel: () => void;
}

export function MaintenanceScheduler({ onSchedule, onCancel }: MaintenanceSchedulerProps) {
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(addHours(new Date(), 2));
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onSchedule({ startTime, endTime, reason });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 w-[350px]" onClick={e => e.stopPropagation()}>
      <div className="space-y-2">
        <Label htmlFor="start-time">Start Time</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="start-time"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !startTime && "text-muted-foreground"
              )}
              type="button"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startTime ? format(startTime, "PPPp") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0" 
            align="start" 
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <Calendar
              mode="single"
              selected={startTime}
              onSelect={(date) => {
                if (date) {
                  setStartTime(date);
                  if (endTime < date) {
                    setEndTime(addHours(date, 2));
                  }
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="end-time">End Time</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="end-time"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !endTime && "text-muted-foreground"
              )}
              type="button"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endTime ? format(endTime, "PPPp") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0" 
            align="start" 
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <Calendar
              mode="single"
              selected={endTime}
              onSelect={(date) => {
                if (date && date > startTime) {
                  setEndTime(date);
                }
              }}
              initialFocus
              disabled={(date) => date <= startTime}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Maintenance</Label>
        <Input
          id="reason"
          placeholder="E.g., Database optimization, System update"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            onCancel();
          }}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={!reason.trim()}
        >
          Schedule
        </Button>
      </div>
    </form>
  );
}
