import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
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

class EmailService {
  private transporter: Transporter | null = null;
  private fromEmail: string;
  private isMockMode: boolean = false;
  private sentEmails: any[] = [];

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@powerfulcrm.co.za';
    this.initializeTransporter();
  }

  private async initializeTransporter(): Promise<void> {
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
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates
        },
      };

      this.transporter = nodemailer.createTransport(config);

      // Verify connection
      await this.transporter.verify();
      logger.info('📧 Email service initialized successfully with SMTP');
    } catch (error) {
      logger.error('❌ Failed to initialize SMTP email service, falling back to mock mode:', error);
      this.enableMockMode();
    }
  }

  private enableMockMode(): void {
    this.isMockMode = true;
    this.transporter = null;
    logger.info('📧 Email service running in MOCK MODE - emails will be logged but not sent via SMTP');
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    // Mock mode: simulate email sending
    if (this.isMockMode) {
      const mockEmail = {
        id: Date.now().toString(),
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
        messageId: mockEmail.id
      });
      return true;
    }

    // Real SMTP mode
    if (!this.transporter) {
      logger.error('Email service not initialized');
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
      logger.info(`📧 Email sent successfully to ${options.to}`, { messageId: result.messageId });
      return true;
    } catch (error) {
      logger.error('❌ Failed to send email:', error);
      return false;
    }
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

  // Follow-up email for leads
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
  async sendBulkEmail(contacts: ContactEmailData[], subject: string, content: string): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const contact of contacts) {
      const personalizedContent = content
        .replace(/\{\{name\}\}/g, contact.name)
        .replace(/\{\{company\}\}/g, contact.company || '')
        .replace(/\{\{email\}\}/g, contact.email);

      const success = await this.sendEmail({
        to: contact.email,
        subject: subject.replace(/\{\{name\}\}/g, contact.name),
        html: personalizedContent,
      });

      if (success) {
        sent++;
      } else {
        failed++;
      }

      // Rate limiting - wait 1 second between emails
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    logger.info(`📧 Bulk email campaign completed: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }

  // System notification emails
  async sendNotificationEmail(to: string, title: string, message: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1>🚀 Powerful CRM</h1>
        </div>
        <div style="padding: 20px; background-color: #f8fafc;">
          <h2 style="color: #1e293b;">${title}</h2>
          <p style="color: #475569; line-height: 1.6;">${message}</p>
          <div style="margin-top: 30px; padding: 15px; background-color: #e2e8f0; border-radius: 8px;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">
              This is an automated notification from your Powerful CRM system.
            </p>
          </div>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to,
      subject: `${title} - Powerful CRM`,
      html,
      text: message,
    });
  }

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

  // Test email connection
  async testConnection(): Promise<{ success: boolean; message: string; mode: string }> {
    if (this.isMockMode) {
      return {
        success: true,
        message: 'Email service is running in mock mode - emails will be logged but not sent',
        mode: 'mock'
      };
    }

    if (!this.transporter) {
      return {
        success: false,
        message: 'Email service not initialized',
        mode: 'error'
      };
    }

    try {
      await this.transporter.verify();
      return {
        success: true,
        message: 'SMTP connection verified successfully',
        mode: 'smtp'
      };
    } catch (error) {
      logger.error('Email connection test failed:', error);
      return {
        success: false,
        message: `SMTP connection failed: ${error}`,
        mode: 'error'
      };
    }
  }

  // Get sent emails (for debugging in mock mode)
  getSentEmails(): any[] {
    return this.sentEmails;
  }

  // Clear sent emails history
  clearSentEmails(): void {
    this.sentEmails = [];
    logger.info('📧 Cleared sent emails history');
  }
}

export default new EmailService();