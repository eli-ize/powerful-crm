import azureOpenAI, { ChatMessage, ChatCompletionRequest, ChatCompletionResponse, ConversationContext } from './azureOpenAI';
import anthropic from './anthropic';
import logger from '../utils/logger';

export type AIProvider = 'azure-openai' | 'anthropic' | 'auto';

export interface UnifiedAIConfig {
  provider?: AIProvider;
  model?: string;
  fallbackEnabled?: boolean;
}

/**
 * Unified AI Service supporting multiple providers with automatic fallback
 * - Azure OpenAI (GPT-4, GPT-3.5-turbo)
 * - Anthropic Claude (Claude Sonnet 4.5)
 */
export class UnifiedAIService {
  private readonly preferredProvider: AIProvider;
  private readonly fallbackEnabled: boolean;

  constructor(config: UnifiedAIConfig = {}) {
    this.preferredProvider = (process.env.AI_PROVIDER as AIProvider) || config.provider || 'auto';
    this.fallbackEnabled = config.fallbackEnabled ?? true;

    logger.info(`Unified AI Service initialized with provider: ${this.preferredProvider}`);
  }

  /**
   * Select the best available provider based on configuration and availability
   */
  private selectProvider(): 'azure-openai' | 'anthropic' {
    if (this.preferredProvider === 'azure-openai') {
      return 'azure-openai';
    }
    
    if (this.preferredProvider === 'anthropic' && anthropic.isAvailable()) {
      return 'anthropic';
    }

    // Auto-select: prefer Claude if available, fallback to Azure OpenAI
    if (anthropic.isAvailable()) {
      logger.info('Auto-selected Anthropic Claude Sonnet 4.5');
      return 'anthropic';
    }

    logger.info('Auto-selected Azure OpenAI');
    return 'azure-openai';
  }

  /**
   * Generate a chat completion with automatic provider selection and fallback
   */
  async generateChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const provider = this.selectProvider();
    
