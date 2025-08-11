import { useState, useEffect } from 'react';
import { AdvanceSettings as AdvanceSettingsComponent } from '@/components/settings/AdvanceSettings';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { Home, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { BACKEND_URL } from '@/lib/config';

export default function AdvanceSettingsPage() {
  const [advanceSettings, setAdvanceSettings] = useState({
    autoApprove: false,
    adminApproval: true,
    advanceSource: 'company_wallet' as 'company_wallet' | 'blueHR'
  });
  const [loading, setLoading] = useState(true);
  
  // Fetch settings from backend on component mount
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/company-admin/advance-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch advance settings');
      }

      const result = await response.json();
      if (result.success) {
        setAdvanceSettings({
          autoApprove: result.data.auto_approve || false,
          adminApproval: result.data.admin_approval || true,
          advanceSource: result.data.advance_source || 'company_wallet'
        });
      } else {
        throw new Error(result.error || 'Failed to fetch advance settings');
      }
    } catch (error) {
      console.error('Error fetching advance settings:', error);
      toast.error('Failed to load advance settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (newSettings: {
    autoApprove: boolean;
    adminApproval: boolean;
    advanceSource: 'company_wallet' | 'blueHR';
  }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/company-admin/advance-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          auto_approve: newSettings.autoApprove,
          admin_approval: newSettings.adminApproval,
          advance_source: newSettings.advanceSource
        })
      });

      const result = await response.json();
      if (result.success) {
        setAdvanceSettings(newSettings);
        toast.success('Advance settings saved successfully');
      } else {
        toast.error(result.error || 'Failed to save advance settings');
      }
    } catch (error) {
      console.error('Error saving advance settings:', error);
      toast.error('Failed to save advance settings');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col gap-6">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink to="/admin">
                <Home className="h-4 w-4 mr-1" />
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink to="/admin/settings">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink>
                Advance Settings
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Advance Settings</h1>
          </div>
        </div>

        <div className="flex justify-center items-center h-64">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading advance settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-6">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink to="/admin">
              <Home className="h-4 w-4 mr-1" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink to="/admin/settings">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink>
              Advance Settings
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Advance Settings</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AdvanceSettingsComponent
          initialSettings={advanceSettings}
          onSave={handleSaveSettings}
        />
      </div>
    </div>
  );
}
