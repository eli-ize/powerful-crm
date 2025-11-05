import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import googlePlacesService from './googlePlaces';
import { VoiceCallHandler } from './voiceCallHandler';
import azureOpenAI from './azureOpenAI';

const prisma = new PrismaClient();

export interface WorkflowStep {
  type: 'find_leads' | 'analyze_website' | 'make_calls' | 'assign_designer' | 'send_emails';
  params: any;
  order: number;
}

export class AutopilotWorkflowEngine {
  private activeWorkflows: Map<string, boolean> = new Map();

  async startAutopilot(configId: string): Promise<string> {
    try {
      logger.info(`Starting autopilot for config ${configId}`);

      // Get autopilot configuration
      const config = await this.getAutopilotConfig(configId);
      if (!config) {
        throw new Error('Autopilot configuration not found');
      }

      // Create workflow
      const workflow = await this.createWorkflow(configId, config);
      
      // Mark as active
      this.activeWorkflows.set(configId, true);

      // Start executing workflow steps
      this.executeWorkflowAsync(workflow.id, configId);

      return workflow.id;
    } catch (error) {
      logger.error('Failed to start autopilot:', error);
      throw error;
    }
  }

  async stopAutopilot(configId: string): Promise<void> {
    try {
      logger.info(`Stopping autopilot for config ${configId}`);
      
      // Mark as inactive
      this.activeWorkflows.set(configId, false);

      // Update any running workflows
      await prisma.autopilotWorkflow.updateMany({
        where: {
          configId,
          status: 'running'
        },
        data: {
          status: 'paused'
        }
      });

      // Update any pending/in-progress tasks
      await prisma.autopilotTask.updateMany({
        where: {
          configId,
          status: { in: ['pending', 'in_progress'] }
        },
        data: {
          status: 'failed',
          errorMessage: 'Autopilot stopped by user'
        }
      });

      logger.info(`Autopilot stopped for config ${configId}`);
    } catch (error) {
      logger.error('Failed to stop autopilot:', error);
      throw error;
    }
  }

  private async getAutopilotConfig(configId: string) {
    return await prisma.autopilotConfig.findUnique({
      where: { id: configId }
    });
  }

  private async createWorkflow(configId: string, config: any) {
    const configData = JSON.parse(config.config);
    
    // Define workflow steps based on configuration
    const steps: WorkflowStep[] = [];
    
    if (configData.leadFinding?.enabled) {
      steps.push({
        type: 'find_leads',
        params: configData.leadFinding,
        order: 1
      });
    }

    if (configData.qualification?.enabled) {
      steps.push({
        type: 'analyze_website',
        params: configData.qualification,
        order: 2
      });
    }

    if (configData.calling?.enabled) {
      steps.push({
        type: 'make_calls',
        params: configData.calling,
        order: 3
      });
    }

    if (configData.taskAssignment?.enabled) {
      steps.push({
        type: 'assign_designer',
        params: configData.taskAssignment,
        order: 4
      });
    }

    if (configData.emailAutomation?.enabled) {
      steps.push({
        type: 'send_emails',
        params: configData.emailAutomation,
        order: 5
      });
    }

    return await prisma.autopilotWorkflow.create({
      data: {
        configId,
        name: `Autopilot Workflow - ${new Date().toISOString()}`,
        description: `Automated workflow for ${config.industry} industry`,
        steps: JSON.stringify(steps),
        totalSteps: steps.length,
        status: 'pending'
      }
    });
  }

