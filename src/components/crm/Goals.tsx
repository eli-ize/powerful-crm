import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Target, TrendingUp, Calendar, Award, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface Goal {
  id: string;
  name: string;
  type: 'revenue' | 'deals' | 'activities';
  target: number;
  current: number;
  period: string;
  owner?: string;
}

const teamGoals: Goal[] = [
  { id: '1', name: 'Q4 Revenue Target', type: 'revenue', target: 500000, current: 342000, period: 'Q4 2025' },
  { id: '2', name: 'Monthly Deals Closed', type: 'deals', target: 25, current: 18, period: 'October 2025' },
  { id: '3', name: 'Customer Calls', type: 'activities', target: 100, current: 67, period: 'This Week' },
];

const individualGoals: Goal[] = [
  { id: '4', name: 'Monthly Revenue', type: 'revenue', target: 50000, current: 42000, period: 'October 2025', owner: 'Sarah Johnson' },
  { id: '5', name: 'Deals Closed', type: 'deals', target: 5, current: 4, period: 'October 2025', owner: 'Sarah Johnson' },
  { id: '6', name: 'Monthly Revenue', type: 'revenue', target: 45000, current: 28000, period: 'October 2025', owner: 'Michael Chen' },
  { id: '7', name: 'Deals Closed', type: 'deals', target: 4, current: 2, period: 'October 2025', owner: 'Michael Chen' },
  { id: '8', name: 'Monthly Revenue', type: 'revenue', target: 40000, current: 38000, period: 'October 2025', owner: 'Emily Davis' },
  { id: '9', name: 'Deals Closed', type: 'deals', target: 4, current: 3, period: 'October 2025', owner: 'Emily Davis' },
];

const leaderboard = [
  { name: 'Sarah Johnson', quota: 50000, achieved: 42000, deals: 4, avatar: 'SJ' },
  { name: 'Emily Davis', quota: 40000, achieved: 38000, deals: 3, avatar: 'ED' },
  { name: 'Michael Chen', quota: 45000, achieved: 28000, deals: 2, avatar: 'MC' },
  { name: 'James Wilson', quota: 45000, achieved: 25000, deals: 2, avatar: 'JW' },
  { name: 'Amanda Rodriguez', quota: 35000, achieved: 18000, deals: 1, avatar: 'AR' },
];

export function Goals() {
  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-600';
    if (progress >= 75) return 'text-blue-600';
    if (progress >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatValue = (value: number, type: string) => {
    if (type === 'revenue') {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'revenue': return DollarSign;
      case 'deals': return Target;
      case 'activities': return Calendar;
      default: return Target;
    }
  };

  return (
    <div className="page-container">
      <div className="mb-6 md:mb-8">
        <h2 className="mb-2">Goals & Quotas</h2>
        <p className="text-gray-600">Track team and individual performance against targets</p>
      </div>

      <Tabs defaultValue="team" className="w-full">
        <TabsList>
          <TabsTrigger value="team">Team Goals</TabsTrigger>
          <TabsTrigger value="individual">Individual Goals</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="mt-6">
          <div className="space-y-6">
            {teamGoals.map((goal) => {
              const progress = getProgress(goal.current, goal.target);
              const Icon = getTypeIcon(goal.type);
              return (
                <Card key={goal.id}>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start justify-between mb-4 gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 md:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                          <Icon className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="mb-1 truncate">{goal.name}</h4>
                          <p className="text-sm text-gray-600">{goal.period}</p>
                        </div>
                      </div>
                      <Badge className={`flex-shrink-0 ${progress >= 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {progress >= 100 ? 'Achieved' : 'In Progress'}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm gap-2">
                        <span className={getProgressColor(progress)}>{progress.toFixed(0)}% Complete</span>
                        <span className="text-gray-600 flex-shrink-0">
                          {formatValue(goal.current, goal.type)} / {formatValue(goal.target, goal.type)}
                        </span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="individual" className="mt-6">
          <div className="space-y-8">
            {['Sarah Johnson', 'Michael Chen', 'Emily Davis'].map(person => {
              const personGoals = individualGoals.filter(g => g.owner === person);
              return (
                <div key={person}>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarFallback>{person.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <h3>{person}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {personGoals.map((goal) => {
                      const progress = getProgress(goal.current, goal.target);
                      const Icon = getTypeIcon(goal.type);
                      return (
                        <Card key={goal.id}>
                          <CardContent className="p-4 md:p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <Icon className="h-5 w-5 text-gray-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h4 className="mb-1 truncate">{goal.name}</h4>
                                <p className="text-sm text-gray-600">{goal.period}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm gap-2">
                                <span className={getProgressColor(progress)}>{progress.toFixed(0)}%</span>
                                <span className="text-gray-600 flex-shrink-0">
                                  {formatValue(goal.current, goal.type)} / {formatValue(goal.target, goal.type)}
                                </span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                October 2025 Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-3 md:space-y-4">
                {leaderboard.map((person, index) => {
                  const progress = getProgress(person.achieved, person.quota);
                  const percentage = (person.achieved / person.quota) * 100;
                  return (
                    <div key={person.name} className="flex items-center gap-2 md:gap-4 p-3 md:p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                          <span className="text-xl md:text-2xl font-bold text-gray-400 w-6 md:w-8">{index + 1}</span>
                          <Avatar className="h-8 w-8 md:h-10 md:w-10">
                            <AvatarFallback>{person.avatar}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="mb-1 md:mb-2 truncate">{person.name}</h4>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm mb-1 gap-2">
                              <span className={getProgressColor(progress)}>{percentage.toFixed(0)}% of quota</span>
                              <span className="text-gray-600 flex-shrink-0">${(person.achieved / 1000).toFixed(0)}K / ${(person.quota / 1000).toFixed(0)}K</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 hidden sm:block">
                          <p className="text-sm text-gray-600">{person.deals} deals</p>
                          {index === 0 && <Award className="h-5 w-5 md:h-6 md:w-6 text-yellow-500 mt-2 ml-auto" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-yellow-500 flex-shrink-0" />
                  <div className="min-w-0 flex flex-col justify-center">
                    <h4 className="mb-0.5">Top Performer</h4>
                    <p className="text-sm text-gray-600 truncate">Sarah Johnson - 84% quota</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-500 flex-shrink-0" />
                  <div className="min-w-0 flex flex-col justify-center">
                    <h4 className="mb-0.5">Most Improved</h4>
                    <p className="text-sm text-gray-600 truncate">Emily Davis - +45% vs last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0 flex flex-col justify-center">
                    <h4 className="mb-0.5">Team Achievement</h4>
                    <p className="text-sm text-gray-600 truncate">68% of total quota reached</p>
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
