import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  Phone as PhoneIcon, 
  PhoneCall, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed,
  MessageSquare, 
  Mic, 
  MicOff, 
  Pause, 
  Play,
  X,
  Search,
  Clock,
  User,
  Mail,
  AlertCircle,
  Settings,
  Video,
  Voicemail,
  History,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { TelnyxQuickAdd } from './TelnyxQuickAdd';
import { ApiKeyManager } from '../../services/apiKeyManager';

interface CallLog {
  id: string;
  contact: string;
  phone: string;
  type: 'incoming' | 'outgoing' | 'missed';
  duration: string;
  timestamp: Date;
  recording?: string;
  status: 'completed' | 'missed' | 'failed';
}

interface SMSMessage {
  id: string;
  contact: string;
  phone: string;
  message: string;
  timestamp: Date;
  direction: 'sent' | 'received';
  status: 'delivered' | 'pending' | 'failed';
}

interface PhoneProps {
  onNavigate?: (view: string) => void;
}

export function Phone({ onNavigate }: PhoneProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState('00:00');
  const [currentCall, setCurrentCall] = useState<string>('');
  const [smsNumber, setSmsNumber] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'testing' | 'connected' | 'failed'>('unknown');

  const [callLogs] = useState<CallLog[]>([
    {
      id: '1',
      contact: 'Sarah Johnson',
      phone: '+1 555-0123',
      type: 'outgoing',
      duration: '5:32',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: 'completed',
      recording: 'recording_001.mp3',
    },
    {
      id: '2',
      contact: 'Michael Chen',
      phone: '+1 555-0456',
      type: 'incoming',
      duration: '12:45',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      status: 'completed',
      recording: 'recording_002.mp3',
    },
    {
      id: '3',
      contact: 'Emma Davis',
      phone: '+1 555-0789',
      type: 'missed',
      duration: '0:00',
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      status: 'missed',
    },
    {
      id: '4',
      contact: 'John Smith',
      phone: '+1 555-0321',
      type: 'outgoing',
      duration: '3:15',
      timestamp: new Date(Date.now() - 1000 * 60 * 240),
      status: 'completed',
    },
  ]);

  const [smsMessages] = useState<SMSMessage[]>([
    {
      id: '1',
      contact: 'Sarah Johnson',
      phone: '+1 555-0123',
      message: 'Thanks for the call! I\'ll send over the proposal by EOD.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      direction: 'received',
      status: 'delivered',
    },
    {
      id: '2',
      contact: 'Sarah Johnson',
      phone: '+1 555-0123',
      message: 'Perfect! Looking forward to reviewing it.',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      direction: 'sent',
      status: 'delivered',
    },
    {
      id: '3',
      contact: 'Michael Chen',
      phone: '+1 555-0456',
      message: 'Can we reschedule our meeting to next week?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      direction: 'received',
      status: 'delivered',
    },
  ]);

  // Check for missing configuration on mount
  useEffect(() => {
    const telnyxConfig = ApiKeyManager.getServiceConfig('telnyx') as any;
    const phoneNumber = telnyxConfig?.phoneNumbers?.[0]?.phoneNumber || localStorage.getItem('telnyx_phone_number');

    if (!telnyxConfig || !telnyxConfig.connectionId) {
      setTimeout(() => {
        toast.warning('Telnyx Connection ID Required', {
          description: '⚙️ Go to Settings → Telnyx PBX to configure your Connection ID to make calls',
          duration: 8000,
          action: onNavigate ? {
            label: 'Configure Now',
            onClick: () => onNavigate('telnyx-manager'),
          } : undefined,
        });
      }, 1000);
    } else if (!phoneNumber) {
      setTimeout(() => {
        toast.info('Add Your Phone Number', {
          description: 'Use the Quick Setup section below to add your Telnyx phone number',
          duration: 6000,
        });
      }, 1000);
    }
  }, [onNavigate]);

  const handleDigitClick = (digit: string) => {
    setPhoneNumber(prev => prev + digit);
  };

  const handleCall = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    // Check if Telnyx is configured using ApiKeyManager
    if (!ApiKeyManager.hasApiKey('telnyx')) {
      toast.error('Telnyx not configured', {
        description: 'Please add your Telnyx credentials in Settings → API Setup',
        duration: 5000,
      });
      if (onNavigate) {
        setTimeout(() => onNavigate('api-setup'), 2000);
      }
      return;
    }

    if (!telnyxPhoneNumber) {
      toast.error('No caller ID configured', {
        description: 'Please add your Telnyx phone number in the Quick Setup section',
        duration: 5000,
      });
      return;
    }

    // Get connection ID from localStorage
    const telnyxConfig = localStorage.getItem('telnyx_config');
    const config = telnyxConfig ? JSON.parse(telnyxConfig) : null;
    
    if (!config || !config.connectionId) {
      toast.error('Telnyx Connection ID required', {
        description: 'Go to Settings → Telnyx PBX to add your connection ID',
        duration: 5000,
      });
      if (onNavigate) {
        setTimeout(() => onNavigate('telnyx-manager'), 2000);
      }
      return;
    }

    // Make REAL call via Telnyx API
    setIsCallActive(true);
    setCurrentCall(phoneNumber);
    
    try {
      const response = await fetch('http://localhost:8000/api/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          to: phoneNumber,
          from: telnyxPhoneNumber,
          connectionId: config.connectionId,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Call initiated via Telnyx');
        
        // Start call duration counter
        let seconds = 0;
        const interval = setInterval(() => {
          seconds++;
          const mins = Math.floor(seconds / 60);
          const secs = seconds % 60;
          setCallDuration(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        }, 1000);

        (window as any).callInterval = interval;
        (window as any).callId = data.data?.id;
      } else {
        throw new Error(data.error || 'Call failed');
      }
    } catch (error) {
      setIsCallActive(false);
      setCurrentCall('');
      toast.error(`Call failed: ${error instanceof Error ? error.message : 'Backend not available'}`, {
        description: 'Make sure backend is running on port 8000',
      });
    }
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setCurrentCall('');
    setCallDuration('00:00');
    setIsMuted(false);
    clearInterval((window as any).callInterval);
    toast.info('Call ended');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? 'Unmuted' : 'Muted');
  };

  const handleSendSMS = () => {
    if (!smsNumber || !smsMessage) {
      toast.error('Please enter phone number and message');
      return;
    }

    const savedKeys = localStorage.getItem('crm_api_keys');
    const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};
    
    if (!apiKeys.telnyx) {
      toast.error('Telnyx not configured', {
        description: 'Please add your Telnyx credentials in Settings → API Setup',
      });
      return;
    }

    if (!telnyxPhoneNumber) {
      toast.error('No sender number configured', {
        description: 'Please add your Telnyx phone number in the Quick Setup section',
      });
      return;
    }

    // IMPORTANT: This is DEMO mode - not sending real SMS!
    toast.warning('⚠️ DEMO MODE: Simulating SMS', {
      description: 'Real SMS requires a backend server. See API Setup → Backend Setup → Telnyx Integration',
      duration: 5000,
    });
    
    toast.success(`Demo: SMS would be sent to ${smsNumber}`);
    setSmsMessage('');

    /* 
    ==========================================
    REAL IMPLEMENTATION (Backend Required):
    ==========================================
    
    const response = await fetch('/api/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: smsNumber,
        from: telnyxPhoneNumber,
        text: smsMessage,
        apiKey: apiKeys.telnyx
      })
    });
    */
  };

  const getCallIcon = (type: string) => {
    switch (type) {
      case 'incoming':
        return <PhoneIncoming className="h-4 w-4 text-green-600" />;
      case 'outgoing':
        return <PhoneOutgoing className="h-4 w-4 text-blue-600" />;
      case 'missed':
        return <PhoneMissed className="h-4 w-4 text-red-600" />;
      default:
        return <PhoneIcon className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const savedKeys = localStorage.getItem('crm_api_keys');
  const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};
  const hasTelnyxKey = !!apiKeys.telnyx;
  const telnyxPhoneNumber = localStorage.getItem('telnyx_phone_number') || '';

  // Test Telnyx API connectivity
  const testTelnyxConnection = async () => {
    if (!apiKeys.telnyx) {
      toast.error('Please add your Telnyx API key first');
      return;
    }

    setTestingConnection(true);
    setConnectionStatus('testing');

    try {
      // Test API connectivity by fetching phone numbers
      const response = await fetch('https://api.telnyx.com/v2/phone_numbers', {
        headers: {
          'Authorization': `Bearer ${apiKeys.telnyx}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus('connected');
        toast.success('✅ Telnyx API connected successfully!', {
          description: `Found ${data.data?.length || 0} phone numbers in your account`,
        });

        // Auto-set first phone number if none configured
        if (!telnyxPhoneNumber && data.data && data.data.length > 0) {
          const firstNumber = data.data[0].phone_number;
          localStorage.setItem('telnyx_phone_number', firstNumber);
          toast.info(`Auto-configured caller ID: ${firstNumber}`);
        }
      } else {
        setConnectionStatus('failed');
        toast.error('❌ Telnyx API connection failed', {
          description: 'Invalid API key or authentication error',
        });
      }
    } catch (error) {
      setConnectionStatus('failed');
      toast.error('❌ Connection test failed', {
        description: 'Could not reach Telnyx API. CORS may be blocking the request.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-responsive">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">Phone & SMS</h2>
          <p className="text-gray-500">Make calls, send SMS, and manage communications</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate && onNavigate('phone-system')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          {telnyxPhoneNumber && (
            <Badge variant="outline" className="border-blue-300 text-blue-600">
              <PhoneIcon className="h-3 w-3 mr-1" />
              <span className="truncate max-w-[150px]">{telnyxPhoneNumber}</span>
            </Badge>
          )}
          {hasTelnyxKey ? (
            <div className="flex items-center gap-2">
              <Badge 
                className={
                  connectionStatus === 'connected' 
                    ? 'bg-green-100 text-green-800 border-0'
                      : connectionStatus === 'failed'
                      ? 'bg-red-100 text-red-800 border-0'
                      : 'bg-gray-100 text-gray-800 border-0'
                  }
                >
                  {connectionStatus === 'connected' && '✓ Connected'}
                  {connectionStatus === 'failed' && '✗ Failed'}
                  {connectionStatus === 'unknown' && 'Not Tested'}
                  {connectionStatus === 'testing' && 'Testing...'}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={testTelnyxConnection}
                  disabled={testingConnection}
                >
                  {testingConnection ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
            ) : (
              <Badge variant="outline" className="border-orange-300 text-orange-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                Not Configured
              </Badge>
            )}
          </div>
        </div>

      <div className="mb-6">
        <TelnyxQuickAdd onNavigateToSetup={() => onNavigate && onNavigate('api-setup')} />
      </div>

      {hasTelnyxKey && (
        <Card className="mb-6 border-red-300 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-red-900 mb-2">⚠️ DEMO MODE: Not Making Real Calls/SMS</h4>
                <div className="space-y-2 text-sm text-red-800">
                  <p><strong>Current Status:</strong> This UI simulates calls and SMS but does NOT make real API calls to Telnyx.</p>
                  <p><strong>Why:</strong> Telnyx API requires a backend server. Browser-only apps cannot make direct calls due to security restrictions.</p>
                  <p><strong>What Happens:</strong> When you click "Call" or "Send SMS", it shows a simulation with fake call timers and messages.</p>
                  <p><strong>To Make Real Calls:</strong> You must create a backend server (Node.js/Next.js/Python) that handles Telnyx API calls.</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-100"
                    onClick={() => onNavigate && onNavigate('api-setup')}
                  >
                    View Backend Setup Guide →
                  </Button>
                  {hasTelnyxKey && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-100"
                      onClick={testTelnyxConnection}
                      disabled={testingConnection}
                    >
                      {testingConnection ? 'Testing API...' : 'Test API Connection'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="dialer" className="w-full">
        <TabsList>
          <TabsTrigger value="dialer">
            <PhoneIcon className="h-4 w-4 mr-2" />
            Dialer
          </TabsTrigger>
          <TabsTrigger value="call-logs">
            <History className="h-4 w-4 mr-2" />
            Call Logs
          </TabsTrigger>
          <TabsTrigger value="sms">
            <MessageSquare className="h-4 w-4 mr-2" />
            SMS
          </TabsTrigger>
        </TabsList>

        {/* Dialer Tab */}
        <TabsContent value="dialer" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dialer */}
            <Card>
              <CardHeader>
                <CardTitle>Phone Dialer</CardTitle>
              </CardHeader>
              <CardContent>
                {!isCallActive ? (
                  <div>
                    <div className="mb-4">
                      <Input
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter phone number"
                        className="text-center text-2xl h-14"
                      />
                    </div>

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                        <Button
                          key={digit}
                          variant="outline"
                          size="lg"
                          onClick={() => handleDigitClick(digit)}
                          className="h-14 text-xl"
                        >
                          {digit}
                        </Button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setPhoneNumber(phoneNumber.slice(0, -1))}
                      >
                        Delete
                      </Button>
                      <Button onClick={handleCall} className="bg-green-600 hover:bg-green-700">
                        <PhoneCall className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mb-6">
                      <Avatar className="w-24 h-24 mx-auto mb-4">
                        <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                          <PhoneIcon className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="mb-1">{currentCall}</h3>
                      <p className="text-2xl font-mono text-gray-600">{callDuration}</p>
                      <Badge className="mt-2 bg-green-100 text-green-800 border-0">
                        Call in progress
                      </Badge>
                    </div>

                    <div className="flex justify-center gap-4 mb-6">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={toggleMute}
                        className={isMuted ? 'bg-red-50' : ''}
                      >
                        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </Button>
                      <Button variant="outline" size="lg">
                        <Pause className="h-5 w-5" />
                      </Button>
                    </div>

                    <Button
                      onClick={handleEndCall}
                      size="lg"
                      className="bg-red-600 hover:bg-red-700 w-full"
                    >
                      <X className="h-5 w-5 mr-2" />
                      End Call
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Contacts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search contacts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {callLogs.slice(0, 6).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setPhoneNumber(log.phone)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-gray-100">
                            {log.contact.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{log.contact}</p>
                          <p className="text-sm text-gray-500">{log.phone}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <PhoneCall className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Call Logs Tab */}
        <TabsContent value="call-logs" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Call History</CardTitle>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Calls</SelectItem>
                      <SelectItem value="incoming">Incoming</SelectItem>
                      <SelectItem value="outgoing">Outgoing</SelectItem>
                      <SelectItem value="missed">Missed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {callLogs.map((log) => (
                  <Card key={log.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getCallIcon(log.type)}
                          <div>
                            <p className="font-medium text-gray-900">{log.contact}</p>
                            <p className="text-sm text-gray-500">{log.phone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{log.duration}</p>
                          <p className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</p>
                        </div>
                      </div>
                      {log.recording && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Play className="h-3 w-3 mr-2" />
                              Play Recording
                            </Button>
                            <Badge variant="outline" className="text-xs">
                              Recording available
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS Tab */}
        <TabsContent value="sms" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Send SMS */}
            <Card>
              <CardHeader>
                <CardTitle>Send SMS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      value={smsNumber}
                      onChange={(e) => setSmsNumber(e.target.value)}
                      placeholder="+1 555-0000"
                    />
                  </div>
                  <div>
                    <Label>Message</Label>
                    <Textarea
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={6}
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {smsMessage.length}/160 characters
                    </p>
                  </div>
                  <Button onClick={handleSendSMS} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send SMS
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* SMS History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {smsMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.direction === 'sent' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.direction === 'sent'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm mb-1">{msg.message}</p>
                        <div className="flex items-center gap-2 text-xs opacity-75">
                          <span>{formatTimestamp(msg.timestamp)}</span>
                          {msg.direction === 'sent' && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                msg.status === 'delivered'
                                  ? 'border-white text-white'
                                  : 'border-orange-200 text-orange-100'
                              }`}
                            >
                              {msg.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
