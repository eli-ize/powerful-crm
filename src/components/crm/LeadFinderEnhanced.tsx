import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, MapPin, Building, Phone, Globe, Star, Plus, CheckCircle, Loader2, EyeOff, Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../utils/api';

interface Place {
  place_id: string;
  name: string;
  formatted_address?: string;
  address?: string;
  formatted_phone_number?: string;
  phone?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  types?: string[];
}

interface SavedContact {
  placeId: string;
  company: string;
  savedAt: string;
}

interface LeadFinderProps {
  onNavigate?: (view: string) => void;
}

export function LeadFinderEnhanced({ onNavigate }: LeadFinderProps) {
  const [searchQuery, setSearchQuery] = useState('software companies Johannesburg');
  const [location, setLocation] = useState('South Africa');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Place[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
  const [savedContacts, setSavedContacts] = useState<SavedContact[]>([]);
  const [hideImported, setHideImported] = useState(true);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [searchProgress, setSearchProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);

  // Load saved contacts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('crm_saved_place_ids');
    if (saved) {
      setSavedContacts(JSON.parse(saved));
    }
  }, []);

  const isContactSaved = (placeId: string) => {
    return savedContacts.some(c => c.placeId === placeId);
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setSearchProgress(0);
    setResults([]);

    try {
      setSearchProgress(20);
      
      const fullQuery = location ? `${searchQuery} ${location}` : searchQuery;
      
      toast.info('🔍 Searching Google Places...', {
        description: 'Fetching unlimited results from South Africa',
      });

      setSearchProgress(40);

      const response = await api.searchPlaces({
        query: fullQuery,
        maxResults: 200,
      });

      setSearchProgress(80);

      if (response.places && response.places.length > 0) {
        setResults(response.places);
        setSearchProgress(100);
        toast.success(`Found ${response.places.length} businesses!`, {
          description: hideImported ? 'Already-imported contacts are hidden' : 'Showing all results',
        });
      } else {
        toast.warning('No results found', {
          description: 'Try adjusting your search query or location',
        });
      }
    } catch (error) {
      toast.error('Search failed', {
        description: error instanceof Error ? error.message : 'Backend may not be running',
      });
    } finally {
      setIsSearching(false);
      setSearchProgress(0);
    }
  };

  const handleSaveContact = async (place: Place) => {
    setSavingIds(prev => new Set(prev).add(place.place_id));

    try {
      // Convert place to contact format
      const contact = {
        company: place.name,
        email: place.website ? `contact@${new URL(place.website).hostname}` : `contact@${place.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        phone: place.formatted_phone_number || '',
        website: place.website || '',
        location: place.formatted_address,
        source: 'Google Places - Lead Finder',
        status: 'new',
        customFields: {
          placeId: place.place_id,
          rating: place.rating,
          totalRatings: place.user_ratings_total,
          businessStatus: place.business_status,
          types: place.types,
        },
      };

      const response = await api.createContact(contact);

      if (response.success) {
        // Save to localStorage
        const newSaved: SavedContact = {
          placeId: place.place_id,
          company: place.name,
          savedAt: new Date().toISOString(),
        };

        const updated = [...savedContacts, newSaved];
        setSavedContacts(updated);
        localStorage.setItem('crm_saved_place_ids', JSON.stringify(updated));

        toast.success(`✅ ${place.name} saved to CRM!`);
      } else {
        throw new Error(response.error || 'Failed to save');
      }
    } catch (error) {
      toast.error('Failed to save contact', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(place.place_id);
        return next;
      });
    }
  };

  const handleBulkSave = async () => {
    const placesToSave = results.filter(p => 
      selectedPlaces.has(p.place_id) && !isContactSaved(p.place_id)
    );

    if (placesToSave.length === 0) {
      toast.warning('No new contacts selected');
      return;
    }

    toast.info(`Saving ${placesToSave.length} contacts...`);

    for (const place of placesToSave) {
      await handleSaveContact(place);
      await new Promise(resolve => setTimeout(resolve, 300)); // Rate limit
    }

    setSelectedPlaces(new Set());
    toast.success(`🎉 Saved ${placesToSave.length} contacts to CRM!`);
  };

  const toggleSelection = (placeId: string) => {
    const next = new Set(selectedPlaces);
    if (next.has(placeId)) {
      next.delete(placeId);
    } else {
      next.add(placeId);
    }
    setSelectedPlaces(next);
  };

  const toggleSelectAll = () => {
    if (selectedPlaces.size === filteredResults.length) {
      setSelectedPlaces(new Set());
    } else {
      setSelectedPlaces(new Set(filteredResults.map(r => r.place_id)));
    }
  };

  const filteredResults = hideImported 
    ? results.filter(r => !isContactSaved(r.place_id))
    : results;

  // Pagination calculations
  const totalResults = filteredResults.length;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const paginatedResults = filteredResults.slice(startIndex, endIndex);

  // Reset to page 1 when search results change
  useEffect(() => {
    setCurrentPage(1);
  }, [results, hideImported]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="page-header-responsive">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">🔍 Lead Finder</h2>
          <p className="text-sm text-gray-600">Find unlimited businesses in South Africa and save to CRM with one click</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          Unlimited Results
        </Badge>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Businesses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Search Query *</Label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. software companies, restaurants, lawyers"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Johannesburg, Cape Town, South Africa"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hideImported"
                  checked={hideImported}
                  onCheckedChange={(checked: boolean) => setHideImported(checked)}
                />
                <label htmlFor="hideImported" className="text-sm font-medium">
                  {hideImported ? <EyeOff className="inline h-4 w-4 mr-1" /> : <Eye className="inline h-4 w-4 mr-1" />}
                  Hide imported ({savedContacts.length})
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">Results per page:</Label>
                <Select value={resultsPerPage.toString()} onValueChange={(value: string) => setResultsPerPage(Number(value))}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSearch} disabled={isSearching} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find Leads
                </>
              )}
            </Button>
          </div>

          {isSearching && searchProgress > 0 && (
            <div className="space-y-2">
              <Progress value={searchProgress} className="h-2" />
              <p className="text-sm text-gray-600 text-center">Fetching businesses... {searchProgress}%</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {filteredResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {totalResults} Businesses Found
                  {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {startIndex + 1}-{Math.min(endIndex, totalResults)} of {totalResults} results • 
                  {selectedPlaces.size} selected • {savedContacts.length} already in CRM
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                  {selectedPlaces.size === filteredResults.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button 
                  onClick={handleBulkSave} 
                  disabled={selectedPlaces.size === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Save {selectedPlaces.size} to CRM
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paginatedResults.map((place) => {
                const isSaved = isContactSaved(place.place_id);
                const isSaving = savingIds.has(place.place_id);
                const isSelected = selectedPlaces.has(place.place_id);

                return (
                  <Card key={place.place_id} className={`${isSaved ? 'bg-green-50 border-green-200' : ''} ${isSelected ? 'border-blue-500 border-2' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelection(place.place_id)}
                            disabled={isSaved}
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold">{place.name}</h4>
                              {isSaved && (
                                <Badge className="bg-green-600">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  In CRM
                                </Badge>
                              )}
                              {place.rating && (
                                <Badge variant="outline" className="text-yellow-600">
                                  <Star className="mr-1 h-3 w-3 fill-yellow-400" />
                                  {place.rating} ({place.user_ratings_total || 0})
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              {place.formatted_address && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{place.formatted_address}</span>
                                </div>
                              )}
                              {place.formatted_phone_number && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Phone className="h-4 w-4 flex-shrink-0" />
                                  {place.formatted_phone_number}
                                </div>
                              )}
                              {place.website && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Globe className="h-4 w-4 flex-shrink-0" />
                                  <a href={place.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                                    {place.website}
                                  </a>
                                </div>
                              )}
                              {place.types && place.types.length > 0 && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Building className="h-4 w-4 flex-shrink-0" />
                                  {place.types.slice(0, 2).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleSaveContact(place)}
                          disabled={isSaved || isSaving}
                          className={isSaved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : isSaved ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Saved
                            </>
                          ) : (
                            <>
                              <Plus className="mr-2 h-4 w-4" />
                              Save
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({totalResults} total results)
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {currentPage > 2 && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => goToPage(1)}>
                          1
                        </Button>
                        {currentPage > 3 && <span className="px-2 py-1">...</span>}
                      </>
                    )}

                    {currentPage > 1 && (
                      <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)}>
                        {currentPage - 1}
                      </Button>
                    )}

                    <Button variant="default" size="sm" className="bg-blue-600">
                      {currentPage}
                    </Button>

                    {currentPage < totalPages && (
                      <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)}>
                        {currentPage + 1}
                      </Button>
                    )}

                    {currentPage < totalPages - 1 && (
                      <>
                        {currentPage < totalPages - 2 && <span className="px-2 py-1">...</span>}
                        <Button variant="outline" size="sm" onClick={() => goToPage(totalPages)}>
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!isSearching && results.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center">
            <Search className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">Ready to Find Leads!</h4>
            <p className="text-gray-600 mb-6">
              Search for unlimited businesses in South Africa and save them to your CRM with one click
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
              <p className="text-sm font-medium text-blue-900 mb-2">💡 Search Examples:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• "software companies Johannesburg"</li>
                <li>• "restaurants Cape Town"</li>
                <li>• "law firms Pretoria"</li>
                <li>• "accounting firms Durban"</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default LeadFinderEnhanced;
