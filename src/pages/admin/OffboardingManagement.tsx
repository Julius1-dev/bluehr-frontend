import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, Download } from 'lucide-react';
import OffboardingRequestsTable from './components/OffboardingRequestsTable';
import NewOffboardingForm from './components/NewOffboardingForm';

export default function OffboardingManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [allRequests, setAllRequests] = useState<any[]>([]);

  // Export handler
  const handleExport = () => {
    if (!allRequests.length) {
      alert('No offboarding records to export.');
      return;
    }
    // Prepare CSV headers and rows
    const headers = [
      'ID', 'Employee Name', 'Email', 'Department', 'Position', 'Type', 'Status', 'Submitted Date', 'Last Working Day', 'Reason', 'Notes'
    ];
    const rows = allRequests.map(req => [
      req.id,
      req.employee?.name || '',
      req.employee?.email || '',
      req.employee?.department || '',
      req.employee?.position || '',
      req.type,
      req.status,
      req.submittedDate ? new Date(req.submittedDate).toLocaleDateString() : '',
      req.lastWorkingDay ? new Date(req.lastWorkingDay).toLocaleDateString() : '',
      req.reason || '',
      req.notes || ''
    ]);
    const csv = [headers, ...rows].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'offboarding_records.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Offboarding Management</h1>
          <p className="text-muted-foreground">
            Manage employee offboarding requests and processes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        <Button onClick={() => setShowNewForm(!showNewForm)}>
          <UserPlus className="mr-2 h-4 w-4" />
          {showNewForm ? 'Hide Form' : 'Initiate Offboarding'}
        </Button>
        </div>
      </div>

      {showNewForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Initiate New Offboarding</CardTitle>
          </CardHeader>
          <CardContent>
            <NewOffboardingForm onSuccess={() => setShowNewForm(false)} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="w-full md:w-1/3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search requests..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <OffboardingRequestsTable searchQuery={searchQuery} onRequestsChange={setAllRequests} />
        </CardContent>
      </Card>
    </div>
  );
}
