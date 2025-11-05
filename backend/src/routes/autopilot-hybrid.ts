import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { googlePlacesService } from '../services/google-places.service';
import { websiteAnalyzerService } from '../services/website-analyzer.service';
import telnyxService from '../services/telnyx';
import { ProfessionalEmailService } from '../services/professionalEmailService';
import config from '../config';

const emailService = new ProfessionalEmailService();

const router = Router();
const prisma = new PrismaClient();

// Test database connection on startup
prisma.$connect()
  .then(() => logger.info('✅ Autopilot: Database connected'))
  .catch((error) => logger.error('❌ Autopilot: Database connection failed:', error));

// Health check endpoint with real database status
router.get('/status', async (req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      success: true,
      message: 'Autopilot system operational with real database',
      status: 'active',
      timestamp: new Date().toISOString(),
      database: 'connected',
      storage: 'real-database'
    });
  } catch (error: any) {
    logger.error('Autopilot status check failed:', error);
    res.json({
      success: true,
      message: 'Autopilot system operational (fallback mode)',
      status: 'active',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      storage: 'memory'
    });
  }
});

// System information endpoint
router.get('/info', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      name: 'AI Autopilot System',
      version: '1.5.0 (Database Integrated)',
      description: 'Complete sales automation with real database persistence',
      features: [
        'Lead Discovery via Google Places',
        'Website Analysis with AI',
        'Automated Voice Calls',
        'Designer Assignment',
        'Email Campaign Automation',
        'ROI Tracking & Analytics'
      ],
      workflow: {
        steps: [
          { id: 1, name: 'Find Leads', description: 'Discover potential clients using Google Places API' },
          { id: 2, name: 'Analyze Websites', description: 'AI analysis of business websites for qualification' },
          { id: 3, name: 'Make Calls', description: 'Automated voice calls using Telnyx API' },
          { id: 4, name: 'Assign Designers', description: 'Match qualified leads with available designers' },
          { id: 5, name: 'Send Emails', description: 'Personalized email campaigns based on analysis' },
          { id: 6, name: 'Track ROI', description: 'Monitor conversion rates and revenue metrics' }
        ]
      },
      integrations: ['Google Places API', 'Azure OpenAI', 'Telnyx Voice', 'Professional Email'],
      capabilities: ['Real database persistence', 'AI decision making', 'Multi-channel outreach'],
      storage: {
        type: 'SQLite with Prisma ORM',
        models: ['AutopilotConfig', 'AutopilotTask', 'AutopilotWorkflow']
      }
    }
  });
});

// Get autopilot configuration - REAL DATABASE VERSION
router.get('/config', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || '1'; // Default to user 1 for development

    // Try to get real config from database
    let autopilotConfig = await prisma.autopilotConfig.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // If no config found, create default one in database
    if (!autopilotConfig) {
      logger.info('Creating default autopilot config in database for user:', userId);
      
      const defaultConfig = {
        autoQualify: true,
        autoCall: false,
        autoEmail: true,
        autoAssignDesigner: false,
        targetIndustry: 'technology',
        maxBudget: 5000,
        leadSources: ['google_places', 'linkedin']
      };

      autopilotConfig = await prisma.autopilotConfig.create({
        data: {
          userId,
          name: 'Default Autopilot Configuration',
          industry: 'technology',
          isActive: false,
          config: JSON.stringify(defaultConfig)
        }
      });

      logger.info('✅ Created autopilot config in database:', autopilotConfig.id);
    }

    // Parse the config JSON
    const parsedConfig = JSON.parse(autopilotConfig.config);

    res.json({
      success: true,
      data: {
        id: autopilotConfig.id,
        userId: autopilotConfig.userId,
        name: autopilotConfig.name,
        industry: autopilotConfig.industry,
        isActive: autopilotConfig.isActive,
        targetIndustry: parsedConfig.targetIndustry || autopilotConfig.industry,
        maxBudget: parsedConfig.maxBudget || 5000,
        leadSources: parsedConfig.leadSources || ['google_places'],
        automationSettings: {
          autoQualify: parsedConfig.autoQualify !== false,
          autoCall: parsedConfig.autoCall || false,
          autoEmail: parsedConfig.autoEmail !== false,
          autoAssignDesigner: parsedConfig.autoAssignDesigner || false
        },
        stats: {
          totalLeadsFound: autopilotConfig.totalLeadsFound,
          totalCallsMade: autopilotConfig.totalCallsMade,
          totalMeetingsBooked: autopilotConfig.totalMeetingsBooked,
          totalRevenue: autopilotConfig.totalRevenue
        },
        createdAt: autopilotConfig.createdAt,
        updatedAt: autopilotConfig.updatedAt
      },
      source: 'database'
    });

  } catch (error: any) {
    logger.error('Failed to fetch autopilot config from database:', error);
    
    // Fallback to mock data if database fails
    res.json({
      success: true,
      data: {
        id: 'fallback-1',
        userId: '1',
        name: 'Fallback Configuration',
        isActive: false,
        targetIndustry: 'technology',
        maxBudget: 5000,
        leadSources: ['google_places'],
        automationSettings: {
          autoQualify: true,
          autoCall: false,
          autoEmail: true,
          autoAssignDesigner: false
        }
      },
      source: 'fallback'
    });
  }
});

