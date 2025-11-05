import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Phone, PhoneOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../utils/api';

interface CallStatus {
  id?: string;
  status?: string;
  to?: string;
  from?: string;
  createdAt?: string;
  callLegId?: string;
}

export function PhoneCall() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fromNumber, setFromNumber] = useState('+16282210321'); // Default verified number
  const [isCallActive, setIsCallActive] = useState(false);
  const [isInitiating, setIsInitiating] = useState(false);
  const [currentCall, setCurrentCall] = useState<CallStatus | null>(null);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format based on length
    if (digits.startsWith('27')) {
      // South African number
      if (digits.length <= 2) return '+27';
      if (digits.length <= 5) return `+27 ${digits.slice(2)}`;
      if (digits.length <= 8) return `+27 ${digits.slice(2, 5)} ${digits.slice(5)}`;
      return `+27 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 12)}`;
    } else if (digits.startsWith('1')) {
      // US number
      if (digits.length <= 1) return '+1';
      if (digits.length <= 4) return `+1 ${digits.slice(1)}`;
      if (digits.length <= 7) return `+1 ${digits.slice(1, 4)} ${digits.slice(4)}`;
      return `+1 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
    }
    
    return '+' + digits;
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const initiateCall = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    // Remove formatting for API
    const cleanNumber = phoneNumber.replace(/\s/g, '');

    setIsInitiating(true);
    try {
      const response = await api.initiateCall({
        to: cleanNumber,
        from: fromNumber,
        connectionId: '2808469699220735458', // Powerful CRM Call Control connection
      });

      if (response.success && response.data) {
        setIsCallActive(true);
        setCurrentCall(response.data as CallStatus);
        toast.success(`📞 Call initiated to ${phoneNumber}`, {
          description: 'The phone should be ringing now!',
        });
      } else {
        throw new Error('Failed to initiate call');
      }
    } catch (error) {
      console.error('Call error:', error);
      toast.error('Failed to initiate call', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsInitiating(false);
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    setCurrentCall(null);
    toast.info('Call ended');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Real Phone Calls (Telnyx)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Make real phone calls using verified Telnyx numbers
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Call status */}
          {isCallActive && currentCall && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-900">Call Active</p>
                  <p className="text-sm text-green-700">
                    Calling {currentCall.to}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Call ID: {currentCall.id?.substring(0, 20)}...
                  </p>
                </div>
                <Button
                  onClick={endCall}
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                >
                  <PhoneOff className="h-4 w-4" />
                  End Call
                </Button>
              </div>
            </div>
          )}

          {/* From number selection */}
          <div className="space-y-2">
            <Label htmlFor="from-number">From Number (Your Telnyx Number)</Label>
            <Select value={fromNumber} onValueChange={setFromNumber}>
              <SelectTrigger id="from-number">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="+16282210321">
                  +1 628 221 0321 (US - Verified ✓)
                </SelectItem>
                <SelectItem value="+15129007574">
                  +1 512 900 7574 (US - Verified ✓)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              These are your verified Telnyx numbers
            </p>
          </div>

          {/* Phone number input */}
          <div className="space-y-2">
            <Label htmlFor="phone-number">To Number (Recipient)</Label>
            <Input
              id="phone-number"
              type="tel"
              placeholder="+27 63 725 0867"
              value={phoneNumber}
              onChange={handlePhoneInput}
              disabled={isCallActive}
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              Enter number in international format (e.g., +27 for South Africa, +1 for US)
            </p>
          </div>

          {/* Call button */}
          <Button
            onClick={initiateCall}
            disabled={isCallActive || isInitiating || !phoneNumber}
            className="w-full"
            size="lg"
          >
            {isInitiating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Initiating Call...
              </>
            ) : (
              <>
                <Phone className="h-5 w-5 mr-2" />
                Make Call
              </>
            )}
          </Button>

          {/* Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">How it works:</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Uses real Telnyx API to make phone calls</li>
              <li>• Calls are recorded (dual-channel MP3)</li>
              <li>• Webhooks notify backend of call events</li>
              <li>• Currently supports basic call initiation</li>
              <li>• Can be extended with AI voice assistant</li>
            </ul>
          </div>

          {/* Recent call info */}
          {currentCall && !isCallActive && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm font-semibold text-gray-900 mb-2">Last Call:</p>
              <div className="text-sm text-gray-700 space-y-1">
                <p>To: {currentCall.to}</p>
                <p>From: {currentCall.from}</p>
                <p>Status: {currentCall.status}</p>
                {currentCall.createdAt && (
                  <p>Time: {new Date(currentCall.createdAt).toLocaleString()}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PhoneCall;
