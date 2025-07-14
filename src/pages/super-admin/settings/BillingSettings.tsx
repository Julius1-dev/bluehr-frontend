import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface BillingSettingsProps {
  settings?: {
    currency: string;
    taxRate: number;
    invoicePrefix: string;
    paymentTerms: string;
    lateFee: number;
    enableAutoInvoicing: boolean;
  };
  onSettingsChange?: (settings: any) => void;
}

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'KES', label: 'Kenyan Shilling (KSh)' },
  { value: 'NGN', label: 'Nigerian Naira (₦)' },
  { value: 'ZAR', label: 'South African Rand (R)' },
];

const PAYMENT_TERMS = [
  'Due on receipt',
  'Net 7',
  'Net 15',
  'Net 30',
  'Net 60',
  'Net 90',
];

export default function BillingSettings({ 
  settings: externalSettings, 
  onSettingsChange 
}: BillingSettingsProps) {
  const [settings, setSettings] = useState({
    currency: externalSettings?.currency || 'USD',
    taxRate: externalSettings?.taxRate || 0,
    invoicePrefix: externalSettings?.invoicePrefix || 'INV-',
    paymentTerms: externalSettings?.paymentTerms || 'Net 30',
    lateFee: externalSettings?.lateFee || 0,
    enableAutoInvoicing: externalSettings?.enableAutoInvoicing ?? true,
  });

  const handleChange = (field: string, value: any) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing Settings</CardTitle>
        <CardDescription>
          Configure billing and payment settings for your organization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="currency">Default Currency</Label>
            <Select
              value={settings.currency}
              onValueChange={(value) => handleChange('currency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={settings.taxRate}
              onChange={(e) => handleChange('taxRate', parseFloat(e.target.value) || 0)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
            <Input
              id="invoicePrefix"
              value={settings.invoicePrefix}
              onChange={(e) => handleChange('invoicePrefix', e.target.value)}
              placeholder="INV-"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Payment Terms</Label>
            <Select
              value={settings.paymentTerms}
              onValueChange={(value) => handleChange('paymentTerms', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment terms" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_TERMS.map((term) => (
                  <SelectItem key={term} value={term}>
                    {term}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lateFee">Late Fee (%)</Label>
            <Input
              id="lateFee"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={settings.lateFee}
              onChange={(e) => handleChange('lateFee', parseFloat(e.target.value) || 0)}
            />
            <p className="text-sm text-muted-foreground">
              Percentage charged on overdue invoices
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-6">
            <div className="space-y-0.5">
              <Label htmlFor="autoInvoicing">Auto-generate Invoices</Label>
              <p className="text-sm text-muted-foreground">
                Automatically generate invoices at the end of each billing cycle
              </p>
            </div>
            <Switch
              id="autoInvoicing"
              checked={settings.enableAutoInvoicing}
              onCheckedChange={(checked) => handleChange('enableAutoInvoicing', checked)}
            />
          </div>
        </div>
        
        <div className="pt-4">
          <h3 className="text-sm font-medium mb-3">Tax Information</h3>
          <div className="space-y-4 bg-muted/50 p-4 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                <Input
                  id="taxId"
                  placeholder="Enter your tax ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRegistration">Tax Registration Number</Label>
                <Input
                  id="taxRegistration"
                  placeholder="Enter your tax registration number"
                />
              </div>
            </div>
            <div>
              <Button variant="outline">
                Upload Tax Certificate
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
