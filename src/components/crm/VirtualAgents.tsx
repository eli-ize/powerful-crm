import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { 
  Bot,
  Plus,
  Power,
  PowerOff,
  Phone as PhoneIcon,
  MessageSquare,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  BarChart3,
  Settings,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface VirtualAgent {
  id: string;
  name: string;
  type: 'ai_caller' | 'ai_qualifier' | 'ai_researcher';
  status: 'active' | 'idle' | 'calling' | 'researching' | 'offline';
  
  // Performance
  stats: {
    callsMade: number;
    successRate: number;
    qualifiedLeads: number;
    averageCallDuration: number; // seconds
    hoursWorked: number;
    totalRevenue: number;
  };
  
  // Current activity
  currentActivity?: {
    campaign: string;
    prospect: string;
    startTime: Date;
    activity: string;
  };
  
  // Config
  assignedCampaigns: string[];
  voiceProfile: {
    voiceId: string;
    tone: string;
    speed: number;
  };
  
  createdAt: Date;
}

export function VirtualAgents() {
  const [agents, setAgents] = useState<VirtualAgent[]>([
    {
      id: 'agent-1',
      name: 'Sarah (AI)',
      type: 'ai_caller',
      status: 'calling',
      stats: {
        callsMade: 1247,
        successRate: 34.2,
        qualifiedLeads: 187,
        averageCallDuration: 187,
        hoursWorked: 124.5,
        totalRevenue: 45600,
      },
      currentActivity: {
        campaign: 'Web Design Outreach',
        prospect: 'Acme Corp',
        startTime: new Date(Date.now() - 120000),
        activity: 'Active call - Discussing pricing',
      },
      assignedCampaigns: ['campaign-1', 'campaign-2'],
      voiceProfile: {
        voiceId: 'en-US-JennyNeural',
        tone: 'professional',
        speed: 1.0,
      },
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'agent-2',
      name: 'Marcus (AI)',
      type: 'ai_caller',
      status: 'active',
      stats: {
        callsMade: 892,
        successRate: 28.7,
        qualifiedLeads: 134,
        averageCallDuration: 156,
        hoursWorked: 89.2,
        totalRevenue: 32100,
      },
      currentActivity: {
        campaign: 'Redesign Pitch',
        prospect: 'Tech Solutions LLC',
        startTime: new Date(Date.now() - 300000),
        activity: 'Idle - Waiting for next call',
      },
      assignedCampaigns: ['campaign-1'],
      voiceProfile: {
        voiceId: 'en-US-GuyNeural',
        tone: 'friendly',
        speed: 1.1,
      },
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'agent-3',
      name: 'Emma (AI)',
      type: 'ai_researcher',
      status: 'researching',
      stats: {
        callsMade: 0,
        successRate: 0,
        qualifiedLeads: 456,
        averageCallDuration: 0,
        hoursWorked: 156.3,
        totalRevenue: 0,
      },
      currentActivity: {
        campaign: 'Lead Enrichment',
        prospect: 'Various',
        startTime: new Date(Date.now() - 600000),
        activity: 'Finding missing contact info for 23 leads',
      },
      assignedCampaigns: [],
      voiceProfile: {
        voiceId: 'en-US-AriaNeural',
        tone: 'enthusiastic',
        speed: 1.0,
      },
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
  ]);

  const getStatusBadge = (status: VirtualAgent['status']) => {
    const styles = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: <Activity className="h-3 w-3" /> },
      idle: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <Clock className="h-3 w-3" /> },
      calling: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <PhoneIcon className="h-3 w-3" /> },
      researching: { bg: 'bg-purple-100', text: 'text-purple-800', icon: <Search className="h-3 w-3" /> },
      offline: { bg: 'bg-red-100', text: 'text-red-800', icon: <PowerOff className="h-3 w-3" /> },
    };
    const style = styles[status];
    return (
      <Badge className={`${style.bg} ${style.text} border-0 gap-1`}>
        {style.icon}
        {status}
      </Badge>
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const toggleAgentStatus = (agentId: string) => {
    setAgents(agents.map(agent => {
      if (agent.id === agentId) {
        const newStatus = agent.status === 'offline' ? 'active' : 'offline';
        toast.info(`${agent.name} is now ${newStatus}`);
        return { ...agent, status: newStatus as VirtualAgent['status'] };
      }
      return agent;
    }));
  };

  const totalStats = {
    callsMade: agents.reduce((sum, a) => sum + a.stats.callsMade, 0),
    qualifiedLeads: agents.reduce((sum, a) => sum + a.stats.qualifiedLeads, 0),
    avgSuccessRate: agents.reduce((sum, a) => sum + a.stats.successRate, 0) / agents.length,
    totalRevenue: agents.reduce((sum, a) => sum + a.stats.totalRevenue, 0),
  };

  return (
    <div className="page-container">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mb-1 text-gray-900">Virtual Agents</h2>
            <p className="text-gray-500">Manage AI agents for automated calling and lead research</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Virtual Agent
          </Button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Agents</p>
                <p className="text-3xl font-bold text-gray-900">
                  {agents.filter(a => a.status !== 'offline').length}/{agents.length}
                </p>
              </div>
              <Bot className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Calls</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalStats.callsMade.toLocaleString()}
                </p>
              </div>
              <PhoneIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Qualified Leads</p>
                <p className="text-3xl font-bold text-green-600">
                  {totalStats.qualifiedLeads}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue Generated</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(totalStats.totalRevenue)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents List */}
      <div className="space-y-4">
        {agents.map((agent) => {
          const callDuration = agent.currentActivity 
            ? Math.floor((Date.now() - agent.currentActivity.startTime.getTime()) / 1000)
            : 0;

          return (
            <Card key={agent.id} className="border-gray-200">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                          <Bot className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3>{agent.name}</h3>
                          {getStatusBadge(agent.status)}
                          <Badge variant="outline" className="text-xs">
                            {agent.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Voice: {agent.voiceProfile.voiceId} • Tone: {agent.voiceProfile.tone}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAgentStatus(agent.id)}
                      >
                        {agent.status === 'offline' ? (
                          <>
                            <Power className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        ) : (
                          <>
                            <PowerOff className="h-4 w-4 mr-2" />
                            Deactivate
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Current Activity */}
                  {agent.currentActivity && agent.status !== 'offline' && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-blue-900">Current Activity</h4>
                              {agent.status === 'calling' && (
                                <Badge className="bg-blue-600 text-white">
                                  {formatDuration(callDuration)}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-blue-700">
                              Campaign: <strong>{agent.currentActivity.campaign}</strong>
                            </p>
                            <p className="text-sm text-blue-700">
                              {agent.currentActivity.activity}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Performance Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Calls Made</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {agent.stats.callsMade.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                      <p className="text-2xl font-bold text-green-600">
                        {agent.stats.successRate.toFixed(1)}%
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Qualified</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {agent.stats.qualifiedLeads}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Avg Call Time</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatDuration(agent.stats.averageCallDuration)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Revenue</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(agent.stats.totalRevenue)}
                      </p>
                    </div>
                  </div>

                  {/* Assigned Campaigns */}
                  {agent.assignedCampaigns.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Assigned Campaigns:</p>
                      <div className="flex flex-wrap gap-2">
                        {agent.assignedCampaigns.map((campaignId) => (
                          <Badge key={campaignId} variant="outline">
                            Campaign #{campaignId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Bot className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-blue-900 mb-2">About Virtual Agents</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p>
                  <strong>AI Callers:</strong> Autonomous agents that make calls using Azure TTS/STT and GPT-4 for conversation. 
                  They can handle objections, qualify leads, and book meetings.
                </p>
                <p>
                  <strong>AI Researchers:</strong> Agents that find missing lead information by searching the internet, 
                  social media, and business databases.
                </p>
                <p>
                  <strong>AI Qualifiers:</strong> Agents that analyze lead data and categorize leads based on qualification criteria.
                </p>
              </div>
              <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                <p className="text-xs text-blue-900 font-medium mb-1">💡 How It Works:</p>
                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Agent receives a lead from an assigned campaign</li>
                  <li>AI dials the prospect using Telnyx API</li>
                  <li>Azure Speech-to-Text converts prospect's speech</li>
                  <li>GPT-4 decides how to respond based on campaign instructions</li>
                  <li>Azure Text-to-Speech speaks the AI's response</li>
                  <li>After call, AI updates lead status and takes configured actions</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
