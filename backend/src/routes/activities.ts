import { Router, Request, Response } from 'express';
import logger from '../utils/logger';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    logger.info('Fetching activities');
    res.json({ success: true, data: [] });
  } catch (error) {
    logger.error('Error fetching activities:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch activities' });
  }
});

export default router;