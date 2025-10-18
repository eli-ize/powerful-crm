import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Image as ImageIcon,
  FileText,
  Upload,
  Send,
  Eye,
  Download,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Task {
  id: string;
  type: 'design_demo' | 'prepare_mockup' | 'create_proposal';
  leadName: string;
  leadCompany: string;
  leadEmail: string;
  leadWebsite?: string;
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
  createdAt: Date;
  completedAt?: Date;
  notes?: string;
  attachments?: string[];
}

export function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      type: 'design_demo',
      leadName: 'Maria Garcia',
      leadCompany: 'Garcia Restaurant',
      leadEmail: 'maria@garciarestaurant.com',
      leadWebsite: 'garciarestaurant.com',
      assignedTo: 'John Designer',
      status: 'completed',
      priority: 'high',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      notes: 'Client wants modern, clean design with focus on menu',
      attachments: ['demo_garcia_v1.pdf', 'mockup_homepage.png'],
    },
    {
      id: '2',
      type: 'design_demo',
      leadName: 'David Chen',
      leadCompany: 'Chen Law Firm',
      leadEmail: 'david@chenlawfirm.com',
      assignedTo: 'Sarah Creative',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      notes: 'Professional, trustworthy design for law firm',
    },
    {
      id: '3',
      type: 'design_demo',
      leadName: 'Lisa Thompson',
      leadCompany: 'Thompson Dental',
      leadEmail: 'lisa@thompsondental.com',
      leadWebsite: 'thompsondental.com',
      assignedTo: 'John Designer',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      notes: 'Existing website is outdated, needs complete redesign',
    },
    {
      id: '4',
      type: 'prepare_mockup',
      leadName: 'Robert Johnson',
      leadCompany: 'Johnson Real Estate',
      leadEmail: 'robert@johnsonre.com',
      assignedTo: 'Mike Graphics',
      status: 'in_progress',
      priority: 'medium',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
    {
      id: '5',
      type: 'design_demo',
      leadName: 'Emily Brown',
      leadCompany: 'Brown Consulting',
      leadEmail: 'emily@brownconsulting.com',
      assignedTo: 'Sarah Creative',
      status: 'pending',
      priority: 'low',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    },
  ]);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [selectedDesigner, setSelectedDesigner] = useState<string>('all');

  const designers = ['John Designer', 'Sarah Creative', 'Mike Graphics'];

  const handleCompleteTask = (task: Task) => {
    setSelectedTask(task);
    setShowCompleteDialog(true);
  };

  const handleSubmitCompletion = () => {
    if (!selectedTask) return;

    setTasks(tasks.map(t => 
      t.id === selectedTask.id 
        ? { ...t, status: 'completed', completedAt: new Date() }
        : t
    ));

    toast.success(`Task completed for ${selectedTask.leadCompany}!`);
    setShowCompleteDialog(false);
  };

  const handleSendEmail = (task: Task) => {
    toast.success(`Email sent to ${task.leadEmail}`, {
      description: 'Demo and mockups attached',
    });

    setTasks(tasks.map(t => 
      t.id === task.id 
        ? { ...t, status: 'approved' }
        : t
    ));
  };

  const handleBatchSendEmails = () => {
    const completedTasks = tasks.filter(t => t.status === 'completed');
    
    completedTasks.forEach(task => {
      setTimeout(() => {
        handleSendEmail(task);
      }, 500);
    });

    toast.success(`Sending ${completedTasks.length} emails with demos...`, {
      description: 'AI is personalizing and sending emails to each lead',
    });
  };

  const filteredTasks = tasks.filter(task => {
    if (filter !== 'all' && task.status !== filter) return false;
    if (selectedDesigner !== 'all' && task.assignedTo !== selectedDesigner) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-800 border-gray-300',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      approved: 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'text-red-600',
      medium: 'text-yellow-600',
      low: 'text-gray-600',
    };
    return colors[priority] || colors.low;
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    approved: tasks.filter(t => t.status === 'approved').length,
  };

  return (
    <div className="page-container">
      <div className="page-header-responsive">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">Task Management</h2>
          <p className="text-gray-500">Designer assignments and demo preparation workflow</p>
        </div>
        <Button 
          onClick={handleBatchSendEmails}
          disabled={stats.completed === 0}
          className="btn-responsive bg-blue-600 hover:bg-blue-700 flex-shrink-0"
        >
          <Send className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">Send {stats.completed} Completed Demos</span>
          <span className="sm:hidden">Send ({stats.completed})</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid-responsive mb-6">
        <Card className="card-responsive border-2 border-gray-200">
          <CardContent className="card-content-responsive text-center">
            <p className="text-2xl font-semibold mb-1">{stats.total}</p>
            <p className="text-xs text-gray-600 font-medium">Total Tasks</p>
          </CardContent>
        </Card>

        <Card className="card-responsive border-2 border-gray-200">
          <CardContent className="card-content-responsive text-center">
            <Clock className="h-6 w-6 text-gray-600 mx-auto mb-2" />
            <p className="text-2xl font-semibold mb-1">{stats.pending}</p>
            <p className="text-xs text-gray-600 font-medium">Pending</p>
          </CardContent>
        </Card>

        <Card className="card-responsive border-2 border-gray-200">
          <CardContent className="card-content-responsive text-center">
            <AlertCircle className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-semibold mb-1">{stats.inProgress}</p>
              <p className="text-xs text-gray-600 font-medium">In Progress</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 min-h-[110px] w-[140px] lg:w-auto flex-shrink-0">
            <CardContent className="p-4 sm:p-5 text-center">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-semibold mb-1">{stats.completed}</p>
              <p className="text-xs text-gray-600 font-medium">Completed</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 min-h-[110px] w-[140px] lg:w-auto flex-shrink-0">
            <CardContent className="p-4 sm:p-5 text-center">
              <Send className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-semibold mb-1">{stats.approved}</p>
              <p className="text-xs text-gray-600 font-medium">Sent</p>
            </CardContent>
          </Card>
        </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={filter} onValueChange={(value: 'all' | 'pending' | 'in_progress' | 'completed') => setFilter(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDesigner} onValueChange={setSelectedDesigner}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by designer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Designers</SelectItem>
                {designers.map(designer => (
                  <SelectItem key={designer} value={designer}>{designer}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.map(task => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-blue-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{task.leadCompany}</h3>
                      <Badge className={`${getStatusColor(task.status)} border text-xs`}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority} priority
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="text-gray-500">Contact:</span> {task.leadName}
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span> {task.leadEmail}
                      </div>
                      <div>
                        <span className="text-gray-500">Due:</span> {task.dueDate.toLocaleDateString()}
                      </div>
                    </div>

                    {task.notes && (
                      <p className="text-sm text-gray-600 mb-3 italic">"{task.notes}"</p>
                    )}

                    {task.attachments && task.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {task.attachments.map((file, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            {file}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <div className="text-right mr-3">
                    <p className="text-xs text-gray-500 mb-1">Assigned to</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                          {task.assignedTo.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{task.assignedTo}</span>
                    </div>
                  </div>

                  {task.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setTasks(tasks.map(t => 
                          t.id === task.id ? { ...t, status: 'in_progress' } : t
                        ));
                        toast.info('Task started');
                      }}
                    >
                      Start Task
                    </Button>
                  )}

                  {task.status === 'in_progress' && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleCompleteTask(task)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  )}

                  {task.status === 'completed' && (
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleSendEmail(task)}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send Email
                    </Button>
                  )}

                  {task.status === 'approved' && (
                    <Badge className="bg-purple-100 text-purple-800 border-purple-300 border">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Sent
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No tasks match your filters</p>
          </CardContent>
        </Card>
      )}

      {/* Complete Task Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
            <DialogDescription>
              Upload your completed demo/mockup for {selectedTask?.leadCompany}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Upload Files</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG up to 10MB</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
              <Textarea 
                placeholder="Add any notes about the design..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitCompletion} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Workflow Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <h4 className="font-medium mb-1">AI Assigns Task</h4>
              <p className="text-sm text-gray-600">
                When client agrees to demo, AI assigns designer
              </p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <h4 className="font-medium mb-1">Designer Creates</h4>
              <p className="text-sm text-gray-600">
                Designer creates custom demo/mockup
              </p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <h4 className="font-medium mb-1">Mark Complete</h4>
              <p className="text-sm text-gray-600">
                Designer uploads files and marks complete
              </p>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                4
              </div>
              <h4 className="font-medium mb-1">AI Sends Email</h4>
              <p className="text-sm text-gray-600">
                AI sends personalized email with demo attached
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}