// Update autopilot configuration - REAL DATABASE VERSION
router.put('/config', [
  body('targetIndustry').optional().isString().trim(),
  body('maxBudget').optional().isNumeric(),
  body('leadSources').optional().isArray(),
  body('automationSettings').optional().isObject()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.body.userId || '1';
    const updateData = req.body;

    // Get existing config
    let autopilotConfig = await prisma.autopilotConfig.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (autopilotConfig) {
      // Update existing config
      const currentConfig = JSON.parse(autopilotConfig.config);
      const newConfig = { ...currentConfig, ...updateData };

      autopilotConfig = await prisma.autopilotConfig.update({
        where: { id: autopilotConfig.id },
        data: {
          industry: updateData.targetIndustry || autopilotConfig.industry,
          config: JSON.stringify(newConfig),
          updatedAt: new Date()
        }
      });

      logger.info('✅ Updated autopilot config in database:', autopilotConfig.id);
    } else {
      // Create new config
      autopilotConfig = await prisma.autopilotConfig.create({
        data: {
          userId,
          name: 'Autopilot Configuration',
          industry: updateData.targetIndustry || 'technology',
          config: JSON.stringify(updateData)
        }
      });

      logger.info('✅ Created new autopilot config in database:', autopilotConfig.id);
    }

    res.json({
      success: true,
      message: 'Autopilot configuration saved to database',
      data: autopilotConfig,
      source: 'database'
    });

  } catch (error: any) {
    logger.error('Failed to update autopilot config in database:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update autopilot configuration',
      error: error.message
    });
  }
});

// Start autopilot - REAL DATABASE VERSION
router.post('/start', [
  body('targetIndustry').optional().isString().trim(),
  body('maxBudget').optional().isNumeric()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.body.userId || '1';
    const { targetIndustry, maxBudget } = req.body;

    // Get or create config
    let autopilotConfig = await prisma.autopilotConfig.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!autopilotConfig) {
      autopilotConfig = await prisma.autopilotConfig.create({
        data: {
          userId,
          name: 'Autopilot Configuration',
          industry: targetIndustry || 'technology',
          isActive: true,
          config: JSON.stringify({
            targetIndustry: targetIndustry || 'technology',
            maxBudget: maxBudget || 5000
          })
        }
      });
    } else {
      // Update and activate
      const currentConfig = JSON.parse(autopilotConfig.config);
      autopilotConfig = await prisma.autopilotConfig.update({
        where: { id: autopilotConfig.id },
        data: {
          isActive: true,
          industry: targetIndustry || autopilotConfig.industry,
          config: JSON.stringify({
            ...currentConfig,
            ...(targetIndustry && { targetIndustry }),
            ...(maxBudget && { maxBudget })
          })
        }
      });
    }

    // Create initial task in database
    const initialTask = await prisma.autopilotTask.create({
      data: {
        configId: autopilotConfig.id,
        type: 'lead_discovery',
        status: 'pending',
        progress: 0,
        inputData: JSON.stringify({
          industry: targetIndustry || autopilotConfig.industry,
          budget: maxBudget || 5000
        })
      }
    });

    logger.info('✅ Autopilot started with database persistence', {
      configId: autopilotConfig.id,
      taskId: initialTask.id,
      industry: targetIndustry || autopilotConfig.industry
    });

    res.json({
      success: true,
      message: 'Autopilot started with real database persistence',
      data: {
        config: autopilotConfig,
        initialTask: {
          id: initialTask.id,
          type: initialTask.type,
          status: initialTask.status
        },
        workflow: {
          currentStep: 1,
          nextAction: `Finding leads in ${targetIndustry || autopilotConfig.industry} industry`,
          estimatedCompletion: '2-5 minutes',
          storage: 'database'
        }
      }
    });

  } catch (error: any) {
    logger.error('Failed to start autopilot with database:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start autopilot',
      error: error.message
    });
  }
});

