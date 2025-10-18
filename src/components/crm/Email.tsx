import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Mail, Send, Inbox, Clock, Star, Archive, Plus, Paperclip, Eye } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
  contact?: string;
  deal?: string;
}

const mockInbox: EmailMessage[] = [
  { id: '1', from: 'sarah.j@techcorp.com', to: 'me@powercrm.com', subject: 'Re: Enterprise License Proposal', body: 'Thank you for the detailed proposal. We would like to schedule a call to discuss the implementation timeline...', date: '2025-10-16 09:30', read: false, starred: true, contact: 'Sarah Johnson', deal: 'Enterprise License' },
  { id: '2', from: 'mchen@innovate.io', to: 'me@powercrm.com', subject: 'Question about pricing', body: 'Hi, I have a few questions regarding the pricing structure for the cloud migration package...', date: '2025-10-16 08:15', read: false, starred: false, contact: 'Michael Chen', deal: 'Cloud Migration' },
  { id: '3', from: 'emily@startup.com', to: 'me@powercrm.com', subject: 'Contract signed!', body: 'Great news! We have signed the contract and are ready to proceed. Looking forward to working together...', date: '2025-10-15 16:45', read: true, starred: true, contact: 'Emily Davis', deal: 'Annual Subscription' },
  { id: '4', from: 'jwilson@global.net', to: 'me@powercrm.com', subject: 'Follow-up from yesterday', body: 'Following up on our conversation yesterday. Can you send over the technical specifications?', date: '2025-10-15 14:20', read: true, starred: false, contact: 'James Wilson' },
];

const mockSent: EmailMessage[] = [
  { id: '5', from: 'me@powercrm.com', to: 'sarah.j@techcorp.com', subject: 'Enterprise License Proposal', body: 'Dear Sarah, Please find attached our comprehensive proposal for the Enterprise License...', date: '2025-10-15 11:00', read: true, starred: false, contact: 'Sarah Johnson' },
  { id: '6', from: 'me@powercrm.com', to: 'dkim@enterprise.com', subject: 'Quarterly Business Review', body: 'Hi David, I wanted to schedule our quarterly business review meeting...', date: '2025-10-14 10:30', read: true, starred: false, contact: 'David Kim' },
];

