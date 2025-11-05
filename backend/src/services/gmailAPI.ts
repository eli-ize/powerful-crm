import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import logger from '../utils/logger';

interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  body: string;
  isRead: boolean;
}

interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

class GmailAPIService {
  private oauth2Client: OAuth2Client | null = null;
  private gmail: any = null;
  private isConfigured = false;

  constructor() {
    this.initializeGmailAPI();
  }

  private async initializeGmailAPI() {
    try {
      // Check if Gmail API credentials are available
      if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET || !process.env.GMAIL_REFRESH_TOKEN) {
        logger.warn('📧 Gmail API credentials not found, service not available');
        return;
      }

      // Initialize OAuth2 client
      this.oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        process.env.GMAIL_REDIRECT_URI || 'http://localhost:8000/auth/gmail/callback'
      );

      // Set refresh token
      this.oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      });

      // Initialize Gmail API
      this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      // Test the connection
      await this.testConnection();
      this.isConfigured = true;
      logger.info('📧 Gmail API service initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Gmail API service:', error);
      this.isConfigured = false;
    }
  }

  private async testConnection(): Promise<void> {
    if (!this.gmail) {
      throw new Error('Gmail API not initialized');
    }

    // Test by getting user profile
    await this.gmail.users.getProfile({ userId: 'me' });
  }

  private createEmailString(options: EmailOptions): string {
    const to = Array.isArray(options.to) ? options.to.join(', ') : options.to;
    const cc = options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : '';
    const bcc = options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : '';

    let email = '';
    email += `To: ${to}\r\n`;
    if (cc) email += `Cc: ${cc}\r\n`;
    if (bcc) email += `Bcc: ${bcc}\r\n`;
    email += `Subject: ${options.subject}\r\n`;
    email += 'MIME-Version: 1.0\r\n';

    if (options.html && options.text) {
      // Multipart email
      const boundary = '----=_Part_' + Date.now();
      email += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n`;
      
      email += `--${boundary}\r\n`;
      email += 'Content-Type: text/plain; charset=UTF-8\r\n\r\n';
      email += `${options.text}\r\n\r\n`;
      
      email += `--${boundary}\r\n`;
      email += 'Content-Type: text/html; charset=UTF-8\r\n\r\n';
      email += `${options.html}\r\n\r\n`;
      
      email += `--${boundary}--`;
    } else if (options.html) {
      // HTML only
      email += 'Content-Type: text/html; charset=UTF-8\r\n\r\n';
      email += options.html;
    } else {
      // Text only
      email += 'Content-Type: text/plain; charset=UTF-8\r\n\r\n';
      email += options.text || '';
    }

    return email;
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured || !this.gmail) {
      return { success: false, error: 'Gmail API not configured' };
    }

    try {
      const emailString = this.createEmailString(options);
      const base64Email = Buffer.from(emailString).toString('base64url');

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: base64Email,
        },
      });

      logger.info(`📧 Email sent via Gmail API to ${options.to}`, { messageId: response.data.id });
      return { success: true, messageId: response.data.id };
    } catch (error) {
      logger.error('❌ Failed to send email via Gmail API:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getEmails(query: string = '', maxResults: number = 10): Promise<GmailMessage[]> {
    if (!this.isConfigured || !this.gmail) {
      throw new Error('Gmail API not configured');
    }

    try {
      // Get list of messages
      const listResponse = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: maxResults,
      });

      if (!listResponse.data.messages) {
        return [];
      }

      // Get full message details
      const messages: GmailMessage[] = [];
      for (const messageRef of listResponse.data.messages) {
        const messageResponse = await this.gmail.users.messages.get({
          userId: 'me',
          id: messageRef.id,
        });

        const message = messageResponse.data;
        const headers = message.payload.headers;

        // Extract headers
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
        const from = headers.find((h: any) => h.name === 'From')?.value || '';
        const to = headers.find((h: any) => h.name === 'To')?.value || '';
        const date = headers.find((h: any) => h.name === 'Date')?.value || '';

        // Extract body
        let body = '';
        if (message.payload.body?.data) {
          body = Buffer.from(message.payload.body.data, 'base64').toString();
        } else if (message.payload.parts) {
          // Find text/plain or text/html part
          const textPart = message.payload.parts.find((part: any) => 
            part.mimeType === 'text/plain' || part.mimeType === 'text/html'
          );
          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString();
          }
        }

        messages.push({
          id: message.id,
          threadId: message.threadId,
          subject,
          from,
          to,
          date,
          snippet: message.snippet || '',
          body,
          isRead: !message.labelIds?.includes('UNREAD'),
        });
      }

      return messages;
    } catch (error) {
      logger.error('❌ Failed to get emails via Gmail API:', error);
      throw error;
    }
  }

  async getUnreadEmails(): Promise<GmailMessage[]> {
    return this.getEmails('is:unread', 50);
  }

  async markAsRead(messageId: string): Promise<boolean> {
    if (!this.isConfigured || !this.gmail) {
      return false;
    }

    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD'],
        },
      });

      logger.info(`📧 Marked message ${messageId} as read`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to mark message ${messageId} as read:`, error);
      return false;
    }
  }

  async getConnectionStatus(): Promise<{ 
    connected: boolean; 
    mode: string; 
    message: string; 
    emailAddress?: string 
  }> {
    if (!this.isConfigured || !this.gmail) {
      return {
        connected: false,
        mode: 'unavailable',
        message: 'Gmail API not configured - missing credentials'
      };
    }

    try {
      const profile = await this.gmail.users.getProfile({ userId: 'me' });
      return {
        connected: true,
        mode: 'gmail_api',
        message: 'Gmail API connected successfully',
        emailAddress: profile.data.emailAddress
      };
    } catch (error) {
      return {
        connected: false,
        mode: 'error',
        message: `Gmail API connection failed: ${error}`
      };
    }
  }

  // Generate OAuth2 URL for initial setup
  getAuthUrl(): string {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized');
    }

    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Exchange authorization code for tokens
  async getTokensFromCode(code: string): Promise<any> {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized');
    }

    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }
}

export default new GmailAPIService();