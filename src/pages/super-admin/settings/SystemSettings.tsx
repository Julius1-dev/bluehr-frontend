import { useState, useEffect } from 'react';
import { format, addHours } from 'date-fns';
import { 
  Database, 
  AlertTriangle, 
  HardDrive, 
  Cpu,
  MemoryStick,
  Network,
  CheckCircle2,
  Calendar as CalendarIcon
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Custom Components
import { MaintenanceScheduler } from './MaintenanceScheduler';

interface MaintenanceWindow {
  id: string;
  startTime: Date;
  endTime: Date;
  reason: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  notified: boolean;
}

interface SystemSettingsProps {
  settings?: {
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    maintenanceMode: boolean;
    cacheEnabled: boolean;
    cacheTtl: number;
    backupEnabled: boolean;
    backupTime: string;
    backupRetention: number;
    emailNotifications: boolean;
    systemAlerts: boolean;
  };
  onSettingsChange?: (settings: any) => void;
}

const TIMEZONES = [
  'Africa/Nairobi', 'Africa/Nairobi', 'Africa/Nairobi', 'Africa/Nairobi', 'Africa/Nairobi',
  'Africa/Nairobi', 'Africa/Nairobi', 'Africa/Nairobi', 'Africa/Nairobi', 'Africa/Nairobi'
];

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY' },
];

const TIME_FORMATS = [
  { value: '12', label: '12-hour (3:45 PM)' },
  { value: '24', label: '24-hour (15:45)' },
];

const BACKUP_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const BACKUP_RETENTION = [
  { value: '7', label: '1 Week' },
  { value: '30', label: '1 Month' },
  { value: '90', label: '3 Months' },
  { value: '180', label: '6 Months' },
  { value: '365', label: '1 Year' },
];

