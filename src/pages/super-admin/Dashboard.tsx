import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  BarChart, 
  PieChart, 
  Building2, 
  Users, 
  DollarSign, 
  Activity, 
  Download, 
  Plus, 
  ChevronDown,
  Settings
} from 'lucide-react';

type MetricCardProps = {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
};

const MetricCard = ({ title, value, change, icon }: MetricCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      <div className="h-4 w-4 text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className={`text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {change >= 0 ? `+${change}%` : `${change}%`} from last month
      </p>
    </CardContent>
  </Card>
);

export default function SuperAdminDashboard() {
  const metrics = [
    {
      title: 'Total Companies',
      value: '1,248',
      change: 12.3,
      icon: <Building2 className="h-4 w-4 text-purple-500" />
    },
    {
      title: 'Active Users',
      value: '24,890',
      change: 8.1,
      icon: <Users className="h-4 w-4 text-blue-500" />
    },
    {
      title: 'Monthly Revenue',
      value: 'KES 124,845',
      change: 5.7,
      icon: <DollarSign className="h-4 w-4 text-green-500" />
    },
    {
      title: 'System Uptime',
      value: '99.98%',
      change: 0.02,
      icon: <Activity className="h-4 w-4 text-amber-500" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your system.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Revenue Overview</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <span className="mr-2">This Year</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              {/* Placeholder for chart */}
              <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-md">
                <LineChart className="h-12 w-12 text-gray-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Plan Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[140px] w-full flex items-center justify-center">
                <PieChart className="h-12 w-12 text-gray-300" />
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { name: 'Enterprise', value: '45%', color: 'bg-purple-500' },
                  { name: 'Business', value: '30%', color: 'bg-blue-500' },
                  { name: 'Starter', value: '20%', color: 'bg-green-500' },
                  { name: 'Free', value: '5%', color: 'bg-gray-200' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full ${item.color} mr-2`}></div>
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'API Service', status: 'operational' },
                  { name: 'Database', status: 'operational' },
                  { name: 'Authentication', status: 'degraded' },
                  { name: 'Storage', status: 'operational' },
                ].map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{service.name}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      service.status === 'operational' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {service.status === 'operational' ? 'Operational' : 'Degraded'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  id: 1, 
                  action: 'New company registered', 
                  company: 'Acme Corp', 
                  time: '2 minutes ago',
                  icon: <Building2 className="h-4 w-4" />
                },
                { 
                  id: 2, 
                  action: 'Subscription upgraded', 
                  company: 'Tech Solutions', 
                  time: '1 hour ago',
                  icon: <DollarSign className="h-4 w-4" />
                },
                { 
                  id: 3, 
                  action: 'New admin user added', 
                  company: 'Global Systems', 
                  time: '3 hours ago',
                  icon: <Users className="h-4 w-4" />
                },
              ].map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.company} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Add New Company
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Create Admin User
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="mr-2 h-4 w-4" />
                Manage Billing
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                System Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
