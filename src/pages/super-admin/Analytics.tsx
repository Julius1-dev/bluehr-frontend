import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Download, 
  Calendar, 
  Users, 
  Building2, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data for charts
const monthlyRevenueData = [
  { month: 'Jan', revenue: 12500 },
  { month: 'Feb', revenue: 18900 },
  { month: 'Mar', revenue: 21500 },
  { month: 'Apr', revenue: 24800 },
  { month: 'May', revenue: 27600 },
  { month: 'Jun', revenue: 31200 },
];

const userGrowthData = [
  { month: 'Jan', users: 1250 },
  { month: 'Feb', users: 1890 },
  { month: 'Mar', users: 2150 },
  { month: 'Apr', users: 2480 },
  { month: 'May', users: 2760 },
  { month: 'Jun', users: 3120 },
];

const planDistributionData = [
  { name: 'Enterprise', value: 45, color: 'bg-purple-500' },
  { name: 'Business', value: 30, color: 'bg-blue-500' },
  { name: 'Starter', value: 20, color: 'bg-green-500' },
  { name: 'Free', value: 5, color: 'bg-gray-200' },
];

const topCompaniesData = [
  { name: 'Acme Corporation', users: 245, revenue: 12500, growth: 12.5 },
  { name: 'Tech Solutions Inc.', users: 187, revenue: 8900, growth: 8.2 },
  { name: 'Global Systems', users: 154, revenue: 7600, growth: 5.7 },
  { name: 'InnoTech', users: 132, revenue: 6800, growth: 4.9 },
  { name: 'DataSphere', users: 98, revenue: 5200, growth: 3.8 },
];

const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon,
  iconColor = 'text-purple-500',
  iconBg = 'bg-purple-50'
}: { 
  title: string; 
  value: string; 
  change: number; 
  icon: any;
  iconColor?: string;
  iconBg?: string;
}) => {
  const isPositive = change >= 0;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <div className="mt-1 flex items-baseline">
              <p className="text-2xl font-semibold">{value}</p>
              <span className={`ml-2 flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span className="ml-1">{Math.abs(change)}%</span>
              </span>
            </div>
          </div>
          <div className={`rounded-lg p-3 ${iconBg}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('6m');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Insights and metrics about your platform's performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value="KES 124,845"
          change={12.5}
          icon={DollarSign}
          iconColor="text-purple-500"
          iconBg="bg-purple-50"
        />
        <MetricCard
          title="Active Companies"
          value="1,248"
          change={8.1}
          icon={Building2}
          iconColor="text-blue-500"
          iconBg="bg-blue-50"
        />
        <MetricCard
          title="Total Users"
          value="24,890"
          change={15.3}
          icon={Users}
          iconColor="text-green-500"
          iconBg="bg-green-50"
        />
        <MetricCard
          title="Avg. Session"
          value="8m 24s"
          change={-2.1}
          icon={Activity}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" className="ml-auto">
            <MoreHorizontal className="mr-2 h-4 w-4" />
            View All
          </Button>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  Monthly recurring revenue for the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                  <LineChart className="h-12 w-12 text-gray-300" />
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
                <CardDescription>
                  Current distribution of subscription plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[140px] flex items-center justify-center">
                  <PieChart className="h-12 w-12 text-gray-300" />
                </div>
                <div className="mt-6 space-y-3">
                  {planDistributionData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`h-3 w-3 rounded-full ${item.color} mr-2`}></div>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Companies</CardTitle>
                  <CardDescription>
                    Companies with the highest number of users
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">MRR</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topCompaniesData.map((company, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                              <Building2 className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium">{company.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {company.users.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          ${company.revenue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            company.growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {company.growth >= 0 ? (
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 mr-1" />
                            )}
                            {Math.abs(company.growth)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>
                Detailed revenue metrics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-md">
                <BarChart3 className="h-12 w-12 text-gray-300" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>
                User acquisition and growth metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-md">
                <Users className="h-12 w-12 text-gray-300" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>
                How users are engaging with the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-md">
                <Activity className="h-12 w-12 text-gray-300" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
