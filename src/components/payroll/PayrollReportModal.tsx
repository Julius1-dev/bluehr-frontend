import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Download } from 'lucide-react';

interface PayrollReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PayrollReportModal({ isOpen, onClose }: PayrollReportModalProps) {
  const [reportType, setReportType] = useState('detailed');
  const [includeAllowances, setIncludeAllowances] = useState(true);
  const [includeDeductions, setIncludeDeductions] = useState(true);
  const [includeStatutory, setIncludeStatutory] = useState(true);
  const [fileFormat, setFileFormat] = useState('pdf');
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Payroll Report</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="reportType">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary Report</SelectItem>
                <SelectItem value="detailed">Detailed Report</SelectItem>
                <SelectItem value="individual">Individual Payslips</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Include in Report</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="includeAllowances" 
                  checked={includeAllowances} 
                  onCheckedChange={(checked) => setIncludeAllowances(!!checked)} 
                />
                <Label htmlFor="includeAllowances">Allowances</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="includeDeductions" 
                  checked={includeDeductions} 
                  onCheckedChange={(checked) => setIncludeDeductions(!!checked)} 
                />
                <Label htmlFor="includeDeductions">Deductions</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="includeStatutory" 
                  checked={includeStatutory} 
                  onCheckedChange={(checked) => setIncludeStatutory(!!checked)} 
                />
                <Label htmlFor="includeStatutory">Statutory Deductions</Label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fileFormat">File Format</Label>
            <Select value={fileFormat} onValueChange={setFileFormat}>
              <SelectTrigger id="fileFormat">
                <SelectValue placeholder="Select file format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
