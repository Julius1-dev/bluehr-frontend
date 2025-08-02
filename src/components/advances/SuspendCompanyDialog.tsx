import { useState } from 'react';
import { Company } from '@/types/advances';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function SuspendCompanyDialog({
  open,
  onOpenChange,
  company,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
  onConfirm: (isSuspending: boolean, notes: string) => void;
}) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isSuspending = company?.status !== 'suspended';
  const actionText = isSuspending ? 'Suspend' : 'Activate';
  const title = isSuspending ? 'Suspend Company' : 'Activate Company';
  const description = isSuspending
    ? 'Are you sure you want to suspend this company? They will not be able to use BlueHR advances until reactivated.'
    : 'Are you sure you want to activate this company? They will regain access to BlueHR advances.';

  const handleSubmit = async () => {
    if (!company) return;
    
    setIsLoading(true);
    try {
      await onConfirm(isSuspending, notes || `${actionText} by admin`);
      setNotes('');
      onOpenChange(false);
    } catch (error) {
      console.error(`Error ${actionText.toLowerCase()}ing company:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Alert variant={isSuspending ? 'destructive' : 'default'}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              {isSuspending
                ? 'This will immediately prevent all employees from requesting new advances.'
                : 'This will allow the company to request new advances.'}
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Company</p>
              <p className="font-medium">{company.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Status</p>
              <p className="font-medium capitalize">{company.status}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Reason {!isSuspending && 'for activation'}
            </label>
            <Textarea
              id="notes"
              placeholder={isSuspending 
                ? 'Why are you suspending this company?' 
                : 'Any notes about reactivating this company...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
              required={isSuspending}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant={isSuspending ? 'destructive' : 'default'}
            onClick={handleSubmit}
            disabled={isLoading || (isSuspending && !notes.trim())}
          >
            {isLoading ? 'Processing...' : `${actionText} Company`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
