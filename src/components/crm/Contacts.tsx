import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Plus, Mail, Phone, Building, MoreVertical, Edit, Trash, Filter, Download, Upload, Star, List, Grid } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { ContactDetail } from './ContactDetail';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'lead' | 'customer' | 'partner';
  value: string;
}

const initialContacts: Contact[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.j@techcorp.com', phone: '+1 555-0123', company: 'TechCorp', status: 'customer', value: '$45,000' },
  { id: '2', name: 'Michael Chen', email: 'mchen@innovate.io', phone: '+1 555-0124', company: 'Innovate Inc', status: 'lead', value: '$12,000' },
  { id: '3', name: 'Emily Davis', email: 'emily@startup.com', phone: '+1 555-0125', company: 'Startup Co', status: 'customer', value: '$78,000' },
  { id: '4', name: 'James Wilson', email: 'jwilson@global.net', phone: '+1 555-0126', company: 'Global Solutions', status: 'partner', value: '$125,000' },
  { id: '5', name: 'Amanda Rodriguez', email: 'arodriguez@design.co', phone: '+1 555-0127', company: 'Design Studio', status: 'lead', value: '$8,500' },
  { id: '6', name: 'David Kim', email: 'dkim@enterprise.com', phone: '+1 555-0128', company: 'Enterprise LLC', status: 'customer', value: '$95,000' },
];

export function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState<Partial<Contact>>({});
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  let filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || contact.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Sort contacts
  filteredContacts = [...filteredContacts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'company':
        return a.company.localeCompare(b.company);
      case 'value':
        return parseFloat(b.value.replace(/[$,]/g, '')) - parseFloat(a.value.replace(/[$,]/g, ''));
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'customer': return 'bg-green-100 text-green-800';
      case 'lead': return 'bg-blue-100 text-blue-800';
      case 'partner': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.email) {
      const contact: Contact = {
        id: Date.now().toString(),
        name: newContact.name,
        email: newContact.email,
        phone: newContact.phone || '',
        company: newContact.company || '',
        status: (newContact.status as Contact['status']) || 'lead',
        value: newContact.value || '$0',
      };
      setContacts([...contacts, contact]);
      setNewContact({});
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  return (
    <div className="page-container">
      {selectedContact ? (
        <ContactDetail contact={selectedContact} onBack={() => setSelectedContact(null)} />
      ) : (
        <>
          <div className="page-header-responsive">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">Contacts</h2>
              <p className="text-sm text-gray-500">Manage your customer relationships</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="btn-responsive hidden sm:flex">
                <Upload className="h-4 w-4" />
                <span className="hidden md:inline">Import</span>
              </Button>
              <Button variant="outline" size="sm" className="btn-responsive hidden sm:flex">
                <Download className="h-4 w-4" />
                <span className="hidden md:inline">Export</span>
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-responsive">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Contact</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="dialog-responsive">
                  <DialogHeader>
                    <DialogTitle>Add New Contact</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="form-group">
                      <Label>Name *</Label>
                      <Input
                        placeholder="John Doe"
                        value={newContact.name || ''}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        placeholder="john@company.com"
                        value={newContact.email || ''}
                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      />
                    </div>
                    <div className="grid-2-col-responsive">
                      <div className="form-group">
                        <Label>Phone</Label>
                        <Input
                          placeholder="+1 555-0123"
                          value={newContact.phone || ''}
                          onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <Label>Company</Label>
                        <Input
                          placeholder="Company Inc"
                          value={newContact.company || ''}
                          onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid-2-col-responsive">
                      <div className="form-group">
                        <Label>Status</Label>
                        <Select value={newContact.status} onValueChange={(value) => setNewContact({ ...newContact, status: value as Contact['status'] })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="partner">Partner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="form-group">
                        <Label>Deal Value</Label>
                        <Input
                          placeholder="$0"
                          value={newContact.value || ''}
                          onChange={(e) => setNewContact({ ...newContact, value: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleAddContact} className="btn-responsive flex-1">Add Contact</Button>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="btn-responsive flex-1">Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6 card-responsive">
            <CardContent className="card-content-responsive">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search contacts..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="space-y-4">
                      <div>
                        <Label>Status</Label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="partner">Partner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Sort By</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                            <SelectItem value="value">Deal Value</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContacts.map((contact) => (
            <Card key={contact.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedContact(contact)}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between mb-4 gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="flex-shrink-0">
                      <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h4 className="mb-1 truncate">{contact.name}</h4>
                      <Badge className={getStatusColor(contact.status)}>
                        {contact.status}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteContact(contact.id)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600 min-w-0">
                    <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 min-w-0">
                    <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{contact.phone}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 min-w-0">
                    <Building className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{contact.company}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Deal Value</span>
                    <span className="text-green-600">{contact.value}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar>
                        <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h4 className="font-medium truncate">{contact.name}</h4>
                        <p className="text-sm text-gray-500 truncate">{contact.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(contact.status)}>
                        {contact.status}
                      </Badge>
                      <span className="text-sm font-medium">{contact.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
        </>
      )}
    </div>
  );
}
