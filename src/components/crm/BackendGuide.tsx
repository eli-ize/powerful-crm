import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Code, Server, AlertCircle } from 'lucide-react';

export function BackendGuide() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="mb-1 text-gray-900">Backend Setup Guide</h2>
        <p className="text-gray-500">How to integrate Google Places API in production</p>
      </div>

      <Alert className="mb-6 border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Important:</strong> Google Places API cannot be called directly from the browser due to CORS restrictions. 
          You must create a backend server to make API calls securely.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="nextjs" className="w-full">
        <TabsList>
          <TabsTrigger value="nextjs">Next.js (Places API)</TabsTrigger>
          <TabsTrigger value="nodejs">Node.js/Express</TabsTrigger>
          <TabsTrigger value="telnyx">Telnyx Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="nextjs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Next.js API Route
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Create file: <code className="bg-gray-100 px-2 py-0.5 rounded">app/api/places/search/route.ts</code></p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    
    // Get API key from environment variable (secure!)
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }
    
    // Call Google Places API from server
    const url = \`https://maps.googleapis.com/maps/api/place/textsearch/json?query=\${encodeURIComponent(query)}&key=\${apiKey}\`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}`}
                  </pre>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Environment Variables: <code className="bg-gray-100 px-2 py-0.5 rounded">.env.local</code></p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs">
{`GOOGLE_PLACES_API_KEY=AIzaSyBfisjDVW0V1wnN5JeVSs5ZUU0viWbNmG4`}
                  </pre>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Frontend Code:</p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`const handleSearch = async (query: string) => {
  const response = await fetch('/api/places/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  
  const data = await response.json();
  
  if (data.status === 'OK') {
    const leads = data.results.map((place: any) => ({
      companyName: place.name,
      location: place.formatted_address,
      phone: place.formatted_phone_number,
      website: place.website,
      // ... other fields
    }));
    
    return leads;
  }
};`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nodejs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Node.js/Express Server
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Install dependencies:</p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs">
{`npm install express cors dotenv node-fetch`}
                  </pre>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Server code: <code className="bg-gray-100 px-2 py-0.5 rounded">server.js</code></p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/places/search', async (req, res) => {
  try {
    const { query } = req.body;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    const url = \`https://maps.googleapis.com/maps/api/place/textsearch/json?query=\${encodeURIComponent(query)}&key=\${apiKey}\`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

app.listen(3001, () => {
  }

// Backend is now running on port 8000
});`}
                  </pre>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Environment Variables: <code className="bg-gray-100 px-2 py-0.5 rounded">.env</code></p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs">
{`GOOGLE_PLACES_API_KEY=AIzaSyBfisjDVW0V1wnN5JeVSs5ZUU0viWbNmG4`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="python" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Python/Flask Server
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Install dependencies:</p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs">
{`pip install flask flask-cors requests python-dotenv`}
                  </pre>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Server code: <code className="bg-gray-100 px-2 py-0.5 rounded">app.py</code></p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

@app.route('/api/places/search', methods=['POST'])
def search_places():
    try:
        data = request.get_json()
        query = data.get('query')
        api_key = os.getenv('GOOGLE_PLACES_API_KEY')
        
        url = f"https://maps.googleapis.com/maps/api/place/textsearch/json"
        params = {
            'query': query,
            'key': api_key
        }
        
        response = requests.get(url, params=params)
        return jsonify(response.json())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=3001, debug=True)`}
                  </pre>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Environment Variables: <code className="bg-gray-100 px-2 py-0.5 rounded">.env</code></p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs">
{`GOOGLE_PLACES_API_KEY=AIzaSyBfisjDVW0V1wnN5JeVSs5ZUU0viWbNmG4`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="telnyx" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Telnyx Voice & SMS Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Install Telnyx SDK:</p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs">
{`npm install telnyx`}
                  </pre>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Backend API for Making Calls: <code className="bg-gray-100 px-2 py-0.5 rounded">api/call/route.ts</code></p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`import { NextResponse } from 'next/server';
import Telnyx from 'telnyx';

const telnyx = new Telnyx(process.env.TELNYX_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, from } = await request.json();
    
    const call = await telnyx.calls.create({
      connection_id: process.env.TELNYX_CONNECTION_ID,
      to: to,
      from: from,
    });
    
    return NextResponse.json({ success: true, call });
  } catch (error) {
    return NextResponse.json(
      { error: 'Call failed' },
      { status: 500 }
    );
  }
}`}
                  </pre>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Backend API for Sending SMS: <code className="bg-gray-100 px-2 py-0.5 rounded">api/sms/route.ts</code></p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`import { NextResponse } from 'next/server';
import Telnyx from 'telnyx';

const telnyx = new Telnyx(process.env.TELNYX_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, from, text } = await request.json();
    
    const message = await telnyx.messages.create({
      from: from, // Your Telnyx number
      to: to,
      text: text,
    });
    
    return NextResponse.json({ success: true, message });
  } catch (error) {
    return NextResponse.json(
      { error: 'SMS failed' },
      { status: 500 }
    );
  }
}`}
                  </pre>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Environment Variables: <code className="bg-gray-100 px-2 py-0.5 rounded">.env.local</code></p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs">
{`TELNYX_API_KEY=YOUR_API_KEY_HERE
TELNYX_CONNECTION_ID=YOUR_CONNECTION_ID
TELNYX_PHONE_NUMBER=+15551234567`}
                  </pre>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Frontend Integration:</p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`// Make a call
const makeCall = async (phoneNumber: string) => {
  const response = await fetch('/api/call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: phoneNumber,
      from: process.env.NEXT_PUBLIC_TELNYX_NUMBER
    })
  });
  return response.json();
};

// Send SMS
const sendSMS = async (to: string, message: string) => {
  const response = await fetch('/api/sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to,
      from: process.env.NEXT_PUBLIC_TELNYX_NUMBER,
      text: message
    })
  });
  return response.json();
};`}
                  </pre>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="text-blue-900 mb-2">Telnyx Setup Steps:</h5>
                  <ol className="space-y-1 text-sm text-blue-800 list-decimal list-inside">
                    <li>Sign up at <a href="https://telnyx.com" target="_blank" className="underline">telnyx.com</a></li>
                    <li>Purchase a phone number in Mission Control</li>
                    <li>Create a SIP Connection or TeXML application</li>
                    <li>Get your API Key from Mission Control → Auth</li>
                    <li>Configure webhooks for incoming calls/SMS</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <h4 className="text-blue-900 mb-3">Why You Need a Backend</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span><strong>Security:</strong> API keys stay on the server, never exposed to users</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span><strong>CORS:</strong> Google APIs block browser requests, but allow server requests</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span><strong>Rate Limiting:</strong> Control API usage and implement caching</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span><strong>Cost Control:</strong> Monitor and limit API calls to avoid unexpected charges</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
