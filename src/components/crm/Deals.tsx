import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Progress } from '../ui/progress';
import { Plus, DollarSign, Calendar, User, LayoutGrid, List as ListIcon, Table as TableIcon, TrendingUp, Percent } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CalendarView } from './CalendarView';
import { TimelineView } from './TimelineView';

interface Deal {
  id: string;
  title: string;
  company: string;
  value: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed';
  contact: string;
  date: string;
  description?: string;
}

const initialDeals: Deal[] = [
  { id: '1', title: 'Enterprise License', company: 'TechCorp', value: 45000, stage: 'negotiation', contact: 'Sarah Johnson', date: '2025-10-20' },
  { id: '2', title: 'Cloud Migration', company: 'Innovate Inc', value: 12000, stage: 'proposal', contact: 'Michael Chen', date: '2025-10-25' },
  { id: '3', title: 'Annual Subscription', company: 'Startup Co', value: 78000, stage: 'closed', contact: 'Emily Davis', date: '2025-10-15' },
  { id: '4', title: 'Consulting Package', company: 'Global Solutions', value: 125000, stage: 'qualified', contact: 'James Wilson', date: '2025-11-01' },
  { id: '5', title: 'Website Redesign', company: 'Design Studio', value: 8500, stage: 'lead', contact: 'Amanda Rodriguez', date: '2025-10-30' },
  { id: '6', title: 'API Integration', company: 'Enterprise LLC', value: 95000, stage: 'proposal', contact: 'David Kim', date: '2025-10-28' },
];

