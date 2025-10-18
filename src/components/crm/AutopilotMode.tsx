import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Zap,
  Play,
  Pause,
  Settings as SettingsIcon,
  CheckCircle,
  Clock,
  Users,
  Mail,
  Phone as PhoneIcon,
  Search,
  Tag,
  Bot,
  FileText,
  Image as ImageIcon,
  Send,
  AlertCircle,
  TrendingUp,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '../ui/progress';

interface AutopilotTask {
  id: string;
  type: 'find_leads' | 'qualify_leads' | 'analyze_website' | 'make_calls' | 'assign_designer' | 'send_emails';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  result?: any;
  assignedTo?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface AutopilotConfig {
  enabled: boolean;
  industry: string;
  leadFinding: {
    enabled: boolean;
    searchQuery: string;
    targetCount: number;
  };
  qualification: {
    enabled: boolean;
    websiteAnalysis: boolean;
    aiCriteria: string[];
  };
  calling: {
    enabled: boolean;
    dailyLimit: number;
    voiceId: string;
  };
  taskAssignment: {
    enabled: boolean;
    autoAssignDesigner: boolean;
    designerPool: string[];
  };
  emailAutomation: {
    enabled: boolean;
    sendAfterDemo: boolean;
    followUpDays: number;
  };
}

export function AutopilotMode() {
  const [isActive, setIsActive] = useState(false);
  const [config, setConfig] = useState<AutopilotConfig>({
    enabled: false,
    industry: 'web_design',
    leadFinding: {
      enabled: true,
      searchQuery: 'restaurants in Miami',
      targetCount: 100,
    },
    qualification: {
      enabled: true,
      websiteAnalysis: true,
      aiCriteria: ['No Website', 'Outdated Design', 'Poor SEO'],
    },
    calling: {
      enabled: true,
      dailyLimit: 200,
      voiceId: 'professional_female',
    },
    taskAssignment: {
      enabled: true,
      autoAssignDesigner: true,
      designerPool: ['John Designer', 'Sarah Creative', 'Mike Graphics'],
    },
    emailAutomation: {
      enabled: true,
      sendAfterDemo: true,
      followUpDays: 3,
    },
  });

  const [tasks, setTasks] = useState<AutopilotTask[]>([
    {
      id: '1',
      type: 'find_leads',
      status: 'completed',
      progress: 100,
      result: { found: 150, qualified: 89 },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      id: '2',
      type: 'analyze_website',
      status: 'completed',
      progress: 100,
      result: { analyzed: 89, needsWork: 67 },
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 45 * 60 * 1000),
    },
    {
      id: '3',
      type: 'make_calls',
      status: 'in_progress',
      progress: 45,
      result: { called: 30, booked: 8 },
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: '4',
      type: 'assign_designer',
      status: 'completed',
      progress: 100,
      result: { assigned: 8 },
      assignedTo: 'John Designer (3), Sarah Creative (3), Mike Graphics (2)',
      createdAt: new Date(Date.now() - 20 * 60 * 1000),
      completedAt: new Date(Date.now() - 15 * 60 * 1000),
    },
    {
      id: '5',
      type: 'send_emails',
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
    },
  ]);

  const [stats, setStats] = useState({
    leadsFound: 150,
    qualified: 89,
    callsMade: 30,
    meetingsBooked: 8,
    demosAssigned: 8,
    emailsSent: 0,
    revenue: 0,
  });

  const handleToggleAutopilot = () => {
    if (isActive) {
      setIsActive(false);
      toast.info('Autopilot paused');
    } else {
      setIsActive(true);
      toast.success('Autopilot activated! AI is now working...', {
        description: 'The system will find leads, qualify them, make calls, and assign tasks automatically.',
      });
      
      // Simulate progress
      setTimeout(() => {
        setStats(prev => ({
          ...prev,
          leadsFound: prev.leadsFound + 20,
        }));
      }, 5000);
    }
  };

  const getTaskIcon = (type: string) => {
    const icons: Record<string, any> = {
      find_leads: Search,
      qualify_leads: Tag,
      analyze_website: Target,
      make_calls: PhoneIcon,
      assign_designer: Users,
      send_emails: Send,
    };
    return icons[type] || Clock;
  };

