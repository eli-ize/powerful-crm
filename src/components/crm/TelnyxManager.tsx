import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Phone, 
  Plus, 
  Trash2, 
  Settings, 
  PhoneIncoming, 
  PhoneOutgoing,
  Bot,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Volume2,
  MessageSquare,
  Clock,
  TrendingUp,
  Sparkles
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface TelnyxNumber {
  id: string;
  phoneNumber: string;
  displayName: string;
  isActive: boolean;
  isPrimary: boolean;
  aiEnabled: boolean;
  aiInstructions: string;
  callHandling: 'ai' | 'human' | 'voicemail';
  forwardingNumber?: string;
  businessHours: {
    enabled: boolean;
    schedule: {
      monday: { start: string; end: string; };
      tuesday: { start: string; end: string; };
      wednesday: { start: string; end: string; };
      thursday: { start: string; end: string; };
      friday: { start: string; end: string; };
      saturday: { start: string; end: string; };
      sunday: { start: string; end: string; };
    };
  };
  voicemailGreeting?: string;
  stats: {
    inbound: number;
    outbound: number;
    answered: number;
    missed: number;
  };
}

interface TelnyxConfig {
  apiKey: string;
  publicKey: string;
  connectionId?: string;
}

export function TelnyxManager() {
  const [config, setConfig] = useState<TelnyxConfig>({
    apiKey: '',
    publicKey: '',
    connectionId: '',
  });
  const [numbers, setNumbers] = useState<TelnyxNumber[]>([]);
  const [showAddNumber, setShowAddNumber] = useState(false);
  const [showEditNumber, setShowEditNumber] = useState(false);
  const [editingNumber, setEditingNumber] = useState<TelnyxNumber | null>(null);
  const [newNumber, setNewNumber] = useState({
    phoneNumber: '',
    displayName: '',
  });
  const [isConfigSaved, setIsConfigSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('numbers');

  // Load config and numbers from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('telnyx_config');
    const savedNumbers = localStorage.getItem('telnyx_numbers');
    
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
      setIsConfigSaved(true);
    }
    
    if (savedNumbers) {
      setNumbers(JSON.parse(savedNumbers));
    }
  }, []);

  const saveConfig = async () => {
    if (!config.apiKey) {
      toast.error('API Key is required');
      return;
    }

    try {
      // Save to backend
      const response = await fetch('http://localhost:8000/api/telnyx/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        localStorage.setItem('telnyx_config', JSON.stringify(config));
        setIsConfigSaved(true);
        toast.success('Telnyx configuration saved successfully');
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      toast.error('Failed to save configuration', {
        description: 'Make sure backend is running',
      });
    }
  };

  const addNumber = () => {
    if (!newNumber.phoneNumber) {
      toast.error('Phone number is required');
      return;
    }

    const telnyxNumber: TelnyxNumber = {
      id: Date.now().toString(),
      phoneNumber: newNumber.phoneNumber,
      displayName: newNumber.displayName || newNumber.phoneNumber,
      isActive: true,
      isPrimary: numbers.length === 0,
      aiEnabled: true,
      aiInstructions: 'You are a professional AI receptionist for our company. Greet callers warmly, understand their needs, and route them appropriately. For sales inquiries, gather contact information. For support requests, create tickets. Always be helpful and professional.',
      callHandling: 'ai',
      businessHours: {
        enabled: true,
        schedule: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: { start: '10:00', end: '14:00' },
          sunday: { start: '00:00', end: '00:00' },
        },
      },
      voicemailGreeting: 'Thank you for calling. Please leave a message and we will get back to you soon.',
      stats: {
        inbound: 0,
        outbound: 0,
        answered: 0,
        missed: 0,
      },
    };

    const updatedNumbers = [...numbers, telnyxNumber];
    setNumbers(updatedNumbers);
    localStorage.setItem('telnyx_numbers', JSON.stringify(updatedNumbers));
    
    setNewNumber({ phoneNumber: '', displayName: '' });
    setShowAddNumber(false);
    toast.success('Phone number added successfully');
  };

  const updateNumber = (id: string, updates: Partial<TelnyxNumber>) => {
    const updatedNumbers = numbers.map(num => 
      num.id === id ? { ...num, ...updates } : num
    );
    setNumbers(updatedNumbers);
    localStorage.setItem('telnyx_numbers', JSON.stringify(updatedNumbers));
    toast.success('Number updated successfully');
  };

  const deleteNumber = (id: string) => {
    const updatedNumbers = numbers.filter(num => num.id !== id);
    setNumbers(updatedNumbers);
    localStorage.setItem('telnyx_numbers', JSON.stringify(updatedNumbers));
    toast.success('Number deleted successfully');
  };

  const setPrimaryNumber = (id: string) => {
    const updatedNumbers = numbers.map(num => ({
      ...num,
      isPrimary: num.id === id,
    }));
    setNumbers(updatedNumbers);
    localStorage.setItem('telnyx_numbers', JSON.stringify(updatedNumbers));
    toast.success('Primary number updated');
  };

  const openEditDialog = (number: TelnyxNumber) => {
    setEditingNumber(number);
    setShowEditNumber(true);
  };

  const saveEditedNumber = () => {
    if (editingNumber) {
      updateNumber(editingNumber.id, editingNumber);
      setShowEditNumber(false);
      setEditingNumber(null);
    }
  };

  const checkTelnyxStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/telnyx/sip-credentials', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Found ${data.count} SIP connections`, {
          description: `Active: ${data.data.filter((c: any) => c.status === 'active').length}`,
        });
      }
    } catch (error) {
      toast.error('Failed to check Telnyx status');
    }
  };

  const primaryNumber = numbers.find(n => n.isPrimary);
  const activeNumbers = numbers.filter(n => n.isActive);

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="page-header-responsive">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">📞 Telnyx PBX Manager</h2>
          <p className="text-sm text-gray-600">Manage phone numbers, AI call handling, and inbound routing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={checkTelnyxStatus}
            disabled={!isConfigSaved}
          >
            <Settings className="mr-2 h-4 w-4" />
            Check Status
          </Button>
          <Badge variant={isConfigSaved ? "default" : "outline"} className={isConfigSaved ? "bg-green-600" : ""}>
            {isConfigSaved ? (
              <>
                <CheckCircle className="mr-1 h-3 w-3" />
                Connected
              </>
            ) : (
              <>
                <AlertCircle className="mr-1 h-3 w-3" />
                Not Configured
              </>
            )}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="numbers">Phone Numbers</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        {/* Phone Numbers Tab */}
        <TabsContent value="numbers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Phone Numbers ({numbers.length})</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      try {
                        const response = await fetch('http://localhost:8000/api/telnyx/numbers/fetch', {
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                          },
                        });
                        const data = await response.json();
                        if (data.success && data.data) {
                          const fetchedNumbers = data.data.map((num: any) => ({
                            id: num.id,
                            phoneNumber: num.phoneNumber,
                            displayName: num.displayName || num.phoneNumber,
                            isActive: num.status === 'active',
                            isPrimary: numbers.length === 0,
                            aiEnabled: true,
                            aiInstructions: 'You are a professional AI receptionist for our company. Greet callers warmly, understand their needs, and route them appropriately.',
                            callHandling: 'ai' as const,
                            businessHours: {
                              enabled: true,
                              schedule: {
                                monday: { start: '09:00', end: '17:00' },
                                tuesday: { start: '09:00', end: '17:00' },
                                wednesday: { start: '09:00', end: '17:00' },
                                thursday: { start: '09:00', end: '17:00' },
                                friday: { start: '09:00', end: '17:00' },
                                saturday: { start: '10:00', end: '14:00' },
                                sunday: { start: '00:00', end: '00:00' },
                              },
                            },
                            voicemailGreeting: 'Thank you for calling. Please leave a message and we will get back to you soon.',
                            stats: { inbound: 0, outbound: 0, answered: 0, missed: 0 },
                          }));
                          setNumbers(fetchedNumbers);
                          localStorage.setItem('telnyx_numbers', JSON.stringify(fetchedNumbers));
                          toast.success(`Imported ${fetchedNumbers.length} numbers from Telnyx`);
                        }
                      } catch (error) {
                        toast.error('Failed to fetch numbers from Telnyx');
                      }
                    }}
                    disabled={!isConfigSaved}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Import from Telnyx
                  </Button>
                  <Button onClick={() => setShowAddNumber(true)} disabled={!isConfigSaved}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Manually
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!isConfigSaved && (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>Please configure your Telnyx API keys first</p>
                  <Button variant="outline" className="mt-4" onClick={() => setActiveTab('config')}>
                    Go to Configuration
                  </Button>
                </div>
              )}

              {isConfigSaved && numbers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Phone className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No phone numbers added yet</p>
                  <Button className="mt-4" onClick={() => setShowAddNumber(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Number
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                {numbers.map((number) => (
                  <Card key={number.id} className={number.isPrimary ? 'border-blue-500 border-2' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg">{number.phoneNumber}</h4>
                            {number.isPrimary && (
                              <Badge className="bg-blue-600">Primary</Badge>
                            )}
                            {number.aiEnabled && (
                              <Badge className="bg-purple-600">
                                <Bot className="mr-1 h-3 w-3" />
                                AI Enabled
                              </Badge>
                            )}
                            {!number.isActive && (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{number.displayName}</p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Call Handling</p>
                              <p className="font-medium capitalize">{number.callHandling}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Inbound</p>
                              <p className="font-medium text-green-600">{number.stats.inbound}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Outbound</p>
                              <p className="font-medium text-blue-600">{number.stats.outbound}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Answered</p>
                              <p className="font-medium">{number.stats.answered}/{number.stats.inbound}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(number)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!number.isPrimary && (
                            <Button variant="outline" size="sm" onClick={() => setPrimaryNumber(number.id)}>
                              Set Primary
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => deleteNumber(number.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          {/* ONE-CLICK SETUP CARD */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Sparkles className="h-5 w-5" />
                🚀 One-Click Telnyx Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-green-800">
                Automatically creates Call Control Application, assigns outbound profile, and imports phone numbers. Just enter your API key!
              </p>
              
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="KEY01..."
                  className="flex-1"
                />
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={async () => {
                    if (!config.apiKey) {
                      toast.error('Please enter your Telnyx API Key');
                      return;
                    }

                    const loadingToast = toast.loading('Setting up Telnyx...', {
                      description: 'Creating Call Control Application...',
                    });

                    try {
                      const response = await fetch('http://localhost:8000/api/telnyx/auto-setup', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                        },
                        body: JSON.stringify({ apiKey: config.apiKey }),
                      });

                      const data = await response.json();

                      if (data.success) {
                        toast.dismiss(loadingToast);
                        
                        // Update config with new connection ID
                        const updatedConfig = {
                          ...config,
                          connectionId: data.data.connectionId,
                        };
                        setConfig(updatedConfig);
                        localStorage.setItem('telnyx_config', JSON.stringify(updatedConfig));
                        setIsConfigSaved(true);

                        // Import phone numbers
                        if (data.data.phoneNumbers && data.data.phoneNumbers.length > 0) {
                          const importedNumbers = data.data.phoneNumbers.map((num: any, idx: number) => ({
                            id: Date.now().toString() + idx,
                            phoneNumber: num.phoneNumber,
                            displayName: num.phoneNumber,
                            isActive: num.status === 'active',
                            isPrimary: idx === 0,
                            aiEnabled: true,
                            aiInstructions: 'You are a professional AI receptionist for our company. Greet callers warmly, understand their needs, and route them appropriately.',
                            callHandling: 'ai' as const,
                            businessHours: {
                              enabled: true,
                              schedule: {
                                monday: { start: '09:00', end: '17:00' },
                                tuesday: { start: '09:00', end: '17:00' },
                                wednesday: { start: '09:00', end: '17:00' },
                                thursday: { start: '09:00', end: '17:00' },
                                friday: { start: '09:00', end: '17:00' },
                                saturday: { start: '10:00', end: '14:00' },
                                sunday: { start: '00:00', end: '00:00' },
                              },
                            },
                            voicemailGreeting: 'Thank you for calling. Please leave a message.',
                            stats: { inbound: 0, outbound: 0, answered: 0, missed: 0 },
                          }));
                          setNumbers(importedNumbers);
                          localStorage.setItem('telnyx_numbers', JSON.stringify(importedNumbers));
                        }

                        toast.success('🎉 Telnyx Setup Complete!', {
                          description: `✓ Call Control App created\n✓ Outbound profile assigned\n✓ ${data.data.phoneNumbersCount} phone numbers imported\n✓ Connection ID: ${data.data.connectionId.substring(0, 15)}...`,
                          duration: 8000,
                        });

                        // Switch to numbers tab to show imported numbers
                        setTimeout(() => setActiveTab('numbers'), 2000);
                      } else {
                        toast.dismiss(loadingToast);
                        toast.error('Setup failed', {
                          description: data.error || 'Please check your API key',
                        });
                      }
                    } catch (error) {
                      toast.dismiss(loadingToast);
                      toast.error('Setup failed', {
                        description: 'Please check your API key and try again',
                      });
                    }
                  }}
                  disabled={!config.apiKey}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Auto Setup Everything
                </Button>
              </div>

              <div className="text-xs text-green-700 space-y-1">
                <p className="font-semibold">This will automatically:</p>
                <ul className="ml-4 space-y-1 list-disc">
                  <li>Create "Powerful CRM Call Control" application</li>
                  <li>Assign outbound voice profile for calling</li>
                  <li>Import all your phone numbers</li>
                  <li>Configure webhooks for call events</li>
                  <li>Save connection ID for immediate use</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manual Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Important Notice */}
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-orange-900 mb-1">Connection ID Required for Calls</h4>
                    <p className="text-sm text-orange-800 mb-2">
                      To make outbound calls, you MUST provide a Connection ID from Telnyx.
                    </p>
                    <ol className="text-sm text-orange-800 space-y-1 ml-4 list-decimal">
                      <li>Log into <a href="https://portal.telnyx.com/#/app/call-control/applications" target="_blank" rel="noopener noreferrer" className="underline font-medium">Telnyx Portal → Call Control Apps</a></li>
                      <li>Create or select an existing application</li>
                      <li>Copy the <strong>Connection ID</strong> (starts with a number)</li>
                      <li>Paste it in the field below</li>
                      <li>Make sure your phone numbers are assigned to this application</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div>
                <Label>API Key *</Label>
                <Input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="KEY01..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from <a href="https://portal.telnyx.com/#/app/auth/v2" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Telnyx Portal → Auth V2</a>
                </p>
              </div>

              <div>
                <Label>Connection ID * (Required for Outbound Calls)</Label>
                <div className="flex gap-2">
                  <Input
                    value={config.connectionId}
                    onChange={(e) => setConfig({ ...config, connectionId: e.target.value })}
                    placeholder="e.g., 1234567890123456789"
                    className={!config.connectionId ? 'border-orange-300' : ''}
                  />
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (!config.apiKey) {
                        toast.error('Please enter API Key first');
                        return;
                      }
                      try {
                        const response = await fetch('http://localhost:8000/api/telnyx/sip-credentials', {
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
                        });
                        const data = await response.json();
                        if (data.success && data.data.length > 0) {
                          const activeConn = data.data.find((c: any) => c.status === 'active');
                          if (activeConn) {
                            setConfig({ ...config, connectionId: activeConn.connectionId });
                            toast.success('Connection ID auto-filled', {
                              description: `Using: ${activeConn.name}`,
                            });
                          } else {
                            toast.error('No active connections found');
                          }
                        }
                      } catch (error) {
                        toast.error('Failed to fetch connection ID');
                      }
                    }}
                  >
                    Auto-Detect
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Find in <a href="https://portal.telnyx.com/#/app/call-control/applications" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Call Control Applications</a> or click Auto-Detect
                </p>
              </div>

              <div>
                <Label>Public Key (Optional)</Label>
                <Input
                  type="password"
                  value={config.publicKey}
                  onChange={(e) => setConfig({ ...config, publicKey: e.target.value })}
                  placeholder="PUBLIC01... (for webhook verification)"
                />
              </div>

              <Button onClick={saveConfig} className="w-full bg-green-600 hover:bg-green-700">
                <Save className="mr-2 h-4 w-4" />
                Save Configuration
              </Button>
            </CardContent>
          </Card>

          {/* Test Configuration Card */}
          {isConfigSaved && (
            <Card>
              <CardHeader>
                <CardTitle>Test Your Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const response = await fetch('http://localhost:8000/api/telnyx/numbers/fetch', {
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
                        });
                        const data = await response.json();
                        if (data.success) {
                          toast.success(`✓ Found ${data.count} phone numbers`, {
                            description: data.data.map((n: any) => n.phoneNumber).join(', '),
                          });
                        }
                      } catch (error) {
                        toast.error('Failed to fetch numbers');
                      }
                    }}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Test API Connection
                  </Button>

                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const response = await fetch('http://localhost:8000/api/telnyx/sip-credentials', {
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
                        });
                        const data = await response.json();
                        if (data.success) {
                          const active = data.data.filter((c: any) => c.status === 'active');
                          toast.success(`✓ Found ${data.count} SIP connections`, {
                            description: `${active.length} active, ${data.count - active.length} inactive`,
                          });
                        }
                      } catch (error) {
                        toast.error('Failed to check SIP connections');
                      }
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Check SIP Status
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 mb-2">Quick Setup Checklist:</h5>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${config.apiKey ? 'text-green-600' : 'text-gray-400'}`} />
                      <span>API Key configured</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${config.connectionId ? 'text-green-600' : 'text-gray-400'}`} />
                      <span>Connection ID set</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${numbers.length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                      <span>Phone numbers added ({numbers.length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${activeNumbers.length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                      <span>Active numbers configured ({activeNumbers.length})</span>
                    </div>
                  </div>
                  {config.apiKey && config.connectionId && numbers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <p className="text-sm font-semibold text-green-700">✓ Ready to make calls!</p>
                      <p className="text-xs text-blue-700 mt-1">Go to Phone & SMS to test calling</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>WebRTC Real-Time Calling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Enable browser-based calling to receive calls directly in the app (no phone needed)
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-2">Setup Instructions:</h5>
                <ol className="text-sm text-blue-800 space-y-2">
                  <li>1. Create a TeXML application in Telnyx Portal</li>
                  <li>2. Generate a Connection ID for WebRTC</li>
                  <li>3. Add the Connection ID above</li>
                  <li>4. Assign your phone numbers to the TeXML application</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Settings Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Call Handling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Bot className="h-6 w-6 text-purple-600 mt-1" />
                  <div>
                    <h5 className="font-medium text-purple-900 mb-1">AI-Powered Receptionist</h5>
                    <p className="text-sm text-purple-800">
                      Your AI receptionist can answer calls 24/7, understand caller intent, gather information, 
                      create leads, schedule appointments, and route calls to the right team member - all without human intervention.
                    </p>
                  </div>
                </div>
              </div>

              {numbers.map((number) => (
                <Card key={number.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{number.phoneNumber}</CardTitle>
                        <p className="text-sm text-gray-600">{number.displayName}</p>
                      </div>
                      <Switch
                        checked={number.aiEnabled}
                        onCheckedChange={(checked) => updateNumber(number.id, { aiEnabled: checked })}
                      />
                    </div>
                  </CardHeader>
                  {number.aiEnabled && (
                    <CardContent className="space-y-4">
                      <div>
                        <Label>AI Instructions</Label>
                        <Textarea
                          value={number.aiInstructions}
                          onChange={(e) => updateNumber(number.id, { aiInstructions: e.target.value })}
                          rows={4}
                          placeholder="Describe how the AI should handle calls..."
                        />
                      </div>

                      <div>
                        <Label>Call Handling Mode</Label>
                        <Select 
                          value={number.callHandling} 
                          onValueChange={(value: 'ai' | 'human' | 'voicemail') => 
                            updateNumber(number.id, { callHandling: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ai">
                              <div className="flex items-center gap-2">
                                <Bot className="h-4 w-4" />
                                AI Handles Everything
                              </div>
                            </SelectItem>
                            <SelectItem value="human">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Transfer to Human
                              </div>
                            </SelectItem>
                            <SelectItem value="voicemail">
                              <div className="flex items-center gap-2">
                                <Volume2 className="h-4 w-4" />
                                Voicemail Only
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {number.callHandling === 'human' && (
                        <div>
                          <Label>Forward to Number</Label>
                          <Input
                            value={number.forwardingNumber || ''}
                            onChange={(e) => updateNumber(number.id, { forwardingNumber: e.target.value })}
                            placeholder="+27..."
                          />
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Numbers</p>
                    <p className="text-3xl font-bold text-gray-900">{numbers.length}</p>
                  </div>
                  <Phone className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Inbound Calls</p>
                    <p className="text-3xl font-bold text-green-600">
                      {numbers.reduce((sum, n) => sum + n.stats.inbound, 0)}
                    </p>
                  </div>
                  <PhoneIncoming className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Outbound Calls</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {numbers.reduce((sum, n) => sum + n.stats.outbound, 0)}
                    </p>
                  </div>
                  <PhoneOutgoing className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">AI Enabled</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {numbers.filter(n => n.aiEnabled).length}
                    </p>
                  </div>
                  <Bot className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Call Performance by Number</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {numbers.map((number) => (
                  <div key={number.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{number.phoneNumber}</h4>
                      <Badge>{number.callHandling}</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Inbound</p>
                        <p className="text-xl font-bold text-green-600">{number.stats.inbound}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Answered</p>
                        <p className="text-xl font-bold">{number.stats.answered}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Missed</p>
                        <p className="text-xl font-bold text-red-600">{number.stats.missed}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Answer Rate</p>
                        <p className="text-xl font-bold">
                          {number.stats.inbound > 0 
                            ? Math.round((number.stats.answered / number.stats.inbound) * 100) 
                            : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Number Dialog */}
      <Dialog open={showAddNumber} onOpenChange={setShowAddNumber}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Phone Number</DialogTitle>
            <DialogDescription>
              Add a Telnyx phone number to your PBX system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Phone Number *</Label>
              <Input
                value={newNumber.phoneNumber}
                onChange={(e) => setNewNumber({ ...newNumber, phoneNumber: e.target.value })}
                placeholder="+27123456789"
              />
            </div>
            <div>
              <Label>Display Name</Label>
              <Input
                value={newNumber.displayName}
                onChange={(e) => setNewNumber({ ...newNumber, displayName: e.target.value })}
                placeholder="Sales Line, Support Line, etc."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddNumber(false)}>
                Cancel
              </Button>
              <Button onClick={addNumber}>
                <Plus className="mr-2 h-4 w-4" />
                Add Number
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Number Dialog */}
      <Dialog open={showEditNumber} onOpenChange={setShowEditNumber}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Phone Number</DialogTitle>
          </DialogHeader>
          {editingNumber && (
            <div className="space-y-4 mt-4">
              <div>
                <Label>Display Name</Label>
                <Input
                  value={editingNumber.displayName}
                  onChange={(e) => setEditingNumber({ ...editingNumber, displayName: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={editingNumber.isActive}
                  onCheckedChange={(checked) => setEditingNumber({ ...editingNumber, isActive: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>AI Enabled</Label>
                <Switch
                  checked={editingNumber.aiEnabled}
                  onCheckedChange={(checked) => setEditingNumber({ ...editingNumber, aiEnabled: checked })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEditNumber(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={saveEditedNumber}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