const stages = [
  { id: 'lead', label: 'Lead', color: 'bg-gray-100' },
  { id: 'qualified', label: 'Qualified', color: 'bg-blue-100' },
  { id: 'proposal', label: 'Proposal', color: 'bg-yellow-100' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-orange-100' },
  { id: 'closed', label: 'Closed Won', color: 'bg-green-100' },
];

export function Deals() {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDeal, setNewDeal] = useState<Partial<Deal>>({});
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'table'>('kanban');

  const handleAddDeal = () => {
    if (newDeal.title && newDeal.company && newDeal.value) {
      const deal: Deal = {
        id: Date.now().toString(),
        title: newDeal.title,
        company: newDeal.company,
        value: newDeal.value,
        stage: (newDeal.stage as Deal['stage']) || 'lead',
        contact: newDeal.contact || '',
        date: newDeal.date || new Date().toISOString().split('T')[0],
        description: newDeal.description,
      };
      setDeals([...deals, deal]);
      setNewDeal({});
      setIsAddDialogOpen(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('dealId', dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStage: Deal['stage']) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');
    setDeals(deals.map(deal => 
      deal.id === dealId ? { ...deal, stage: newStage } : deal
    ));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
  };

  const getStageTotal = (stage: string) => {
    return deals
      .filter(deal => deal.stage === stage)
      .reduce((sum, deal) => sum + deal.value, 0);
  };

  const totalPipelineValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const avgDealSize = totalPipelineValue / deals.length;
  const forecastedRevenue = deals.filter(d => d.stage === 'negotiation' || d.stage === 'proposal').reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="page-container">
      <div className="page-header-responsive">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">Deals Pipeline</h2>
          <p className="text-gray-500">Track and manage your sales opportunities</p>
        </div>
        <div className="flex gap-2 items-center flex-shrink-0">
          <div className="flex border rounded-lg mr-2">
            <Button
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="btn-responsive"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="btn-responsive"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="btn-responsive"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-responsive">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Deal</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="dialog-responsive">
            <DialogHeader>
              <DialogTitle>Add New Deal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="form-group">
                <Label>Deal Title *</Label>
                <Input
                  placeholder="Enterprise License"
                  value={newDeal.title || ''}
                  onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <Label>Company *</Label>
                <Input
                  placeholder="Company Inc"
                  value={newDeal.company || ''}
                  onChange={(e) => setNewDeal({ ...newDeal, company: e.target.value })}
                />
              </div>
              <div className="grid-2-col-responsive gap-4">
                <div className="form-group">
                  <Label>Deal Value *</Label>
                  <Input
                    type="number"
                    placeholder="50000"
                    value={newDeal.value || ''}
                    onChange={(e) => setNewDeal({ ...newDeal, value: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <Label>Contact Person</Label>
                  <Input
                    placeholder="John Doe"
                    value={newDeal.contact || ''}
                    onChange={(e) => setNewDeal({ ...newDeal, contact: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid-2-col-responsive gap-4">
                <div className="form-group">
                  <Label>Stage</Label>
                  <Select value={newDeal.stage} onValueChange={(value) => setNewDeal({ ...newDeal, stage: value as Deal['stage'] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map(stage => (
                        <SelectItem key={stage.id} value={stage.id}>{stage.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="form-group">
                  <Label>Expected Close Date</Label>
                  <Input
                    type="date"
                    value={newDeal.date || ''}
                    onChange={(e) => setNewDeal({ ...newDeal, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <Label>Description</Label>
                <Textarea
                  placeholder="Deal details..."
                  value={newDeal.description || ''}
                  onChange={(e) => setNewDeal({ ...newDeal, description: e.target.value })}
                />
              </div>
              <Button onClick={handleAddDeal} className="w-full btn-responsive">Add Deal</Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="grid-responsive mb-6">
        <Card className="card-responsive border border-gray-200 hover:border-gray-300 transition-colors">
          <CardContent className="card-content-responsive">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-100 rounded-lg flex-shrink-0">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500">Pipeline Value</p>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{formatCurrency(totalPipelineValue)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-responsive border border-gray-200 hover:border-gray-300 transition-colors">
          <CardContent className="card-content-responsive">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-lg flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500">Forecasted Close</p>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{formatCurrency(forecastedRevenue)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-responsive border border-gray-200 hover:border-gray-300 transition-colors">
          <CardContent className="card-content-responsive">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 rounded-lg flex-shrink-0">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500">Avg Deal Size</p>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{formatCurrency(avgDealSize)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-responsive border border-gray-200 hover:border-gray-300 transition-colors">
          <CardContent className="card-content-responsive">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-100 rounded-lg flex-shrink-0">
                <Percent className="h-5 w-5 text-orange-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500">Win Probability</p>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">68%</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={viewMode} className="w-full" onValueChange={(value: 'kanban' | 'list' | 'table') => setViewMode(value)}>
        <TabsList className="mb-6">
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stages.map(stage => (
          <div
            key={stage.id}
            className="flex flex-col"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id as Deal['stage'])}
          >
            <Card className={`mb-4 ${stage.color}`}>
              <CardHeader className="p-4">
                <CardTitle className="text-sm">
                  {stage.label}
                  <span className="ml-2 text-gray-600">
                    ({deals.filter(d => d.stage === stage.id).length})
                  </span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {formatCurrency(getStageTotal(stage.id))}
                </p>
              </CardHeader>
            </Card>

            <div className="space-y-3 flex-1">
              {deals
                .filter(deal => deal.stage === stage.id)
                .map(deal => (
                  <Card
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                    className="cursor-move hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-4">
                      <h4 className="mb-2">{deal.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{deal.company}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="mr-2 h-3 w-3" />
                          {formatCurrency(deal.value)}
                        </div>
                        {deal.contact && (
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="mr-2 h-3 w-3" />
                            {deal.contact}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-2 h-3 w-3" />
                          {new Date(deal.date).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
        </TabsContent>

        <TabsContent value="list">
        <div className="space-y-3">
          {deals.map((deal) => {
            const stage = stages.find(s => s.id === deal.stage);
            const winProbability = {
              lead: 10,
              qualified: 25,
              proposal: 50,
              negotiation: 75,
              closed: 100,
            }[deal.stage] || 0;

            return (
              <Card key={deal.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4>{deal.title}</h4>
                        <Badge className={stage?.color}>{stage?.label}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{deal.company}</p>
                    </div>
                    <div className="text-right">
                      <h3 className="text-green-600">{formatCurrency(deal.value)}</h3>
                      <p className="text-sm text-gray-600">{deal.contact}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Win Probability</span>
                      <span className="font-medium">{winProbability}%</span>
                    </div>
                    <Progress value={winProbability} className="h-2" />
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Expected close: {new Date(deal.date).toLocaleDateString()}</span>
                      </div>
                      <span className="text-gray-600">
                        {Math.ceil((new Date(deal.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        </TabsContent>

        <TabsContent value="table">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Close Date</TableHead>
                  <TableHead>Win %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((deal) => {
                  const stage = stages.find(s => s.id === deal.stage);
                  const winProbability = {
                    lead: 10,
                    qualified: 25,
                    proposal: 50,
                    negotiation: 75,
                    closed: 100,
                  }[deal.stage] || 0;

                  return (
                    <TableRow key={deal.id}>
                      <TableCell>{deal.title}</TableCell>
                      <TableCell>{deal.company}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(deal.value)}</TableCell>
                      <TableCell>
                        <Badge className={stage?.color}>{stage?.label}</Badge>
                      </TableCell>
                      <TableCell>{deal.contact}</TableCell>
                      <TableCell>{new Date(deal.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={winProbability} className="h-2 w-16" />
                          <span className="text-sm">{winProbability}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarView />
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
