import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle, ArrowRight, Key, Search, Download, AlertCircle } from 'lucide-react';

interface QuickStartGuideProps {
  onDismiss: () => void;
  onGoToApiSetup: () => void;
}

export function QuickStartGuide({ onDismiss, onGoToApiSetup }: QuickStartGuideProps) {
  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardContent className="p-4 md:p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h3 className="text-blue-900">🚀 Quick Start: Find Your First Leads</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDismiss} 
              className="text-gray-500 hover:text-gray-700 flex-shrink-0"
            >
              Dismiss
            </Button>
          </div>
          <p className="text-sm text-blue-700">Follow these 3 simple steps to start finding leads</p>
        </div>

        <div className="space-y-4">
          {/* Step 1 */}
          <div>
            <div className="float-left mr-3 flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div>
              <h4 className="text-gray-900 mb-1">Configure Google Places API</h4>
              <p className="text-sm text-gray-600 mb-2">
                Add your Google Places API key to enable lead finding
              </p>
              <Button size="sm" variant="outline" onClick={onGoToApiSetup}>
                <Key className="h-3 w-3 mr-2" />
                Go to API Setup
              </Button>
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <div className="float-left mr-3 flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div>
              <h4 className="text-gray-900 mb-1">Search for Leads</h4>
              <p className="text-sm text-gray-600">
                Enter keywords like "coffee shops in New York" or "software companies San Francisco"
              </p>
              <div className="mt-2 bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Example searches:</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• "restaurants in Miami"</li>
                  <li>• "real estate agents Los Angeles"</li>
                  <li>• "marketing agencies Chicago"</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <div className="float-left mr-3 flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div>
              <h4 className="text-gray-900 mb-1">Import to Your CRM</h4>
              <p className="text-sm text-gray-600">
                Review results, select leads, and import them directly to your Contacts
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-green-200 bg-green-100 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <div>
              <p className="text-green-900 font-medium mb-1">
                ✅ Backend Connected
              </p>
              <p className="text-xs text-green-800">
                The Lead Finder is now connected to your backend server and fetching REAL business data from Google Places API. Make sure your backend is running on localhost:8000.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
