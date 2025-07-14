import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const banks = [
  'Absa Bank Kenya PLC',
  'Access Bank (Kenya) PLC',
  'African Banking Corporation Ltd (ABC Bank)',
  'Bank of Africa Kenya Ltd',
  'Bank of Baroda (Kenya) Ltd',
  'Bank of India',
  'Citibank N.A. Kenya',
  'Commercial International Bank Kenya Ltd (CIB)',
  'Consolidated Bank of Kenya Ltd',
  'Co-operative Bank of Kenya Ltd',
  'Credit Bank PLC',
  'Development Bank of Kenya Ltd',
  'Diamond Trust Bank Kenya Ltd',
  'Dubai Islamic Bank (also DIB Bank)',
  'Ecobank Kenya Ltd',
  'Equity Bank Kenya Ltd',
  'Family Bank Ltd',
  'First Community Bank Ltd',
  'Guaranty Trust Bank (Kenya) Ltd',
  'Guardian Bank Ltd',
  'Gulf African Bank Ltd',
  'Habib Bank A.G. Zurich',
  'I&M Bank Ltd',
  'Kingdom Bank Ltd',
  'KCB Bank Kenya Ltd',
  'Mayfair CIB Bank Ltd',
  'Middle East Bank (Kenya) Ltd',
  'M-Oriental Bank Ltd',
  'National Bank of Kenya Ltd',
  'NCBA Bank Kenya PLC',
  'Paramount Bank Ltd',
  'Premier Bank Kenya Ltd',
  'Prime Bank Ltd',
  'SBM Bank Kenya Ltd',
  'Sidian Bank Ltd',
  'Spire Bank Ltd',
  'Stanbic Bank Kenya Ltd',
  'Standard Chartered Bank Kenya Ltd',
  'United Bank for Africa Kenya Ltd',
  'Victoria Commercial Bank PLC'
];

export function LinkBankAccountDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    bank: '',
    branch: '',
    branchCode: '',
    accountNumber: '',
    isPrimary: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would make an API call here
    console.log('Linking bank account:', formData);
    
    // Show success message
    alert('Bank account has been linked successfully!');
    
    // Reset form and close dialog
    setFormData({
      bank: '',
      branch: '',
      branchCode: '',
      accountNumber: '',
      isPrimary: false
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Link Bank Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Link Bank Account</DialogTitle>
          <DialogDescription>
            Connect your bank account to enable transfers and withdrawals.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank">Bank Name</Label>
            <Select 
              value={formData.bank} 
              onValueChange={(value) => setFormData({...formData, bank: value})}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {banks.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch">Branch Name</Label>
              <Input 
                id="branch" 
                placeholder="Enter branch name" 
                value={formData.branch}
                onChange={(e) => setFormData({...formData, branch: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchCode">Branch Code</Label>
              <Input 
                id="branchCode" 
                placeholder="e.g. 123" 
                value={formData.branchCode}
                onChange={(e) => setFormData({...formData, branchCode: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input 
              id="accountNumber" 
              placeholder="Enter account number" 
              value={formData.accountNumber}
              onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
              required
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isPrimary"
              checked={formData.isPrimary}
              onChange={(e) => setFormData({...formData, isPrimary: e.target.checked})}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isPrimary" className="text-sm font-medium">
              Set as primary account
            </label>
          </div>
          
          <div className="pt-4">
            <Button type="submit" className="w-full">
              Link Account
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
