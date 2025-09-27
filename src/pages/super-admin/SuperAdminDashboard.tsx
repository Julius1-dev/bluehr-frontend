import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Users, CheckCircle2, Building2, DollarSign, Activity } from 'lucide-react';
import { OverviewChart } from '@/components/dashboard/OverviewChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { BACKEND_URL } from '@/lib/config';

export function SuperAdminDashboard() {
  const [stats, setStats] = useState([
    {
      title: 'Total Organizations',
      value: '0',
      change: '0%',
      changeType: 'positive',
      icon: <Building2 className="h-4 w-4 text-purple-500" />,
    },
    {
      title: 'Active Users',
      value: '0',
      change: '0%',
      changeType: 'positive',
      icon: <Users className="h-4 w-4 text-blue-500" />,
    },
    {
      title: 'Active Subscriptions',
      value: '0',
      change: '0',
      changeType: 'positive',
      icon: <DollarSign className="h-4 w-4 text-green-500" />,
    },
    {
      title: 'System Health',
      value: '99.9%',
      change: 'Stable',
      changeType: 'neutral',
      icon: <Activity className="h-4 w-4 text-amber-500" />,
    },
  ]);

  const [chartData, setChartData] = useState<{
    organizations: number[];
    users: number[];
    apiRequests: number[];
  } | null>(null);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${BACKEND_URL}/super-admin/dashboard/metrics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard metrics');
        }

        const result = await response.json();
        
        if (result.success) {
          setStats([
            {
              title: 'Total Organizations',
              value: result.data.totalCompanies?.toLocaleString() || '0',
              change: '0%',
              changeType: 'positive',
              icon: <Building2 className="h-4 w-4 text-purple-500" />,
            },
            {
              title: 'Active Users',
              value: result.data.activeUsers?.toLocaleString() || '0',
              change: '0%',
              changeType: 'positive',
              icon: <Users className="h-4 w-4 text-blue-500" />,
            },
            {
              title: 'Active Subscriptions',
              value: result.data.activeSubscriptions?.toLocaleString() || '0',
              change: '0',
              changeType: 'positive',
              icon: <DollarSign className="h-4 w-4 text-green-500" />,
            },
            {
              title: 'System Health',
              value: '99.9%',
              change: 'Stable',
              changeType: 'neutral',
              icon: <Activity className="h-4 w-4 text-amber-500" />,
            },
          ]);
        }

        // Fetch chart data
        const chartResponse = await fetch(`${BACKEND_URL}/super-admin/dashboard/chart-data`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (chartResponse.ok) {
          const chartResult = await chartResponse.json();
          
          if (chartResult.success) {
            setChartData(chartResult.data);
          }
        }
      } catch (_error) {
        // Error handling
      }
    };

    fetchDashboardMetrics();
  }, []);

  const quickActions = [
    { title: 'Add New Organization', icon: '🏢', path: '/super-admin/organizations/new' },
    { title: 'Manage Users', icon: '👥', path: '/super-admin/users' },
    { title: 'View System Logs', icon: '📊', path: '/super-admin/system-logs' },
    { title: 'Billing Overview', icon: '💳', path: '/super-admin/billing' },
  ];

  const recentActivities = [
    { id: 1, action: 'New organization registered', time: '2 minutes ago', user: 'Acme Corp' },
    { id: 2, action: 'Subscription plan upgraded', time: '1 hour ago', user: 'Tech Solutions Inc.' },
    { id: 3, action: 'New admin user added', time: '3 hours ago', user: 'John Doe' },
    { id: 4, action: 'System maintenance completed', time: '5 hours ago', user: 'System' },
    { id: 5, action: 'New feature released', time: '1 day ago', user: 'System' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Super Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>
      </div>

      <StatsGrid stats={stats} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart className="h-[300px]" chartData={chartData} />
          </CardContent>
        </Card>

        <div className="col-span-3 space-y-4">
          <QuickActions actions={quickActions} />
          <RecentActivity activities={recentActivities} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Organizations</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[0].value}</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
            <div className="mt-4 h-[80px]">
              {/* Mini chart would go here */}
              <div className="h-full w-full rounded bg-muted/50 flex items-end">
                {[30, 50, 70, 60, 90, 80, 100].map((height, i) => (
                  <div 
                    key={i}
                    className="h-full w-3 mx-0.5 bg-primary rounded-t"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[1].value}</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
            <div className="mt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Avatar key={i} className="h-8 w-8 border-2 border-background">
                    <AvatarFallback>U{i}</AvatarFallback>
                  </Avatar>
                ))}
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback>+99</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">All Systems Operational</div>
            <p className="text-xs text-muted-foreground">Last updated: Just now</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>API</span>
                <span className="flex items-center text-green-500">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Database</span>
                <span className="flex items-center text-green-500">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Storage</span>
                <span className="flex items-center text-green-500">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  65% used
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
