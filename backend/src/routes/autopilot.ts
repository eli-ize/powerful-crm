import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

interface AutopilotConfig {
  enabled: boolean;
  industry: string;
  leadFinding: {
    enabled: boolean;
    searchQuery: string;
    targetCount: number;
  };
  qualification: {
    enabled: boolean;
    websiteAnalysis: boolean;
    aiCriteria: string[];
  };
  calling: {
    enabled: boolean;
    dailyLimit: number;
    voiceId: string;
  };
  taskAssignment: {
    enabled: boolean;
    autoAssignDesigner: boolean;
    designerPool: string[];
  };
  emailAutomation: {
    enabled: boolean;
    sendAfterDemo: boolean;
    followUpDays: number;
  };
}

/**
 * GET /api/autopilot/config
 * Get user's autopilot configuration
 */
router.get('/config', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'default-user';
    
    let autopilotConfig = await prisma.autopilotConfig.findFirst({
      where: { userId },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        workflows: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!autopilotConfig) {
      // Create default configuration
      const defaultConfig: AutopilotConfig = {
        enabled: false,
        industry: 'web_design',
        leadFinding: {
          enabled: true,
          searchQuery: 'restaurants without websites',
          targetCount: 100,
        },
        qualification: {
          enabled: true,
          websiteAnalysis: true,
          aiCriteria: ['No Website', 'Outdated Design', 'Poor SEO'],
        },
        calling: {
          enabled: true,
          dailyLimit: 200,
          voiceId: 'en-ZA-LeahNeural',
        },
        taskAssignment: {
          enabled: true,
          autoAssignDesigner: true,
          designerPool: ['AI Designer', 'Human Designer'],
        },
        emailAutomation: {
          enabled: true,
          sendAfterDemo: true,
          followUpDays: 3,
        },
      };

      autopilotConfig = await prisma.autopilotConfig.create({
        data: {
          userId,
          config: JSON.stringify(defaultConfig),
        },
        include: {
          tasks: true,
          workflows: true
        }
      });
    }

    const config = JSON.parse(autopilotConfig.config);

    res.json({
      success: true,
      data: {
        id: autopilotConfig.id,
        name: autopilotConfig.name,
        industry: autopilotConfig.industry,
        isActive: autopilotConfig.isActive,
        config,
        stats: {
          totalLeadsFound: autopilotConfig.totalLeadsFound,
          totalCallsMade: autopilotConfig.totalCallsMade,
          totalMeetingsBooked: autopilotConfig.totalMeetingsBooked,
          totalRevenue: autopilotConfig.totalRevenue,
        },
        recentTasks: autopilotConfig.tasks,
        recentWorkflows: autopilotConfig.workflows,
      }
    });
  } catch (error) {
    logger.error('Failed to get autopilot config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get autopilot configuration'
    });
  }
});

/**
 * POST /api/autopilot/config
 * Create or update autopilot configuration
 */
router.post('/config', [
  body('industry').optional().isString(),
  body('config').isObject().withMessage('Configuration object is required'),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const userId = (req as any).user?.id || 'default-user';
    const { industry, config, name } = req.body;

    let autopilotConfig = await prisma.autopilotConfig.findFirst({
      where: { userId }
    });

    if (autopilotConfig) {
      autopilotConfig = await prisma.autopilotConfig.update({
        where: { id: autopilotConfig.id },
        data: {
          industry: industry || 'web_design',
          config: JSON.stringify(config),
          updatedAt: new Date(),
        }
      });
    } else {
      autopilotConfig = await prisma.autopilotConfig.create({
        data: {
          userId,
          name: name || 'Default Autopilot',
          industry: industry || 'web_design',
          config: JSON.stringify(config),
        }
      });
    }

    logger.info(`Autopilot config updated for user ${userId}`, { configId: autopilotConfig.id });

    res.json({
      success: true,
      data: {
        id: autopilotConfig.id,
        name: autopilotConfig.name,
        industry: autopilotConfig.industry,
        config: JSON.parse(autopilotConfig.config),
        isActive: autopilotConfig.isActive,
      }
    });
  } catch (error) {
    logger.error('Failed to update autopilot config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update autopilot configuration'
    });
  }
});

/**
 * POST /api/autopilot/start
 * Start the autopilot system
 */
router.post('/start', [
  body('configId').optional().isString(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const userId = (req as any).user?.id || 'default-user';
    const { configId } = req.body;

    let autopilotConfig;
    if (configId) {
      autopilotConfig = await prisma.autopilotConfig.findFirst({
        where: { id: configId, userId }
      });
    } else {
      autopilotConfig = await prisma.autopilotConfig.findFirst({
        where: { userId }
      });
    }

    if (!autopilotConfig) {
      return res.status(404).json({
        success: false,
        error: 'Autopilot configuration not found'
      });
    }

    // Update config to active
    await prisma.autopilotConfig.update({
      where: { id: autopilotConfig.id },
      data: { isActive: true }
    });

    // Start the workflow engine
    // const workflowId = await workflowEngine.startAutopilot(autopilotConfig.id);
    const workflowId = 'workflow_' + Date.now(); // Temporary placeholder

    logger.info(`Autopilot started for user ${userId}`, { 
      configId: autopilotConfig.id,
      workflowId 
    });

    res.json({
      success: true,
      data: {
        message: 'Autopilot started successfully',
        configId: autopilotConfig.id,
        workflowId,
        status: 'running'
      }
    });
  } catch (error) {
    logger.error('Failed to start autopilot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start autopilot'
    });
  }
});

