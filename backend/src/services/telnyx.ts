// @ts-nocheck
import Telnyx from 'telnyx';
import config from '../config';
import logger from '../utils/logger';

interface CallRequest {
  to: string;
  from: string;
  connectionId?: string;
  webhook_url?: string;
  webhook_failover_url?: string;
  time_limit_secs?: number;
}

interface CallResponse {
  call_control_id: string;
  call_leg_id: string;
  call_session_id: string;
  is_alive: boolean;
}

interface SMSRequest {
  to: string;
  from: string;
  text: string;
  webhook_url?: string;
}

class TelnyxService {
  private client: any;
  
  constructor() {
    if (config.telnyxApiKey) {
      const maskedKey = config.telnyxApiKey.substring(0, 10) + '...' + config.telnyxApiKey.substring(config.telnyxApiKey.length - 4);
      logger.info(`Initializing Telnyx client with API key: ${maskedKey}`);
      this.client = Telnyx(config.telnyxApiKey);
    } else {
      logger.warn('Telnyx API key not configured');
    }
  }

  async initiateCall(params: CallRequest): Promise<CallResponse> {
    if (!this.client) {
      throw new Error('Telnyx API key not configured');
    }

    try {
      logger.info(`Initiating call from ${params.from} to ${params.to}`);
      
      // Connection ID is required for outbound calls
      if (!params.connectionId) {
        throw new Error('Connection ID is required. Please configure your Telnyx connection ID in the settings.');
      }
      
      const callParams = {
        to: params.to,
        from: params.from,
        connection_id: params.connectionId,
        webhook_url: params.webhook_url || `${config.backendUrl}/api/calls/webhook`,
        webhook_failover_url: params.webhook_failover_url,
        time_limit_secs: params.time_limit_secs || 1800, // 30 minutes
        record: 'record-from-answer',
        record_format: 'mp3',
        record_channels: 'dual',
      };

      logger.info('Call parameters:', JSON.stringify(callParams, null, 2));
      const response = await this.client.calls.create(callParams);
      
      logger.info(`Call initiated successfully: ${response.data.call_control_id}`);
      
      return {
        call_control_id: response.data.call_control_id,
        call_leg_id: response.data.call_leg_id,
        call_session_id: response.data.call_session_id,
        is_alive: response.data.is_alive,
      };
    } catch (error: any) {
      logger.error('Failed to initiate call:', {
        error: error.message,
        code: error.code,
        type: error.type,
        detail: error.detail,
        raw: error.raw,
        statusCode: error.statusCode,
      });
      
      // Provide more specific error messages
      if (error.statusCode === 401 || error.statusCode === 403) {
        throw new Error('Invalid Telnyx API key or insufficient permissions');
      } else if (error.statusCode === 422) {
        throw new Error(`Invalid call parameters: ${error.message || 'Check your phone numbers and connection ID'}`);
      } else if (error.message) {
        throw new Error(error.message);
      }
      
      throw new Error('Failed to initiate call - check backend logs for details');
    }
  }

  async answerCall(callControlId: string): Promise<void> {
    if (!this.client) {
      throw new Error('Telnyx API key not configured');
    }

    try {
      await this.client.calls.answer(callControlId);
      logger.info(`Call answered: ${callControlId}`);
    } catch (error) {
      logger.error('Failed to answer call:', error);
      throw new Error('Failed to answer call');
    }
  }

  async hangupCall(callControlId: string): Promise<void> {
    if (!this.client) {
      throw new Error('Telnyx API key not configured');
    }

    try {
      await this.client.calls.hangup(callControlId);
      logger.info(`Call hung up: ${callControlId}`);
    } catch (error) {
      logger.error('Failed to hangup call:', error);
      throw new Error('Failed to hangup call');
    }
  }

  async sendSpeech(callControlId: string, text: string, voice: string = 'female'): Promise<void> {
    if (!this.client) {
      throw new Error('Telnyx API key not configured');
    }

    try {
      await this.client.calls.speak(callControlId, {
        payload: text,
        voice: voice,
        language: 'en-US',
      });
      
      logger.info(`Speech sent to call ${callControlId}: ${text.substring(0, 50)}...`);
    } catch (error) {
      logger.error('Failed to send speech:', error);
      throw new Error('Failed to send speech');
    }
  }

