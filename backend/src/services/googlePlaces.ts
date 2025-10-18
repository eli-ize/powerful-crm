import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  types: string[];
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
}

interface PlacesSearchRequest {
  query: string;
  location?: string;
  radius?: number;
  type?: string;
  minRating?: number;
  openNow?: boolean;
}

interface PlacesSearchResponse {
  results: PlaceResult[];
  status: string;
  next_page_token?: string;
  error_message?: string;
}

export class GooglePlacesService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';

  constructor() {
    this.apiKey = config.googlePlacesApiKey;
    if (!this.apiKey) {
      logger.warn('Google Places API key not configured');
    }
  }

  async searchPlaces(params: PlacesSearchRequest): Promise<PlacesSearchResponse> {
    if (!this.apiKey) {
      throw new Error('Google Places API key not configured');
    }

    try {
      const searchParams = new URLSearchParams({
        query: params.query,
        key: this.apiKey,
      });

      if (params.location) {
        searchParams.append('location', params.location);
      }

      if (params.radius) {
        searchParams.append('radius', params.radius.toString());
      }

      if (params.type) {
        searchParams.append('type', params.type);
      }

      if (params.openNow) {
        searchParams.append('opennow', 'true');
      }

      const url = `${this.baseUrl}/textsearch/json?${searchParams.toString()}`;
      
      logger.info(`Searching Google Places: ${params.query}`);
      
      const response = await axios.get(url, {
        timeout: 15000, // 15 seconds
        headers: {
          'User-Agent': 'Powerful-CRM/1.0',
        },
      });

      let allResults: PlaceResult[] = [];
      let data = response.data as PlacesSearchResponse;
      
      // Get first page
      if (data.results) {
        allResults = [...data.results];
      }

      // Get additional pages if available (up to 3 pages = ~60 results)
      let nextPageToken = data.next_page_token;
      let pageCount = 1;
      
      while (nextPageToken && pageCount < 10) { // Get up to 10 pages (~200 results)
        // Wait 2 seconds before next page request (Google requirement)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const nextPageUrl = `${this.baseUrl}/textsearch/json?pagetoken=${nextPageToken}&key=${this.apiKey}`;
        const nextResponse = await axios.get(nextPageUrl, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Powerful-CRM/1.0',
          },
        });
        
        const nextData = nextResponse.data as PlacesSearchResponse;
        if (nextData.results) {
          allResults = [...allResults, ...nextData.results];
        }
        
        nextPageToken = nextData.next_page_token;
        pageCount++;
      }
      
      // Enrich each result with full details
      const enrichedResults = await Promise.all(
        allResults.map(async (place) => {
          try {
            const details = await this.getPlaceDetails(place.place_id);
            return details || place;
          } catch {
            return place;
          }
        })
      );

      data.results = enrichedResults;

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${data.error_message || data.status}`);
      }

      // Filter by minimum rating if specified
      if (params.minRating && data.results) {
        data.results = data.results.filter(place => 
          place.rating && place.rating >= params.minRating!
        );
      }

      logger.info(`Found ${data.results?.length || 0} places for query: ${params.query}`);

      return data;
    } catch (error) {
      logger.error('Google Places API search failed:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error('Google Places API key is invalid or quota exceeded');
        } else if (error.response?.status === 429) {
          throw new Error('Google Places API rate limit exceeded');
        }
      }
      
      throw new Error('Failed to search places');
    }
  }

  async getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
    if (!this.apiKey) {
      throw new Error('Google Places API key not configured');
    }

    try {
      const url = `${this.baseUrl}/details/json`;
      const params = {
        place_id: placeId,
        key: this.apiKey,
        fields: 'name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,business_status,types,geometry,opening_hours',
      };

      logger.info(`Getting place details for: ${placeId}`);

      const response = await axios.get(url, {
        params,
        timeout: 10000,
        headers: {
          'User-Agent': 'Powerful-CRM/1.0',
        },
      });

      const data = response.data;

      if (data.status !== 'OK') {
        logger.warn(`Place details not found: ${data.error_message || data.status}`);
        return null;
      }

      return data.result;
    } catch (error) {
      logger.error('Failed to get place details:', error);
      throw new Error('Failed to get place details');
    }
  }

  async searchNearby(location: string, radius: number = 5000, type?: string): Promise<PlacesSearchResponse> {
    if (!this.apiKey) {
      throw new Error('Google Places API key not configured');
    }

    try {
      const url = `${this.baseUrl}/nearbysearch/json`;
      const params: any = {
        location,
        radius: radius.toString(),
        key: this.apiKey,
      };

      if (type) {
        params.type = type;
      }

      logger.info(`Searching nearby places: ${location}, radius: ${radius}`);

      const response = await axios.get(url, {
        params,
        timeout: 10000,
        headers: {
          'User-Agent': 'Powerful-CRM/1.0',
        },
      });

      const data = response.data as PlacesSearchResponse;

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${data.error_message || data.status}`);
      }

      return data;
    } catch (error) {
      logger.error('Google Places nearby search failed:', error);
      throw new Error('Failed to search nearby places');
    }
  }

  // Convert place result to our contact format
  convertToContact(place: PlaceResult): any {
    const companyName = place.name || 'Unknown Company';
    const website = place.website || '';
    const phone = place.formatted_phone_number || '';
    const email = website ? `contact@${this.extractDomainFromWebsite(website)}` : `contact@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    
    return {
      firstName: '',
      lastName: '',
      email,
      phone,
      title: 'Decision Maker',
      company: companyName,
      website: website || '',
      industry: this.mapTypesToIndustry(place.types),
      location: place.formatted_address || '',
      source: 'Google Places',
      score: this.calculateLeadScore(place),
      status: 'new',
      customFields: {
        placeId: place.place_id,
        rating: place.rating || 0,
        userRatingsTotal: place.user_ratings_total || 0,
        businessStatus: place.business_status || 'OPERATIONAL',
        coordinates: place.geometry?.location,
        openingHours: place.opening_hours,
        types: place.types,
      },
    };
  }

  private extractDomainFromWebsite(website?: string): string | null {
    if (!website) return null;
    
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`);
      return url.hostname.replace('www.', '');
    } catch {
      return null;
    }
  }

  private mapTypesToIndustry(types: string[]): string {
    const industryMap: { [key: string]: string } = {
      restaurant: 'Restaurant',
      food: 'Food & Beverage',
      store: 'Retail',
      clothing_store: 'Retail',
      electronics_store: 'Electronics',
      car_dealer: 'Automotive',
      real_estate_agency: 'Real Estate',
      insurance_agency: 'Insurance',
      bank: 'Financial Services',
      hospital: 'Healthcare',
      dentist: 'Healthcare',
      lawyer: 'Legal Services',
      accounting: 'Accounting',
      gym: 'Fitness',
      beauty_salon: 'Beauty & Wellness',
      hair_care: 'Beauty & Wellness',
      school: 'Education',
      university: 'Education',
    };

    for (const type of types) {
      if (industryMap[type]) {
        return industryMap[type];
      }
    }

    return 'Other';
  }

  private calculateLeadScore(place: PlaceResult): number {
    let score = 50; // Base score

    // Rating bonus
    if (place.rating) {
      score += Math.round((place.rating - 3) * 10); // 3.0 = +0, 5.0 = +20
    }

    // Reviews bonus
    if (place.user_ratings_total) {
      if (place.user_ratings_total > 100) score += 10;
      if (place.user_ratings_total > 50) score += 5;
    }

    // Website bonus
    if (place.website) {
      score += 15;
    }

    // Phone bonus
    if (place.formatted_phone_number) {
      score += 10;
    }

    // Business status
    if (place.business_status === 'OPERATIONAL') {
      score += 5;
    }

    return Math.min(Math.max(score, 0), 100); // Clamp between 0-100
  }
}

export default new GooglePlacesService();