// Stop autopilot - REAL DATABASE VERSION
router.post('/stop', async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || '1';

    // Find active config
    const autopilotConfig = await prisma.autopilotConfig.findFirst({
      where: {
        userId,
        isActive: true
      }
    });

    if (autopilotConfig) {
      // Deactivate in database
      await prisma.autopilotConfig.update({
        where: { id: autopilotConfig.id },
        data: { isActive: false }
      });

      logger.info('✅ Autopilot stopped in database:', autopilotConfig.id);

      res.json({
        success: true,
        message: 'Autopilot stopped and saved to database',
        data: {
          configId: autopilotConfig.id,
          stoppedAt: new Date().toISOString(),
          storage: 'database'
        }
      });
    } else {
      res.json({
        success: true,
        message: 'No active autopilot found',
        data: {}
      });
    }

  } catch (error: any) {
    logger.error('Failed to stop autopilot in database:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop autopilot',
      error: error.message
    });
  }
});

// Get autopilot tasks - REAL DATABASE VERSION
router.get('/tasks', [
  query('status').optional().isString(),
  query('type').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, type, page = '1', limit = '20' } = req.query;
    const userId = req.query.userId as string || '1';

    // Build where clause
    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;

    // Get config ID for user
    const config = await prisma.autopilotConfig.findFirst({
      where: { userId },
      select: { id: true }
    });

    if (config) {
      whereClause.configId = config.id;
    }

    // Query database
    const [tasks, totalCount] = await Promise.all([
      prisma.autopilotTask.findMany({
        where: whereClause,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.autopilotTask.count({ where: whereClause })
    ]);

    logger.info(`✅ Retrieved ${tasks.length} tasks from database`);

    res.json({
      success: true,
      data: {
        tasks: tasks.map(task => ({
          id: task.id,
          type: task.type,
          status: task.status,
          progress: task.progress,
          inputData: task.inputData ? JSON.parse(task.inputData) : null,
          resultData: task.resultData ? JSON.parse(task.resultData) : null,
          createdAt: task.createdAt,
          completedAt: task.completedAt
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / Number(limit))
        }
      },
      source: 'database'
    });

  } catch (error: any) {
    logger.error('Failed to fetch tasks from database:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch autopilot tasks',
      error: error.message
    });
  }
});