export default function SystemSettings({ 
  settings: externalSettings = {}, 
  onSettingsChange = () => {}
}: SystemSettingsProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    startTime: new Date(),
    endTime: addHours(new Date(), 2),
    reason: '',
  });
  const [maintenanceWindows, setMaintenanceWindows] = useState<MaintenanceWindow[]>([
    {
      id: '1',
      startTime: new Date('2025-06-10T02:00:00'),
      endTime: new Date('2025-06-10T04:00:00'),
      reason: 'Database migration and optimization',
      status: 'scheduled',
      notified: false,
    },
    {
      id: '2',
      startTime: new Date('2025-06-15T00:00:00'),
      endTime: new Date('2025-06-15T06:00:00'),
      reason: 'Scheduled system update',
      status: 'scheduled',
      notified: true,
    },
  ]);

  const [settings, setSettings] = useState({
    timezone: externalSettings?.timezone || 'Africa/Nairobi',
    dateFormat: externalSettings?.dateFormat || 'DD/MM/YYYY',
    timeFormat: externalSettings?.timeFormat || '12',
    maintenanceMode: externalSettings?.maintenanceMode ?? false,
    cacheEnabled: externalSettings?.cacheEnabled ?? true,
    cacheTtl: externalSettings?.cacheTtl || 60,
    backupEnabled: externalSettings?.backupEnabled ?? true,
    backupTime: externalSettings?.backupTime || '02:00',
    backupRetention: externalSettings?.backupRetention || 30,
    emailNotifications: externalSettings?.emailNotifications ?? true,
    systemAlerts: externalSettings?.systemAlerts ?? true,
  });

  const backupDatabase = async () => {
    try {
      console.log('Starting database backup...');
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Database backup completed');
    } catch (error) {
      console.error('Backup failed:', error);
    }
  };

  const restartServices = async () => {
    try {
      console.log('Restarting services...');
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Services restarted');
    } catch (error) {
      console.error('Failed to restart services:', error);
    }
  };

  const runMaintenance = async () => {
    try {
      console.log('Running system maintenance...');
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Maintenance completed');
    } catch (error) {
      console.error('Maintenance failed:', error);
    }
  };

  const handleChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const [systemInfo] = useState({
    os: 'Linux',
    nodeVersion: 'v18.15.0',
    memory: '15.5 GB / 16.0 GB',
    cpu: 'Intel(R) Xeon(R) CPU @ 2.30GHz',
    uptime: '15 days, 6 hours, 23 minutes',
    database: 'MongoDB 6.0.5',
    storage: '245.7 GB / 500 GB',
    lastBackup: '2025-06-05 02:00:00',
    nextBackup: '2025-06-06 02:00:00',
    systemLoad: '0.75',
    activeUsers: '42',
  });

  const [resourceData, setResourceData] = useState<any>(null);
  const [resourceLoading, setResourceLoading] = useState(true);
  const [resourceError, setResourceError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResourceData = async () => {
      setResourceLoading(true);
      setResourceError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:4000/super-admin/companies/system-health', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch system health');
        const data = await res.json();
        setResourceData(data.resources);
      } catch (err: any) {
        setResourceError(err.message || 'Failed to fetch system health');
      } finally {
        setResourceLoading(false);
      }
    };
    fetchResourceData();
  }, []);

  const recentActivities = [
    { id: 1, type: 'backup', message: 'Nightly backup completed', time: '2 hours ago', status: 'success' },
    { id: 2, type: 'update', message: 'Security patches applied', time: '5 hours ago', status: 'success' },
    { id: 3, type: 'warning', message: 'High CPU usage detected', time: '1 day ago', status: 'warning' },
    { id: 4, type: 'backup', message: 'Database backup failed', time: '2 days ago', status: 'error' },
  ];

  const handleScheduleMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (newMaintenance.reason.trim()) {
      const newWindow: MaintenanceWindow = {
        id: Date.now().toString(),
        ...newMaintenance,
        status: 'scheduled',
        notified: false,
      };
      
      setMaintenanceWindows(prev => [...prev, newWindow]);
      setScheduleOpen(false);
      setNewMaintenance({
        startTime: new Date(),
        endTime: addHours(new Date(), 2),
        reason: '',
      });
      
      // In a real app, you would send a notification to users here
      console.log('Maintenance scheduled:', newWindow);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    setScheduleOpen(open);
  };

  const cancelMaintenance = (id: string) => {
    setMaintenanceWindows(maintenanceWindows.filter(mw => mw.id !== id));
    // In a real app, you would send a notification to users here
    console.log('Maintenance cancelled:', id);
  };

  const startMaintenanceNow = () => {
    setSettings(prev => ({ ...prev, maintenanceMode: true }));
    // In a real app, you would implement actual maintenance mode
    console.log('Maintenance mode activated');
  };

  const endMaintenance = () => {
    setSettings(prev => ({ ...prev, maintenanceMode: false }));
    // In a real app, you would implement actual maintenance mode
    console.log('Maintenance mode deactivated');
  };

  const clearCache = () => {
    // In a real app, this would clear the application cache
    console.log('Cache cleared');
  };
  
  // Removed duplicate function declarations for restartServices and runMaintenance

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Settings</h2>
        <p className="text-muted-foreground">
          Configure system-wide settings and maintenance windows
        </p>
      </div>
      
      <div className="space-y-4">
        {/* System Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and resource usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle>CPU Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  {resourceLoading ? 'Loading...' : resourceError ? resourceError : `${resourceData?.cpu ?? '--'}%`}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Memory Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  {resourceLoading ? 'Loading...' : resourceError ? resourceError : `${resourceData?.memory ?? '--'}%`}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Storage Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  {resourceLoading ? 'Loading...' : resourceError ? resourceError : `${resourceData?.storage ?? '--'}%`}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Network</CardTitle>
                </CardHeader>
                <CardContent>
                  {resourceLoading ? 'Loading...' : resourceError ? resourceError : `${resourceData?.networkIn ?? '--'} MB/s`}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Windows Card */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Windows</CardTitle>
            <CardDescription>Schedule and manage system maintenance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Upcoming Maintenance</h3>
                <Popover open={scheduleOpen} onOpenChange={setScheduleOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Schedule Maintenance
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end" onPointerDownOutside={(e) => e.preventDefault()}>
                    <MaintenanceScheduler
                      onSchedule={({ startTime, endTime, reason }) => {
                        const newWindow: MaintenanceWindow = {
                          id: Date.now().toString(),
                          startTime,
                          endTime,
                          reason,
                          status: 'scheduled',
                          notified: false,
                        };
                        setMaintenanceWindows(prev => [...prev, newWindow]);
                        setScheduleOpen(false);
                        console.log('Maintenance scheduled:', newWindow);
                      }}
                      onCancel={() => setScheduleOpen(false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="border rounded-md divide-y">
                {maintenanceWindows.length > 0 ? (
                  maintenanceWindows.map((window) => (
                    <div key={window.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{window.reason}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(window.startTime, 'MMM d, yyyy h:mm a')} - {format(window.endTime, 'h:mm a')}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={window.status === 'scheduled' ? 'outline' : 'default'}>
                          {window.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelMaintenance(window.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No upcoming maintenance scheduled
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>System Actions</CardTitle>
            <CardDescription>Perform system-wide actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={startMaintenanceNow} disabled={settings.maintenanceMode}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Start Maintenance
              </Button>
              <Button variant="outline" size="sm" onClick={endMaintenance} disabled={!settings.maintenanceMode}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                End Maintenance
              </Button>
              <Button variant="outline" size="sm" onClick={backupDatabase}>
                <Database className="mr-2 h-4 w-4" />
                Backup Database
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
