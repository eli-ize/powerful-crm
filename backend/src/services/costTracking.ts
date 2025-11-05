/**
 * Cost Tracking Service
 * Monitors and logs all API costs in real-time
 */

import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export interface CostEntry {
  service: 'openai' | 'azure_speech_tts' | 'azure_speech_stt' | 'telnyx' | 'azure_openai';
  operation: string;
  cost: number;
  tokens?: number;
  duration?: number;
  metadata?: any;
  userId?: string;
  sessionId?: string;
}

export interface SpendingSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  breakdown: {
    [service: string]: number;
  };
}

class CostTrackingService {
  /**
   * Track an API usage and its cost
   */
  async trackUsage(entry: CostEntry): Promise<void> {
    try {
      // For SQLite, we need to execute raw SQL since the tables might not be in Prisma schema
      await prisma.$executeRaw`
        INSERT INTO api_usage (service, operation, cost, tokens, duration, metadata, user_id, session_id, created_at)
        VALUES (${entry.service}, ${entry.operation}, ${entry.cost}, ${entry.tokens || null}, ${entry.duration || null}, 
                ${JSON.stringify(entry.metadata || {})}, ${entry.userId || null}, ${entry.sessionId || null}, datetime('now'))
      `;

      logger.info(`💰 Cost tracked: ${entry.service} - ${entry.operation}: $${entry.cost.toFixed(4)}`);
    } catch (error) {
      logger.error('Failed to track cost:', error);
      // Don't throw - cost tracking shouldn't break the app
    }
  }

  /**
   * Get spending for a time period
   */
  async getSpending(startDate: Date, endDate: Date): Promise<number> {
    try {
      const result = await prisma.$queryRaw<Array<{ total: number }>>`
        SELECT COALESCE(SUM(cost), 0) as total
        FROM api_usage
        WHERE created_at >= ${startDate.toISOString()}
        AND created_at <= ${endDate.toISOString()}
      `;

      return result[0]?.total || 0;
    } catch (error) {
      logger.error('Failed to get spending:', error);
      return 0;
    }
  }

  /**
   * Get today's spending
   */
  async getTodaySpending(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getSpending(today, tomorrow);
  }

  /**
   * Get this month's spending
   */
  async getMonthSpending(): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.getSpending(startOfMonth, endOfMonth);
  }

  /**
   * Get comprehensive spending summary
   */
  async getSpendingSummary(): Promise<SpendingSummary> {
    try {
      const today = await this.getTodaySpending();
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const thisWeek = await this.getSpending(weekAgo, new Date());
      
      const thisMonth = await this.getMonthSpending();

      // Get breakdown by service
      const breakdownResult = await prisma.$queryRaw<Array<{ service: string; total: number }>>`
        SELECT service, COALESCE(SUM(cost), 0) as total
        FROM api_usage
        WHERE created_at >= date('now', 'start of month')
        GROUP BY service
      `;

      const breakdown: { [service: string]: number } = {};
      breakdownResult.forEach(row => {
        breakdown[row.service] = row.total;
      });

      return {
        today,
        thisWeek,
        thisMonth,
        breakdown
      };
    } catch (error) {
      logger.error('Failed to get spending summary:', error);
      return {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        breakdown: {}
      };
    }
  }

  /**
   * Check if spending limit is reached
   */
  async checkLimit(limit: number): Promise<boolean> {
    const today = await this.getTodaySpending();
    return today >= limit;
  }

  /**
   * Get cost estimates for operations
   */
  estimateCost(service: string, operation: string, units: number): number {
    const rates = {
      openai: {
        'gpt-4': 0.03 / 1000, // per token
        'gpt-3.5-turbo': 0.002 / 1000
      },
      azure_openai: {
        'Phi-4-mini-instruct': 0.002 / 1000 // Very cheap!
      },
      azure_speech_tts: 16 / 1000000, // per character
      azure_speech_stt: 1 / 3600, // per second
      telnyx: {
        'outbound_call': 0.02 / 60 // per second
      }
    };

    // Simplified cost estimation
    if (service === 'telnyx' && operation === 'outbound_call') {
      return (rates.telnyx.outbound_call || 0) * units;
    } else if (service === 'azure_speech_tts') {
      return (rates.azure_speech_tts || 0) * units;
    } else if (service === 'azure_speech_stt') {
      return (rates.azure_speech_stt || 0) * units;
    } else if (service === 'azure_openai') {
      return (rates.azure_openai['Phi-4-mini-instruct'] || 0) * units;
    }

    return 0;
  }
}

export const costTracking = new CostTrackingService();

/**
 * Helper function to track OpenAI API usage
 */
export async function trackOpenAICost(tokens: number, model: string = 'gpt-3.5-turbo', sessionId?: string) {
  const costPerToken = model.includes('gpt-4') ? 0.03 / 1000 : 0.002 / 1000;
  const cost = tokens * costPerToken;

  await costTracking.trackUsage({
    service: 'openai',
    operation: 'chat_completion',
    cost,
    tokens,
    metadata: { model },
    sessionId
  });
}

/**
 * Helper function to track Azure OpenAI usage
 */
export async function trackAzureOpenAICost(tokens: number, model: string = 'Phi-4-mini-instruct', sessionId?: string) {
  const costPerToken = 0.002 / 1000; // Very cheap model
  const cost = tokens * costPerToken;

  await costTracking.trackUsage({
    service: 'azure_openai',
    operation: 'chat_completion',
    cost,
    tokens,
    metadata: { model },
    sessionId
  });
}

/**
 * Helper function to track Azure Speech TTS
 */
export async function trackTTSCost(characters: number, sessionId?: string) {
  const cost = (characters * 16) / 1000000; // $16 per 1M characters

  await costTracking.trackUsage({
    service: 'azure_speech_tts',
    operation: 'text_to_speech',
    cost,
    metadata: { characters },
    sessionId
  });
}

/**
 * Helper function to track Azure Speech STT
 */
export async function trackSTTCost(durationSeconds: number, sessionId?: string) {
  const cost = durationSeconds / 3600; // $1 per hour

  await costTracking.trackUsage({
    service: 'azure_speech_stt',
    operation: 'speech_to_text',
    cost,
    duration: durationSeconds,
    sessionId
  });
}

/**
 * Helper function to track Telnyx call costs
 */
export async function trackTelnyxCost(durationSeconds: number, sessionId?: string) {
  const cost = (durationSeconds * 0.02) / 60; // $0.02 per minute

  await costTracking.trackUsage({
    service: 'telnyx',
    operation: 'outbound_call',
    cost,
    duration: durationSeconds,
    sessionId
  });
}

export default costTracking;