  private async executeWorkflowAsync(workflowId: string, configId: string) {
    try {
      // Update workflow status to running
      await prisma.autopilotWorkflow.update({
        where: { id: workflowId },
        data: { 
          status: 'running',
          startedAt: new Date()
        }
      });

      // Get workflow steps
      const workflow = await prisma.autopilotWorkflow.findUnique({
        where: { id: workflowId }
      });

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      const steps: WorkflowStep[] = JSON.parse(workflow.steps);
      
      // Execute steps in order
      for (let i = 0; i < steps.length; i++) {
        // Check if autopilot is still active
        if (!this.activeWorkflows.get(configId)) {
          logger.info(`Autopilot stopped, exiting workflow ${workflowId}`);
          break;
        }

        const step = steps[i];
        logger.info(`Executing step ${i + 1}: ${step.type}`, { workflowId, configId });

        // Update current step
        await prisma.autopilotWorkflow.update({
          where: { id: workflowId },
          data: { 
            currentStep: i + 1,
            progress: Math.round(((i + 1) / steps.length) * 100)
          }
        });

        // Execute the step
        await this.executeStep(step, configId, workflowId);

        // Small delay between steps
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Mark workflow as completed
      await prisma.autopilotWorkflow.update({
        where: { id: workflowId },
        data: { 
          status: 'completed',
          completedAt: new Date(),
          progress: 100
        }
      });

      logger.info(`Workflow completed: ${workflowId}`);
    } catch (error) {
      logger.error(`Workflow failed: ${workflowId}`, error);
      
      await prisma.autopilotWorkflow.update({
        where: { id: workflowId },
        data: { 
          status: 'failed',
          completedAt: new Date()
        }
      });
    }
  }

  private async executeStep(step: WorkflowStep, configId: string, workflowId: string) {
    // Create task for this step
    const task = await prisma.autopilotTask.create({
      data: {
        configId,
        type: step.type,
        status: 'in_progress',
        inputData: JSON.stringify(step.params),
        startedAt: new Date()
      }
    });

    try {
      let result: any = {};

      switch (step.type) {
        case 'find_leads':
          result = await this.executeLeadFinding(step.params);
          break;
        case 'analyze_website':
          result = await this.executeWebsiteAnalysis(step.params);
          break;
        case 'make_calls':
          result = await this.executeCalling(step.params);
          break;
        case 'assign_designer':
          result = await this.executeDesignerAssignment(step.params);
          break;
        case 'send_emails':
          result = await this.executeEmailAutomation(step.params);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      // Update task as completed
      await prisma.autopilotTask.update({
        where: { id: task.id },
        data: {
          status: 'completed',
          progress: 100,
          resultData: JSON.stringify(result),
          completedAt: new Date()
        }
      });

      // Update config stats
      await this.updateConfigStats(configId, step.type, result);

      logger.info(`Step completed: ${step.type}`, { taskId: task.id, result });
    } catch (error) {
      // Update task as failed
      await prisma.autopilotTask.update({
        where: { id: task.id },
        data: {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date()
        }
      });

      logger.error(`Step failed: ${step.type}`, { taskId: task.id, error });
      throw error;
    }
  }

  private async executeLeadFinding(params: any): Promise<any> {
    logger.info('Executing lead finding', params);
    
    try {
      // Use existing Google Places service
      const results = await googlePlacesService.searchPlaces({
        query: params.searchQuery,
        location: 'South Africa',
      });

      // Limit results based on target count
      const limitedResults = results.results?.slice(0, params.targetCount) || [];

      // Convert places to contacts (simulate for now)
      const leads = limitedResults.map(place => ({
        name: place.name,
        company: place.name,
        location: place.formatted_address,
        phone: place.formatted_phone_number,
        website: place.website,
        rating: place.rating,
        source: 'google_places_autopilot'
      }));

      return {
        found: leads.length,
        leads: leads,
        searchQuery: params.searchQuery,
        targetCount: params.targetCount
      };
    } catch (error) {
      logger.error('Lead finding failed:', error);
      return {
        found: 0,
        leads: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async executeWebsiteAnalysis(params: any): Promise<any> {
    logger.info('Executing website analysis', params);
    
    // Simulated website analysis for now
    // In production, this would use web scraping and AI analysis
    return {
      analyzed: 45,
      needsWork: 38,
      categories: {
        'No Website': 15,
        'Outdated Design': 12,
        'Poor SEO': 11
      },
      criteria: params.aiCriteria
    };
  }

  private async executeCalling(params: any): Promise<any> {
    logger.info('Executing AI calling', params);
    
    // Simulated calling for now
    // In production, this would integrate with existing calling system
    return {
      called: 25,
      answered: 18,
      interested: 12,
      meetings_booked: 6,
      dailyLimit: params.dailyLimit,
      voiceId: params.voiceId
    };
  }

  private async executeDesignerAssignment(params: any): Promise<any> {
    logger.info('Executing designer assignment', params);
    
    // Simulated designer assignment
    return {
      tasksCreated: 6,
      designersAssigned: params.designerPool.length,
      autoAssigned: params.autoAssignDesigner
    };
  }

  private async executeEmailAutomation(params: any): Promise<any> {
    logger.info('Executing email automation', params);
    
    // Simulated email sending
    return {
      emailsSent: 18,
      opened: 12,
      clicked: 8,
      replied: 3,
      followUpDays: params.followUpDays
    };
  }

  private async updateConfigStats(configId: string, stepType: string, result: any) {
    const updates: any = {};

    switch (stepType) {
      case 'find_leads':
        updates.totalLeadsFound = { increment: result.found || 0 };
        break;
      case 'make_calls':
        updates.totalCallsMade = { increment: result.called || 0 };
        updates.totalMeetingsBooked = { increment: result.meetings_booked || 0 };
        break;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.autopilotConfig.update({
        where: { id: configId },
        data: updates
      });
    }
  }
}

export default new AutopilotWorkflowEngine();