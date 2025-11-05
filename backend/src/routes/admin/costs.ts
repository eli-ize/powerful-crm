import express, { Request, Response } from 'express';
import logger from '../../utils/logger';
import costTracking from '../../services/costTracking';

const router = express.Router();

/**
 * GET /api/admin/costs/summary
 * Get spending summary
 */
router.get('/costs/summary', async (req: Request, res: Response) => {
  try {
    const summary = await costTracking.getSpendingSummary();
    
    res.json({
      success: true,
      summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get cost summary:', error);
    res.status(500).json({ error: 'Failed to get cost summary' });
  }
});

/**
 * GET /api/admin/costs/today
 * Get today's spending
 */
router.get('/costs/today', async (req: Request, res: Response) => {
  try {
    const todaySpending = await costTracking.getTodaySpending();
    
    res.json({
      success: true,
      spending: todaySpending,
      formattedCost: `$${todaySpending.toFixed(2)}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get today spending:', error);
    res.status(500).json({ error: 'Failed to get today spending' });
  }
});

/**
 * GET /api/admin/costs/month
 * Get this month's spending
 */
router.get('/costs/month', async (req: Request, res: Response) => {
  try {
    const monthSpending = await costTracking.getMonthSpending();
    
    res.json({
      success: true,
      spending: monthSpending,
      formattedCost: `$${monthSpending.toFixed(2)}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get month spending:', error);
    res.status(500).json({ error: 'Failed to get month spending' });
  }
});

/**
 * POST /api/admin/costs/estimate
 * Estimate cost for an operation
 */
router.post('/costs/estimate', async (req: Request, res: Response) => {
  try {
    const { service, operation, units } = req.body;
    
    if (!service || !operation || !units) {
      return res.status(400).json({ error: 'Service, operation, and units are required' });
    }
    
    const estimatedCost = costTracking.estimateCost(service, operation, units);
    
    res.json({
      success: true,
      service,
      operation,
      units,
      estimatedCost,
      formattedCost: `$${estimatedCost.toFixed(4)}`
    });
  } catch (error) {
    logger.error('Failed to estimate cost:', error);
    res.status(500).json({ error: 'Failed to estimate cost' });
  }
});

export default router;
