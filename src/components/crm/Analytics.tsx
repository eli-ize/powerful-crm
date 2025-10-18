import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Users, Award } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';

const revenueData = [
  { month: 'Jan', actual: 45000, forecast: 42000, target: 50000 },
  { month: 'Feb', actual: 52000, forecast: 48000, target: 50000 },
  { month: 'Mar', actual: 48000, forecast: 50000, target: 50000 },
  { month: 'Apr', actual: 61000, forecast: 55000, target: 60000 },
  { month: 'May', actual: 55000, forecast: 58000, target: 60000 },
  { month: 'Jun', actual: 67000, forecast: 65000, target: 70000 },
  { month: 'Jul', actual: null, forecast: 72000, target: 70000 },
  { month: 'Aug', actual: null, forecast: 75000, target: 75000 },
];

const conversionData = [
  { stage: 'Leads', count: 150, conversion: 100 },
  { stage: 'Qualified', count: 90, conversion: 60 },
  { stage: 'Proposal', count: 54, conversion: 36 },
  { stage: 'Negotiation', count: 32, conversion: 21 },
  { stage: 'Closed Won', count: 28, conversion: 19 },
];

const leadSourceData = [
  { name: 'Website', value: 45, color: '#3b82f6' },
  { name: 'Referral', value: 30, color: '#8b5cf6' },
  { name: 'Email', value: 15, color: '#10b981' },
  { name: 'Social Media', value: 10, color: '#f59e0b' },
];

const performanceData = [
  { name: 'Sarah Johnson', deals: 12, revenue: 245000, winRate: 68, avatar: 'SJ' },
  { name: 'Michael Chen', deals: 10, revenue: 198000, winRate: 62, avatar: 'MC' },
  { name: 'Emily Davis', deals: 9, revenue: 176000, winRate: 58, avatar: 'ED' },
  { name: 'James Wilson', deals: 8, revenue: 165000, winRate: 55, avatar: 'JW' },
  { name: 'Amanda Rodriguez', deals: 7, revenue: 142000, winRate: 51, avatar: 'AR' },
];

const dealSizeData = [
  { range: '$0-10k', count: 24 },
  { range: '$10-25k', count: 18 },
  { range: '$25-50k', count: 12 },
  { range: '$50-100k', count: 8 },
  { range: '$100k+', count: 5 },
];

