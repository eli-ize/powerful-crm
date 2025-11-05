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

export interface StreamChunk {
  content: string;
  done: boolean;
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
        baseURL: config.azureOpenAIEndpoint,
      });
      logger.info('Azure AI Foundry Service initialized (Phi-4-mini-instruct, Johannesburg)');
    } else if (config.openaiApiKey) {
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
        model: request.model || config.azureOpenAIDeployment || 'Phi-4-mini-instruct',
        messages: request.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          ...(msg.name && { name: msg.name }),
        })),
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 80,
        top_p: request.topP ?? 1,
        frequency_penalty: request.frequencyPenalty ?? 0,
        presence_penalty: request.presencePenalty ?? 0,
        stop: request.stop,
      });

      const choice = response.choices[0];
      if (!choice) {
        throw new Error('No response generated');
      }

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

  async *generateChatCompletionStream(request: ChatCompletionRequest): AsyncGenerator<StreamChunk> {
    if (!this.client) {
      throw new Error('OpenAI service not configured');
    }

    try {
      const stream = await this.client.chat.completions.create({
        model: request.model || config.azureOpenAIDeployment || 'Phi-4-mini-instruct',
        messages: request.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          ...(msg.name && { name: msg.name }),
        })),
        temperature: request.temperature ?? 0.6,
        max_tokens: request.maxTokens ?? 200,  // Increased default for complete responses
        top_p: request.topP ?? 1,
        frequency_penalty: request.frequencyPenalty ?? 0,
        presence_penalty: request.presencePenalty ?? 0,
        stop: request.stop,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield {
            content,
            done: false,
          };
        }
        
        if (chunk.choices[0]?.finish_reason) {
          yield {
            content: '',
            done: true,
          };
        }
      }
    } catch (error) {
      logger.error('Azure OpenAI streaming failed:', error);
      throw new Error('Failed to generate streaming AI response');
    }
  }

  async generateCallResponse(
    context: ConversationContext,
    prospectMessage: string
  ): Promise<{ response: string; nextStage: string; confidence: number }> {
    const systemPrompt = this.buildSystemPrompt(context);
    
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...context.conversationHistory,
      { role: 'user', content: prospectMessage },
    ];

    try {
      const completion = await this.generateChatCompletion({
        messages,
        temperature: 0.6,
        maxTokens: 40,
      });

      const response = completion.content.trim();
      
      return { 
        response, 
        nextStage: context.currentStage,
        confidence: 0.8 
      };
    } catch (error) {
      logger.error('Failed to generate call response:', error);
      
      return {
        response: "I see. Could you tell me more about that?",
        nextStage: context.currentStage,
        confidence: 0.5,
      };
    }
  }

  private buildSystemPrompt(context: ConversationContext): string {
    return `You are a professional sales agent on a phone call.

PERSONA: ${context.personalityPrompt}
OBJECTIVE: ${context.objective}

RULES:
- Keep responses under 25 words (1-2 sentences max)
- Sound natural and conversational
- Ask one question at a time
- Be empathetic and listen actively
- Don't be pushy

STAGE: ${context.currentStage}

Respond briefly and naturally as if speaking on the phone.`;
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
    const analysisPrompt = `Analyze this sales call conversation quickly.

OBJECTIVE: ${campaignObjective}

CONVERSATION:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Respond with JSON:
{
  "outcome": "interested|not_interested|needs_follow_up|no_answer",
  "confidence": 0.85,
  "summary": "Brief summary",
  "nextAction": "Next step",
  "insights": ["Insight 1", "Insight 2"]
}`;

    try {
      const completion = await this.generateChatCompletion({
        messages: [{ role: 'user', content: analysisPrompt }],
        temperature: 0.3,
        maxTokens: 300,
      });

      const analysis = JSON.parse(completion.content);
      
      return analysis;
    } catch (error) {
      logger.error('Failed to analyze call outcome:', error);
      
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
    const emailPrompt = `Create a brief follow-up email.

PROSPECT: ${prospectName}
OBJECTIVE: ${campaignObjective}
SUMMARY: ${conversationSummary}

JSON format:
{
  "subject": "Subject line",
  "body": "Brief email body"
}`;

    try {
      const completion = await this.generateChatCompletion({
        messages: [{ role: 'user', content: emailPrompt }],
        temperature: 0.7,
        maxTokens: 400,
      });

      const email = JSON.parse(completion.content);
      
      return email;
    } catch (error) {
      logger.error('Failed to generate follow-up email:', error);
      
      return {
        subject: `Following up on our conversation`,
        body: `Hi ${prospectName},\n\nThank you for your time today. Based on our discussion about ${campaignObjective}, I believe we can help.\n\nWould you be available for a brief call this week?\n\nBest regards`,
      };
    }
  }

  estimateTokenUsage(text: string): number {
    return Math.ceil(text.length / 4);
  }

  estimateCost(promptTokens: number, completionTokens: number, model: string = 'Phi-4-mini-instruct'): number {
    const pricing: { [key: string]: { input: number; output: number } } = {
      'Phi-4-mini-instruct': { input: 0.001, output: 0.002 },
      'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'gpt-4': { input: 0.03, output: 0.06 },
    };

    const modelPricing = pricing[model] || pricing['Phi-4-mini-instruct'];
    const inputCost = (promptTokens / 1000) * modelPricing.input;
    const outputCost = (completionTokens / 1000) * modelPricing.output;
    
    return Math.round((inputCost + outputCost) * 10000) / 10000;
  }
}

export default new AzureOpenAIService();