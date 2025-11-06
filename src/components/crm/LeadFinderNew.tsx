import { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Globe, Star, Check, Loader2, Filter, ChevronDown, Building2, TrendingUp, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface Place {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  types?: string[];
}

interface SavedContact {
  id: string;
  placeId: string;
  company: string;
}

export default function LeadFinderNew() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [savedContacts, setSavedContacts] = useState<SavedContact[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'rating'>('rating');
  
  // Filters
  const [phoneRequired, setPhoneRequired] = useState(false);
  const [websiteRequired, setWebsiteRequired] = useState(false);
  const [minRating, setMinRating] = useState(0);

  // Load saved contacts
  useEffect(() => {
    loadSavedContacts();
  }, []);

  const loadSavedContacts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/contacts');
      const data = await response.json();
      if (data.success && data.data) {
        setSavedContacts(data.data.filter((c: any) => c.placeId));
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const isContactSaved = (placeId: string) => {
    return savedContacts.some(c => c.placeId === placeId);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setResults([]);
    setSelectedPlaces(new Set());

    try {
      const response = await fetch(
        `http://localhost:8000/api/places/search?query=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setResults(data.data);
        toast.success(`Found ${data.data.length} businesses`);
      } else {
        toast.error('Search failed');
      }
    } catch (error) {
      toast.error('Search failed');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveContact = async (place: Place) => {
    if (isContactSaved(place.place_id)) {
      toast.info(`${place.name} is already in your CRM`);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId: place.place_id,
          company: place.name,
          address: place.formatted_address,
          phone: place.formatted_phone_number || place.international_phone_number,
          website: place.website,
          createdBy: localStorage.getItem('userId') || 'a11f9e24-8631-46b5-bdb8-b5cfcb973140',
          customFields: {
            rating: place.rating,
            totalRatings: place.user_ratings_total,
            businessStatus: place.business_status,
            types: place.types,
          },
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        toast.error('This business is already in your CRM');
        return;
      }

      if (data.success) {
        toast.success(`${place.name} added to CRM`);
        await loadSavedContacts();
      } else {
        toast.error('Failed to save contact');
      }
    } catch (error) {
      toast.error('Failed to save contact');
      console.error('Save error:', error);
    }
  };

  const handleBulkSave = async () => {
    const selectedResults = results.filter(r => selectedPlaces.has(r.place_id));
    let successCount = 0;

    for (const place of selectedResults) {
      if (!isContactSaved(place.place_id)) {
        try {
          const response = await fetch('http://localhost:8000/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              placeId: place.place_id,
              company: place.name,
              address: place.formatted_address,
              phone: place.formatted_phone_number || place.international_phone_number,
              website: place.website,
              createdBy: localStorage.getItem('userId') || 'a11f9e24-8631-46b5-bdb8-b5cfcb973140',
              customFields: {
                rating: place.rating,
                totalRatings: place.user_ratings_total,
                businessStatus: place.business_status,
                types: place.types,
              },
            }),
          });

          const data = await response.json();
          if (data.success || response.status === 409) {
            successCount++;
          }
        } catch (error) {
          console.error(`Failed to save ${place.name}:`, error);
        }
      }
    }

    setSelectedPlaces(new Set());
    await loadSavedContacts();
    toast.success(`Imported ${successCount} contacts to CRM`);
  };

  // Apply filters and sort
  const filteredResults = results
    .filter(place => {
      if (phoneRequired && !place.formatted_phone_number && !place.international_phone_number) {
        return false;
      }
      if (websiteRequired && !place.website) {
        return false;
      }
      if (minRating > 0 && (!place.rating || place.rating < minRating)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return a.name.localeCompare(b.name);
    });

  const toggleSelectAll = () => {
    if (selectedPlaces.size === filteredResults.length && filteredResults.length > 0) {
      setSelectedPlaces(new Set());
    } else {
      setSelectedPlaces(new Set(filteredResults.map(r => r.place_id)));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Hero Search Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Find New Leads</h1>
              <p className="text-gray-600">Search Google Places for businesses across South Africa and import them directly into your CRM</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isSearching && handleSearch()}
                  placeholder="e.g., Restaurants in Johannesburg, Plumbers in Cape Town, Coffee shops in Durban..."
                  className="w-full h-14 pl-12 pr-4 text-base rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-gray-900 placeholder-gray-400 font-medium"
                  disabled={isSearching}
                />
              </div>
              
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="h-14 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 min-w-[160px] justify-center"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span>Find Leads</span>
                  </>
                )}
              </button>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>{showFilters ? 'Hide' : 'Show'} Advanced Filters</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Filters Panel */}
            {showFilters && (
              <div className="p-5 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={phoneRequired}
                        onChange={(e) => setPhoneRequired(e.target.checked)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Phone number required</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={websiteRequired}
                        onChange={(e) => setWebsiteRequired(e.target.checked)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Website required</span>
                  </label>

                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Min Rating:</label>
                    <select
                      value={minRating}
                      onChange={(e) => setMinRating(Number(e.target.value))}
                      className="flex-1 h-10 px-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none text-sm font-medium text-gray-700"
                    >
                      <option value={0}>Any Rating</option>
                      <option value={3}>3+ Stars</option>
                      <option value={4}>4+ Stars</option>
                      <option value={4.5}>4.5+ Stars</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {filteredResults.length > 0 && (
          <div className="space-y-4">
            {/* Results Header */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-bold text-blue-900">{filteredResults.length} businesses found</span>
                  </div>
                  
                  {selectedPlaces.size > 0 && (
                    <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <span className="text-sm font-bold text-green-900">{selectedPlaces.size} selected</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-600">Sort:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'name' | 'rating')}
                      className="h-9 px-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none text-sm font-medium text-gray-700"
                    >
                      <option value="rating">Highest Rated</option>
                      <option value="name">Name (A-Z)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={toggleSelectAll}
                    className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                  >
                    {selectedPlaces.size === filteredResults.length && filteredResults.length > 0 ? '✓ Deselect All' : 'Select All'}
                  </button>

                  {selectedPlaces.size > 0 && (
                    <button
                      onClick={handleBulkSave}
                      className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Import {selectedPlaces.size} Contact{selectedPlaces.size !== 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Business Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredResults.map((place) => {
                const isSaved = isContactSaved(place.place_id);
                const isSelected = selectedPlaces.has(place.place_id);

                return (
                  <div
                    key={place.place_id}
                    className={`group relative bg-white rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                      isSelected
                        ? 'border-blue-500 shadow-lg shadow-blue-100'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    {/* Selection Checkbox */}
                    <div className="absolute top-4 right-4 z-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newSelected = new Set(selectedPlaces);
                          if (e.target.checked) {
                            newSelected.add(place.place_id);
                          } else {
                            newSelected.delete(place.place_id);
                          }
                          setSelectedPlaces(newSelected);
                        }}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                      />
                    </div>

                    {/* Card Content */}
                    <div className="p-6 pr-12">
                      {/* Business Name */}
                      <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {place.name}
                      </h3>

                      {/* Rating */}
                      {place.rating && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-bold text-amber-900">{place.rating}</span>
                          </div>
                          {place.user_ratings_total && (
                            <span className="text-sm text-gray-500 font-medium">
                              ({place.user_ratings_total.toLocaleString()} reviews)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Contact Details */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 line-clamp-2">{place.formatted_address}</span>
                        </div>

                        {(place.formatted_phone_number || place.international_phone_number) && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-900 font-medium">
                              {place.formatted_phone_number || place.international_phone_number}
                            </span>
                          </div>
                        )}

                        {place.website && (
                          <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <a
                              href={place.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-700 hover:underline truncate font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {place.website.replace(/^https?:\/\/(www\.)?/, '')}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleSaveContact(place)}
                        disabled={isSaved}
                        className={`w-full py-3 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                          isSaved
                            ? 'bg-green-600 text-white cursor-default shadow-md'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span>In CRM</span>
                          </>
                        ) : (
                          <>
                            <span>+ Add to CRM</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State - No Search Yet */}
        {!isSearching && results.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Search className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Start Your Lead Search
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
              Enter a search query above to discover businesses. Try searching for <span className="font-semibold text-gray-900">"Restaurants in Johannesburg"</span> or <span className="font-semibold text-gray-900">"Coffee shops in Cape Town"</span>
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Google Places API Active</span>
            </div>
          </div>
        )}

        {/* Empty State - No Results After Filter */}
        {!isSearching && results.length > 0 && filteredResults.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 via-amber-50 to-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Filter className="h-12 w-12 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Results Match Your Filters
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              We found {results.length} businesses, but none match your current filter criteria. Try adjusting your filters.
            </p>
            <button
              onClick={() => {
                setPhoneRequired(false);
                setWebsiteRequired(false);
                setMinRating(0);
              }}
              className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