  const getTaskLabel = (type: string) => {
    const labels: Record<string, string> = {
      find_leads: 'Finding Leads',
      qualify_leads: 'Qualifying Leads',
      analyze_website: 'Analyzing Websites',
      make_calls: 'Making Calls',
      assign_designer: 'Assigning to Designers',
      send_emails: 'Sending Emails',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-800 border-gray-300',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      failed: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-gradient-to-br from-green-500 to-green-600 animate-pulse' : 'bg-gradient-to-br from-gray-400 to-gray-500'}`}>
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-gray-900">Autopilot Mode</h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {isActive ? 'AI is working 24/7 on your behalf...' : 'Complete automation from leads to closed deals'}
              </p>
            </div>
          </div>

          <Button
            onClick={handleToggleAutopilot}
            size="lg"
            className={`w-full sm:w-auto h-12 px-8 min-w-[200px] ${isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isActive ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Pause Autopilot
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Activate Autopilot
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      {isActive && (
        <Card className="mb-6 border-2 border-green-200 bg-green-50 animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="status-dot online"></div>
              <div>
                <h4 className="text-green-900 mb-1">Autopilot is ACTIVE</h4>
                <p className="text-sm text-green-700">
                  AI is finding leads, qualifying them, making calls, assigning tasks to designers, and sending follow-up emails automatically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-6">
        <div className="inline-flex lg:grid lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 pb-4 min-w-full lg:min-w-0">
          <Card className="border-2 border-gray-200 min-h-[120px] w-[140px] lg:w-auto flex-shrink-0">
            <CardContent className="p-4 sm:p-5 text-center">
              <Search className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-semibold mb-1">{stats.leadsFound}</p>
              <p className="text-xs text-gray-600 font-medium">Leads Found</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 min-h-[120px] w-[140px] lg:w-auto flex-shrink-0">
            <CardContent className="p-4 sm:p-5 text-center">
              <Tag className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-semibold mb-1">{stats.qualified}</p>
              <p className="text-xs text-gray-600 font-medium">Qualified</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 min-h-[120px] w-[140px] lg:w-auto flex-shrink-0">
            <CardContent className="p-4 sm:p-5 text-center">
              <PhoneIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-semibold mb-1">{stats.callsMade}</p>
              <p className="text-xs text-gray-600 font-medium">Calls Made</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 min-h-[120px] w-[140px] lg:w-auto flex-shrink-0">
            <CardContent className="p-4 sm:p-5 text-center">
              <CheckCircle className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-semibold mb-1">{stats.meetingsBooked}</p>
              <p className="text-xs text-gray-600 font-medium">Meetings Booked</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 min-h-[120px] w-[140px] lg:w-auto flex-shrink-0">
            <CardContent className="p-4 sm:p-5 text-center">
              <ImageIcon className="h-6 w-6 text-pink-600 mx-auto mb-2" />
              <p className="text-2xl font-semibold mb-1">{stats.demosAssigned}</p>
              <p className="text-xs text-gray-600 font-medium">Demos Assigned</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 min-h-[120px] w-[140px] lg:w-auto flex-shrink-0">
            <CardContent className="p-4 sm:p-5 text-center">
              <Send className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
              <p className="text-2xl font-semibold mb-1">{stats.emailsSent}</p>
              <p className="text-xs text-gray-600 font-medium">Emails Sent</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 min-h-[120px] w-[140px] lg:w-auto flex-shrink-0">
            <CardContent className="p-4 sm:p-5 text-center">
              <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-semibold mb-1">${stats.revenue}K</p>
              <p className="text-xs text-gray-600 font-medium">Revenue</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">Industry</Label>
                <Select value={config.industry} onValueChange={(value) => setConfig({ ...config, industry: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web_design">Web Design</SelectItem>
                    <SelectItem value="saas">SaaS Products</SelectItem>
                    <SelectItem value="digital_marketing">Digital Marketing</SelectItem>
                    <SelectItem value="consulting">Business Consulting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Search className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Lead Finding</span>
                  </div>
                  <Switch
                    checked={config.leadFinding.enabled}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      leadFinding: { ...config.leadFinding, enabled: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Target className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Website Analysis</span>
                  </div>
                  <Switch
                    checked={config.qualification.websiteAnalysis}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      qualification: { ...config.qualification, websiteAnalysis: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">AI Calling</span>
                  </div>
                  <Switch
                    checked={config.calling.enabled}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      calling: { ...config.calling, enabled: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Task Assignment</span>
                  </div>
                  <Switch
                    checked={config.taskAssignment.enabled}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      taskAssignment: { ...config.taskAssignment, enabled: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Send className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Email Automation</span>
                  </div>
                  <Switch
                    checked={config.emailAutomation.enabled}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      emailAutomation: { ...config.emailAutomation, enabled: checked }
                    })}
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-900">
                  <strong>Autopilot Pipeline:</strong> Find leads → Analyze websites → Make calls → Assign designers → Send demos
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Queue */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Active Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => {
                  const Icon = getTaskIcon(task.type);
                  return (
                    <div key={task.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            task.status === 'completed' ? 'bg-green-100' :
                            task.status === 'in_progress' ? 'bg-blue-100' :
                            task.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            <Icon className={`h-5 w-5 ${
                              task.status === 'completed' ? 'text-green-600' :
                              task.status === 'in_progress' ? 'text-blue-600' :
                              task.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{getTaskLabel(task.type)}</h4>
                            <p className="text-xs text-gray-500">
                              Started {task.createdAt.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(task.status)} border`}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      {task.status === 'in_progress' && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="text-sm text-gray-900">{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-2" />
                        </div>
                      )}

                      {task.result && (
                        <div className="flex flex-wrap gap-2 text-sm">
                          {Object.entries(task.result).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {value as string}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {task.assignedTo && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          {task.assignedTo}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>How Autopilot Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">AI Finds Leads</h4>
                    <p className="text-sm text-gray-600">
                      Uses Google Places to discover businesses matching your criteria
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-purple-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">AI Analyzes Websites</h4>
                    <p className="text-sm text-gray-600">
                      Checks design quality, SEO, technical issues, content, images - explains qualification criteria
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-green-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">AI Makes Calls</h4>
                    <p className="text-sm text-gray-600">
                      Virtual agents call qualified leads, pitch your services, book meetings
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-orange-600">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">AI Assigns Tasks</h4>
                    <p className="text-sm text-gray-600">
                      When client agrees to demo, AI assigns designer to create mockup/design
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-cyan-600">5</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Designer Creates Demos</h4>
                    <p className="text-sm text-gray-600">
                      Designer gets list of qualified leads, creates custom designs for each
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-pink-600">6</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">AI Sends Emails</h4>
                    <p className="text-sm text-gray-600">
                      Once designer reports completion, AI sends personalized emails with demos attached to each lead
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">You Close Deals!</h4>
                    <p className="text-sm text-gray-600">
                      Focus on high-quality meetings while AI handles everything else
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
