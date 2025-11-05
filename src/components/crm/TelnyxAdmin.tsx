import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Phone, Settings, Key, Webhook, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

interface TelnyxConfig {
  apiKey?: string;
  publicKey?: string;
  webhookUrl?: string;
  phoneNumber?: string;
  applicationId?: string;
  connectionId?: string;
}

interface TelnyxStatus {
  configured: boolean;
  connected: boolean;
  balance?: number;
  phoneNumbers?: any[];
  lastError?: string;
}

export default function TelnyxAdmin() {
  const [config, setConfig] = useState<TelnyxConfig>({});
  const [status, setStatus] = useState<TelnyxStatus>({ configured: false, connected: false });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
    checkStatus();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await api.get('/api/admin/telnyx/config');
      setConfig(response.data.config || {});
    } catch (error) {
      console.error('Failed to load Telnyx config:', error);
    }
  };

  const checkStatus = async () => {
    try {
      const response = await api.get('/api/admin/telnyx/status');
      setStatus(response.data);
    } catch (error) {
      console.error('Failed to check Telnyx status:', error);
      setStatus({ configured: false, connected: false, lastError: 'Failed to connect' });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await api.post('/api/admin/telnyx/config', config);
      setMessage({ type: 'success', text: 'Telnyx configuration saved successfully!' });
      await checkStatus();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save configuration' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setMessage(null);

    try {
      const response = await api.post('/api/admin/telnyx/test');
      setMessage({ 
        type: 'success', 
        text: `Test successful! ${response.data.message}` 
      });
      await checkStatus();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Test failed' 
      });
    } finally {
      setTesting(false);
    }
  };

  const handleTestCall = async () => {
    if (!config.phoneNumber) {
      setMessage({ type: 'error', text: 'Please enter a test phone number' });
      return;
    }

    setTesting(true);
    setMessage(null);

    try {
      const response = await api.post('/api/admin/telnyx/test-call', {
        to: config.phoneNumber
      });
      setMessage({ 
        type: 'success', 
        text: `Test call initiated! Call ID: ${response.data.callId}` 
      });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to initiate test call' 
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Phone className="h-8 w-8" />
            Telnyx Configuration
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure Telnyx for voice call automation and SMS campaigns
          </p>
        </div>

        <div className="flex items-center gap-4">
          {status.configured && (
            <Badge variant={status.connected ? 'default' : 'destructive'} className="gap-1">
              {status.connected ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Connected
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Disconnected
                </>
              )}
            </Badge>
          )}
          {status.balance !== undefined && (
            <Badge variant="outline" className="gap-1">
              Balance: ${status.balance.toFixed(2)}
            </Badge>
          )}
        </div>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="phone">
            <Phone className="h-4 w-4 mr-2" />
            Phone Numbers
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="h-4 w-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="test">
            <AlertCircle className="h-4 w-4 mr-2" />
            Test
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Credentials</CardTitle>
              <CardDescription>
                Get your API keys from{' '}
                <a 
                  href="https://portal.telnyx.com/#/app/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Telnyx Portal → API Keys
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">
                  <Key className="h-4 w-4 inline mr-2" />
                  API Key (V2)
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="KEY..."
                  value={config.apiKey || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, apiKey: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Used for making API calls to Telnyx services
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="publicKey">Public Key</Label>
                <Input
                  id="publicKey"
                  type="password"
                  placeholder="PUBLIC_..."
                  value={config.publicKey || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, publicKey: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Used for webhook signature verification
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="connectionId">Connection ID</Label>
                <Input
                  id="connectionId"
                  placeholder="123456789"
                  value={config.connectionId || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, connectionId: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Your TeXML application connection ID
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicationId">Application ID (Optional)</Label>
                <Input
                  id="applicationId"
                  placeholder="app_..."
                  value={config.applicationId || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, applicationId: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Your Telnyx call control application ID
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Configuration'}
                </Button>
                <Button variant="outline" onClick={loadConfig}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phone" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phone Numbers</CardTitle>
              <CardDescription>
                Manage your Telnyx phone numbers for calling and SMS
              </CardDescription>
            </CardHeader>
            <CardContent>
              {status.phoneNumbers && status.phoneNumbers.length > 0 ? (
                <div className="space-y-2">
                  {status.phoneNumbers.map((number: any) => (
                    <div
                      key={number.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{number.phone_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {number.status} • {number.connection_name}
                        </p>
                      </div>
                      <Badge>{number.features?.join(', ')}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No phone numbers found</p>
                  <p className="text-sm mt-2">
                    Purchase numbers at{' '}
                    <a
                      href="https://portal.telnyx.com/#/app/numbers/my-numbers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Telnyx Portal
                    </a>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Set up webhooks to receive real-time call events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://your-domain.com/api/telnyx/webhook"
                  value={config.webhookUrl || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, webhookUrl: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  This URL will receive call events (answered, completed, etc.)
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>For local development:</strong> Use{' '}
                  <a
                    href="https://ngrok.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    ngrok
                  </a>{' '}
                  to expose your local server:
                  <code className="block mt-2 p-2 bg-muted rounded">
                    ngrok http 8000
                  </code>
                  {' '}
                  Then use the ngrok URL as your webhook URL
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={loading}>
                  Save Webhook URL
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open(
                      'https://portal.telnyx.com/#/app/call-control/applications',
                      '_blank'
                    );
                  }}
                >
                  Configure in Telnyx Portal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connection Test</CardTitle>
              <CardDescription>
                Verify your Telnyx configuration is working correctly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button onClick={handleTest} disabled={testing || !config.apiKey}>
                  {testing ? 'Testing...' : 'Test API Connection'}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Verifies your API key and retrieves account information
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Call</CardTitle>
              <CardDescription>
                Make a test call to verify voice functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testPhone">Phone Number (E.164 format)</Label>
                <Input
                  id="testPhone"
                  type="tel"
                  placeholder="+14155551234"
                  value={config.phoneNumber || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, phoneNumber: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Enter your phone number in E.164 format (e.g., +14155551234)
                </p>
              </div>

              <Button
                onClick={handleTestCall}
                disabled={testing || !config.apiKey || !config.phoneNumber}
              >
                {testing ? 'Calling...' : 'Make Test Call'}
              </Button>
            </CardContent>
          </Card>

          {status.lastError && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Last Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-mono">{status.lastError}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
