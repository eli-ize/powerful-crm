import { Router, Request, Response } from 'express';
import logger from '../utils/logger';

const router = Router();

// Mock authentication for development
// TODO: Implement proper JWT authentication with bcrypt password hashing

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Login endpoint
router.post('/login', async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // TODO: Implement actual authentication
    // For now, return a mock token
    logger.info(`Login attempt for user: ${email}`);

    res.json({
      success: true,
      data: {
        token: 'mock_jwt_token_' + Date.now(),
        user: {
          id: 'user_123',
          email,
          name: 'Demo User',
          role: 'SALES_REP',
        },
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Register endpoint
router.post('/register', async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required',
      });
    }

    // TODO: Implement actual user registration with Prisma
    logger.info(`Registration attempt for user: ${email}`);

    res.status(201).json({
      success: true,
      data: {
        token: 'mock_jwt_token_' + Date.now(),
        user: {
          id: 'user_' + Date.now(),
          email,
          name,
          role: 'SALES_REP',
        },
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Logout endpoint
router.post('/logout', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;