    try {
      if (provider === 'anthropic') {
        logger.info('Using Claude Sonnet 4.5 for completion');
        return await anthropic.generateChatCompletion(request);
      } else {
        logger.info('Using Azure OpenAI for completion');
        return await azureOpenAI.generateChatCompletion(request);
      }
    } catch (error) {
      logger.error(`${provider} completion failed:`, error);

      // Try fallback provider if enabled
      if (this.fallbackEnabled) {
        const fallbackProvider = provider === 'anthropic' ? 'azure-openai' : 'anthropic';
        
        try {
          logger.info(`Attempting fallback to ${fallbackProvider}`);
          
          if (fallbackProvider === 'anthropic' && anthropic.isAvailable()) {
            return await anthropic.generateChatCompletion(request);
          } else {
            return await azureOpenAI.generateChatCompletion(request);
          }
        } catch (fallbackError) {
          logger.error(`Fallback to ${fallbackProvider} also failed:`, fallbackError);
          throw new Error('All AI providers failed to generate response');
        }
      }

      throw error;
    }
  }

  /**
   * Generate a response during a sales call
   */
  async generateCallResponse(
    context: ConversationContext,
    prospectMessage: string
  ): Promise<{ response: string; nextStage: string; confidence: number }> {
    const provider = this.selectProvider();
    
    try {
      if (provider === 'anthropic') {
        return await anthropic.generateCallResponse(context, prospectMessage);
      } else {
        return await azureOpenAI.generateCallResponse(context, prospectMessage);
      }
    } catch (error) {
      logger.error(`${provider} call response failed:`, error);

      if (this.fallbackEnabled) {
        const fallbackProvider = provider === 'anthropic' ? 'azure-openai' : 'anthropic';
        logger.info(`Attempting fallback to ${fallbackProvider} for call response`);
        
        try {
          if (fallbackProvider === 'anthropic' && anthropic.isAvailable()) {
            return await anthropic.generateCallResponse(context, prospectMessage);
          } else {
            return await azureOpenAI.generateCallResponse(context, prospectMessage);
          }
        } catch (fallbackError) {
          // Return safe fallback response
          return {
            response: "I appreciate you sharing that. Could you tell me more?",
            nextStage: context.currentStage,
            confidence: 0.5,
          };
        }
      }

      throw error;
    }
  }

  /**
   * Analyze call outcome
   */
  async analyzeCallOutcome(
    conversationHistory: ChatMessage[],
    campaignObjective: string
  ): Promise<{
    outcome: 'interested' | 'not_interested' | 'needs_follow_up' | 'no_answer';
    confidence: number;
    summary: string;
    nextAction: string;
    insights: string[];
  }> {
    const provider = this.selectProvider();
    
    try {
      if (provider === 'anthropic') {
        return await anthropic.analyzeCallOutcome(conversationHistory, campaignObjective);
      } else {
        return await azureOpenAI.analyzeCallOutcome(conversationHistory, campaignObjective);
      }
    } catch (error) {
      logger.error(`Call analysis failed with ${provider}:`, error);

      if (this.fallbackEnabled) {
        const fallbackProvider = provider === 'anthropic' ? 'azure-openai' : 'anthropic';
        
        try {
          if (fallbackProvider === 'anthropic' && anthropic.isAvailable()) {
            return await anthropic.analyzeCallOutcome(conversationHistory, campaignObjective);
          } else {
            return await azureOpenAI.analyzeCallOutcome(conversationHistory, campaignObjective);
          }
        } catch (fallbackError) {
          // Return safe fallback
          return {
            outcome: 'needs_follow_up',
            confidence: 0.5,
            summary: 'Call completed but requires manual review.',
            nextAction: 'Manual review required',
            insights: ['Automatic analysis unavailable'],
          };
        }
      }

      throw error;
    }
  }

  /**
   * Generate follow-up email
   */
  async generateEmailFollowUp(
    conversationSummary: string,
    prospectName: string,
    campaignObjective: string
  ): Promise<{ subject: string; body: string }> {
    const provider = this.selectProvider();
    
    try {
      if (provider === 'anthropic') {
        return await anthropic.generateEmailFollowUp(conversationSummary, prospectName, campaignObjective);
      } else {
        return await azureOpenAI.generateEmailFollowUp(conversationSummary, prospectName, campaignObjective);
      }
    } catch (error) {
      logger.error(`Email generation failed with ${provider}:`, error);

      if (this.fallbackEnabled) {
        const fallbackProvider = provider === 'anthropic' ? 'azure-openai' : 'anthropic';
        
        try {
          if (fallbackProvider === 'anthropic' && anthropic.isAvailable()) {
            return await anthropic.generateEmailFollowUp(conversationSummary, prospectName, campaignObjective);
          } else {
            return await azureOpenAI.generateEmailFollowUp(conversationSummary, prospectName, campaignObjective);
          }
        } catch (fallbackError) {
          // Return safe fallback
          return {
            subject: `Following up on our conversation`,
            body: `Hi ${prospectName},\n\nThank you for taking the time to speak with me. I wanted to follow up on our discussion about ${campaignObjective}.\n\nBest regards`,
          };
        }
      }

      throw error;
    }
  }

  /**
   * Get current provider info
   */
  getCurrentProvider(): { name: string; available: boolean } {
    const provider = this.selectProvider();
    
    return {
      name: provider === 'anthropic' ? 'Claude Sonnet 4.5' : 'Azure OpenAI',
      available: provider === 'anthropic' ? anthropic.isAvailable() : true,
    };
  }

  /**
   * Estimate cost for a request
   */
  estimateCost(promptTokens: number, completionTokens: number, model?: string): number {
    const provider = this.selectProvider();
    
    if (provider === 'anthropic') {
      return anthropic.estimateCost(promptTokens, completionTokens);
    } else {
      return azureOpenAI.estimateCost(promptTokens, completionTokens, model || 'gpt-4');
    }
  }
}

// Export singleton instance
export default new UnifiedAIService();

// Re-export types for convenience
export type { ChatMessage, ChatCompletionRequest, ChatCompletionResponse, ConversationContext };
