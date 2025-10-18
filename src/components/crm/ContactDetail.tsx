import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Mail, Phone, Building, MapPin, Calendar, DollarSign, Star, MessageSquare, Paperclip, CheckCircle } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'lead' | 'customer' | 'partner';
  value: string;
}

interface Activity {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  title: string;
  description: string;
  date: string;
}

interface Note {
  id: string;
  content: string;
  author: string;
  date: string;
}

interface Deal {
  id: string;
  title: string;
  value: string;
  stage: string;
  date: string;
}

const mockActivities: Activity[] = [
  { id: '1', type: 'email', title: 'Sent proposal', description: 'Sent enterprise license proposal via email', date: '2025-10-15 14:30' },
  { id: '2', type: 'call', title: 'Discovery call', description: 'Initial 30-minute discovery call to understand requirements', date: '2025-10-14 10:00' },
  { id: '3', type: 'meeting', title: 'Product demo', description: 'Demonstrated platform features and answered questions', date: '2025-10-12 15:00' },
  { id: '4', type: 'note', title: 'Research', description: 'Company is looking to migrate from competitor platform', date: '2025-10-10 09:00' },
];

const mockNotes: Note[] = [
  { id: '1', content: 'Very interested in enterprise features. Budget approved for Q4.', author: 'You', date: '2025-10-15 16:00' },
  { id: '2', content: 'Decision maker confirmed. Next step: technical evaluation.', author: 'Sarah Johnson', date: '2025-10-14 11:30' },
];

const mockDeals: Deal[] = [
  { id: '1', title: 'Enterprise License', value: '$45,000', stage: 'Negotiation', date: '2025-10-20' },
  { id: '2', title: 'Professional Plan', value: '$12,000', stage: 'Proposal', date: '2025-09-15' },
];

interface ContactDetailProps {
  contact: Contact | null;
  onClose: () => void;
}

export function ContactDetail({ contact, onClose }: ContactDetailProps) {
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<Note[]>(mockNotes);

  if (!contact) return null;

  const leadScore = 85; // Mock lead score

  const addNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        content: newNote,
        author: 'You',
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      setNotes([note, ...notes]);
      setNewNote('');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'call': return Phone;
      case 'meeting': return Calendar;
      case 'note': return MessageSquare;
      default: return MessageSquare;
    }
  };

  return (
    <Dialog open={!!contact} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{contact.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={
                  contact.status === 'customer' ? 'bg-green-100 text-green-800' :
                  contact.status === 'lead' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }>
                  {contact.status}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm">Lead Score: {leadScore}/100</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Contact Info */}
        <Card className="mt-4">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm">{contact.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm">{contact.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Company</p>
                  <p className="text-sm">{contact.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Total Value</p>
                  <p className="text-sm text-green-600">{contact.value}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lead Score Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h4>Lead Score</h4>
              <span className="text-2xl font-bold text-green-600">{leadScore}/100</span>
            </div>
            <Progress value={leadScore} className="h-2 mb-3" />
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Engagement</p>
                <p className="font-medium">High</p>
              </div>
              <div>
                <p className="text-gray-500">Budget</p>
                <p className="font-medium">Qualified</p>
              </div>
              <div>
                <p className="text-gray-500">Fit</p>
                <p className="font-medium">Excellent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="timeline" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-4">
            <div className="space-y-3">
              {mockActivities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <Card key={activity.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg h-fit">
                          <Icon className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="mb-1">{activity.title}</h5>
                              <p className="text-sm text-gray-600">{activity.description}</p>
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                              {new Date(activity.date).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="deals" className="mt-4">
            <div className="space-y-3">
              {mockDeals.map((deal) => (
                <Card key={deal.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="mb-1">{deal.title}</h5>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{deal.stage}</Badge>
                          <span className="text-sm text-gray-600">Close: {new Date(deal.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className="text-green-600">{deal.value}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={addNote}>Add Note</Button>
              </div>
              <div className="space-y-3">
                {notes.map((note) => (
                  <Card key={note.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{note.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{note.author}</span>
                            <span className="text-xs text-gray-500">{new Date(note.date).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-gray-700">{note.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-4">
          <Button className="flex-1">
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
          <Button variant="outline" className="flex-1">
            <Phone className="mr-2 h-4 w-4" />
            Log Call
          </Button>
          <Button variant="outline">
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
