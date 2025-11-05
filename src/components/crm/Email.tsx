import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Mail, Send, Inbox, Clock, Star, Archive, Plus, Paperclip, Eye, Loader2, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { toast } from 'sonner';
import { api } from '../../utils/api';

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

interface Contact {
  id?: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
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
  const [newEmail, setNewEmail] = useState({ to: '', subject: '', body: '', contact: '', isHtml: true });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [emailType, setEmailType] = useState<'individual' | 'bulk' | 'template'>('individual');
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [bulkEmail, setBulkEmail] = useState({ subject: '', content: '', contacts: [] as Contact[] });

  // Load contacts on component mount
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await api.request('/api/contacts');
      if (response.data) {
        const mappedContacts = response.data.map((contact: any) => ({
          id: contact.id,
          name: `${contact.firstName} ${contact.lastName}`.trim(),
          email: contact.email || `${contact.firstName?.toLowerCase()}.${contact.lastName?.toLowerCase()}@example.com`,
          company: contact.company,
          phone: contact.phone,
        }));
        setContacts(mappedContacts);
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const emailTemplates = [
    { value: 'welcome', label: 'Welcome Email', content: 'Welcome to our platform! We\'re excited to have you on board.' },
    { value: 'followup', label: 'Follow-up Email', content: 'Thank you for your interest. We wanted to follow up on our previous conversation.' },
    { value: 'newsletter', label: 'Newsletter Template', content: 'Here are the latest updates and news from our team.' },
    { value: 'reminder', label: 'Meeting Reminder', content: 'This is a friendly reminder about our upcoming meeting.' },
  ];

  const handleSendEmail = async () => {
    if (!newEmail.to || !newEmail.subject || !newEmail.body) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSending(true);
    try {
      const response = await api.request('/api/emails/send', {
        method: 'POST',
        body: JSON.stringify({
          to: newEmail.to,
          subject: newEmail.subject,
          content: newEmail.body,
          isHtml: newEmail.isHtml,
        }),
      });

      if (response.success) {
        toast.success('✅ Email sent successfully!');
        
        // Add to sent emails
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
        
        setNewEmail({ to: '', subject: '', body: '', contact: '', isHtml: true });
        setIsComposeOpen(false);
      } else {
        throw new Error(response.error || 'Failed to send email');
      }
    } catch (error) {
      toast.error('Failed to send email', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendBulkEmail = async () => {
    if (!bulkEmail.subject || !bulkEmail.content || bulkEmail.contacts.length === 0) {
      toast.error('Please fill in all required fields and select contacts');
      return;
    }

    setIsSending(true);
    try {
      const response = await api.request('/api/emails/bulk', {
        method: 'POST',
        body: JSON.stringify({
          contacts: bulkEmail.contacts,
          subject: bulkEmail.subject,
          content: bulkEmail.content,
        }),
      });

      if (response.success) {
        toast.success(`🎉 Bulk email campaign completed!`, {
          description: `Sent to ${response.data.sent} contacts, ${response.data.failed} failed`,
        });
        setBulkEmail({ subject: '', content: '', contacts: [] });
        setIsComposeOpen(false);
      } else {
        throw new Error(response.error || 'Failed to send bulk email');
      }
    } catch (error) {
      toast.error('Failed to send bulk email', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendWelcomeEmail = async (contact: Contact) => {
    setIsSending(true);
    try {
      const response = await api.request('/api/emails/welcome', {
        method: 'POST',
        body: JSON.stringify({
          name: contact.name,
          email: contact.email,
          company: contact.company,
          phone: contact.phone,
        }),
      });

      if (response.success) {
        toast.success(`✅ Welcome email sent to ${contact.name}!`);
      } else {
        throw new Error(response.error || 'Failed to send welcome email');
      }
    } catch (error) {
      toast.error('Failed to send welcome email', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSending(false);
    }
  };

  const loadTemplate = (templateValue: string) => {
    const template = emailTemplates.find(t => t.value === templateValue);
    if (template) {
      if (emailType === 'individual') {
        setNewEmail(prev => ({
          ...prev,
          subject: template.label,
          body: template.content,
        }));
      } else if (emailType === 'bulk') {
        setBulkEmail(prev => ({
          ...prev,
          subject: template.label,
          content: template.content,
        }));
      }
    }
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
          <DialogContent className="dialog-responsive max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Compose Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {/* Email Type Selection */}
              <div className="form-group">
                <Label>Email Type</Label>
                <Select value={emailType} onValueChange={setEmailType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Email</SelectItem>
                    <SelectItem value="bulk">Bulk Email Campaign</SelectItem>
                    <SelectItem value="template">Use Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Template Selection */}
              {emailType === 'template' && (
                <div className="form-group">
                  <Label>Select Template</Label>
                  <Select onValueChange={loadTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTemplates.map(template => (
                        <SelectItem key={template.value} value={template.value}>
                          {template.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Bulk Email Warning */}
              {emailType === 'bulk' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Users className="h-4 w-4 inline mr-1" />
                    {selectedContacts.length} contacts will receive this email
                  </p>
                </div>
              )}

              {/* Individual Email Form */}
              {(emailType === 'individual' || emailType === 'template') && (
                <>
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
                    <Select value={newEmail.contact} onValueChange={(value: string) => setNewEmail({ ...newEmail, contact: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact" />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts.map(contact => (
                          <SelectItem key={contact.id || contact.email} value={contact.name}>
                            {contact.name} ({contact.email})
                          </SelectItem>
                        ))}
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
                </>
              )}

              {/* Bulk Email Form */}
              {emailType === 'bulk' && (
                <>
                  <div className="form-group">
                    <Label>Select Contacts *</Label>
                    <div className="max-h-32 overflow-y-auto border rounded p-2">
                      {contacts.map(contact => (
                        <label key={contact.id || contact.email} className="flex items-center gap-2 p-1">
                          <input
                            type="checkbox"
                            checked={selectedContacts.some(c => c.email === contact.email)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedContacts(prev => [...prev, contact]);
                                setBulkEmail(prev => ({ ...prev, contacts: [...prev.contacts, contact] }));
                              } else {
                                setSelectedContacts(prev => prev.filter(c => c.email !== contact.email));
                                setBulkEmail(prev => ({ ...prev, contacts: prev.contacts.filter(c => c.email !== contact.email) }));
                              }
                            }}
                          />
                          <span className="text-sm">{contact.name} ({contact.email})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <Label>Subject *</Label>
                    <Input
                      placeholder="Campaign subject"
                      value={bulkEmail.subject}
                      onChange={(e) => setBulkEmail(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <Label>Message *</Label>
                    <Textarea
                      placeholder="Your campaign content... (Use {{name}} and {{company}} for personalization)"
                      className="min-h-[200px]"
                      value={bulkEmail.content}
                      onChange={(e) => setBulkEmail(prev => ({ ...prev, content: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tip: Use {"{{name}}"} and {"{{company}}"} for personalization
                    </p>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {emailType === 'bulk' ? (
                  <Button 
                    onClick={sendBulkEmail} 
                    disabled={isSending || selectedContacts.length === 0}
                    className="flex-1 btn-responsive"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Campaign...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send to {selectedContacts.length} Contacts
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSendEmail} 
                    disabled={isSending}
                    className="flex-1 btn-responsive"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Email
                      </>
                    )}
                  </Button>
                )}
                <Button variant="outline" className="btn-responsive">
                  <Paperclip className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Attach</span>
                </Button>
              </div>

              {/* Quick Welcome Emails for Selected Contacts */}
              {selectedContacts.length > 0 && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium">Quick Actions</Label>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {selectedContacts.slice(0, 3).map(contact => (
                      <Button
                        key={contact.email}
                        variant="outline"
                        size="sm"
                        onClick={() => sendWelcomeEmail(contact)}
                        disabled={isSending}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Welcome {contact.name.split(' ')[0]}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
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
                            onClick={(e: React.MouseEvent) => {
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
                            onClick={(e: React.MouseEvent) => {
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
