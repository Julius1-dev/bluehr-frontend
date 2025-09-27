import { useState, useEffect } from 'react';
import { useNavigate, useParams, Outlet, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { mockCompanies } from '@/types/advances';

export default function AdvancesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId } = useParams();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  
  // Update selected company when companyId changes
  useEffect(() => {
    if (companyId) {
      const company = mockCompanies.find(c => c.id === companyId) || null;
      setSelectedCompany(company);
    } else {
      setSelectedCompany(null);
    }
  }, [companyId]);
  
  // Update active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('requests')) {
      setActiveTab('requests');
    } else if (path.includes('settings')) {
      setActiveTab('settings');
    } else if (companyId) {
      setActiveTab('company');
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname, companyId]);

  const handleTabChange = (value: string) => {
    if (value === 'overview') {
      navigate('/super-admin/advances/overview');
    } else if (value === 'requests') {
      navigate('/super-admin/advances/requests');
    } else if (value === 'settings') {
      navigate('/super-admin/advances/settings');
    } else if (value === 'company' && selectedCompany) {
      navigate(`/super-admin/advances/${selectedCompany.id}`);
    }
  };

  const handleBack = () => {
    navigate('/super-admin/advances/overview');
    setSelectedCompany(null);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          {(selectedCompany || activeTab !== 'overview') && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {selectedCompany ? selectedCompany.name : 'Advances Management'}
            </h2>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Advance Requests</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <div className="pt-4">
          <Outlet context={{ 
            selectedCompany,
            onViewCompany: (company: any) => navigate(`/super-admin/advances/${company.id}`)
          }} />
        </div>
      </Tabs>
    </div>
  );
}
