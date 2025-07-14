import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';

export default function AdvanceSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advance Settings</CardTitle>
          <CardDescription>
            View advance policy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Advances are automatically approved and fixed at 33.33% of gross earnings, with a 1-month repayment period.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Advance Percentage</Label>
              <div className="flex items-center p-4 border rounded-md bg-muted/20 h-16">
                <span className="text-2xl font-bold">33.33%</span>
                <span className="text-sm text-muted-foreground ml-3">of gross earnings</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Repayment Period</Label>
              <div className="flex items-center p-4 border rounded-md bg-muted/20 h-16">
                <span className="text-2xl font-bold">1</span>
                <span className="text-sm text-muted-foreground ml-3">month</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Interest Rate</Label>
              <div className="flex items-center p-4 border rounded-md bg-muted/20 h-16">
                <span className="text-2xl font-bold">0%</span>
                <span className="text-sm text-muted-foreground ml-3">no interest</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Approval Process</Label>
              <div className="flex items-center p-4 border rounded-md bg-muted/20 h-16">
                <span className="text-lg font-medium">Automatic</span>
                <span className="text-sm text-muted-foreground ml-3">no manual approval needed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
