import { Router, Request, Response } from 'express';
import config from '../config';
import prisma from '../config/database';

const router = Router();

// Basic health check
router.get('/', async (req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      success: true,
      message: 'Powerful CRM API is running',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      version: '1.0.0',
      services: {
        database: 'connected',
        redis: 'checking...',
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Service unavailable',
      timestamp: new Date().toISOString(),
      error: config.nodeEnv === 'development' ? error : 'Database connection failed',
    });
  }
});

// Detailed health check
router.get('/detailed', async (req: Request, res: Response) => {
  const checks = {
    database: false,
    redis: false,
    externalApis: {
      googlePlaces: !!config.googlePlacesApiKey,
      telnyx: !!config.telnyxApiKey,
      azureSpeech: !!config.azureSpeechKey,
      openai: !!config.openaiApiKey,
    },
  };

  try {
    // Database check
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    // Database is down
  }

  // TODO: Redis check
  // try {
  //   await redis.ping();
  //   checks.redis = true;
  // } catch (error) {
  //   // Redis is down
  // }

  const allHealthy = checks.database && checks.redis;

  res.status(allHealthy ? 200 : 503).json({
    success: allHealthy,
    timestamp: new Date().toISOString(),
    checks,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

export default router;