import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, CheckCircle, Phone, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface TelnyxQuickAddProps {
  onNavigateToSetup?: () => void;
}

export function TelnyxQuickAdd({ onNavigateToSetup }: TelnyxQuickAddProps) {
  const [apiKey, setApiKey] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const savedKeys = localStorage.getItem('crm_api_keys');
  const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};
  const hasTelnyxKey = !!apiKeys.telnyx;

  const handleSave = () => {
    if (!apiKey) {
      toast.error('Please enter your Telnyx API key');
      return;
    }

    if (!apiKey.startsWith('KEY')) {
      toast.error('Invalid Telnyx API key format', {
        description: 'Telnyx API keys start with "KEY..."',
      });
      return;
    }

    const updated = { ...apiKeys, telnyx: apiKey };
    localStorage.setItem('crm_api_keys', JSON.stringify(updated));
    
    if (phoneNumber) {
      localStorage.setItem('telnyx_phone_number', phoneNumber);
      toast.success('Telnyx configured successfully!', {
        description: `Caller ID set to ${phoneNumber}`,
      });
    } else {
      toast.success('Telnyx API key saved!', {
        description: 'Click "Test Connection" to verify and auto-detect your phone number',
      });
    }
    
    setApiKey('');
    window.location.reload(); // Reload to update UI
  };

  if (hasTelnyxKey) {
    const configuredNumber = localStorage.getItem('telnyx_phone_number');
    
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-blue-900 mb-1">Telnyx API Key Configured</h4>
              {configuredNumber ? (
                <p className="text-sm text-blue-700 mb-2">
                  Caller ID: <strong>{configuredNumber}</strong>
                </p>
              ) : (
                <p className="text-sm text-blue-700 mb-2">
                  Click "Test Connection" to verify API key and auto-detect your phone number
                </p>
              )}
              <p className="text-xs text-blue-600">
                ⚠️ Note: This is demo mode. Real calls require a backend server.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
              onClick={onNavigateToSetup}
            >
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-blue-900 mb-1">Quick Setup: Add Telnyx</h4>
            <p className="text-sm text-blue-700">
              Add your Telnyx API key to enable phone calls and SMS messaging
            </p>
          </div>
        </div>

        <Alert className="mb-4 border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-sm text-orange-800">
            Don't have a Telnyx account? 
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto ml-1 text-orange-900 underline"
              onClick={() => window.open('https://telnyx.com/sign-up', '_blank')}
            >
              Sign up here (free trial available)
            </Button>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label>Telnyx API Key *</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="KEY..."
              className="font-mono"
            />
            <p className="text-xs text-gray-600 mt-1">
              Find this in Telnyx Mission Control → Auth → API Keys
            </p>
          </div>

          <div>
            <Label>Your Telnyx Phone Number (Optional)</Label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 555-123-4567"
            />
            <p className="text-xs text-gray-600 mt-1">
              The phone number you purchased in Telnyx
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              Save & Connect
            </Button>
            <Button
              variant="outline"
              onClick={onNavigateToSetup}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Full Setup Guide
            </Button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-xs text-blue-700">
            💡 <strong>New to Telnyx?</strong> It takes ~5 minutes to setup: 
            Create account → Buy phone number ($1-5/mo) → Get API key → Paste above
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