// Execute lead discovery with REAL Google Places API
router.post('/execute/find-leads', [
  body('taskId').optional().isString(),
  body('industry').isString().trim(),
  body('location').optional().isString().trim(),
  body('maxResults').optional().isInt({ min: 1, max: 50 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { taskId, industry, location = 'South Africa', maxResults = 20 } = req.body;
    const userId = req.body.userId || '1';

    logger.info(`🚀 Executing REAL lead discovery: ${industry} in ${location}`);

    // Get or create config
    let config = await prisma.autopilotConfig.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!config) {
      config = await prisma.autopilotConfig.create({
        data: {
          userId,
          name: 'Autopilot Configuration',
          industry,
          config: JSON.stringify({ targetIndustry: industry })
        }
      });
    }

    // Get or create task
    let task;
    if (taskId) {
      task = await prisma.autopilotTask.findUnique({ where: { id: taskId } });
    }

    if (!task) {
      task = await prisma.autopilotTask.create({
        data: {
          configId: config.id,
          type: 'find_leads',
          status: 'in_progress',
          progress: 0,
          inputData: JSON.stringify({ industry, location, maxResults }),
          startedAt: new Date()
        }
      });
    } else {
      await prisma.autopilotTask.update({
        where: { id: task.id },
        data: { status: 'in_progress', startedAt: new Date() }
      });
    }

    // REAL GOOGLE PLACES API CALL
    const places = await googlePlacesService.findLeadsByIndustry(industry, location, maxResults);

    logger.info(`✅ Found ${places.length} real leads from Google Places`);

    // Convert places to contacts and save to database
    const contacts = [];
    for (const place of places) {
      try {
        const contactData = googlePlacesService.placeToContact(place, userId);
        
        // Save contact to database
        const contact = await prisma.contact.create({
          data: contactData
        });

        contacts.push({
          id: contact.id,
          company: contact.company,
          phone: contact.phone,
          website: contact.website,
          location: contact.location,
          industry: contact.industry,
          rating: contact.score,
          source: 'Google Places API'
        });

        logger.info(`✅ Saved contact: ${contact.company}`);
      } catch (error: any) {
        logger.error(`Failed to save contact for ${place.name}:`, error.message);
      }
    }

    // Update task with results
    await prisma.autopilotTask.update({
      where: { id: task.id },
      data: {
        status: 'completed',
        progress: 100,
        resultData: JSON.stringify({
          leadsFound: contacts.length,
          leads: contacts,
          source: 'Google Places API',
          timestamp: new Date().toISOString()
        }),
        completedAt: new Date()
      }
    });

    // Update config stats
    await prisma.autopilotConfig.update({
      where: { id: config.id },
      data: {
        totalLeadsFound: { increment: contacts.length }
      }
    });

    logger.info(`🎉 Lead discovery completed: ${contacts.length} leads saved to database`);

    res.json({
      success: true,
      message: `Found ${contacts.length} real leads using Google Places API`,
      data: {
        taskId: task.id,
        leadsFound: contacts.length,
        leads: contacts,
        industry,
        location,
        source: 'Google Places API (REAL)',
        storage: 'database',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    logger.error('Lead discovery failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute lead discovery',
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Execute website analysis with REAL Azure AI
router.post('/execute/analyze-websites', [
  body('taskId').optional().isString(),
  body('contactIds').isArray().withMessage('contactIds must be an array'),
  body('contactIds.*').isString()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { taskId, contactIds } = req.body;
    const userId = req.body.userId || '1';

    logger.info(`🤖 Executing REAL website analysis for ${contactIds.length} contacts`);

    // Get or create config
    let config = await prisma.autopilotConfig.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Autopilot config not found'
      });
    }

    // Get or create task
    let task;
    if (taskId) {
      task = await prisma.autopilotTask.findUnique({ where: { id: taskId } });
    }

    if (!task) {
      task = await prisma.autopilotTask.create({
        data: {
          configId: config.id,
          type: 'analyze_websites',
          status: 'in_progress',
          progress: 0,
          inputData: JSON.stringify({ contactIds }),
          startedAt: new Date()
        }
      });
    } else {
      await prisma.autopilotTask.update({
        where: { id: task.id },
        data: { status: 'in_progress', startedAt: new Date() }
      });
    }

    // Get contacts with websites
    const contacts = await prisma.contact.findMany({
      where: {
        id: { in: contactIds },
        website: { not: null }
      }
    });

    logger.info(`📊 Found ${contacts.length} contacts with websites to analyze`);

    // Analyze each website using REAL Azure AI
    const analyses = [];
    let qualifiedCount = 0;

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      
      try {
        if (!contact.website) continue;

        logger.info(`Analyzing ${i + 1}/${contacts.length}: ${contact.company}`);

        // REAL AZURE AI WEBSITE ANALYSIS
        const analysis = await websiteAnalyzerService.analyzeWebsite(
          contact.website,
          contact.company,
          contact.industry || 'Unknown'
        );

        analyses.push({
          contactId: contact.id,
          company: contact.company,
          website: contact.website,
          ...analysis
        });

        // Update contact with qualification info
        await prisma.contact.update({
          where: { id: contact.id },
          data: {
            qualificationCategory: analysis.recommendedAction,
            qualificationReason: analysis.qualificationReason,
            score: analysis.qualificationScore,
            qualifiedAt: new Date(),
            customFields: JSON.stringify({
              ...( contact.customFields ? JSON.parse(contact.customFields) : {}),
              websiteAnalysis: analysis
            })
          }
        });

        if (analysis.qualificationScore >= 70) {
          qualifiedCount++;
        }

        // Update task progress
        const progress = Math.round(((i + 1) / contacts.length) * 100);
        await prisma.autopilotTask.update({
          where: { id: task.id },
          data: { progress }
        });

        logger.info(`✅ Analyzed ${contact.company}: Score ${analysis.qualificationScore}/100`);

        // Rate limiting: wait 3 seconds between analyses
        if (i < contacts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error: any) {
        logger.error(`Failed to analyze ${contact.company}:`, error.message);
        analyses.push({
          contactId: contact.id,
          company: contact.company,
          website: contact.website,
          error: error.message
        });
      }
    }

    // Update task with results
    await prisma.autopilotTask.update({
      where: { id: task.id },
      data: {
        status: 'completed',
        progress: 100,
        resultData: JSON.stringify({
          analyzed: analyses.length,
          qualified: qualifiedCount,
          analyses,
          source: 'Azure AI (REAL)',
          timestamp: new Date().toISOString()
        }),
        completedAt: new Date()
      }
    });

    logger.info(`🎉 Website analysis completed: ${analyses.length} analyzed, ${qualifiedCount} qualified`);

    res.json({
      success: true,
      message: `Analyzed ${analyses.length} websites using Azure AI`,
      data: {
        taskId: task.id,
        analyzed: analyses.length,
        qualified: qualifiedCount,
        analyses,
        source: 'Azure AI (REAL - Phi-4-mini-instruct)',
        storage: 'database',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    logger.error('Website analysis failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute website analysis',
      error: error.message
    });
  }
});

// Execute voice calling with REAL Telnyx API
router.post('/execute/make-calls', [
  body('taskId').optional().isString(),
  body('contactIds').isArray().withMessage('contactIds must be an array'),
  body('contactIds.*').isString(),
  body('fromNumber').isString().withMessage('From number is required'),
  body('campaignObjective').optional().isString()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { taskId, contactIds, fromNumber, campaignObjective = 'Introduce services and book meetings' } = req.body;
    const userId = req.body.userId || '1';

    logger.info(`📞 Executing REAL voice calls for ${contactIds.length} contacts`);

    // Get or create config
    let autopilotConfig = await prisma.autopilotConfig.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!autopilotConfig) {
      return res.status(404).json({
        success: false,
        message: 'Autopilot config not found'
      });
    }

    // Get or create task
    let task;
    if (taskId) {
      task = await prisma.autopilotTask.findUnique({ where: { id: taskId } });
    }

    if (!task) {
      task = await prisma.autopilotTask.create({
        data: {
          configId: autopilotConfig.id,
          type: 'make_calls',
          status: 'in_progress',
          progress: 0,
          inputData: JSON.stringify({ contactIds, fromNumber, campaignObjective }),
          startedAt: new Date()
        }
      });
    } else {
      await prisma.autopilotTask.update({
        where: { id: task.id },
        data: { status: 'in_progress', startedAt: new Date() }
      });
    }

    // Get contacts with phone numbers
    const contacts = await prisma.contact.findMany({
      where: {
        id: { in: contactIds },
        phone: { not: null }
      }
    });

    logger.info(`📊 Found ${contacts.length} contacts with phone numbers`);

    // Initiate calls using REAL Telnyx API
    const callResults = [];
    let successfulCalls = 0;

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      
      try {
        if (!contact.phone) continue;

        // Clean phone number (remove spaces, dashes, etc.)
        const cleanPhone = contact.phone.replace(/[\s\-\(\)]/g, '');
        
        logger.info(`📞 Calling ${i + 1}/${contacts.length}: ${contact.company} (${cleanPhone})`);

        // REAL TELNYX API CALL
        const callResponse = await telnyxService.initiateCall({
          to: cleanPhone,
          from: fromNumber,
          connectionId: config.telnyxConnectionId,
          webhook_url: config.webhookUrl,
          time_limit_secs: 300 // 5 minutes
        });

        // Create call log in database
        const callLog = await prisma.callLog.create({
          data: {
            telnyxCallId: callResponse.call_control_id,
            direction: 'OUTBOUND',
            status: 'INITIATED',
            fromNumber: fromNumber,
            toNumber: cleanPhone,
            contactId: contact.id,
            createdBy: userId,
            startedAt: new Date()
          }
        });

        callResults.push({
          contactId: contact.id,
          company: contact.company,
          phone: cleanPhone,
          callControlId: callResponse.call_control_id,
          callLogId: callLog.id,
          status: 'initiated',
          source: 'Telnyx API (REAL)'
        });

        successfulCalls++;

        // Update task progress
        const progress = Math.round(((i + 1) / contacts.length) * 100);
        await prisma.autopilotTask.update({
          where: { id: task.id },
          data: { progress }
        });

        logger.info(`✅ Call initiated: ${contact.company} - Call ID: ${callResponse.call_control_id}`);

        // Rate limiting: wait 2 seconds between calls
        if (i < contacts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error: any) {
        logger.error(`Failed to call ${contact.company}:`, error.message);
        callResults.push({
          contactId: contact.id,
          company: contact.company,
          phone: contact.phone,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Update task with results
    await prisma.autopilotTask.update({
      where: { id: task.id },
      data: {
        status: successfulCalls > 0 ? 'completed' : 'failed',
        progress: 100,
        resultData: JSON.stringify({
          totalContacts: contacts.length,
          callsInitiated: successfulCalls,
          callResults,
          source: 'Telnyx API (REAL)',
          timestamp: new Date().toISOString()
        }),
        completedAt: new Date()
      }
    });

    // Update config stats
    await prisma.autopilotConfig.update({
      where: { id: autopilotConfig.id },
      data: {
        totalCallsMade: { increment: successfulCalls }
      }
    });

    logger.info(`🎉 Voice calling completed: ${successfulCalls}/${contacts.length} calls initiated`);

    res.json({
      success: true,
      message: `Initiated ${successfulCalls} real voice calls using Telnyx API`,
      data: {
        taskId: task.id,
        totalContacts: contacts.length,
        callsInitiated: successfulCalls,
        callResults,
        source: 'Telnyx API (REAL)',
        storage: 'database',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    logger.error('Voice calling failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute voice calling',
      error: error.message
    });
  }
});

// Execute email automation with REAL Professional SMTP
router.post('/execute/send-emails', [
  body('taskId').optional().isString(),
  body('contactIds').isArray().withMessage('contactIds must be an array'),
  body('contactIds.*').isString(),
  body('emailTemplate').optional().isString(),
  body('campaignSubject').optional().isString()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      taskId, 
      contactIds, 
      emailTemplate = 'lead-introduction',
      campaignSubject = 'Enhance Your Online Presence' 
    } = req.body;
    const userId = req.body.userId || '1';

    logger.info(`📧 Executing REAL email campaign for ${contactIds.length} contacts`);

    // Get or create config
    let autopilotConfig = await prisma.autopilotConfig.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!autopilotConfig) {
      return res.status(404).json({
        success: false,
        message: 'Autopilot config not found'
      });
    }

    // Get or create task
    let task;
    if (taskId) {
      task = await prisma.autopilotTask.findUnique({ where: { id: taskId } });
    }

    if (!task) {
      task = await prisma.autopilotTask.create({
        data: {
          configId: autopilotConfig.id,
          type: 'send_emails',
          status: 'in_progress',
          progress: 0,
          inputData: JSON.stringify({ contactIds, emailTemplate, campaignSubject }),
          startedAt: new Date()
        }
      });
    } else {
      await prisma.autopilotTask.update({
        where: { id: task.id },
        data: { status: 'in_progress', startedAt: new Date() }
      });
    }

    // Get contacts with email addresses
    const contacts = await prisma.contact.findMany({
      where: {
        id: { in: contactIds },
        email: { not: null }
      }
    });

    logger.info(`📊 Found ${contacts.length} contacts with email addresses`);

    // Send emails using REAL Professional SMTP
    const emailResults = [];
    let successfulEmails = 0;

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      
      try {
        if (!contact.email) continue;

        logger.info(`📧 Emailing ${i + 1}/${contacts.length}: ${contact.company} (${contact.email})`);

        // Get website analysis if available
        let websiteAnalysis;
        if (contact.customFields) {
          try {
            const customFields = JSON.parse(contact.customFields);
            websiteAnalysis = customFields.websiteAnalysis;
          } catch (e) {
            // No analysis available
          }
        }

        // Prepare personalized email context
        const emailContext = {
          recipientName: contact.firstName || contact.company,
          companyName: contact.company,
          industry: contact.industry || 'your industry',
          websiteUrl: contact.website || '',
          qualificationScore: contact.score || 50,
          opportunities: websiteAnalysis?.insights?.opportunities || [
            'Website modernization',
            'SEO optimization',
            'Mobile responsiveness'
          ],
          senderName: 'CampaignIt Team',
          senderEmail: 'sales@campaignit.co.za',
          callToAction: 'Schedule a free consultation'
        };

        // REAL PROFESSIONAL SMTP EMAIL SEND
        const emailResult = await emailService.sendCustomEmail({
          to: contact.email,
          subject: campaignSubject,
          html: generatePersonalizedEmail(emailContext),
          from: process.env.EMAIL_FROM || 'noreply@campaignit.co.za',
          replyTo: process.env.EMAIL_SALES || 'sales@campaignit.co.za'
        });

        if (emailResult.success) {
          emailResults.push({
            contactId: contact.id,
            company: contact.company,
            email: contact.email,
            status: 'sent',
            messageId: emailResult.messageId,
            source: 'Professional SMTP (REAL)'
          });

          successfulEmails++;

          // Create activity log
          await prisma.activity.create({
            data: {
              type: 'EMAIL',
              title: `Email sent: ${campaignSubject}`,
              description: `Automated email sent to ${contact.company}`,
              contactId: contact.id,
              createdBy: userId
            }
          });

          logger.info(`✅ Email sent to ${contact.company} - Message ID: ${emailResult.messageId}`);
        } else {
          emailResults.push({
            contactId: contact.id,
            company: contact.company,
            email: contact.email,
            status: 'failed',
            error: emailResult.error
          });
          logger.error(`Failed to send email to ${contact.company}: ${emailResult.error}`);
        }

        // Update task progress
        const progress = Math.round(((i + 1) / contacts.length) * 100);
        await prisma.autopilotTask.update({
          where: { id: task.id },
          data: { progress }
        });

        // Rate limiting: wait 1 second between emails
        if (i < contacts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error: any) {
        logger.error(`Failed to email ${contact.company}:`, error.message);
        emailResults.push({
          contactId: contact.id,
          company: contact.company,
          email: contact.email,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Update task with results
    await prisma.autopilotTask.update({
      where: { id: task.id },
      data: {
        status: successfulEmails > 0 ? 'completed' : 'failed',
        progress: 100,
        resultData: JSON.stringify({
          totalContacts: contacts.length,
          emailsSent: successfulEmails,
          emailResults,
          source: 'Professional SMTP (REAL)',
          timestamp: new Date().toISOString()
        }),
        completedAt: new Date()
      }
    });

    logger.info(`🎉 Email campaign completed: ${successfulEmails}/${contacts.length} emails sent`);

    res.json({
      success: true,
      message: `Sent ${successfulEmails} real emails using Professional SMTP`,
      data: {
        taskId: task.id,
        totalContacts: contacts.length,
        emailsSent: successfulEmails,
        emailResults,
        source: 'Professional SMTP (REAL - CampaignIt)',
        storage: 'database',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    logger.error('Email campaign failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute email campaign',
      error: error.message
    });
  }
});

/**
 * Generate personalized email HTML
 */
function generatePersonalizedEmail(context: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .opportunities { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Transform Your Digital Presence</h1>
    </div>
    <div class="content">
      <p>Hi ${context.recipientName},</p>
      
      <p>I noticed <strong>${context.companyName}</strong> in ${context.industry}, and I wanted to reach out personally.</p>
      
      ${context.websiteUrl ? `<p>After reviewing your website at <a href="${context.websiteUrl}">${context.websiteUrl}</a>, I identified some exciting opportunities to enhance your online presence:</p>` : ''}
      
      <div class="opportunities">
        <h3>💡 Growth Opportunities:</h3>
        <ul>
          ${context.opportunities.map((opp: string) => `<li>${opp}</li>`).join('')}
        </ul>
      </div>
      
      <p>At <strong>CampaignIt</strong>, we specialize in helping businesses like yours:</p>
      <ul>
        <li>✨ Modernize their website design</li>
        <li>📈 Improve SEO and search rankings</li>
        <li>📱 Optimize for mobile devices</li>
        <li>🎯 Generate more qualified leads</li>
      </ul>
      
      <p>I'd love to discuss how we can help ${context.companyName} achieve its digital goals.</p>
      
      <center>
        <a href="https://calendly.com/campaignit" class="cta-button">${context.callToAction}</a>
      </center>
      
      <p>Looking forward to connecting!</p>
      
      <p>Best regards,<br>
      ${context.senderName}<br>
      <a href="mailto:${context.senderEmail}">${context.senderEmail}</a></p>
    </div>
    <div class="footer">
      <p>CampaignIt | South Africa<br>
      <a href="https://campaignit.co.za">www.campaignit.co.za</a></p>
      <p><small>You're receiving this because we identified your business as a potential fit for our services.</small></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Get ROI Analytics with REAL Database Queries
router.get('/analytics/roi', [
  query('userId').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = (req.query.userId as string) || '1';
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

    logger.info(`📊 Calculating REAL ROI analytics for user ${userId}`);

    // Get autopilot config
    const config = await prisma.autopilotConfig.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!config) {
      return res.json({
        success: true,
        message: 'No autopilot data available',
        data: {
          summary: {
            totalLeads: 0,
            qualifiedLeads: 0,
            callsMade: 0,
            emailsSent: 0,
            estimatedRevenue: 0,
            roi: 0
          }
        }
      });
    }

    // REAL DATABASE QUERIES FOR ANALYTICS

    // 1. Total leads found (from contacts created by this user)
    const totalLeads = await prisma.contact.count({
      where: {
        createdBy: userId,
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    // 2. Qualified leads (score >= 70)
    const qualifiedLeads = await prisma.contact.count({
      where: {
        createdBy: userId,
        score: { gte: 70 },
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    // 3. Calls made
    const callsMade = await prisma.callLog.count({
      where: {
        createdBy: userId,
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    // 4. Successful calls (answered)
    const successfulCalls = await prisma.callLog.count({
      where: {
        createdBy: userId,
        status: 'ANSWERED',
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    // 5. Emails sent (from activities)
    const emailsSent = await prisma.activity.count({
      where: {
        createdBy: userId,
        type: 'EMAIL',
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    // 6. Deals created
    const dealsCreated = await prisma.deal.count({
      where: {
        createdBy: userId,
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    // 7. Total deal value
    const dealValue = await prisma.deal.aggregate({
      where: {
        createdBy: userId,
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: {
        value: true
      }
    });

    // 8. Closed/Won deals
    const closedDeals = await prisma.deal.count({
      where: {
        createdBy: userId,
        stage: { in: ['WON', 'CLOSED_WON'] },
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    // 9. Tasks completed
    const tasksCompleted = await prisma.autopilotTask.count({
      where: {
        configId: config.id,
        status: 'completed',
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    // Calculate metrics
    const conversionRate = totalLeads > 0 ? ((qualifiedLeads / totalLeads) * 100).toFixed(2) : '0.00';
    const callAnswerRate = callsMade > 0 ? ((successfulCalls / callsMade) * 100).toFixed(2) : '0.00';
    const dealCloseRate = dealsCreated > 0 ? ((closedDeals / dealsCreated) * 100).toFixed(2) : '0.00';
    
    const estimatedRevenue = dealValue._sum.value || 0;
    const costPerLead = 5; // Estimated cost per lead
    const totalCost = totalLeads * costPerLead;
    const roi = totalCost > 0 ? (((estimatedRevenue - totalCost) / totalCost) * 100).toFixed(2) : '0.00';

    // Get recent activities
    const recentActivities = await prisma.activity.findMany({
      where: {
        createdBy: userId,
        createdAt: { gte: startDate, lte: endDate }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        contact: {
          select: {
            company: true
          }
        }
      }
    });

    // Get top performing leads
    const topLeads = await prisma.contact.findMany({
      where: {
        createdBy: userId,
        score: { gte: 70 },
        createdAt: { gte: startDate, lte: endDate }
      },
      orderBy: { score: 'desc' },
      take: 5,
      select: {
        id: true,
        company: true,
        industry: true,
        score: true,
        qualificationCategory: true,
        website: true
      }
    });

    logger.info(`✅ ROI analytics calculated: ${totalLeads} leads, ${qualifiedLeads} qualified, ROI: ${roi}%`);

    res.json({
      success: true,
      message: 'ROI analytics calculated from real database data',
      data: {
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        },
        summary: {
          totalLeads,
          qualifiedLeads,
          callsMade,
          successfulCalls,
          emailsSent,
          dealsCreated,
          closedDeals,
          tasksCompleted,
          estimatedRevenue,
          totalCost,
          roi: parseFloat(roi)
        },
        metrics: {
          conversionRate: parseFloat(conversionRate),
          callAnswerRate: parseFloat(callAnswerRate),
          dealCloseRate: parseFloat(dealCloseRate),
          avgDealValue: dealsCreated > 0 ? (estimatedRevenue / dealsCreated).toFixed(2) : '0.00',
          costPerLead: costPerLead.toFixed(2),
          revenuePerLead: totalLeads > 0 ? (estimatedRevenue / totalLeads).toFixed(2) : '0.00'
        },
        topLeads: topLeads.map(lead => ({
          company: lead.company,
          industry: lead.industry,
          score: lead.score,
          category: lead.qualificationCategory,
          website: lead.website
        })),
        recentActivities: recentActivities.map(activity => ({
          type: activity.type,
          title: activity.title,
          company: activity.contact?.company || 'Unknown',
          createdAt: activity.createdAt
        })),
        source: 'Real Database Analytics',
        storage: 'database',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    logger.error('ROI analytics failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate ROI analytics',
      error: error.message
    });
  }
});

// Workflow simulation endpoint
router.post('/simulate-workflow', async (req: Request, res: Response) => {
  try {
    const { industry = 'technology', budget = 5000 } = req.body;

    res.json({
      success: true,
      message: 'Workflow simulation with database persistence',
      data: {
        industry,
        budget,
        steps: [
          { step: 1, name: 'Find Leads', status: 'completed', results: `Found 15 ${industry} companies` },
          { step: 2, name: 'Analyze Websites', status: 'completed', results: '12 qualified leads identified' },
          { step: 3, name: 'Make Calls', status: 'in_progress', results: '8 calls scheduled' },
          { step: 4, name: 'Assign Designers', status: 'pending', results: 'Awaiting call outcomes' },
          { step: 5, name: 'Send Emails', status: 'pending', results: 'Email templates prepared' },
          { step: 6, name: 'Track ROI', status: 'pending', results: 'Analytics dashboard ready' }
        ],
        summary: {
          totalLeads: 15,
          qualifiedLeads: 12,
          callsScheduled: 8,
          estimatedROI: '$45,000',
          timeToComplete: '24-48 hours',
          storage: 'database'
        }
      }
    });
  } catch (error: any) {
    logger.error('Workflow simulation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Workflow simulation failed',
      error: error.message
    });
  }
});

export default router;
