import { OpenAI } from 'openai';
import config from '../config';
import logger from '../utils/logger';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface ChatCompletionResponse {
  content: string;
  finishReason: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface ConversationContext {
  campaignId: string;
  contactId: string;
  objective: string;
  personalityPrompt: string;
  conversationHistory: ChatMessage[];
  currentStage: 'greeting' | 'qualification' | 'pitch' | 'objection_handling' | 'closing' | 'follow_up';
}

export class AzureOpenAIService {
  private readonly client: OpenAI | null = null;

  constructor() {
    if (config.azureOpenAIKey && config.azureOpenAIEndpoint) {
      this.client = new OpenAI({
        apiKey: config.azureOpenAIKey,
        baseURL: `${config.azureOpenAIEndpoint}/openai/deployments/${config.azureOpenAIDeployment || 'gpt-4'}`,
        defaultQuery: { 'api-version': config.azureOpenAIApiVersion || '2024-02-15-preview' },
        defaultHeaders: {
          'api-key': config.azureOpenAIKey,
        },
      });
      logger.info('Azure OpenAI Service initialized');
    } else if (config.openaiApiKey) {
      // Fallback to regular OpenAI
      this.client = new OpenAI({
        apiKey: config.openaiApiKey,
      });
      logger.info('OpenAI Service initialized (fallback)');
    } else {
      logger.warn('Neither Azure OpenAI nor OpenAI configured');
    }
  }

  async generateChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.client) {
      throw new Error('OpenAI service not configured');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: request.model || 'gpt-4',
        messages: request.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          ...(msg.name && { name: msg.name }),
        })),
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 1000,
        top_p: request.topP ?? 1,
        frequency_penalty: request.frequencyPenalty ?? 0,
        presence_penalty: request.presencePenalty ?? 0,
        stop: request.stop,
      });

      const choice = response.choices[0];
      if (!choice) {
        throw new Error('No response generated');
      }

      logger.info(`AI completion generated: ${choice.message.content?.length} characters`);

      return {
        content: choice.message.content || '',
        finishReason: choice.finish_reason || 'unknown',
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        model: response.model,
      };
    } catch (error) {
      logger.error('Azure OpenAI completion failed:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async generateCallResponse(
    context: ConversationContext,
    prospectMessage: string
  ): Promise<{ response: string; nextStage: string; confidence: number }> {
    const systemPrompt = this.buildSystemPrompt(context);
    
    // Add prospect's message to conversation history
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...context.conversationHistory,
      { role: 'user', content: prospectMessage },
    ];

    try {
      const completion = await this.generateChatCompletion({
        messages,
        temperature: 0.8,
        maxTokens: 200, // Keep responses concise for calls
      });

      // Parse the response to extract next stage and confidence
      const { response, nextStage, confidence } = this.parseCallResponse(
        completion.content,
        context.currentStage
      );

      logger.info(`Generated call response: stage ${context.currentStage} -> ${nextStage}`);

      return { response, nextStage, confidence };
    } catch (error) {
      logger.error('Failed to generate call response:', error);
      
      // Fallback response
      return {
        response: "I appreciate you sharing that with me. Could you tell me more about your current situation?",
        nextStage: context.currentStage,
        confidence: 0.5,
      };
    }
  }

  private buildSystemPrompt(context: ConversationContext): string {
    const basePrompt = `You are an AI sales agent making a cold call. 

PERSONA: ${context.personalityPrompt}

OBJECTIVE: ${context.objective}

CURRENT STAGE: ${context.currentStage}

CONVERSATION GUIDELINES:
- Keep responses under 50 words for natural phone conversation
- Be conversational and human-like
- Listen actively and ask follow-up questions
- Handle objections with empathy
- Don't be pushy or aggressive
- End each response with [STAGE:stage_name|CONFIDENCE:0.0-1.0]

STAGE PROGRESSION:
1. greeting: Introduce yourself and purpose
2. qualification: Understand their needs and pain points  
3. pitch: Present your solution based on their needs
4. objection_handling: Address concerns and doubts
5. closing: Ask for next steps (meeting, demo, etc.)
6. follow_up: Schedule future contact

RESPONSE FORMAT:
Your conversational response here.
[STAGE:next_stage|CONFIDENCE:0.8]

Remember: You're on a phone call. Be natural, conversational, and concise.`;

    return basePrompt;
  }

  private parseCallResponse(
    response: string,
    currentStage: string
  ): { response: string; nextStage: string; confidence: number } {
    // Extract stage and confidence from response
    const regex = /\[STAGE:(\w+)\|CONFIDENCE:([\d.]+)\]/;
    const stageMatch = regex.exec(response);
    
    let nextStage = currentStage;
    let confidence = 0.5;
    let cleanResponse = response;

    if (stageMatch) {
      nextStage = stageMatch[1];
      confidence = Number.parseFloat(stageMatch[2]);
      cleanResponse = response.replace(/\[STAGE:.*?\]/, '').trim();
    }

    return {
      response: cleanResponse,
      nextStage,
      confidence: Math.max(0, Math.min(1, confidence)),
    };
  }

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
    const analysisPrompt = `Analyze this sales call conversation and determine the outcome.

CAMPAIGN OBJECTIVE: ${campaignObjective}

CONVERSATION:
${conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}

Provide your analysis in this exact JSON format:
{
  "outcome": "interested|not_interested|needs_follow_up|no_answer",
  "confidence": 0.85,
  "summary": "Brief 1-2 sentence summary of the call",
  "nextAction": "Specific recommended next step",
  "insights": ["Key insight 1", "Key insight 2", "Key insight 3"]
}`;

    try {
      const completion = await this.generateChatCompletion({
        messages: [{ role: 'user', content: analysisPrompt }],
        temperature: 0.3, // Low temperature for consistent analysis
        maxTokens: 500,
      });

      const analysis = JSON.parse(completion.content);
      
      logger.info(`Call analysis completed: ${analysis.outcome} (${analysis.confidence})`);
      
      return analysis;
    } catch (error) {
      logger.error('Failed to analyze call outcome:', error);
      
      // Fallback analysis
      return {
        outcome: 'needs_follow_up',
        confidence: 0.5,
        summary: 'Call completed but requires manual review.',
        nextAction: 'Manual review required',
        insights: ['Automatic analysis failed'],
      };
    }
  }

  async generateEmailFollowUp(
    conversationSummary: string,
    prospectName: string,
    campaignObjective: string
  ): Promise<{ subject: string; body: string }> {
    const emailPrompt = `Generate a follow-up email based on this sales call.

PROSPECT NAME: ${prospectName}
CAMPAIGN OBJECTIVE: ${campaignObjective}
CALL SUMMARY: ${conversationSummary}

Create a professional, personalized follow-up email with:
- Compelling subject line
- Reference to the conversation
- Clear value proposition
- Specific next step
- Professional but friendly tone

Format your response as JSON:
{
  "subject": "Subject line here",
  "body": "Email body here with proper formatting"
}`;

    try {
      const completion = await this.generateChatCompletion({
        messages: [{ role: 'user', content: emailPrompt }],
        temperature: 0.7,
        maxTokens: 800,
      });

      const email = JSON.parse(completion.content);
      
      logger.info(`Follow-up email generated for ${prospectName}`);
      
      return email;
    } catch (error) {
      logger.error('Failed to generate follow-up email:', error);
      
      // Fallback email
      return {
        subject: `Following up on our conversation`,
        body: `Hi ${prospectName},\n\nThank you for taking the time to speak with me today. I wanted to follow up on our discussion about ${campaignObjective}.\n\nBased on our conversation, I believe we can help you achieve your goals. Would you be available for a brief call this week to discuss next steps?\n\nBest regards,\nYour AI Sales Agent`,
      };
    }
  }

  estimateTokenUsage(text: string): number {
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }

  estimateCost(promptTokens: number, completionTokens: number, model: string = 'gpt-4'): number {
    // Azure OpenAI pricing (as of 2024)
    const pricing: { [key: string]: { input: number; output: number } } = {
      'gpt-4': { input: 0.03, output: 0.06 }, // per 1K tokens
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
    };

    const modelPricing = pricing[model] || pricing['gpt-4'];
    const inputCost = (promptTokens / 1000) * modelPricing.input;
    const outputCost = (completionTokens / 1000) * modelPricing.output;
    
    return Math.round((inputCost + outputCost) * 10000) / 10000; // Round to 4 decimal places
  }
}

export default new AzureOpenAIService();