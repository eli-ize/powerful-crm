import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle, ExternalLink, Phone, MessageSquare, Mic } from 'lucide-react';

export function TelnyxSetupGuide() {
  return (
    <div className="space-y-6">
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Security Warning:</strong> Never share your API keys publicly or commit them to Git. 
          Always use environment variables in production.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Telnyx Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 */}
          <div>
            <div className="float-left mr-3 flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div>
              <h4 className="mb-2">Create a Telnyx Account</h4>
              <p className="text-sm text-gray-600 mb-3">
                Sign up at Telnyx and complete account verification
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://telnyx.com/sign-up', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Sign Up at Telnyx
              </Button>
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <div className="float-left mr-3 flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div>
              <h4 className="mb-2">Purchase a Phone Number</h4>
              <p className="text-sm text-gray-600 mb-2">
                In Telnyx Mission Control, go to Numbers → Search & Buy
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Choose your country and area code</li>
                <li>Select a phone number ($1-5/month)</li>
                <li>Complete the purchase</li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <div className="float-left mr-3 flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div>
              <h4 className="mb-2">Get Your API Key</h4>
              <p className="text-sm text-gray-600 mb-2">
                In Telnyx Mission Control:
              </p>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside ml-2">
                <li>Go to Auth → API Keys</li>
                <li>Click "Create API Key"</li>
                <li>Name it "CRM Integration"</li>
                <li>Copy the key (starts with "KEY...")</li>
              </ol>
            </div>
          </div>

          {/* Step 4 */}
          <div>
            <div className="float-left mr-3 flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
              4
            </div>
            <div>
              <h4 className="mb-2">Configure Messaging Profile</h4>
              <p className="text-sm text-gray-600 mb-2">
                For SMS functionality:
              </p>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside ml-2">
                <li>Go to Messaging → Messaging Profiles</li>
                <li>Create a new profile or use default</li>
                <li>Assign your phone number to the profile</li>
                <li>Note the Messaging Profile ID</li>
              </ol>
            </div>
          </div>

          {/* Step 5 */}
          <div>
            <div className="float-left mr-3 flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
              5
            </div>
            <div>
              <h4 className="mb-2">Add API Key to CRM</h4>
              <p className="text-sm text-gray-600 mb-2">
                In this CRM:
              </p>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside ml-2">
                <li>Go to the "API Keys" tab above</li>
                <li>Find the "Telnyx" section</li>
                <li>Paste your API key</li>
                <li>Click "Save"</li>
              </ol>
            </div>
          </div>

          {/* Step 6 */}
          <div>
            <div className="float-left mr-3 flex-shrink-0 w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-medium">
              ✓
            </div>
            <div>
              <h4 className="mb-2 text-green-700">Start Using Phone & SMS!</h4>
              <p className="text-sm text-gray-600 mb-3">
                Navigate to Phone & SMS in the sidebar to start making calls and sending messages.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-100 text-green-800 border-0">
                  <Phone className="h-3 w-3 mr-1" />
                  Voice Calls
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 border-0">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  SMS
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 border-0">
                  <Mic className="h-3 w-3 mr-1" />
                  Call Recording
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="text-blue-900 mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            What You Can Do with Telnyx
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-medium mb-1">Voice Features:</p>
              <ul className="space-y-1 list-disc list-inside ml-2">
                <li>Make outbound calls</li>
                <li>Receive incoming calls</li>
                <li>Call recording</li>
                <li>Call forwarding</li>
                <li>IVR menus</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">Messaging Features:</p>
              <ul className="space-y-1 list-disc list-inside ml-2">
                <li>Send SMS/MMS</li>
                <li>Receive messages</li>
                <li>Delivery receipts</li>
                <li>Two-way conversations</li>
                <li>Bulk messaging</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Pricing (Pay-as-you-go)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium mb-2">Phone Numbers</h5>
              <p className="text-2xl font-bold text-blue-600 mb-1">$1-5</p>
              <p className="text-xs text-gray-600">per month</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium mb-2">Voice Calls</h5>
              <p className="text-2xl font-bold text-blue-600 mb-1">$0.004</p>
              <p className="text-xs text-gray-600">per minute</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium mb-2">SMS Messages</h5>
              <p className="text-2xl font-bold text-blue-600 mb-1">$0.004</p>
              <p className="text-xs text-gray-600">per message</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            💡 Example: 1000 minutes of calls + 1000 SMS messages = ~$8/month + number fee
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
