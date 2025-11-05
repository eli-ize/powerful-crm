import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface RequestTimeoutOptions {
  timeout?: number; // milliseconds
  onTimeout?: (req: Request) => void;
}

/**
 * Request timeout middleware
 * Prevents hung requests from blocking server resources
 * Critical for production stability
 */
export function requestTimeout(options: RequestTimeoutOptions = {}) {
  const timeout = options.timeout || 30000; // 30 seconds default
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip timeout for WebSocket upgrades
    if (req.headers.upgrade === 'websocket') {
      return next();
    }
    
    // Skip timeout for Server-Sent Events
    if (req.headers.accept?.includes('text/event-stream')) {
      return next();
    }
    
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn(`⏱️ Request timeout after ${timeout}ms: ${req.method} ${req.path}`);
        
        if (options.onTimeout) {
          options.onTimeout(req);
        }
        
        res.status(408).json({
          error: 'Request Timeout',
          message: `Request took longer than ${timeout}ms to complete`,
          path: req.path,
          method: req.method
        });
      }
    }, timeout);
    
    // Clear timeout when response finishes
    res.on('finish', () => {
      clearTimeout(timer);
    });
    
    res.on('close', () => {
      clearTimeout(timer);
    });
    
    next();
  };
}

/**
 * Different timeout settings for different route types
 */
export const timeoutConfigs = {
  // Short timeout for health checks and simple queries
  fast: requestTimeout({ timeout: 5000 }), // 5 seconds
  
  // Normal timeout for most API operations
  normal: requestTimeout({ timeout: 30000 }), // 30 seconds
  
  // Extended timeout for AI operations, speech processing
  ai: requestTimeout({ 
    timeout: 60000, // 60 seconds
    onTimeout: (req) => {
      logger.error(`🤖 AI request timeout: ${req.path}`, {
        body: req.body,
        query: req.query
      });
    }
  }),
  
  // Very long timeout for file uploads, batch operations
  long: requestTimeout({ timeout: 300000 }) // 5 minutes
};