  async startRecording(callControlId: string): Promise<void> {
    if (!this.client) {
      throw new Error('Telnyx API key not configured');
    }

    try {
      await this.client.calls.record_start(callControlId, {
        format: 'mp3',
        channels: 'dual',
      });
      
      logger.info(`Recording started for call: ${callControlId}`);
    } catch (error) {
      logger.error('Failed to start recording:', error);
      throw new Error('Failed to start recording');
    }
  }

  async stopRecording(callControlId: string): Promise<void> {
    if (!this.client) {
      throw new Error('Telnyx API key not configured');
    }

    try {
      await this.client.calls.record_stop(callControlId);
      logger.info(`Recording stopped for call: ${callControlId}`);
    } catch (error) {
      logger.error('Failed to stop recording:', error);
      throw new Error('Failed to stop recording');
    }
  }

  async sendSMS(params: SMSRequest): Promise<any> {
    if (!this.client) {
      throw new Error('Telnyx API key not configured');
    }

    try {
      logger.info(`Sending SMS from ${params.from} to ${params.to}`);
      
      const response = await this.client.messages.create({
        to: params.to,
        from: params.from,
        text: params.text,
        webhook_url: params.webhook_url || `${config.backendUrl}/api/sms/webhook`,
      });

      logger.info(`SMS sent successfully: ${response.data.id}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to send SMS:', error);
      throw new Error('Failed to send SMS');
    }
  }

  async getCallDetails(callControlId: string): Promise<any> {
    if (!this.client) {
      throw new Error('Telnyx API key not configured');
    }

    try {
      const response = await this.client.calls.retrieve(callControlId);
      return response.data;
    } catch (error) {
      logger.error('Failed to get call details:', error);
      throw new Error('Failed to get call details');
    }
  }

  async getRecording(recordingId: string): Promise<any> {
    if (!this.client) {
      throw new Error('Telnyx API key not configured');
    }

    try {
      const response = await this.client.recordings.retrieve(recordingId);
      return response.data;
    } catch (error) {
      logger.error('Failed to get recording:', error);
      throw new Error('Failed to get recording');
    }
  }

  // Webhook event handler
  handleWebhook(event: any): void {
    const { event_type, payload } = event.data;
    
    logger.info(`Received Telnyx webhook: ${event_type}`, {
      event_type,
      call_control_id: payload?.call_control_id,
      call_session_id: payload?.call_session_id,
    });

    switch (event_type) {
      case 'call.initiated':
        this.handleCallInitiated(payload);
        break;
      case 'call.answered':
        this.handleCallAnswered(payload);
        break;
      case 'call.hangup':
        this.handleCallHangup(payload);
        break;
      case 'call.recording.saved':
        this.handleRecordingSaved(payload);
        break;
      case 'call.speak.ended':
        this.handleSpeechEnded(payload);
        break;
      default:
        logger.info(`Unhandled webhook event: ${event_type}`);
    }
  }

  private handleCallInitiated(payload: any): void {
    logger.info(`Call initiated: ${payload.call_control_id}`);
    // TODO: Update database with call status
  }

  private handleCallAnswered(payload: any): void {
    logger.info(`Call answered: ${payload.call_control_id}`);
    // TODO: Update database and start AI conversation
  }

  private handleCallHangup(payload: any): void {
    logger.info(`Call ended: ${payload.call_control_id}`, {
      hangup_cause: payload.hangup_cause,
      hangup_source: payload.hangup_source,
    });
    // TODO: Update database and process call results
  }

  private handleRecordingSaved(payload: any): void {
    logger.info(`Recording saved: ${payload.recording_id}`, {
      recording_url: payload.recording_urls?.mp3,
    });
    // TODO: Save recording URL to database
  }

  private handleSpeechEnded(payload: any): void {
    logger.info(`Speech ended: ${payload.call_control_id}`);
    // TODO: Continue AI conversation flow
  }

  // Utility method to validate phone number
  static validatePhoneNumber(phone: string): boolean {
    // Basic E.164 format validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  // Utility method to format phone number
  static formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if missing (assume US +1)
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    
    return `+${cleaned}`;
  }
}

export { TelnyxService };
export default new TelnyxService();