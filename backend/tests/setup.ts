// Test setup - runs before all tests
import { PrismaClient } from '@prisma/client';

// Increase timeout for database operations
jest.setTimeout(30000);

// Mock Prisma for unit tests
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
