import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import config from '../config';
import prisma from '../config/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: any;
  };
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token required', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      throw new AppError('Access token required', 401);
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      
      // Get user from database to ensure they still exist and are active
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          permissions: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new AppError('User account not found or inactive', 401);
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions as any,
      };

      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        throw new AppError('Token expired', 401);
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid token', 401);
      } else {
        throw jwtError;
      }
    }
  } catch (error) {
    next(error);
  }
}

// Authorization middleware factory
export function authorize(...requiredPermissions: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const userPermissions = req.user.permissions || {};
    
    // Check if user has any of the required permissions
    const hasPermission = requiredPermissions.some(permission => {
      return userPermissions[permission] === true;
    });

    if (!hasPermission) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
}

// Role-based authorization
export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient role permissions', 403));
    }

    next();
  };
}

// Optional authentication (for endpoints that work with or without auth)
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // User provided token, authenticate them
    return authenticate(req, res, next);
  }
  
  // No token provided, continue without authentication
  next();
}