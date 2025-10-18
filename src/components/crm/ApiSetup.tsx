import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CheckCircle, AlertCircle, ExternalLink, Copy, Eye, EyeOff, Server, Phone } from 'lucide-react';
import { useState } from 'react';
import { BackendGuide } from './BackendGuide';
import { TelnyxSetupGuide } from './TelnyxSetupGuide';

export function ApiSetup() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [apiKeys, setApiKeys] = useState(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('crm_api_keys');
    return saved ? JSON.parse(saved) : {
      googlePlaces: '',
      hunter: '',
      apollo: '',
      clearbit: '',
      telnyx: '',
    };
  });

  const toggleShowKey = (key: string) => {
    setShowKeys({ ...showKeys, [key]: !showKeys[key] });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const saveApiKey = (key: string, value: string) => {
    const updated = { ...apiKeys, [key]: value };
    setApiKeys(updated);
    localStorage.setItem('crm_api_keys', JSON.stringify(updated));
  };

  const apis = [
    {
      name: 'Google Places API',
      key: 'googlePlaces',
      status: apiKeys.googlePlaces ? 'connected' : 'not-connected',
      description: 'Find businesses, get phone numbers, addresses, and websites',
      pricing: '$17 per 1,000 requests',
      setupUrl: 'https://developers.google.com/maps/documentation/places/web-service/get-api-key',
      required: true,
      features: ['Business search', 'Phone numbers', 'Addresses', 'Websites', 'Reviews & ratings'],
    },
    {
      name: 'Telnyx',
      key: 'telnyx',
      status: apiKeys.telnyx ? 'connected' : 'not-connected',
      description: 'Voice calling, SMS, and telephony services',
      pricing: '$0.004/min for calls, $0.004/SMS',
      setupUrl: 'https://developers.telnyx.com/docs/v2/messaging',
      required: true,
      features: ['Voice calls', 'SMS messaging', 'Call recording', 'WebRTC', 'Voicemail'],
    },
    {
      name: 'Hunter.io',
      key: 'hunter',
      status: apiKeys.hunter ? 'connected' : 'not-connected',
      description: 'Find and verify professional email addresses',
      pricing: 'Free tier: 25 searches/mo, Paid: $49/mo for 500 searches',
      setupUrl: 'https://hunter.io/api',
      required: false,
      features: ['Email finder', 'Email verification', 'Domain search', 'Bulk searches'],
    },
    {
      name: 'Apollo.io',
      key: 'apollo',
      status: apiKeys.apollo ? 'connected' : 'not-connected',
      description: 'B2B contact database and enrichment',
      pricing: 'Free tier: 50 emails/mo, Paid: $49/mo',
      setupUrl: 'https://apolloio.github.io/apollo-api-docs/',
      required: false,
      features: ['Contact enrichment', 'Company data', 'Job titles', 'LinkedIn profiles'],
    },
    {
      name: 'Clearbit',
      key: 'clearbit',
      status: apiKeys.clearbit ? 'connected' : 'not-connected',
      description: 'Company data enrichment (employee count, revenue, tech stack)',
      pricing: '$99/mo',
      setupUrl: 'https://clearbit.com/docs',
      required: false,
      features: ['Company enrichment', 'Employee count', 'Revenue estimates', 'Tech stack'],
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header-responsive">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">API Configuration</h2>
          <p className="text-sm text-gray-500">Connect APIs to power Lead Finder and contact enrichment</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="flex-1 min-w-[100px]">Overview</TabsTrigger>
          <TabsTrigger value="setup" className="flex-1 min-w-[100px]">API Keys</TabsTrigger>
          <TabsTrigger value="telnyx-guide" className="flex-1 min-w-[140px]">
            <Phone className="h-3.5 w-3.5 mr-1.5" />
            <span className="hidden sm:inline">Telnyx Setup</span>
            <span className="sm:hidden">Telnyx</span>
          </TabsTrigger>
          <TabsTrigger value="backend" className="flex-1 min-w-[140px]">
            <Server className="h-3.5 w-3.5 mr-1.5" />
            <span className="hidden sm:inline">Backend Setup</span>
            <span className="sm:hidden">Backend</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid-2-col-responsive">
            {apis.map((api) => (
              <Card key={api.key} className="card-responsive border border-gray-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg flex flex-wrap items-center gap-2 mb-1">
                        <span className="truncate">{api.name}</span>
                        {api.required && (
                          <Badge variant="outline" className="badge-responsive flex-shrink-0">Required</Badge>
                        )}
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{api.description}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {api.status === 'connected' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="card-content-responsive">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Features:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {api.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-blue-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-600 mb-3">
                        <span className="font-medium">Pricing:</span> <span className="block sm:inline mt-1 sm:mt-0">{api.pricing}</span>
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="btn-responsive w-full text-xs sm:text-sm"
                        onClick={() => window.open(api.setupUrl, '_blank')}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="truncate">View Documentation</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="setup" className="mt-6">
          <div className="space-y-4 max-w-3xl mx-auto">
            {apis.map((api) => (
              <Card key={api.key} className="card-responsive border border-gray-200">
                <CardContent className="card-content-responsive">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="mb-1">{api.name}</h4>
                      <p className="text-sm text-gray-500">{api.description}</p>
                    </div>
                    {apiKeys[api.key as keyof typeof apiKeys] ? (
                      <Badge className="bg-green-100 text-green-800 border-0">Connected</Badge>
                    ) : (
                      <Badge variant="outline">Not Connected</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="form-group">
                      <Label className="text-sm font-medium">API Key</Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <Input
                            type={showKeys[api.key] ? 'text' : 'password'}
                            placeholder="Enter your API key..."
                            value={apiKeys[api.key as keyof typeof apiKeys]}
                            onChange={(e) => setApiKeys({ ...apiKeys, [api.key]: e.target.value })}
                            className="pr-10 text-sm"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => toggleShowKey(api.key)}
                            type="button"
                          >
                            {showKeys[api.key] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <Button 
                          variant="outline"
                          size="default"
                          className="btn-responsive w-full sm:w-auto min-w-[100px]"
                          onClick={() => saveApiKey(api.key, apiKeys[api.key as keyof typeof apiKeys])}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-blue-600"
                      onClick={() => window.open(api.setupUrl, '_blank')}
                    >
                      How to get {api.name} API key →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="guide" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle>Quick Start Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="float-left mr-2 flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4>Google Places API</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Go to Google Cloud Console → Create a project → Enable Places API → Create credentials → Copy API key
                    </p>
                  </div>
                </div>

                <div>
                  <div className="float-left mr-2 flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4>Hunter.io</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Sign up at Hunter.io → Go to API settings → Copy your API key → Start with free tier (25 searches/mo)
                    </p>
                  </div>
                </div>

                <div>
                  <div className="float-left mr-2 flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4>Apollo.io (Optional)</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Create Apollo account → Settings → API Keys → Generate new key → Use for contact enrichment
                    </p>
                  </div>
                </div>

                <div>
                  <div className="float-left mr-2 flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div>
                    <h4>Test & Go Live</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Paste your API keys above → Click Save → Test in Lead Finder → Start finding leads!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle>Security Best Practices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h5 className="text-red-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Important Security Warning
                  </h5>
                  <p className="text-sm text-red-800">
                    API keys are stored in your browser's localStorage. For production apps, use a backend server to make API calls and keep keys secure.
                  </p>
                </div>

                <div>
                  <h5 className="mb-2">Production Architecture:</h5>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`// Frontend (Your CRM)
fetch('/api/find-leads', {
  method: 'POST',
  body: JSON.stringify({ query: 'software SF' })
});

// Backend (Node.js/Next.js API Route)
// This keeps your API keys secret!
export async function POST(req) {
  const { query } = await req.json();
  
  // Google Places API (server-side)
  const places = await fetch(
    \`https://maps.googleapis.com/maps/api/place/textsearch/json?query=\${query}&key=\${process.env.GOOGLE_API_KEY}\`
  );
  
  // Hunter.io (server-side)
  const emails = await fetch(
    \`https://api.hunter.io/v2/email-finder?domain=...\`,
    { headers: { 'Authorization': \`Bearer \${process.env.HUNTER_API_KEY}\` }}
  );
  
  return Response.json({ places, emails });
}`}
                  </pre>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="text-blue-900 mb-2">For This Demo:</h5>
                  <p className="text-sm text-blue-800">
                    Since this is a frontend-only demo, we're using CORS proxies for Google Places API. In production, always use a backend server to protect your API keys.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="telnyx-guide" className="mt-6">
          <TelnyxSetupGuide />
        </TabsContent>

        <TabsContent value="backend" className="mt-6">
          <BackendGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
}
