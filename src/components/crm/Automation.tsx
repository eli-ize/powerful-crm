import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Zap, Plus, Play, Pause, Edit, Trash, ChevronRight, Mail, Bell, Calendar } from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  enabled: boolean;
  executions: number;
}

const initialWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'New Lead Welcome Sequence',
    trigger: 'Contact created with status = Lead',
    actions: ['Send welcome email', 'Create follow-up task in 2 days', 'Notify sales rep'],
    enabled: true,
    executions: 142,
  },
  {
    id: '2',
    name: 'Deal Stage Change Notification',
    trigger: 'Deal moves to Negotiation',
    actions: ['Email manager for approval', 'Schedule review meeting', 'Update forecast'],
    enabled: true,
    executions: 38,
  },
  {
    id: '3',
    name: 'Stale Deal Alert',
    trigger: 'Deal inactive for 7 days',
    actions: ['Send reminder email to owner', 'Create follow-up task', 'Add to review list'],
    enabled: true,
    executions: 27,
  },
  {
    id: '4',
    name: 'Customer Onboarding',
    trigger: 'Deal marked as Closed Won',
    actions: ['Send onboarding email', 'Create onboarding tasks', 'Notify customer success team'],
    enabled: false,
    executions: 15,
  },
];

const triggers = [
  'Contact created',
  'Contact updated',
  'Deal created',
  'Deal stage changed',
  'Deal inactive for X days',
  'Email received',
  'Task completed',
  'Custom field changed',
];

const actions = [
  'Send email',
  'Create task',
  'Send notification',
  'Update field',
  'Add to campaign',
  'Schedule meeting',
  'Create note',
  'Send Slack message',
];

export function Automation() {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({ name: '', trigger: '', actions: [] as string[] });

  const toggleWorkflow = (id: string) => {
    setWorkflows(workflows.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(workflows.filter(w => w.id !== id));
  };

  const createWorkflow = () => {
    if (newWorkflow.name && newWorkflow.trigger && newWorkflow.actions.length > 0) {
      const workflow: Workflow = {
        id: Date.now().toString(),
        name: newWorkflow.name,
        trigger: newWorkflow.trigger,
        actions: newWorkflow.actions,
        enabled: true,
        executions: 0,
      };
      setWorkflows([...workflows, workflow]);
      setNewWorkflow({ name: '', trigger: '', actions: [] });
      setIsCreateOpen(false);
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h2 className="mb-2">Workflow Automation</h2>
          <p className="text-gray-600">Automate repetitive tasks and streamline your processes</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
          </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Workflow Name *</Label>
                <Input
                  placeholder="My Automation Workflow"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Trigger *</Label>
                <Select value={newWorkflow.trigger} onValueChange={(value) => setNewWorkflow({ ...newWorkflow, trigger: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggers.map(trigger => (
                      <SelectItem key={trigger} value={trigger}>{trigger}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Actions * (Select multiple)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {actions.map(action => (
                    <div key={action} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={action}
                        checked={newWorkflow.actions.includes(action)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWorkflow({ ...newWorkflow, actions: [...newWorkflow.actions, action] });
                          } else {
                            setNewWorkflow({ ...newWorkflow, actions: newWorkflow.actions.filter(a => a !== action) });
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={action} className="text-sm">{action}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={createWorkflow} className="w-full">Create Workflow</Button>
            </div>
          </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-yellow-500" />
              <div>
                <h3>{workflows.length}</h3>
                <p className="text-sm text-gray-600">Total Workflows</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Play className="h-8 w-8 text-green-500" />
              <div>
                <h3>{workflows.filter(w => w.enabled).length}</h3>
                <p className="text-sm text-gray-600">Active Workflows</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-500" />
              <div>
                <h3>{workflows.reduce((sum, w) => sum + w.executions, 0)}</h3>
                <p className="text-sm text-gray-600">Total Executions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <h3>24h</h3>
                <p className="text-sm text-gray-600">Time Saved Daily</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className={`h-5 w-5 ${workflow.enabled ? 'text-yellow-500' : 'text-gray-400'}`} />
                    <h4>{workflow.name}</h4>
                    <Badge variant={workflow.enabled ? 'default' : 'secondary'}>
                      {workflow.enabled ? 'Active' : 'Paused'}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <span className="font-medium">Trigger:</span>
                      <Badge variant="outline">{workflow.trigger}</Badge>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="font-medium mt-1">Actions:</span>
                      <div className="flex flex-wrap gap-2">
                        {workflow.actions.map((action, index) => (
                          <div key={index} className="flex items-center gap-1">
                            {index > 0 && <ChevronRight className="h-3 w-3" />}
                            <Badge variant="outline" className="bg-blue-50">{action}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Executed {workflow.executions} times</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Switch
                    checked={workflow.enabled}
                    onCheckedChange={() => toggleWorkflow(workflow.id)}
                  />
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteWorkflow(workflow.id)}>
                    <Trash className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workflow Templates */}
      <div className="mt-8">
        <h3 className="mb-4">Popular Workflow Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-dashed hover:border-blue-500 cursor-pointer transition-colors">
            <CardContent className="p-6">
              <Mail className="h-8 w-8 text-blue-500 mb-3" />
              <h4 className="mb-2">Email Drip Campaign</h4>
              <p className="text-sm text-gray-600 mb-4">Automatically send a series of emails to new leads over time</p>
              <Button variant="outline" size="sm" className="w-full">Use Template</Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed hover:border-blue-500 cursor-pointer transition-colors">
            <CardContent className="p-6">
              <Bell className="h-8 w-8 text-orange-500 mb-3" />
              <h4 className="mb-2">Deal Follow-up Reminder</h4>
              <p className="text-sm text-gray-600 mb-4">Get notified when deals haven't been updated in X days</p>
              <Button variant="outline" size="sm" className="w-full">Use Template</Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed hover:border-blue-500 cursor-pointer transition-colors">
            <CardContent className="p-6">
              <Calendar className="h-8 w-8 text-green-500 mb-3" />
              <h4 className="mb-2">Meeting Scheduler</h4>
              <p className="text-sm text-gray-600 mb-4">Automatically schedule meetings when deals reach certain stages</p>
              <Button variant="outline" size="sm" className="w-full">Use Template</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
