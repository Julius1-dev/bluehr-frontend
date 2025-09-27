import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Settings,
  CreditCard,
  Building,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvanceSettingsProps {
  initialSettings?: {
    autoApprove: boolean;
    adminApproval: boolean;
    advanceSource: 'company_wallet' | 'blueHR';
  };
  onSave?: (settings: {
    autoApprove: boolean;
    adminApproval: boolean;
    advanceSource: 'company_wallet' | 'blueHR';
  }) => void;
}

export function AdvanceSettings({ 
  initialSettings = {
    autoApprove: false,
    adminApproval: true,
    advanceSource: 'company_wallet'
  },
  onSave 
}: AdvanceSettingsProps) {
  // Admin approval is always required
  const [adminApproval] = useState(true);
  const [_autoApprove, setAutoApprove] = useState(false);
  const [advanceSource, setAdvanceSource] = useState<'company_wallet' | 'blueHR'>(initialSettings.advanceSource);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Prevent enabling auto-approve if admin approval is required
  const _handleAutoApproveChange = (checked: boolean) => {
    if (adminApproval) {
      setAutoApprove(false);
      setHasUnsavedChanges(true);
      return;
    }
    setAutoApprove(checked);
    setHasUnsavedChanges(true);
  };

  // Handle advance source change
  const handleAdvanceSourceChange = (source: 'company_wallet' | 'blueHR') => {
    setAdvanceSource(source);
    setHasUnsavedChanges(true);
  };

  // Save settings
  const handleSave = () => {
    if (onSave) {
      onSave({
        autoApprove: false, // Always false if admin approval is required
        adminApproval: true, // Always true
        advanceSource
      });
    }
    setHasUnsavedChanges(false);
    // Show success message in a real app
    alert('Advance settings saved successfully!');
  };

  // Effect to save to localStorage when settings change
  useEffect(() => {
    localStorage.setItem('advanceSettings', JSON.stringify({
      autoApprove: false,
      adminApproval: true,
      advanceSource
    }));
  }, [advanceSource]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Salary Advance Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Admin Approval Setting (always required) */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="admin-approval" className="text-base font-medium">
                  Admin Approval Required
                </Label>
                <div className={cn(
                  "px-2 py-0.5 text-xs rounded-full flex items-center gap-1 bg-amber-100 text-amber-800"
                )}>
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Required</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                All advances must be approved by an administrator. This setting is mandatory and cannot be disabled.
              </p>
            </div>
            <Switch
              id="admin-approval"
              checked={true}
              disabled
              className="data-[state=checked]:bg-amber-500"
            />
          </div>

          {/* Auto-approve Setting (disabled) */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 opacity-60 cursor-not-allowed">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="auto-approve" className="text-base font-medium">
                  Auto-approve Advances
                </Label>
                <div className={cn(
                  "px-2 py-0.5 text-xs rounded-full flex items-center gap-1 bg-gray-100 text-gray-600"
                )}>
                  <XCircle className="h-3 w-3" />
                  <span>Disabled</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Advances require manual approval before processing. Auto-approve is disabled because admin approval is required.
              </p>
            </div>
            <Switch
              id="auto-approve"
              checked={false}
              disabled
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          {/* Advance Source Setting */}
          <div className="p-4 rounded-lg bg-gray-50">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-medium">Advance Source</h3>
                <p className="text-sm text-gray-500">Select where advances will be paid from</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => handleAdvanceSourceChange('company_wallet')}
                  className={cn(
                    "relative p-4 rounded-lg border-2 text-left transition-colors",
                    advanceSource === 'company_wallet' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-full",
                      advanceSource === 'company_wallet' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-500'
                    )}>
                      <Building className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Company Wallet</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Advances will be paid from the company's wallet
                  </p>
                  {advanceSource === 'company_wallet' && (
                    <div className="absolute top-3 right-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-600"></div>
                    </div>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => handleAdvanceSourceChange('blueHR')}
                  className={cn(
                    "relative p-4 rounded-lg border-2 text-left transition-colors",
                    advanceSource === 'blueHR' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-full",
                      advanceSource === 'blueHR' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-500'
                    )}>
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <span className="font-medium">BlueHR</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Advances will be processed through BlueHR's system
                  </p>
                  {advanceSource === 'blueHR' && (
                    <div className="absolute top-3 right-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-600"></div>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="pt-2">
            <Button 
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className={cn(
                "w-full transition-all",
                hasUnsavedChanges 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "bg-gray-300 cursor-not-allowed"
              )}
            >
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Status Alert */}
      {!hasUnsavedChanges && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span>All changes saved successfully</span>
        </div>
      )}
    </div>
  );
}
