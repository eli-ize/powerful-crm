import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { 
  Megaphone,
  Plus,
  Play,
  Pause,
  Settings,
  Users,
  Phone as PhoneIcon,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';

interface Campaign {
  id: string;
  name: string;
  type: 'ai_calling' | 'manual_calling' | 'email' | 'sms';
  status: 'draft' | 'active' | 'paused' | 'completed';
  objective: string;
  
  // Stats
  stats: {
    totalProspects: number;
    contacted: number;
    qualified: number;
    interested: number;
    notInterested: number;
    noAnswer: number;
  };
  
  // Config
  assignedAgents: string[];
  qualificationCategories: string[];
  
  createdAt: Date;
  createdBy: string;
}

interface CampaignProspect {
  id: string;
  leadId: string;
  campaignId: string;
  status: 'new' | 'in_campaign' | 'contacted' | 'qualified' | 'dead';
  journeyStage: string;
  addedAt: Date;
  addedBy: string;
}

export function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Web Design Outreach - No Website',
      type: 'ai_calling',
      status: 'active',
      objective: 'Offer website design services to businesses without websites',
      stats: {
        totalProspects: 150,
        contacted: 89,
        qualified: 23,
        interested: 12,
        notInterested: 45,
        noAnswer: 32,
      },
      assignedAgents: ['agent-1', 'agent-2'],
      qualificationCategories: ['No Website', 'Social Media Only'],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      createdBy: 'John Doe',
    },
    {
      id: '2',
      name: 'Redesign Pitch - Outdated Websites',
      type: 'ai_calling',
      status: 'active',
      objective: 'Pitch website redesign to businesses with outdated designs',
      stats: {
        totalProspects: 200,
        contacted: 134,
        qualified: 45,
        interested: 28,
        notInterested: 56,
        noAnswer: 50,
      },
      assignedAgents: ['agent-1', 'agent-3'],
      qualificationCategories: ['Outdated Design', 'Poor Mobile Experience'],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      createdBy: 'Jane Smith',
    },
  ]);

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddProspectsDialog, setShowAddProspectsDialog] = useState(false);
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    type: 'ai_calling',
    status: 'draft',
    stats: {
      totalProspects: 0,
      contacted: 0,
      qualified: 0,
      interested: 0,
      notInterested: 0,
      noAnswer: 0,
    },
    assignedAgents: [],
    qualificationCategories: [],
  });

  const handleCreateCampaign = () => {
    if (newCampaign.name && newCampaign.objective) {
      const campaign: Campaign = {
        id: Date.now().toString(),
        name: newCampaign.name,
        type: newCampaign.type || 'ai_calling',
        status: 'draft',
        objective: newCampaign.objective,
        stats: {
          totalProspects: 0,
          contacted: 0,
          qualified: 0,
          interested: 0,
          notInterested: 0,
          noAnswer: 0,
        },
        assignedAgents: newCampaign.assignedAgents || [],
        qualificationCategories: newCampaign.qualificationCategories || [],
        createdAt: new Date(),
        createdBy: 'Current User',
      };
      setCampaigns([...campaigns, campaign]);
      setNewCampaign({
        type: 'ai_calling',
        status: 'draft',
        stats: {
          totalProspects: 0,
          contacted: 0,
          qualified: 0,
          interested: 0,
          notInterested: 0,
          noAnswer: 0,
        },
        assignedAgents: [],
        qualificationCategories: [],
      });
      setShowCreateDialog(false);
      toast.success('Campaign created successfully');
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleToggleCampaign = (campaignId: string) => {
    setCampaigns(campaigns.map(c => {
      if (c.id === campaignId) {
        const newStatus = c.status === 'active' ? 'paused' : 'active';
        toast.info(`Campaign ${newStatus === 'active' ? 'activated' : 'paused'}`);
        return { ...c, status: newStatus as Campaign['status'] };
      }
      return c;
    }));
  };

  const getStatusBadge = (status: Campaign['status']) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-orange-100 text-orange-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return styles[status];
  };

  const getTypeBadge = (type: Campaign['type']) => {
    const icons = {
      ai_calling: <PhoneIcon className="h-3 w-3" />,
      manual_calling: <PhoneIcon className="h-3 w-3" />,
      email: <Badge className="h-3 w-3" />,
      sms: <Badge className="h-3 w-3" />,
    };
    return icons[type];
  };

  return (
    <div className="page-container">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mb-1 text-gray-900">Campaigns</h2>
            <p className="text-gray-500">Manage prospect journeys and AI calling campaigns</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
              <Megaphone className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Campaigns</p>
                <p className="text-3xl font-bold text-green-600">
                  {campaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Prospects</p>
                <p className="text-3xl font-bold text-gray-900">
                  {campaigns.reduce((sum, c) => sum + c.stats.totalProspects, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Qualified Leads</p>
                <p className="text-3xl font-bold text-green-600">
                  {campaigns.reduce((sum, c) => sum + c.stats.qualified, 0)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((campaign) => {
          const contactedPercentage = (campaign.stats.contacted / campaign.stats.totalProspects) * 100 || 0;
          const qualifiedPercentage = (campaign.stats.qualified / campaign.stats.contacted) * 100 || 0;

          return (
            <Card key={campaign.id} className="border-gray-200">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        {getTypeBadge(campaign.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3>{campaign.name}</h3>
                          <Badge className={getStatusBadge(campaign.status)}>
                            {campaign.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {campaign.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{campaign.objective}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {campaign.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleCampaign(campaign.id)}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleCampaign(campaign.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Activate
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">
                        {campaign.stats.contacted}/{campaign.stats.totalProspects} contacted ({contactedPercentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={contactedPercentage} className="h-2" />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <p className="text-2xl font-bold text-gray-900">{campaign.stats.totalProspects}</p>
                      </div>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <PhoneIcon className="h-4 w-4 text-blue-400" />
                        <p className="text-2xl font-bold text-blue-600">{campaign.stats.contacted}</p>
                      </div>
                      <p className="text-xs text-gray-600">Contacted</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <p className="text-2xl font-bold text-green-600">{campaign.stats.qualified}</p>
                      </div>
                      <p className="text-xs text-gray-600">Qualified</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Badge className="h-4 w-4 text-purple-400" />
                        <p className="text-2xl font-bold text-purple-600">{campaign.stats.interested}</p>
                      </div>
                      <p className="text-xs text-gray-600">Interested</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <XCircle className="h-4 w-4 text-red-400" />
                        <p className="text-2xl font-bold text-red-600">{campaign.stats.notInterested}</p>
                      </div>
                      <p className="text-xs text-gray-600">Not Interested</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="h-4 w-4 text-orange-400" />
                        <p className="text-2xl font-bold text-orange-600">{campaign.stats.noAnswer}</p>
                      </div>
                      <p className="text-xs text-gray-600">No Answer</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setShowAddProspectsDialog(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Prospects
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure AI
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Campaign Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Set up a new prospect journey or AI calling campaign
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Campaign Name *</Label>
              <Input
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                placeholder="e.g., Web Design Outreach - No Website"
              />
            </div>

            <div>
              <Label>Campaign Type *</Label>
              <Select
                value={newCampaign.type}
                onValueChange={(value: string) => setNewCampaign({ ...newCampaign, type: value as Campaign['type'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai_calling">AI Automated Calling</SelectItem>
                  <SelectItem value="manual_calling">Manual Calling</SelectItem>
                  <SelectItem value="email">Email Campaign</SelectItem>
                  <SelectItem value="sms">SMS Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Campaign Objective *</Label>
              <Textarea
                value={newCampaign.objective}
                onChange={(e) => setNewCampaign({ ...newCampaign, objective: e.target.value })}
                placeholder="Describe the goal of this campaign..."
                rows={3}
              />
            </div>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Next Steps After Creation:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Add prospects from qualified lead categories</li>
                      <li>Configure AI voice and behavior settings</li>
                      <li>Assign virtual agents to the campaign</li>
                      <li>Review and activate the campaign</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign}>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Prospects Dialog */}
      <Dialog open={showAddProspectsDialog} onOpenChange={setShowAddProspectsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Add Prospects to Campaign</DialogTitle>
            <DialogDescription>
              Select qualified leads from categories to add to this campaign
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div className="text-sm text-orange-800">
                    <p className="font-medium">Duplicate Check</p>
                    <p className="text-xs mt-1">
                      The system will automatically check if prospects are already in another campaign before adding them.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-sm text-gray-600">
              This feature will integrate with the Lead Qualification system. 
              You'll be able to bulk-select prospects from categories like "No Website", "Outdated Design", etc.
            </p>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddProspectsDialog(false)}>
                Close
              </Button>
              <Button>
                Go to Lead Qualification →
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
