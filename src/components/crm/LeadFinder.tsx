import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Combobox } from '../ui/combobox';
import { Search, MapPin, Building, Phone, Globe, Star, Plus, CheckCircle, Loader2, EyeOff, Eye, Download, ChevronLeft, ChevronRight, Filter, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../utils/api';
import { SOUTH_AFRICAN_CITIES } from '../../data/southAfricanCities';
import { BUSINESS_CATEGORIES } from '../../data/businessCategories';
import { LeadScoreBadge, calculateLeadScore } from '../lead/LeadScoreBadge';

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
  leadScore?: number;
}

interface SavedContact {
  placeId: string;
  company: string;
  savedAt: string;
}

interface LeadFinderProps {
  onNavigate?: (view: string) => void;
  onContactSaved?: () => void;
}

export function LeadFinder({ onNavigate, onContactSaved }: LeadFinderProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('johannesburg');
  const [selectedCategory, setSelectedCategory] = useState('restaurant');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Place[]>([]);
  
  // Filter state
  const [minRating, setMinRating] = useState<string>('0');
  const [minReviews, setMinReviews] = useState<string>('0');
  const [hasPhone, setHasPhone] = useState(false);
  const [hasWebsite, setHasWebsite] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Sort state
  const [sortBy, setSortBy] = useState<string>('relevance');
  
  // UI state
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
  const [savedContacts, setSavedContacts] = useState<SavedContact[]>([]);
  const [hideImported, setHideImported] = useState(true);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [searchProgress, setSearchProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);

  // Load saved contacts from database (not localStorage)
  useEffect(() => {
    const loadSavedContacts = async () => {
      try {
        const response = await api.getContacts();
        if (response.success && response.data) {
          // Extract place IDs from contacts that have them in customFields
          const savedFromDB = response.data
            .filter((contact: any) => contact.customFields?.placeId)
            .map((contact: any) => ({
              placeId: contact.customFields.placeId,
              company: contact.company || contact.firstName + ' ' + contact.lastName,
              savedAt: contact.createdAt || new Date().toISOString(),
            }));
          setSavedContacts(savedFromDB);
        }
      } catch (error) {
        console.error('Failed to load saved contacts:', error);
        // Fallback to localStorage for offline support
        const saved = localStorage.getItem('crm_saved_place_ids');
        if (saved) {
          setSavedContacts(JSON.parse(saved));
        }
      }
    };
    
    loadSavedContacts();
  }, []);

  const isContactSaved = (placeId: string) => {
    return savedContacts.some(c => c.placeId === placeId);
  };

  const handleSearch = async () => {
    // Build search query from city and category
    const cityLabel = SOUTH_AFRICAN_CITIES.find(c => c.value === selectedCity)?.label || 'South Africa';
    const categoryData = BUSINESS_CATEGORIES.find(c => c.value === selectedCategory);
    const categoryLabel = categoryData?.label || searchQuery;
    
    const fullQuery = searchQuery || `${categoryLabel} in ${cityLabel}`;
    
    if (!fullQuery) {
      toast.error('Please enter a search query or select a category');
      return;
    }

    setIsSearching(true);
    setSearchProgress(0);
    setResults([]);

    try {
      setSearchProgress(20);
      
      toast.info('🔍 Searching Google Places...', {
        description: `Finding ${categoryLabel} in ${cityLabel}`,
      });

      setSearchProgress(40);


      
      const response = await api.searchPlaces({
        query: fullQuery,
        // No maxResults limit - truly unlimited search
      });

      setSearchProgress(80);

      if (response.places && response.places.length > 0) {
        // Calculate lead scores for each place
        const placesWithScores = response.places.map(place => ({
          ...place,
          leadScore: calculateLeadScore(place),
        }));
        
        setResults(placesWithScores);
        setSearchProgress(100);
        toast.success(`🎉 Found ${response.places.length} businesses!`, {
          description: `Search: "${fullQuery}" - ${hideImported ? 'Already-imported contacts are hidden' : 'Showing all results'}`,
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
        email: place.website ? `contact@${new URL(place.website).hostname}` : `contact@${place.name.toLowerCase().replaceAll(/[^a-z0-9]/g, '')}.com`,
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
        // Add to local state immediately for UI responsiveness
        const newSaved: SavedContact = {
          placeId: place.place_id,
          company: place.name,
          savedAt: new Date().toISOString(),
        };

        const updated = [...savedContacts, newSaved];
        setSavedContacts(updated);
        
        // Also save to localStorage as backup
        localStorage.setItem('crm_saved_place_ids', JSON.stringify(updated));

        toast.success(`✅ ${place.name} saved to CRM!`);
        
        // Notify parent component about the new contact
        onContactSaved?.();
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

    if (selectedPlaces.size === 0) {
      toast.warning('Please select contacts to import');
      return;
    }

    if (placesToSave.length === 0) {
      toast.warning('All selected contacts have already been imported');
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

  // Apply filters
  let filteredAndSortedResults = filteredResults.filter(place => {
    // Rating filter
    if (minRating !== '0' && (!place.rating || place.rating < Number.parseFloat(minRating))) {
      return false;
    }
    
    // Reviews filter
    if (minReviews !== '0' && (!place.user_ratings_total || place.user_ratings_total < Number.parseInt(minReviews))) {
      return false;
    }
    
    // Phone filter
    if (hasPhone && !place.formatted_phone_number && !place.phone) {
      return false;
    }
    
    // Website filter
    if (hasWebsite && !place.website) {
      return false;
    }
    
    return true;
  });

  // Apply sorting
  filteredAndSortedResults = [...filteredAndSortedResults].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'reviews':
        return (b.user_ratings_total || 0) - (a.user_ratings_total || 0);
      case 'score':
        return (b.leadScore || 0) - (a.leadScore || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0; // relevance (original order)
    }
  });

  // Pagination calculations
  const totalResults = filteredAndSortedResults.length;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const paginatedResults = filteredAndSortedResults.slice(startIndex, endIndex);

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
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Search Businesses</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* City Selector */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4" />
                City / Location *
              </Label>
              <Combobox
                options={SOUTH_AFRICAN_CITIES.map(city => ({
                  value: city.value,
                  label: city.label,
                  icon: city.popular ? '⭐' : undefined,
                }))}
                value={selectedCity}
                onValueChange={setSelectedCity}
                placeholder="🏙️ Select city or search..."
                searchPlaceholder="Type to search cities..."
              />
            </div>

            {/* Category Selector */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4" />
                Business Category *
              </Label>
              <Combobox
                options={BUSINESS_CATEGORIES.map(cat => ({
                  value: cat.value,
                  label: cat.label,
                  icon: cat.icon,
                }))}
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                placeholder="🏢 Select business type..."
                searchPlaceholder="Type to search categories..."
              />
            </div>

            {/* Custom Search Query */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4" />
                Custom Search (Optional)
              </Label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. 'luxury hotels' or leave blank"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t pt-4 mt-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Rating Filter */}
                <div>
                  <Label className="text-sm">Minimum Rating</Label>
                  <Select value={minRating} onValueChange={setMinRating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any Rating</SelectItem>
                      <SelectItem value="3.0">⭐ 3.0+</SelectItem>
                      <SelectItem value="3.5">⭐ 3.5+</SelectItem>
                      <SelectItem value="4.0">⭐ 4.0+</SelectItem>
                      <SelectItem value="4.5">⭐ 4.5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reviews Filter */}
                <div>
                  <Label className="text-sm">Minimum Reviews</Label>
                  <Select value={minReviews} onValueChange={setMinReviews}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any</SelectItem>
                      <SelectItem value="10">10+ reviews</SelectItem>
                      <SelectItem value="50">50+ reviews</SelectItem>
                      <SelectItem value="100">100+ reviews</SelectItem>
                      <SelectItem value="500">500+ reviews</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Contact Info Filters */}
                <div className="flex flex-col gap-3">
                  <Label className="text-sm">Contact Info</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasPhone"
                      checked={hasPhone}
                      onCheckedChange={(checked: boolean) => setHasPhone(checked)}
                    />
                    <label htmlFor="hasPhone" className="text-sm">
                      <Phone className="inline h-3 w-3 mr-1" />
                      Has Phone
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasWebsite"
                      checked={hasWebsite}
                      onCheckedChange={(checked: boolean) => setHasWebsite(checked)}
                    />
                    <label htmlFor="hasWebsite" className="text-sm">
                      <Globe className="inline h-3 w-3 mr-1" />
                      Has Website
                    </label>
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <Label className="text-sm">Sort Results By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="score">Lead Score (High to Low)</SelectItem>
                      <SelectItem value="rating">Rating (High to Low)</SelectItem>
                      <SelectItem value="reviews">Most Reviews</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t">
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
              <p className="text-sm text-gray-600 text-center">
                {searchProgress < 50 
                  ? "🔍 Searching Google Places..." 
                  : searchProgress < 90 
                  ? "📊 Processing business data..." 
                  : "✨ Finalizing results..."}
                {" "}{searchProgress}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {filteredAndSortedResults.length > 0 && (
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
                  {selectedPlaces.size === filteredAndSortedResults.length ? 'Deselect All' : 'Select All'}
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
                const leadScore = place.leadScore || calculateLeadScore(place);

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
                              <h4 className="font-semibold text-lg">{place.name}</h4>
                              <LeadScoreBadge score={leadScore} size="sm" />
                              {isSaved && (
                                <Badge className="bg-green-600">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  In CRM
                                </Badge>
                              )}
                              {place.rating && (
                                <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                                  <Star className="mr-1 h-3 w-3 fill-yellow-400" />
                                  {place.rating.toFixed(1)} ({place.user_ratings_total || 0})
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
                                  {place.types.slice(0, 2).map(t => t.replace(/_/g, ' ')).join(', ')}
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

      {/* Recent Saves Section */}
      {savedContacts.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Recently Saved to CRM ({savedContacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {savedContacts.slice(-5).reverse().map((contact) => (
                <div
                  key={contact.placeId}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-green-900">{contact.company}</p>
                    <p className="text-sm text-green-700">
                      Saved {new Date(contact.savedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-green-600">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                </div>
              ))}
              {savedContacts.length > 5 && (
                <p className="text-sm text-gray-600 text-center pt-2">
                  And {savedContacts.length - 5} more contacts saved...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!isSearching && results.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center">
            <Search className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">Ready to Find Leads!</h4>
            <p className="text-gray-600 mb-6">
              Search for <strong>unlimited businesses</strong> in South Africa and save them to your CRM with one click
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

export default LeadFinder;
