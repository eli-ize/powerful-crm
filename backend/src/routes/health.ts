import { Router, Request, Response } from 'express';
import config from '../config';
import prisma from '../config/database';
import { healthMonitor } from '../middleware/healthMonitor';

const router = Router();

// Basic health check (no database required)
router.get('/', (req: Request, res: Response) => {
  const health = healthMonitor.getHealth();
  const statusCode = health.healthy ? 200 : 503;
  
  res.status(statusCode).json({
    success: health.healthy,
    message: health.message,
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: '1.0.0',
    status: health.healthy ? 'healthy' : 'degraded',
    errorCount: health.errorCount,
    uptime: Math.floor(process.uptime()),
  });
});

// Database health check (separate endpoint)
router.get('/db', async (req: Request, res: Response) => {
  try {
    // Test database connection with 5 second timeout
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 5000)
    );
    const dbCheck = prisma.$queryRaw`SELECT 1`;
    
    await Promise.race([dbCheck, timeout]);
    
    res.json({
      success: true,
      message: 'Database connected',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      version: '1.0.0',
      services: {
        database: 'connected',
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database unavailable',
      timestamp: new Date().toISOString(),
      error: config.nodeEnv === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Database connection failed',
    });
  }
});

// Detailed health check
router.get('/detailed', async (req: Request, res: Response) => {
  const health = healthMonitor.getHealth();
  const stats = healthMonitor.getStats();
  
  const checks = {
    database: false,
    redis: false,
    errorMonitoring: health.healthy,
    externalApis: {
      googlePlaces: !!config.googlePlacesApiKey,
      telnyx: !!config.telnyxApiKey,
      azureSpeech: !!config.azureSpeechKey,
      azureOpenAI: !!config.azureOpenAIKey,
      openai: !!config.openaiApiKey,
    },
  };

  try {
    // Database check with 3 second timeout
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 3000)
    );
    const dbCheck = prisma.$queryRaw`SELECT 1`;
    
    await Promise.race([dbCheck, timeout]);
    checks.database = true;
  } catch (error) {
    // Database is down
    healthMonitor.recordError(
      error instanceof Error ? error : new Error('Database check failed'),
      'health_check'
    );
  }

  // TODO: Redis check
  // try {
  //   await redis.ping();
  //   checks.redis = true;
  // } catch (error) {
  //   // Redis is down
  // }

  const allHealthy = checks.database && health.healthy;

  res.status(allHealthy ? 200 : 503).json({
    success: allHealthy,
    timestamp: new Date().toISOString(),
    checks,
    monitoring: {
      errorCount: stats.errorCount,
      errorsPerMinute: stats.errorsPerMinute,
      threshold: stats.threshold,
      healthy: stats.healthy
    },
    uptime: Math.floor(process.uptime()),
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
    },
  });
});

export default router;