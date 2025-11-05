/**
 * Google Places API Service
 * Real API integration for lead discovery
 */

import axios from 'axios';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place';

export interface PlaceSearchResult {
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
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface GooglePlacesSearchOptions {
  query: string;
  location?: string;
  radius?: number;
  type?: string;
  maxResults?: number;
}

/**
 * Search for businesses using Google Places Text Search
 */
export async function searchPlaces(options: GooglePlacesSearchOptions): Promise<PlaceSearchResult[]> {
  try {
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    const { query, location, radius = 50000, type, maxResults = 20 } = options;

    // Build query string
    let searchQuery = query;
    if (location) {
      searchQuery = `${query} in ${location}`;
    }

    console.log(`🔍 Searching Google Places: "${searchQuery}"`);

    // Text Search API
    const response = await axios.get(`${PLACES_API_BASE}/textsearch/json`, {
      params: {
        query: searchQuery,
        key: GOOGLE_PLACES_API_KEY,
        type: type || undefined,
      },
      timeout: 15000,
    });

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', response.data.status, response.data.error_message);
      throw new Error(`Google Places API error: ${response.data.status}`);
    }

    const results = response.data.results || [];
    console.log(`✅ Found ${results.length} places`);

    // Get detailed information for each place (limited by maxResults)
    const detailedResults: PlaceSearchResult[] = [];
    const limitedResults = results.slice(0, maxResults);

    for (const place of limitedResults) {
      try {
        const details = await getPlaceDetails(place.place_id);
        if (details) {
          detailedResults.push(details);
        }
      } catch (error) {
        console.error(`Failed to get details for place ${place.place_id}:`, error);
        // Include basic info even if details fail
        detailedResults.push({
          place_id: place.place_id,
          name: place.name,
          formatted_address: place.formatted_address || place.vicinity,
          geometry: place.geometry,
          types: place.types,
          rating: place.rating,
          user_ratings_total: place.user_ratings_total,
          business_status: place.business_status,
        });
      }

      // Rate limiting: wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return detailedResults;
  } catch (error: any) {
    console.error('Google Places search error:', error.message);
    throw new Error(`Failed to search places: ${error.message}`);
  }
}

/**
 * Get detailed information about a specific place
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceSearchResult | null> {
  try {
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    const response = await axios.get(`${PLACES_API_BASE}/details/json`, {
      params: {
        place_id: placeId,
        fields: 'place_id,name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,business_status,types,geometry',
        key: GOOGLE_PLACES_API_KEY,
      },
      timeout: 10000,
    });

    if (response.data.status !== 'OK') {
      console.error(`Place details error for ${placeId}:`, response.data.status);
      return null;
    }

    return response.data.result;
  } catch (error: any) {
    console.error(`Failed to get place details for ${placeId}:`, error.message);
    return null;
  }
}

/**
 * Search for businesses by industry in a specific location
 */
export async function findLeadsByIndustry(
  industry: string,
  location: string = 'South Africa',
  maxResults: number = 20
): Promise<PlaceSearchResult[]> {
  console.log(`🎯 Finding leads: ${industry} in ${location}`);

  // Map common industries to Google Places search queries and types
  const industryMap: Record<string, { query: string; type?: string }> = {
    'web design': { query: 'web design agency', type: 'establishment' },
    'web_design': { query: 'web design agency', type: 'establishment' },
    'restaurant': { query: 'restaurant', type: 'restaurant' },
    'restaurants': { query: 'restaurant', type: 'restaurant' },
    'real estate': { query: 'real estate agency', type: 'real_estate_agency' },
    'real_estate': { query: 'real estate agency', type: 'real_estate_agency' },
    'dental': { query: 'dental clinic', type: 'dentist' },
    'dentist': { query: 'dental clinic', type: 'dentist' },
    'law firm': { query: 'law firm', type: 'lawyer' },
    'law_firm': { query: 'law firm', type: 'lawyer' },
    'accounting': { query: 'accounting firm', type: 'accounting' },
    'fitness': { query: 'gym fitness center', type: 'gym' },
    'salon': { query: 'hair salon', type: 'hair_care' },
    'spa': { query: 'spa', type: 'spa' },
    'hotel': { query: 'hotel', type: 'lodging' },
    'cafe': { query: 'cafe coffee shop', type: 'cafe' },
    'bakery': { query: 'bakery', type: 'bakery' },
    'retail': { query: 'retail store', type: 'store' },
    'auto repair': { query: 'auto repair shop', type: 'car_repair' },
    'plumber': { query: 'plumber', type: 'plumber' },
    'electrician': { query: 'electrician', type: 'electrician' },
    'contractor': { query: 'general contractor', type: 'general_contractor' },
    'insurance': { query: 'insurance agency', type: 'insurance_agency' },
  };

  const searchConfig = industryMap[industry.toLowerCase()] || { query: industry };

  const results = await searchPlaces({
    query: searchConfig.query,
    location,
    type: searchConfig.type,
    maxResults,
  });

  return results;
}

/**
 * Convert Google Places result to CRM contact format
 */
export function placeToContact(place: PlaceSearchResult, userId: string) {
  // Extract company name (remove common suffixes)
  const companyName = place.name
    .replace(/\s+(inc|llc|ltd|limited|pty|corp|corporation)\.?$/i, '')
    .trim();

  // Extract location from address
  const addressParts = place.formatted_address.split(',').map(p => p.trim());
  const location = addressParts.slice(-2).join(', '); // Last 2 parts (city, country)

  // Determine industry from place types
  const placeTypes = place.types || [];
  let industry = 'Unknown';
  if (placeTypes.includes('restaurant')) industry = 'Restaurant';
  else if (placeTypes.includes('real_estate_agency')) industry = 'Real Estate';
  else if (placeTypes.includes('dentist')) industry = 'Dental';
  else if (placeTypes.includes('lawyer')) industry = 'Legal';
  else if (placeTypes.includes('accounting')) industry = 'Accounting';
  else if (placeTypes.includes('gym')) industry = 'Fitness';
  else if (placeTypes.some(t => t.includes('salon') || t === 'hair_care')) industry = 'Beauty & Salon';
  else if (placeTypes.includes('spa')) industry = 'Spa & Wellness';
  else if (placeTypes.includes('lodging')) industry = 'Hospitality';
  else if (placeTypes.includes('cafe')) industry = 'Cafe';
  else if (placeTypes.includes('bakery')) industry = 'Bakery';
  else if (placeTypes.includes('store')) industry = 'Retail';
  else if (placeTypes.includes('car_repair')) industry = 'Auto Services';
  else if (placeTypes.includes('plumber')) industry = 'Plumbing';
  else if (placeTypes.includes('electrician')) industry = 'Electrical';
  else if (placeTypes.includes('general_contractor')) industry = 'Construction';
  else if (placeTypes.includes('insurance_agency')) industry = 'Insurance';

  return {
    firstName: '',
    lastName: companyName,
    company: companyName,
    phone: place.formatted_phone_number || place.international_phone_number || null,
    website: place.website || null,
    location,
    industry,
    source: 'Google Places API',
    status: 'NEW',
    score: place.rating ? Math.round(place.rating * 20) : 50, // Convert 5-star to 100-point scale
    tags: placeTypes.join(','),
    customFields: JSON.stringify({
      placeId: place.place_id,
      googleRating: place.rating,
      totalReviews: place.user_ratings_total,
      businessStatus: place.business_status,
      address: place.formatted_address,
      coordinates: place.geometry?.location,
    }),
    createdBy: userId,
  };
}

export const googlePlacesService = {
  searchPlaces,
  getPlaceDetails,
  findLeadsByIndustry,
  placeToContact,
};
