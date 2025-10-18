import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { FileText, Plus, Edit, Trash, Copy, Mail, FileCheck, MessageSquare } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: 'email' | 'proposal' | 'contract';
  subject?: string;
  content: string;
  usageCount: number;
}

const initialTemplates: Template[] = [
  {
    id: '1',
    name: 'Initial Outreach Email',
    category: 'email',
    subject: 'Quick question about [Company Name]',
    content: 'Hi [First Name],\n\nI noticed that [Company Name] is [specific observation]. I wanted to reach out because we help companies like yours [value proposition].\n\nWould you be open to a quick 15-minute call this week to discuss how we can help?\n\nBest regards,\n[Your Name]',
    usageCount: 45,
  },
  {
    id: '2',
    name: 'Follow-up After Demo',
    category: 'email',
    subject: 'Great connecting with you!',
    content: 'Hi [First Name],\n\nThank you for taking the time to meet with me today. I enjoyed learning more about [Company Name] and your goals for [specific goal].\n\nAs discussed, I\'m attaching our proposal which outlines how we can help you achieve [specific outcome].\n\nLet me know if you have any questions!\n\nBest,\n[Your Name]',
    usageCount: 38,
  },
  {
    id: '3',
    name: 'Service Proposal',
    category: 'proposal',
    content: '# Proposal for [Company Name]\n\n## Executive Summary\n[Brief overview of the proposal]\n\n## Scope of Work\n- Item 1\n- Item 2\n- Item 3\n\n## Timeline\n[Project timeline]\n\n## Investment\nTotal: $[Amount]\n\n## Next Steps\n[Next steps]',
    usageCount: 22,
  },
  {
    id: '4',
    name: 'Standard Service Agreement',
    category: 'contract',
    content: 'SERVICE AGREEMENT\n\nThis Agreement is entered into on [Date] between [Your Company] and [Client Company].\n\n1. SERVICES\n[Description of services]\n\n2. TERM\n[Duration of agreement]\n\n3. COMPENSATION\n[Payment terms]\n\n4. TERMINATION\n[Termination clauses]',
    usageCount: 15,
  },
  {
    id: '5',
    name: 'Meeting No-Show Follow-up',
    category: 'email',
    subject: 'Missed you at our meeting',
    content: 'Hi [First Name],\n\nI noticed we missed each other for our scheduled call today. No worries - I know things come up!\n\nWould you like to reschedule? I have availability:\n- [Time slot 1]\n- [Time slot 2]\n- [Time slot 3]\n\nLet me know what works best for you.\n\nBest,\n[Your Name]',
    usageCount: 12,
  },
];

export function Templates() {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [newTemplate, setNewTemplate] = useState({ name: '', category: 'email' as Template['category'], subject: '', content: '' });

  const createTemplate = () => {
    if (newTemplate.name && newTemplate.content) {
      const template: Template = {
        id: Date.now().toString(),
        name: newTemplate.name,
        category: newTemplate.category,
        subject: newTemplate.subject,
        content: newTemplate.content,
        usageCount: 0,
      };
      setTemplates([...templates, template]);
      setNewTemplate({ name: '', category: 'email', subject: '', content: '' });
      setIsCreateOpen(false);
    }
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'email': return Mail;
      case 'proposal': return FileText;
      case 'contract': return FileCheck;
      default: return MessageSquare;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'proposal': return 'bg-purple-100 text-purple-800';
      case 'contract': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h2 className="mb-2">Templates</h2>
          <p className="text-gray-600">Save time with pre-built email, proposal, and contract templates</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Template Name *</Label>
                <Input
                  placeholder="My Email Template"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Category *</Label>
                <div className="flex gap-2 mt-2">
                  {['email', 'proposal', 'contract'].map(cat => (
                    <Button
                      key={cat}
                      type="button"
                      variant={newTemplate.category === cat ? 'default' : 'outline'}
                      onClick={() => setNewTemplate({ ...newTemplate, category: cat as Template['category'] })}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              {newTemplate.category === 'email' && (
                <div>
                  <Label>Subject Line</Label>
                  <Input
                    placeholder="Email subject"
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                  />
                </div>
              )}
              <div>
                <Label>Content *</Label>
                <Textarea
                  placeholder="Template content... Use [First Name], [Company Name], etc. for variables"
                  className="min-h-[300px]"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Tip: Use brackets for variables like [First Name] or [Company Name]</p>
              </div>
              <Button onClick={createTemplate} className="w-full">Create Template</Button>
            </div>
          </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <h3>{templates.length}</h3>
                <p className="text-sm text-gray-600">Total Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Copy className="h-8 w-8 text-green-500" />
              <div>
                <h3>{templates.reduce((sum, t) => sum + t.usageCount, 0)}</h3>
                <p className="text-sm text-gray-600">Times Used</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-purple-500" />
              <div>
                <h3>{templates.filter(t => t.category === 'email').length}</h3>
                <p className="text-sm text-gray-600">Email Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="proposal">Proposals</TabsTrigger>
          <TabsTrigger value="contract">Contracts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {templates.map((template) => {
              const Icon = getCategoryIcon(template.category);
              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <div>
                          <h4>{template.name}</h4>
                          <Badge className={`mt-1 ${getCategoryColor(template.category)}`}>
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(template.content)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(template)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteTemplate(template.id)}>
                          <Trash className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    {template.subject && (
                      <p className="text-sm mb-2"><span className="font-medium">Subject:</span> {template.subject}</p>
                    )}
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">{template.content}</p>
                    <p className="text-xs text-gray-500">Used {template.usageCount} times</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {['email', 'proposal', 'contract'].map(category => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {templates.filter(t => t.category === category).map((template) => {
                const Icon = getCategoryIcon(template.category);
                return (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-gray-600" />
                          <h4>{template.name}</h4>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(template.content)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteTemplate(template.id)}>
                            <Trash className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                      {template.subject && (
                        <p className="text-sm mb-2"><span className="font-medium">Subject:</span> {template.subject}</p>
                      )}
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">{template.content}</p>
                      <p className="text-xs text-gray-500">Used {template.usageCount} times</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