export function Analytics() {
  const totalRevenue = 542000;
  const forecastRevenue = 725000;
  const avgDealSize = 28500;
  const winRate = 68;
  const avgSalesCycle = 32;

  return (
    <div className="page-container">
      <div className="page-header-responsive">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">Analytics & Forecasting</h2>
          <p className="text-gray-500">Deep insights into your sales performance</p>
        </div>
        <Select defaultValue="6m">
          <SelectTrigger className="w-[180px] flex-shrink-0">
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">Last Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid-responsive mb-8">
        <Card className="card-responsive border-2 border-gray-200">
          <CardContent className="card-content-responsive">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="mb-1 text-2xl font-semibold">${(totalRevenue / 1000).toFixed(0)}K</h3>
            <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
            <p className="text-xs text-green-600 mt-1">+23% vs last period</p>
          </CardContent>
        </Card>

        <Card className="card-responsive border-2 border-gray-200">
          <CardContent className="card-content-responsive">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <Badge variant="outline" className="text-xs badge-responsive">Forecast</Badge>
            </div>
            <h3 className="mb-1 text-2xl font-semibold">${(forecastRevenue / 1000).toFixed(0)}K</h3>
            <p className="text-sm text-gray-600 font-medium">Forecasted Revenue</p>
              <p className="text-xs text-blue-600 mt-1">Next 2 months</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 min-h-[140px] w-[200px] lg:w-auto flex-shrink-0">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <span className="text-xs text-gray-500">AVG</span>
              </div>
              <h3 className="mb-1 text-2xl font-semibold">${(avgDealSize / 1000).toFixed(1)}K</h3>
              <p className="text-sm text-gray-600 font-medium">Avg Deal Size</p>
              <p className="text-xs text-purple-600 mt-1">+12% vs last period</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 min-h-[140px] w-[200px] lg:w-auto flex-shrink-0">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-5 w-5 text-orange-600" />
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
              <h3 className="mb-1 text-2xl font-semibold">{winRate}%</h3>
              <p className="text-sm text-gray-600 font-medium">Win Rate</p>
              <p className="text-xs text-orange-600 mt-1">+5% vs last period</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 min-h-[140px] w-[200px] lg:w-auto flex-shrink-0">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 text-cyan-600" />
                <TrendingDown className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="mb-1 text-2xl font-semibold">{avgSalesCycle}d</h3>
              <p className="text-sm text-gray-600 font-medium">Avg Sales Cycle</p>
              <p className="text-xs text-green-600 mt-1">-3 days improvement</p>
            </CardContent>
          </Card>
        </div>

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Health</TabsTrigger>
          <TabsTrigger value="performance">Team Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-6">
          <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            <div className="inline-flex lg:grid lg:grid-cols-2 gap-4 sm:gap-6 pb-4 min-w-full lg:min-w-0">
              <Card className="border-2 border-gray-200 w-[340px] sm:w-[480px] lg:w-auto flex-shrink-0">
                <CardHeader>
                  <CardTitle>Revenue Forecast vs Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full min-w-[300px]">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="target" stackId="1" stroke="#d1d5db" fill="#f3f4f6" name="Target" />
                        <Area type="monotone" dataKey="forecast" stackId="2" stroke="#3b82f6" fill="#93c5fd" name="Forecast" />
                        <Area type="monotone" dataKey="actual" stackId="3" stroke="#10b981" fill="#6ee7b7" name="Actual" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 w-[340px] sm:w-[480px] lg:w-auto flex-shrink-0">
                <CardHeader>
                  <CardTitle>Lead Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full min-w-[300px]">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={leadSourceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {leadSourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 w-[340px] sm:w-[480px] lg:w-auto lg:col-span-2 flex-shrink-0">
                <CardHeader>
                  <CardTitle>Deal Size Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full min-w-[300px]">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dealSizeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="mt-6">
          <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-6">
            <div className="pb-4">
              <Card className="border-2 border-gray-200 min-w-[340px] sm:min-w-[480px]">
                <CardHeader>
                  <CardTitle>Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full min-w-[300px]">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={conversionData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="stage" type="category" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#3b82f6" name="Count" />
                        <Bar dataKey="conversion" fill="#10b981" name="Conversion %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <h4 className="mb-4">Pipeline Health Score</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Progress value={82} className="h-3" />
                    </div>
                    <span className="text-2xl font-bold text-green-600">82/100</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Healthy pipeline with good distribution</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h4 className="mb-4">Deals at Risk</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Progress value={15} className="h-3" />
                    </div>
                    <span className="text-2xl font-bold text-orange-600">6</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Deals with no activity in 7+ days</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h4 className="mb-4">Avg Time in Stage</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Lead</span>
                      <span>5 days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Qualified</span>
                      <span>8 days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Proposal</span>
                      <span>12 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((person, index) => (
                  <div key={person.name} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl font-bold text-gray-400 w-8">{index + 1}</span>
                      <Avatar>
                        <AvatarFallback>{person.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4>{person.name}</h4>
                        <p className="text-sm text-gray-600">{person.deals} deals closed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-600">${(person.revenue / 1000).toFixed(0)}K</p>
                      <p className="text-sm text-gray-600">{person.winRate}% win rate</p>
                    </div>
                    {index === 0 && <Award className="h-6 w-6 text-yellow-500" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="mb-2">Revenue Trending Up</h4>
                    <p className="text-sm text-gray-600">Your revenue is 23% higher than last period. Enterprise deals are driving growth.</p>
                    <Badge className="mt-2 bg-blue-100 text-blue-800">Positive</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-orange-600 mt-1" />
                  <div>
                    <h4 className="mb-2">Action Needed</h4>
                    <p className="text-sm text-gray-600">6 deals haven't been updated in over a week. Consider following up to keep them moving.</p>
                    <Badge className="mt-2 bg-orange-100 text-orange-800">Action Required</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="mb-2">Best Performing Source</h4>
                    <p className="text-sm text-gray-600">Website leads have a 72% conversion rate. Consider increasing marketing spend here.</p>
                    <Badge className="mt-2 bg-green-100 text-green-800">Opportunity</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="mb-2">Team Performance</h4>
                    <p className="text-sm text-gray-600">Sarah Johnson is on track to exceed quota by 145%. Great month!</p>
                    <Badge className="mt-2 bg-purple-100 text-purple-800">Achievement</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