export function Email() {
  const [inbox, setInbox] = useState<EmailMessage[]>(mockInbox);
  const [sent, setSent] = useState<EmailMessage[]>(mockSent);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newEmail, setNewEmail] = useState({ to: '', subject: '', body: '', contact: '' });

  const handleSendEmail = () => {
    const email: EmailMessage = {
      id: Date.now().toString(),
      from: 'me@powercrm.com',
      to: newEmail.to,
      subject: newEmail.subject,
      body: newEmail.body,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      read: true,
      starred: false,
      contact: newEmail.contact,
    };
    setSent([email, ...sent]);
    setNewEmail({ to: '', subject: '', body: '', contact: '' });
    setIsComposeOpen(false);
  };

  const toggleStar = (id: string, type: 'inbox' | 'sent') => {
    if (type === 'inbox') {
      setInbox(inbox.map(email => email.id === id ? { ...email, starred: !email.starred } : email));
    } else {
      setSent(sent.map(email => email.id === id ? { ...email, starred: !email.starred } : email));
    }
  };

  const markAsRead = (id: string) => {
    setInbox(inbox.map(email => email.id === id ? { ...email, read: true } : email));
  };

  const getInitials = (email: string) => {
    const name = email.split('@')[0];
    return name.slice(0, 2).toUpperCase();
  };

  const unreadCount = inbox.filter(e => !e.read).length;

  return (
    <div className="page-container">
      <div className="page-header-responsive">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">Email</h2>
          <p className="text-gray-500">Manage all your communications in one place</p>
        </div>
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button className="btn-responsive flex-shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Compose Email</span>
              <span className="sm:hidden">Compose</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="dialog-responsive max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compose Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="form-group">
                <Label>To *</Label>
                <Input
                  placeholder="recipient@example.com"
                  value={newEmail.to}
                  onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
                />
              </div>
              <div className="form-group">
                <Label>Link to Contact</Label>
                <Select value={newEmail.contact} onValueChange={(value) => setNewEmail({ ...newEmail, contact: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                    <SelectItem value="Michael Chen">Michael Chen</SelectItem>
                    <SelectItem value="Emily Davis">Emily Davis</SelectItem>
                    <SelectItem value="James Wilson">James Wilson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="form-group">
                <Label>Subject *</Label>
                <Input
                  placeholder="Email subject"
                  value={newEmail.subject}
                  onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                />
              </div>
              <div className="form-group">
                <Label>Message *</Label>
                <Textarea
                  placeholder="Write your email..."
                  className="min-h-[200px]"
                  value={newEmail.body}
                  onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSendEmail} className="flex-1 btn-responsive">
                  <Send className="mr-2 h-4 w-4" />
                  <span>Send Email</span>
                </Button>
                <Button variant="outline" className="btn-responsive">
                  <Paperclip className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Attach</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList>
          <TabsTrigger value="inbox">
            <Inbox className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Inbox ({unreadCount})</span>
            <span className="sm:hidden">({unreadCount})</span>
          </TabsTrigger>
          <TabsTrigger value="sent">
            <Send className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Sent</span>
            <span className="sm:hidden">Sent</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-6">
          <div className="space-y-2">
            {inbox.map((email) => (
              <Card
                key={email.id}
                className={`card-responsive cursor-pointer transition-colors hover:bg-gray-50 ${!email.read ? 'bg-blue-50' : ''}`}
                onClick={() => {
                  setSelectedEmail(email);
                  markAsRead(email.id);
                }}
              >
                <CardContent className="card-content-responsive">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback>{getInitials(email.from)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={!email.read ? 'font-semibold' : ''}>{email.from}</span>
                            {email.contact && (
                              <Badge variant="outline" className="text-xs">
                                {email.contact}
                              </Badge>
                            )}
                            {email.deal && (
                              <Badge variant="outline" className="text-xs bg-green-50">
                                {email.deal}
                              </Badge>
                            )}
                          </div>
                          <h4 className={`mt-1 ${!email.read ? 'font-semibold' : ''}`}>
                            {email.subject}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            {email.body}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-sm text-gray-500 whitespace-nowrap">
                            {new Date(email.date).toLocaleString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(email.id, 'inbox');
                            }}
                          >
                            <Star className={`h-4 w-4 ${email.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          <div className="space-y-2">
            {sent.map((email) => (
              <Card
                key={email.id}
                className="cursor-pointer transition-colors hover:bg-gray-50"
                onClick={() => setSelectedEmail(email)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback>ME</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span>To: {email.to}</span>
                            {email.contact && (
                              <Badge variant="outline" className="text-xs">
                                {email.contact}
                              </Badge>
                            )}
                          </div>
                          <h4 className="mt-1">{email.subject}</h4>
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            {email.body}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-sm text-gray-500 whitespace-nowrap">
                            {new Date(email.date).toLocaleString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(email.id, 'sent');
                            }}
                          >
                            <Star className={`h-4 w-4 ${email.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedEmail && (
        <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedEmail.subject}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>{getInitials(selectedEmail.from)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{selectedEmail.from}</span>
                    {selectedEmail.contact && (
                      <Badge variant="outline">{selectedEmail.contact}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">To: {selectedEmail.to}</p>
                  <p className="text-sm text-gray-500">{new Date(selectedEmail.date).toLocaleString()}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="whitespace-pre-wrap">{selectedEmail.body}</p>
              </div>
              <div className="flex gap-2">
                <Button>Reply</Button>
                <Button variant="outline">Forward</Button>
                <Button variant="outline">
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
