import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Server, 
  Database, 
  Cpu, 
  HardDrive, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Download,
  Activity,
  Network,
  ShieldCheck,
  Cloud,
  HardDriveDownload,
  HardDriveUpload
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import React, { useEffect, useState } from 'react';
import { BACKEND_URL } from '@/lib/config';

export default function SystemHealth() {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/super-admin/companies/system-health`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch system health');
      const data = await res.json();
      setSystemStatus(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch system health');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
  }, []);

  if (loading) return <div className="p-6">Loading system health...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!systemStatus) return <div className="p-6">No data</div>;

  const lastUpdated = new Date(systemStatus.lastChecked).toLocaleString();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">
            Monitor the health and performance of your BlueHR instance.
            <span className="ml-2 text-xs text-muted-foreground/60">
              Last updated: {lastUpdated}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSystemHealth}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <div className="flex items-center space-x-2">
              {systemStatus.status === 'operational' ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <StatusBadge status={systemStatus.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uptime (30d)</span>
                <span>{systemStatus.uptime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg. Response</span>
                <span>{systemStatus.responseTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-medium">System Components</CardTitle>
            <CardDescription>Current status of all system components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {systemStatus.components.map((component: any) => (
                <div key={component.name} className="flex items-center space-x-2">
                  {component.status === 'operational' ? (
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  )}
                  <span className="text-sm">{component.name}</span>
                  <div className="ml-auto">
                    <StatusBadge status={component.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ResourceUsage 
          title="CPU Usage" 
          value={systemStatus.resources.cpu} 
          icon={Cpu} 
        />
        <ResourceUsage 
          title="Memory Usage" 
          value={systemStatus.resources.memory} 
          icon={HardDrive} 
        />
        <ResourceUsage 
          title="Storage Usage" 
          value={systemStatus.resources.storage} 
          icon={Database} 
        />
        <ResourceUsage 
          title="Network" 
          value={systemStatus.resources.networkIn}
          max={100}
          unit=" MB/s"
          icon={Network} 
        />
      </div>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Incidents</CardTitle>
          <CardDescription>Track ongoing and past system incidents</CardDescription>
        </CardHeader>
        <CardContent>
          {systemStatus.recentIncidents.length > 0 ? (
            <div className="space-y-4">
              {systemStatus.recentIncidents.map((incident: any) => (
                <div key={incident.id} className="flex items-start space-x-4 pb-4 border-b">
                  <div className="flex-shrink-0 pt-1">
                    {incident.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{incident.title}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                      <span>Started: {new Date(incident.started).toLocaleString()}</span>
                      {incident.resolved && (
                        <span>• Resolved: {new Date(incident.resolved).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <StatusBadge status={incident.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent incidents to report</p>
              <p className="text-sm">All systems are operating normally</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requests and Users Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Requests</CardTitle>
            <CardDescription>API request statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total</span>
                <span>{systemStatus.metrics.requests.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Success</span>
                <span>{systemStatus.metrics.requests.success}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Error</span>
                <span>{systemStatus.metrics.requests.error}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Error Rate</span>
                <span>{systemStatus.metrics.requests.errorRate.toFixed(2)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <CardDescription>User activity statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active</span>
                <span>{systemStatus.metrics.users.active}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>New Today</span>
                <span>{systemStatus.metrics.users.newToday}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Sessions</span>
                <span>{systemStatus.metrics.users.sessions}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
    operational: { label: 'Operational', variant: 'success' },
    degraded: { label: 'Degraded', variant: 'destructive' },
    investigating: { label: 'Investigating', variant: 'destructive' },
    monitoring: { label: 'Monitoring', variant: 'secondary' },
    resolved: { label: 'Resolved', variant: 'default' },
    scheduled: { label: 'Scheduled', variant: 'outline' },
    completed: { label: 'Completed', variant: 'default' },
  };

  const { label, variant } = statusMap[status] || { label: status, variant: 'outline' };
  
  return <Badge variant={variant}>{label}</Badge>;
};

const ResourceUsage = ({ 
  title, 
  value, 
  max = 100, 
  unit = '%',
  icon: Icon 
}: { 
  title: string; 
  value: number; 
  max?: number;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {value}{unit}
      </div>
      <div className="mt-2">
        <Progress value={value} max={max} className="h-2" />
      </div>
    </CardContent>
  </Card>
);
