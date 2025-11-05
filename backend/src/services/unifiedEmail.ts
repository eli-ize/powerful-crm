import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import gmailAPIService from './gmailAPI';
import logger from '../utils/logger';

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

interface ContactEmailData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
}

type EmailProvider = 'gmail_api' | 'smtp' | 'mock';

class UnifiedEmailService {
  private transporter: Transporter | null = null;
  private fromEmail: string;
  private currentProvider: EmailProvider = 'mock';
  private sentEmails: any[] = [];

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@powerfulcrm.co.za';
    this.initializeEmailService();
  }

  private async initializeEmailService(): Promise<void> {
    // Try Gmail API first
    const gmailStatus = await gmailAPIService.getConnectionStatus();
    if (gmailStatus.connected) {
      this.currentProvider = 'gmail_api';
      logger.info('📧 Using Gmail API as primary email provider');
      return;
    }

    // Fallback to SMTP
    await this.initializeSMTP();
  }

  private async initializeSMTP(): Promise<void> {
    try {
      // Check if SMTP credentials are available
      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        logger.warn('📧 SMTP credentials not found, enabling mock mode');
        this.enableMockMode();
        return;
      }

      const config = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      };

      this.transporter = nodemailer.createTransport(config);
      await this.transporter.verify();
      
      this.currentProvider = 'smtp';
      logger.info('📧 Using SMTP as email provider');
    } catch (error) {
      logger.error('❌ Failed to initialize SMTP, falling back to mock mode:', error);
      this.enableMockMode();
    }
  }

  private enableMockMode(): void {
    this.currentProvider = 'mock';
    this.transporter = null;
    logger.info('📧 Email service running in MOCK MODE - emails will be logged but not sent');
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    switch (this.currentProvider) {
      case 'gmail_api':
        return await this.sendViaGmailAPI(options);
      case 'smtp':
        return await this.sendViaSMTP(options);
      case 'mock':
        return this.sendViaMock(options);
      default:
        logger.error('❌ No email provider available');
        return false;
    }
  }

  private async sendViaGmailAPI(options: EmailOptions): Promise<boolean> {
    try {
      const result = await gmailAPIService.sendEmail(options);
      if (result.success) {
        logger.info(`📧 Email sent via Gmail API to ${options.to}`, { messageId: result.messageId });
        return true;
      } else {
        logger.error('❌ Gmail API send failed:', result.error);
        return false;
      }
    } catch (error) {
      logger.error('❌ Gmail API send error:', error);
      return false;
    }
  }

  private async sendViaSMTP(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      const mailOptions = {
        from: this.fromEmail,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Email sent via SMTP to ${options.to}`, { messageId: result.messageId });
      return true;
    } catch (error) {
      logger.error('❌ Failed to send email via SMTP:', error);
      return false;
    }
  }

  private sendViaMock(options: EmailOptions): boolean {
    const mockEmail = {
      id: Date.now().toString(),
      provider: 'mock',
      from: this.fromEmail,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      content: options.html || options.text || '',
      timestamp: new Date().toISOString(),
      status: 'mock_sent'
    };

    this.sentEmails.push(mockEmail);
    logger.info(`📧 MOCK EMAIL SENT to ${options.to}:`, {
      subject: options.subject,
      messageId: mockEmail.id,
      provider: this.currentProvider
    });
    return true;
  }

  // Email receiving functionality (Gmail API only)
  async getEmails(query: string = '', maxResults: number = 10) {
    if (this.currentProvider !== 'gmail_api') {
      throw new Error('Email receiving only available with Gmail API');
    }

    return await gmailAPIService.getEmails(query, maxResults);
  }

  async getUnreadEmails() {
    if (this.currentProvider !== 'gmail_api') {
      throw new Error('Email receiving only available with Gmail API');
    }

    return await gmailAPIService.getUnreadEmails();
  }

  async markAsRead(messageId: string): Promise<boolean> {
    if (this.currentProvider !== 'gmail_api') {
      return false;
    }

    return await gmailAPIService.markAsRead(messageId);
  }

  // Welcome email for new contacts
  async sendWelcomeEmail(contact: ContactEmailData): Promise<boolean> {
    const template = this.getWelcomeEmailTemplate(contact);
    
    return await this.sendEmail({
      to: contact.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Follow-up email
  async sendFollowUpEmail(contact: ContactEmailData, message: string): Promise<boolean> {
    const template = this.getFollowUpEmailTemplate(contact, message);
    
    return await this.sendEmail({
      to: contact.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Bulk email campaign
  async sendBulkEmail(contacts: ContactEmailData[], subject: string, content: string): Promise<{
    sent: number;
    failed: number;
    results: Array<{ email: string; status: string; messageId?: string; error?: string }>;
  }> {
    let sent = 0;
    let failed = 0;
    const results: Array<{ email: string; status: string; messageId?: string; error?: string }> = [];

    for (const contact of contacts) {
      try {
        // Personalize content
        let personalizedSubject = subject
          .replace(/\{\{name\}\}/g, contact.name || 'Valued Customer')
          .replace(/\{\{company\}\}/g, contact.company || 'Your Company');

        let personalizedContent = content
          .replace(/\{\{name\}\}/g, contact.name || 'Valued Customer')
          .replace(/\{\{company\}\}/g, contact.company || 'Your Company');

        const success = await this.sendEmail({
          to: contact.email,
          subject: personalizedSubject,
          html: personalizedContent,
        });

        if (success) {
          results.push({ email: contact.email, status: 'sent' });
          sent++;
        } else {
          results.push({ email: contact.email, status: 'failed', error: 'Send failed' });
          failed++;
        }
      } catch (error) {
        results.push({ 
          email: contact.email, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        failed++;
      }
    }

    logger.info(`📬 Bulk email campaign completed: ${sent} sent, ${failed} failed`);
    return { sent, failed, results };
  }

  // System notification email
  async sendNotificationEmail(to: string, title: string, message: string, data?: any): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f59e0b; color: white; padding: 20px; text-align: center;">
          <h1>🔔 ${title}</h1>
        </div>
        <div style="padding: 20px;">
          <p>${message}</p>
          ${data ? `<pre style="background: #f3f4f6; padding: 15px; border-radius: 5px; overflow-x: auto;"><code>${JSON.stringify(data, null, 2)}</code></pre>` : ''}
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px;">
              Automated notification from Powerful CRM<br>
              ${new Date().toISOString()}
            </p>
          </div>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to,
      subject: `[CRM Alert] ${title}`,
      html,
      text: `${title}\n\n${message}${data ? '\n\n' + JSON.stringify(data, null, 2) : ''}`,
    });
  }

  // Get service status
  async getConnectionStatus(): Promise<{ 
    connected: boolean; 
    provider: EmailProvider; 
    message: string; 
    features: string[];
    emailAddress?: string;
  }> {
    const features: string[] = ['send'];

    switch (this.currentProvider) {
      case 'gmail_api':
        const gmailStatus = await gmailAPIService.getConnectionStatus();
        return {
          connected: gmailStatus.connected,
          provider: 'gmail_api',
          message: gmailStatus.message,
          features: ['send', 'receive', 'read_status', 'threading'],
          emailAddress: gmailStatus.emailAddress,
        };

      case 'smtp':
        try {
          if (this.transporter) {
            await this.transporter.verify();
            return {
              connected: true,
              provider: 'smtp',
              message: 'SMTP connection verified successfully',
              features,
            };
          }
        } catch (error) {
          return {
            connected: false,
            provider: 'smtp',
            message: `SMTP connection failed: ${error}`,
            features: [],
          };
        }
        break;

      case 'mock':
        return {
          connected: true,
          provider: 'mock',
          message: 'Mock email service - emails logged but not sent',
          features: ['send', 'mock_receive'],
        };
    }

    return {
      connected: false,
      provider: this.currentProvider,
      message: 'Email service not available',
      features: [],
    };
  }

  // Gmail API setup helpers
  getGmailAuthUrl(): string {
    return gmailAPIService.getAuthUrl();
  }

  async processGmailAuthCode(code: string): Promise<any> {
    return await gmailAPIService.getTokensFromCode(code);
  }

  // Mock mode helpers
  getSentEmails(): any[] {
    return this.sentEmails;
  }

  clearSentEmails(): void {
    this.sentEmails = [];
    logger.info('📧 Cleared sent emails history');
  }

  getCurrentProvider(): EmailProvider {
    return this.currentProvider;
  }

  // Email templates
  private getWelcomeEmailTemplate(contact: ContactEmailData): EmailTemplate {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1>🚀 Welcome to Powerful CRM</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello ${contact.name}! 👋</h2>
          <p>Thank you for your interest in our services. We're excited to work with you!</p>
          
          ${contact.company ? `<p><strong>Company:</strong> ${contact.company}</p>` : ''}
          ${contact.phone ? `<p><strong>Phone:</strong> ${contact.phone}</p>` : ''}
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0369a1; margin-top: 0;">What's Next?</h3>
            <ul style="color: #075985;">
              <li>One of our team members will contact you soon</li>
              <li>We'll schedule a consultation to understand your needs</li>
              <li>You'll receive a personalized proposal</li>
            </ul>
          </div>
          
          <p>If you have any questions, feel free to reply to this email or call us!</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px;">
              Best regards,<br>
              The Powerful CRM Team
            </p>
          </div>
        </div>
      </div>
    `;

    return {
      subject: `Welcome to Powerful CRM, ${contact.name}!`,
      html,
      text: `Hello ${contact.name}! Thank you for your interest in our services. We're excited to work with you! One of our team members will contact you soon.`,
    };
  }

  private getFollowUpEmailTemplate(contact: ContactEmailData, message: string): EmailTemplate {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
          <h1>📞 Follow-up from Powerful CRM</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hi ${contact.name},</h2>
          <div style="background-color: #f0fdf4; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
            ${message}
          </div>
          <p>We look forward to hearing from you!</p>
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 14px;">
              Best regards,<br>
              The Powerful CRM Team
            </p>
          </div>
        </div>
      </div>
    `;

    return {
      subject: `Follow-up: ${contact.company || contact.name}`,
      html,
      text: `Hi ${contact.name}, ${message}`,
    };
  }
}

export default new UnifiedEmailService();