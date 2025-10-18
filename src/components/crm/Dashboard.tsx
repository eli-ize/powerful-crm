import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, TrendingUp, DollarSign, Target } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const stats = [
  { title: 'Total Contacts', value: '2,847', change: '+12%', icon: Users, color: 'text-blue-600' },
  { title: 'Active Deals', value: '42', change: '+8%', icon: TrendingUp, color: 'text-green-600' },
  { title: 'Revenue', value: '$542K', change: '+23%', icon: DollarSign, color: 'text-purple-600' },
  { title: 'Conversion Rate', value: '68%', change: '+5%', icon: Target, color: 'text-orange-600' },
];

const revenueData = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 67000 },
];

const dealsData = [
  { stage: 'Lead', count: 24 },
  { stage: 'Qualified', count: 18 },
  { stage: 'Proposal', count: 12 },
  { stage: 'Negotiation', count: 8 },
  { stage: 'Closed', count: 15 },
];

export function Dashboard() {
  return (
    <div className="page-container min-h-0">
      <div className="page-header-responsive">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
            Good morning, John
          </h2>
          <p className="text-sm text-gray-500">Your universal sales automation platform - sell anything, anywhere, anytime.</p>
        </div>
        <div className="text-left md:text-right flex-shrink-0">
          <p className="text-xs text-gray-500">Today</p>
          <p className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-6">
        <div className="grid-responsive">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="card-responsive border border-gray-200 hover:border-blue-300 transition-colors">
                <CardContent className="card-content-responsive">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 bg-gray-50 rounded-lg ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="badge-responsive text-green-600 px-2.5 py-1 bg-green-50 rounded-md font-medium">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{stat.title}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2-col-responsive mb-0">
        <Card className="card-responsive border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg text-gray-900">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="card-content-responsive pb-4">
            <div className="table-responsive-wrapper">
              <div className="min-w-[280px] h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-responsive border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg text-gray-900">Deals by Stage</CardTitle>
          </CardHeader>
          <CardContent className="card-content-responsive pb-4">
            <div className="table-responsive-wrapper">
              <div className="min-w-[280px] h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dealsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
