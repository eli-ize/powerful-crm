import express from 'express';
import { body, query, validationResult } from 'express-validator';
import googlePlacesService from '../services/googlePlaces';
import logger from '../utils/logger';

const router = express.Router();

// Search places endpoint (POST version for API testing)
router.post('/search',
  [
    body('query').notEmpty().withMessage('Search query is required'),
    body('location').optional().isString(),
    body('maxResults').optional().isInt({ min: 1, max: 60 }),
    body('radius').optional().isInt({ min: 100, max: 50000 }),
    body('type').optional().isString(),
    body('minRating').optional().isFloat({ min: 0, max: 5 }),
    body('openNow').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const {
        query: searchQuery,
        location,
        maxResults = 20,
        radius,
        type,
        minRating,
        openNow,
      } = req.body;

      const params = {
        query: searchQuery as string,
        location: location as string,
        radius: radius ? parseInt(radius as string) : undefined,
        type: type as string,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        openNow: openNow === true,
      };

      logger.info(`Places search request (POST): ${searchQuery}`, { 
        userId: (req as any).user?.id,
        params 
      });

      const results = await googlePlacesService.searchPlaces(params);

      // Limit results
      const limitedResults = results.results?.slice(0, maxResults) || [];

      res.json({
        success: true,
        data: limitedResults,
        count: limitedResults.length,
        status: results.status,
      });
    } catch (error) {
      logger.error('Places search failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Places search failed',
      });
    }
  }
);

// Search places endpoint (GET version)
router.get('/search',
  [
    query('query').notEmpty().withMessage('Search query is required'),
    query('location').optional().isString(),
    query('radius').optional().isInt({ min: 100, max: 50000 }),
    query('type').optional().isString(),
    query('minRating').optional().isFloat({ min: 0, max: 5 }),
    query('openNow').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const {
        query: searchQuery,
        location,
        radius,
        type,
        minRating,
        openNow,
      } = req.query;

      const params = {
        query: searchQuery as string,
        location: location as string,
        radius: radius ? parseInt(radius as string) : undefined,
        type: type as string,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        openNow: openNow === 'true',
      };

      logger.info(`Places search request: ${searchQuery}`, { 
        userId: (req as any).user?.id,
        params 
      });

      const results = await googlePlacesService.searchPlaces(params);

      res.json({
        success: true,
        data: {
          places: results.results || [],
          status: results.status,
          nextPageToken: results.next_page_token,
        },
      });
    } catch (error) {
      logger.error('Places search failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Places search failed',
      });
    }
  }
);

// Get place details endpoint
router.get('/details/:placeId',
  async (req, res) => {
    try {
      const { placeId } = req.params;

      if (!placeId) {
        return res.status(400).json({
          success: false,
          error: 'Place ID is required',
        });
      }

      logger.info(`Place details request: ${placeId}`, { 
        userId: (req as any).user?.id 
      });

      const placeDetails = await googlePlacesService.getPlaceDetails(placeId);

      if (!placeDetails) {
        return res.status(404).json({
          success: false,
          error: 'Place not found',
        });
      }

      res.json({
        success: true,
        data: placeDetails,
      });
    } catch (error) {
      logger.error('Get place details failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get place details',
      });
    }
  }
);

// Search nearby places
router.get('/nearby',
  [
    query('location').notEmpty().withMessage('Location is required'),
    query('radius').optional().isInt({ min: 100, max: 50000 }),
    query('type').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { location, radius, type } = req.query;

      logger.info(`Nearby places search: ${location}`, { 
        userId: (req as any).user?.id,
        radius,
        type
      });

      const results = await googlePlacesService.searchNearby(
        location as string,
        radius ? parseInt(radius as string) : 5000,
        type as string
      );

      res.json({
        success: true,
        data: {
          places: results.results || [],
          status: results.status,
        },
      });
    } catch (error) {
      logger.error('Nearby search failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Nearby search failed',
      });
    }
  }
);

// Convert places to contacts
router.post('/convert-to-contacts',
  [
    body('places').isArray().withMessage('Places array is required'),
    body('places.*.place_id').notEmpty().withMessage('Place ID is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { places } = req.body;

      logger.info(`Converting ${places.length} places to contacts`, { 
        userId: (req as any).user?.id 
      });

      const contacts = places.map((place: any) => 
        googlePlacesService.convertToContact(place)
      );

      res.json({
        success: true,
        data: {
          contacts,
          count: contacts.length,
        },
      });
    } catch (error) {
      logger.error('Convert to contacts failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to convert places to contacts',
      });
    }
  }
);

// Bulk import places as contacts
router.post('/bulk-import',
  [
    body('searchQuery').notEmpty().withMessage('Search query is required'),
    body('location').optional().isString(),
    body('maxResults').optional().isInt({ min: 1, max: 500 }),
    body('filters').optional().isObject(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { searchQuery, location, maxResults = 200, filters = {} } = req.body;

      logger.info(`Bulk import request: ${searchQuery}`, { 
        userId: (req as any).user?.id,
        maxResults,
        filters
      });

      // Search for places
      const searchResults = await googlePlacesService.searchPlaces({
        query: searchQuery,
        location,
        ...filters,
      });

      if (!searchResults.results || searchResults.results.length === 0) {
        return res.json({
          success: true,
          data: {
            contacts: [],
            count: 0,
            message: 'No places found matching your search criteria',
          },
        });
      }

      // Limit results
      const limitedResults = searchResults.results.slice(0, maxResults);

      // Convert to contacts
      const contacts = limitedResults.map(place => 
        googlePlacesService.convertToContact(place)
      );

      logger.info(`Bulk import completed: ${contacts.length} contacts created`);

      res.json({
        success: true,
        data: {
          contacts,
          count: contacts.length,
          searchStatus: searchResults.status,
        },
      });
    } catch (error) {
      logger.error('Bulk import failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Bulk import failed',
      });
    }
  }
);

export default router;