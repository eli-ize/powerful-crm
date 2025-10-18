// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import logger from '../utils/logger';
import config from '../config';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Custom error class
export class AppError extends Error implements ApiError {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle Prisma errors
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
  switch (error.code) {
    case 'P2002':
      return new AppError('A record with this information already exists', 409);
    case 'P2025':
      return new AppError('Record not found', 404);
    case 'P2003':
      return new AppError('Invalid reference to related record', 400);
    case 'P2021':
      return new AppError('Table does not exist', 500);
    default:
      return new AppError('Database error occurred', 500);
  }
}

// Handle JWT errors
function handleJWTError(): AppError {
  return new AppError('Invalid token', 401);
}

// Handle JWT expired error
function handleJWTExpiredError(): AppError {
  return new AppError('Token expired', 401);
}

// Handle validation errors
function handleValidationError(error: any): AppError {
  const errors = Object.values(error.errors).map((err: any) => err.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
}

// Send error response
function sendErrorResponse(err: ApiError, res: Response) {
  const { statusCode = 500, message } = err;
  
  const errorResponse: any = {
    success: false,
    error: message,
    statusCode,
  };

  // Add stack trace in development
  if (config.nodeEnv === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}

// Global error handler
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(`Error ${err.statusCode || 500}: ${err.message}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: err.stack,
  });

  // Handle specific error types
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  } else if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  } else if (!err.statusCode) {
    // Default to 500 server error
    error = new AppError('Internal server error', 500);
  }

  sendErrorResponse(error, res);
}

// 404 handler
export function notFoundHandler(req: Request, res: Response): void {
  const message = `Route ${req.originalUrl} not found`;
  logger.warn(`404 - ${message}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
  });
  
  res.status(404).json({
    success: false,
    error: message,
    statusCode: 404,
  });
}