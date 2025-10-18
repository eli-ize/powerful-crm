import { Router, Request, Response } from 'express';
import logger from '../utils/logger';

const router = Router();

// Get campaigns
router.get('/', async (_req: Request, res: Response) => {
  try {
    logger.info('Fetching campaigns');

    res.json({
      success: true,
      data: [],
    });
  } catch (error) {
    logger.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaigns',
    });
  }
});

// Create campaign
router.post('/', async (req: Request, res: Response) => {
  try {
    const campaign = req.body;
    logger.info('Creating campaign:', campaign);

    res.status(201).json({
      success: true,
      data: {
        id: 'campaign_' + Date.now(),
        ...campaign,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error creating campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create campaign',
    });
  }
});

export default router;