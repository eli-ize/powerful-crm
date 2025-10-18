import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Calendar, Clock, User, CheckCircle2, Circle } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  type: 'call' | 'meeting' | 'email' | 'task';
  contact: string;
  date: string;
  time: string;
  completed: boolean;
  notes?: string;
}

const initialActivities: Activity[] = [
  { id: '1', title: 'Follow-up call with TechCorp', type: 'call', contact: 'Sarah Johnson', date: '2025-10-17', time: '10:00 AM', completed: false },
  { id: '2', title: 'Product demo meeting', type: 'meeting', contact: 'Michael Chen', date: '2025-10-18', time: '2:00 PM', completed: false },
  { id: '3', title: 'Send proposal to Startup Co', type: 'email', contact: 'Emily Davis', date: '2025-10-16', time: '9:00 AM', completed: true },
  { id: '4', title: 'Contract negotiation', type: 'meeting', contact: 'James Wilson', date: '2025-10-19', time: '11:00 AM', completed: false },
  { id: '5', title: 'Design review call', type: 'call', contact: 'Amanda Rodriguez', date: '2025-10-20', time: '3:00 PM', completed: false },
  { id: '6', title: 'Quarterly business review', type: 'meeting', contact: 'David Kim', date: '2025-10-17', time: '1:00 PM', completed: false },
];

export function Activities() {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({});
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const handleAddActivity = () => {
    if (newActivity.title && newActivity.type && newActivity.date) {
      const activity: Activity = {
        id: Date.now().toString(),
        title: newActivity.title,
        type: (newActivity.type as Activity['type']) || 'task',
        contact: newActivity.contact || '',
        date: newActivity.date,
        time: newActivity.time || '9:00 AM',
        completed: false,
        notes: newActivity.notes,
      };
      setActivities([...activities, activity]);
      setNewActivity({});
      setIsAddDialogOpen(false);
    }
  };

  const toggleActivityComplete = (id: string) => {
    setActivities(activities.map(activity =>
      activity.id === id ? { ...activity, completed: !activity.completed } : activity
    ));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-800';
      case 'meeting': return 'bg-purple-100 text-purple-800';
      case 'email': return 'bg-green-100 text-green-800';
      case 'task': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredActivities = activities
    .filter(activity => {
      if (filter === 'pending') return !activity.completed;
      if (filter === 'completed') return activity.completed;
      return true;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pendingCount = activities.filter(a => !a.completed).length;
  const completedCount = activities.filter(a => a.completed).length;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h2 className="mb-2">Activities</h2>
          <p className="text-gray-600">Track calls, meetings, and tasks</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Title *</Label>
                <Input
                  placeholder="Follow-up call"
                  value={newActivity.title || ''}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Type *</Label>
                <Select value={newActivity.type} onValueChange={(value) => setNewActivity({ ...newActivity, type: value as Activity['type'] })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Contact</Label>
                <Input
                  placeholder="Contact name"
                  value={newActivity.contact || ''}
                  onChange={(e) => setNewActivity({ ...newActivity, contact: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={newActivity.date || ''}
                    onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    placeholder="10:00 AM"
                    value={newActivity.time || ''}
                    onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="Additional details..."
                  value={newActivity.notes || ''}
                  onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                />
              </div>
              <Button onClick={handleAddActivity} className="w-full">Add Activity</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All ({activities.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pending ({pendingCount})
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
        >
          Completed ({completedCount})
        </Button>
      </div>

      <div className="space-y-3">
        {filteredActivities.map((activity) => (
          <Card key={activity.id} className={activity.completed ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <Checkbox
                    checked={activity.completed}
                    onCheckedChange={() => toggleActivityComplete(activity.id)}
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className={`mb-2 ${activity.completed ? 'line-through' : ''}`}>
                        {activity.title}
                      </h4>
                      <Badge className={getTypeColor(activity.type)}>
                        {activity.type}
                      </Badge>
                    </div>
                    {activity.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    {activity.contact && (
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="mr-2 h-4 w-4" />
                        {activity.contact}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="mr-2 h-4 w-4" />
                      {new Date(activity.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="mr-2 h-4 w-4" />
                      {activity.time}
                    </div>
                  </div>

                  {activity.notes && (
                    <p className="text-sm text-gray-600 mt-3 pl-0">
                      {activity.notes}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