/**
 * POST /api/autopilot/stop
 * Stop the autopilot system
 */
router.post('/stop', [
  body('configId').optional().isString(),
], async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'default-user';
    const { configId } = req.body;

    let autopilotConfig;
    if (configId) {
      autopilotConfig = await prisma.autopilotConfig.findFirst({
        where: { id: configId, userId }
      });
    } else {
      autopilotConfig = await prisma.autopilotConfig.findFirst({
        where: { userId, isActive: true }
      });
    }

    if (!autopilotConfig) {
      return res.status(404).json({
        success: false,
        error: 'Active autopilot configuration not found'
      });
    }

    // Update config to inactive
    await prisma.autopilotConfig.update({
      where: { id: autopilotConfig.id },
      data: { isActive: false }
    });

    // Stop the workflow engine
    // await workflowEngine.stopAutopilot(autopilotConfig.id);

    logger.info(`Autopilot stopped for user ${userId}`, { configId: autopilotConfig.id });

    res.json({
      success: true,
      data: {
        message: 'Autopilot stopped successfully',
        configId: autopilotConfig.id,
        status: 'stopped'
      }
    });
  } catch (error) {
    logger.error('Failed to stop autopilot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop autopilot'
    });
  }
});

/**
 * GET /api/autopilot/status
 * Get autopilot status and current progress
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'default-user';

    const autopilotConfig = await prisma.autopilotConfig.findFirst({
      where: { userId },
      include: {
        tasks: {
          where: {
            status: { in: ['pending', 'in_progress'] }
          },
          orderBy: { createdAt: 'desc' }
        },
        workflows: {
          where: {
            status: { in: ['pending', 'running'] }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!autopilotConfig) {
      return res.status(404).json({
        success: false,
        error: 'Autopilot configuration not found'
      });
    }

    const currentWorkflow = autopilotConfig.workflows[0];
    const activeTasks = autopilotConfig.tasks;

    res.json({
      success: true,
      data: {
        isActive: autopilotConfig.isActive,
        configId: autopilotConfig.id,
        industry: autopilotConfig.industry,
        stats: {
          totalLeadsFound: autopilotConfig.totalLeadsFound,
          totalCallsMade: autopilotConfig.totalCallsMade,
          totalMeetingsBooked: autopilotConfig.totalMeetingsBooked,
          totalRevenue: autopilotConfig.totalRevenue,
        },
        currentWorkflow: currentWorkflow ? {
          id: currentWorkflow.id,
          name: currentWorkflow.name,
          status: currentWorkflow.status,
          progress: currentWorkflow.progress,
          currentStep: currentWorkflow.currentStep,
          totalSteps: currentWorkflow.totalSteps,
        } : null,
        activeTasks: activeTasks.map(task => ({
          id: task.id,
          type: task.type,
          status: task.status,
          progress: task.progress,
          assignedTo: task.assignedTo,
          createdAt: task.createdAt,
        })),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to get autopilot status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get autopilot status'
    });
  }
});

/**
 * GET /api/autopilot/tasks
 * Get autopilot tasks with pagination
 */
router.get('/tasks', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending', 'in_progress', 'completed', 'failed']),
  query('type').optional().isString(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const userId = (req as any).user?.id || 'default-user';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const type = req.query.type as string;
    const offset = (page - 1) * limit;

    // Get user's autopilot config
    const autopilotConfig = await prisma.autopilotConfig.findFirst({
      where: { userId }
    });

    if (!autopilotConfig) {
      return res.status(404).json({
        success: false,
        error: 'Autopilot configuration not found'
      });
    }

    const whereClause: any = { configId: autopilotConfig.id };
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;

    const [tasks, totalCount] = await Promise.all([
      prisma.autopilotTask.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.autopilotTask.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        tasks: tasks.map(task => ({
          id: task.id,
          type: task.type,
          status: task.status,
          progress: task.progress,
          assignedTo: task.assignedTo,
          inputData: task.inputData ? JSON.parse(task.inputData) : null,
          resultData: task.resultData ? JSON.parse(task.resultData) : null,
          errorMessage: task.errorMessage,
          startedAt: task.startedAt,
          completedAt: task.completedAt,
          createdAt: task.createdAt,
        })),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1,
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get autopilot tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get autopilot tasks'
    });
  }
});

export default router;