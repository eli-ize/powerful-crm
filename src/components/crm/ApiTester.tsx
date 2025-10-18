import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Loader2, Search, Phone, Globe, MapPin, Star } from 'lucide-react';
import { api } from '../../utils/api';

interface Place {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  types: string[];
}

export function ApiTester() {
  const [searchQuery, setSearchQuery] = useState('restaurants in New York');
  const [location, setLocation] = useState('New York, NY');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');

  // Test backend connection on component mount
  useEffect(() => {
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      await api.healthCheck();
      setBackendStatus('online');
    } catch (error) {
      // Backend connection failed - show offline status\n      setBackendStatus('offline');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await api.searchPlaces({
        query: searchQuery,
        location: location || undefined,
      });
      
      setPlaces(result.places || []);
      
      if (result.places.length === 0) {
        setError('No places found. Try a different search query.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Search failed');
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = async () => {
    if (places.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const result = await api.bulkImportPlaces({
        searchQuery,
        location: location || undefined,
        maxResults: 10,
      });

      alert(`Successfully imported ${result.count} contacts!`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Backend Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Backend API Status
            <div className={`w-3 h-3 rounded-full ${getStatusColor(backendStatus)}`} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span>
              Status: <Badge variant={backendStatus === 'online' ? 'default' : 'destructive'}>
                {backendStatus.toUpperCase()}
              </Badge>
            </span>
            <Button 
              onClick={testBackendConnection} 
              size="sm" 
              variant="outline"
              disabled={loading}
            >
              Test Connection
            </Button>
          </div>
          {backendStatus === 'offline' && (
            <Alert className="mt-4">
              <AlertDescription>
                Backend API is not responding. Make sure the backend server is running on port 8000.
                Run: <code>cd backend && npm run dev</code>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* API Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Google Places API Integration Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Query</label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., restaurants in Miami"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location (Optional)</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York, NY"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSearch} 
              disabled={loading || backendStatus !== 'online'}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search Places
            </Button>
            
            {places.length > 0 && (
              <Button 
                onClick={handleBulkImport}
                disabled={loading || backendStatus !== 'online'}
                variant="outline"
              >
                Import as Contacts ({places.length})
              </Button>
            )}
          </div>

          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results */}
          {places.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Found {places.length} Places</h3>
              <div className="grid gap-4">
                {places.slice(0, 5).map((place) => (
                  <Card key={place.place_id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-lg">{place.name}</h4>
                          {place.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{place.rating}</span>
                              {place.user_ratings_total && (
                                <span className="text-xs text-gray-500">
                                  ({place.user_ratings_total})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="truncate">{place.formatted_address}</span>
                          </div>
                          
                          {place.formatted_phone_number && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span>{place.formatted_phone_number}</span>
                            </div>
                          )}
                          
                          {place.website && (
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-gray-500" />
                              <a 
                                href={place.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline truncate"
                              >
                                {place.website}
                              </a>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {place.business_status || 'Unknown'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {place.types.slice(0, 3).map((type) => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {places.length > 5 && (
                  <p className="text-center text-gray-500">
                    ... and {places.length - 5} more results
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}