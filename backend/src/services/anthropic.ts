import Anthropic from '@anthropic-ai/sdk';
import logger from '../utils/logger';
import { ChatMessage, ChatCompletionRequest, ChatCompletionResponse, ConversationContext } from './azureOpenAI';

export class AnthropicService {
  private client: Anthropic | null = null;
  private readonly model = 'claude-sonnet-4.5-20241022'; // Latest Claude Sonnet 4.5

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (apiKey) {
      this.client = new Anthropic({
        apiKey: apiKey,
      });
      logger.info('Anthropic Claude Sonnet 4.5 Service initialized');
    } else {
      logger.warn('Anthropic API key not configured');
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async generateChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.client) {
      throw new Error('Anthropic service not configured');
    }

    try {
      // Convert messages format (OpenAI style to Anthropic style)
      const systemMessage = request.messages.find(m => m.role === 'system');
      const conversationMessages = request.messages
        .filter(m => m.role !== 'system')
        .map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        }));

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: request.maxTokens ?? 1000,
        temperature: request.temperature ?? 0.7,
        top_p: request.topP ?? 1,
        system: systemMessage?.content,
        messages: conversationMessages as any,
        stop_sequences: request.stop,
      });

      // Extract text from response
      const content = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      logger.info(`Claude Sonnet 4.5 completion generated: ${content.length} characters`);

      return {
        content,
        finishReason: response.stop_reason || 'unknown',
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        model: this.model,
      };
    } catch (error) {
      logger.error('Anthropic Claude completion failed:', error);
      throw new Error('Failed to generate AI response with Claude');
    }
  }

  async generateCallResponse(
    context: ConversationContext,
    prospectMessage: string
  ): Promise<{ response: string; nextStage: string; confidence: number }> {
    const systemPrompt = this.buildSystemPrompt(context);
    
    // Build conversation history
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...context.conversationHistory,
      { role: 'user', content: prospectMessage },
    ];

    try {
      const completion = await this.generateChatCompletion({
        messages,
        temperature: 0.8,
        maxTokens: 200,
      });

      const { response, nextStage, confidence } = this.parseCallResponse(
        completion.content,
        context.currentStage
      );

      logger.info(`Claude generated call response: stage ${context.currentStage} -> ${nextStage}`);

      return { response, nextStage, confidence };
    } catch (error) {
      logger.error('Failed to generate call response with Claude:', error);
      
      return {
        response: "I appreciate you sharing that with me. Could you tell me more about your current situation?",
        nextStage: context.currentStage,
        confidence: 0.5,
      };
    }
  }

  private buildSystemPrompt(context: ConversationContext): string {
    return `You are an AI sales agent making a cold call. 

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
  }

  private parseCallResponse(
    response: string,
    currentStage: string
  ): { response: string; nextStage: string; confidence: number } {
    const stageRegex = /\[STAGE:(\w+)\|CONFIDENCE:([\d.]+)\]/;
    const stageMatch = stageRegex.exec(response);
    
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
        temperature: 0.3,
        maxTokens: 500,
      });

      const analysis = JSON.parse(completion.content);
      
      logger.info(`Claude call analysis: ${analysis.outcome} (${analysis.confidence})`);
      
      return analysis;
    } catch (error) {
      logger.error('Failed to analyze call with Claude:', error);
      
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
      
      logger.info(`Claude generated follow-up email for ${prospectName}`);
      
      return email;
    } catch (error) {
      logger.error('Failed to generate email with Claude:', error);
      
      return {
        subject: `Following up on our conversation`,
        body: `Hi ${prospectName},\n\nThank you for taking the time to speak with me today. I wanted to follow up on our discussion about ${campaignObjective}.\n\nBased on our conversation, I believe we can help you achieve your goals. Would you be available for a brief call this week to discuss next steps?\n\nBest regards,\nYour AI Sales Agent`,
      };
    }
  }

  estimateCost(promptTokens: number, completionTokens: number): number {
    // Claude Sonnet 4.5 pricing (as of Oct 2024)
    const inputCostPer1K = 0.003;  // $3 per million tokens
    const outputCostPer1K = 0.015; // $15 per million tokens
    
    const inputCost = (promptTokens / 1000) * inputCostPer1K;
    const outputCost = (completionTokens / 1000) * outputCostPer1K;
    
    return Math.round((inputCost + outputCost) * 10000) / 10000;
  }
}

export default new AnthropicService();
