/**
 * Smart API Key Input Component
 * Auto-validates, tests, and discovers resources when user enters API key
 */

import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Sparkles,
  Phone,
  Link
} from 'lucide-react';
import { useServiceApiKey } from '../../hooks/useApiKeys';
import { UnifiedConfig } from '../../services/apiKeyManager';
import { toast } from 'sonner';

interface SmartApiKeyInputProps {
  service: keyof UnifiedConfig;
  label: string;
  description?: string;
  placeholder?: string;
  onSaveSuccess?: (resources: any) => void;
}

export function SmartApiKeyInput({
  service,
  label,
  description,
  placeholder,
  onSaveSuccess,
}: SmartApiKeyInputProps) {
  const {
    apiKey: savedKey,
    hasApiKey,
    isValidated,
    serviceConfig,
    loading: hookLoading,
    error: hookError,
    saveApiKey,
    removeApiKey,
  } = useServiceApiKey(service);

  const [inputValue, setInputValue] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<'idle' | 'validating' | 'discovering' | 'done'>('idle');
  const [resources, setResources] = useState<any>(null);
  const [selectedResource, setSelectedResource] = useState<any>(null);

  // Load saved key on mount
  useEffect(() => {
    if (savedKey) {
      setInputValue(savedKey);
      setStatus('done');
      if (serviceConfig?.resources) {
        setResources(serviceConfig.resources);
      }
    }
  }, [savedKey, serviceConfig]);

  const handleKeyChange = async (value: string) => {
    setInputValue(value);
    setStatus('idle');
    setResources(null);
    setSelectedResource(null);

    // Auto-validate when key looks complete
    if (isKeyLikelyComplete(service, value)) {
      await handleAutoValidate(value);
    }
  };

  const isKeyLikelyComplete = (svc: string, key: string): boolean => {
    const minLengths: Record<string, number> = {
      telnyx: 40,
      googlePlaces: 39,
      hunter: 40,
      apollo: 20,
      clearbit: 35,
    };
    return key.length >= (minLengths[svc] || 20);
  };

  const handleAutoValidate = async (key: string) => {
    setStatus('validating');
    
    const result = await saveApiKey(key);
    
    if (result.success) {
      setStatus('discovering');
      
      if (result.resources) {
        setResources(result.resources);
        
        // Show success with resource count
        const resourceCount = getResourceCount(result.resources);
        toast.success('API key validated!', {
          description: resourceCount > 0 
            ? `Found ${resourceCount} resource${resourceCount !== 1 ? 's' : ''}` 
            : 'Key is valid and ready to use',
        });
      }
      
      setStatus('done');
      onSaveSuccess?.(result.resources);
    } else {
      setStatus('idle');
      toast.error('Invalid API key', {
        description: result.error || 'Please check your API key and try again',
      });
    }
  };

  const getResourceCount = (res: any): number => {
    if (!res) return 0;
    return (res.phoneNumbers?.length || 0) + (res.connections?.length || 0);
  };

  const handleManualSave = async () => {
    if (!inputValue) {
      toast.error('Please enter an API key');
      return;
    }

    setStatus('validating');
    await handleAutoValidate(inputValue);
  };

  const handleRemove = () => {
    removeApiKey();
    setInputValue('');
    setStatus('idle');
    setResources(null);
    setSelectedResource(null);
    toast.success('API key removed');
  };

  const handleResourceSelect = (resource: any) => {
    setSelectedResource(resource);
    toast.success('Resource selected', {
      description: `Using ${resource.name || resource.phoneNumber}`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            {label}
            {hasApiKey && isValidated && (
              <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Validated
              </Badge>
            )}
          </Label>
          
          {hasApiKey && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-red-600 hover:text-red-700 h-auto p-1"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Remove
            </Button>
          )}
        </div>

        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showKey ? 'text' : 'password'}
              value={inputValue}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder={placeholder || 'Enter API key...'}
              className="pr-10"
              disabled={status === 'validating' || status === 'discovering'}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowKey(!showKey)}
              type="button"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>

          <Button
            onClick={handleManualSave}
            disabled={!inputValue || status === 'validating' || status === 'discovering'}
            className="min-w-[100px]"
          >
            {status === 'validating' || status === 'discovering' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {status === 'validating' ? 'Testing...' : 'Finding...'}
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {status === 'validating' && (
        <Alert className="border-blue-200 bg-blue-50">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription className="text-blue-900">
            Validating API key...
          </AlertDescription>
        </Alert>
      )}

      {status === 'discovering' && (
        <Alert className="border-blue-200 bg-blue-50">
          <Sparkles className="h-4 w-4" />
          <AlertDescription className="text-blue-900">
            Discovering available resources...
          </AlertDescription>
        </Alert>
      )}

      {hookError && status === 'idle' && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-900">
            {hookError}
          </AlertDescription>
        </Alert>
      )}

      {/* Auto-Discovered Resources */}
      {resources && status === 'done' && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-green-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Auto-Discovered Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Phone Numbers */}
            {resources.phoneNumbers && resources.phoneNumbers.length > 0 && (
              <div>
                <p className="text-sm font-medium text-green-900 mb-2 flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  Phone Numbers ({resources.phoneNumbers.length})
                </p>
                <div className="space-y-1">
                  {resources.phoneNumbers.map((number: any) => (
                    <button
                      key={number.id}
                      onClick={() => handleResourceSelect(number)}
                      className={`w-full text-left p-2 rounded border text-sm transition-colors ${
                        selectedResource?.id === number.id
                          ? 'bg-green-600 text-white border-green-700'
                          : 'bg-white text-gray-900 border-gray-300 hover:border-green-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono">{number.phoneNumber}</span>
                        <Badge
                          variant={number.status === 'active' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {number.status}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Connections */}
            {resources.connections && resources.connections.length > 0 && (
              <div>
                <p className="text-sm font-medium text-green-900 mb-2 flex items-center gap-1">
                  <Link className="h-3.5 w-3.5" />
                  Connections ({resources.connections.length})
                </p>
                <div className="space-y-1">
                  {resources.connections.map((conn: any) => (
                    <button
                      key={conn.id}
                      onClick={() => handleResourceSelect(conn)}
                      className={`w-full text-left p-2 rounded border text-sm transition-colors ${
                        selectedResource?.id === conn.id
                          ? 'bg-green-600 text-white border-green-700'
                          : 'bg-white text-gray-900 border-gray-300 hover:border-green-500'
                      }`}
                    >
                      <div className="font-medium">{conn.name}</div>
                      {conn.webhookUrl && (
                        <div className="text-xs opacity-75 truncate mt-1">
                          {conn.webhookUrl}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {getResourceCount(resources) === 0 && (
              <p className="text-sm text-green-800">
                API key validated successfully! No additional resources found.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
