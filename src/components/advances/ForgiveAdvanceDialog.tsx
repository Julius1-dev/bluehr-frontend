import { useState } from 'react';
import { Advance } from '@/types/advances';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function ForgiveAdvanceDialog({
  open,
  onOpenChange,
  advance,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  advance: Advance | null;
  onConfirm: (notes: string) => void;
}) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!advance) return;
    
    setIsLoading(true);
    try {
      await onConfirm(notes || 'Advance forgiven by admin');
      setNotes('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error forgiving advance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!advance) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Forgive Advance</DialogTitle>
          <DialogDescription>
            Are you sure you want to forgive this advance? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Employee</p>
              <p className="font-medium">{advance.employeeName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-medium">KSh {advance.amount.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes (optional)
            </label>
            <Textarea
              id="notes"
              placeholder="Add a note about this action..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
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
            variant="destructive"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Forgive Advance'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
