// Enhanced Professional Email Service for CampaignIt CRM
import nodemailer from 'nodemailer';
import { renderEmailTemplate, EmailContext, availableTemplates } from './emailTemplates';

export interface ProfessionalEmailOptions {
  to: string;
  template: string;
  context: EmailContext;
  from?: string;
  replyTo?: string;
  priority?: 'high' | 'normal' | 'low';
  trackOpening?: boolean;
  trackClicks?: boolean;
}

export interface CustomEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
  }>;
}

export class ProfessionalEmailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly defaultFromAddress: string;
  private readonly companyInfo: {
    name: string;
    logo: string;
    address: string;
    supportUrl: string;
    unsubscribeUrl: string;
  };

  constructor() {
    // Initialize SMTP transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER || 'eli.ize.dev@gmail.com',
        pass: process.env.SMTP_PASSWORD || 'lukm fvvk ctpy xevz'
      }
    });

    // Set default professional email address
    this.defaultFromAddress = process.env.EMAIL_FROM || 'noreply@campaignit.co.za';

    // Company information from environment
    this.companyInfo = {
      name: process.env.CRM_COMPANY_NAME || 'CampaignIt',
      logo: process.env.CRM_COMPANY_LOGO || 'https://campaignit.co.za/logo.png',
      address: process.env.CRM_COMPANY_ADDRESS || 'South Africa',
      supportUrl: process.env.CRM_SUPPORT_URL || 'https://campaignit.co.za/support',
      unsubscribeUrl: process.env.CRM_UNSUBSCRIBE_URL || 'https://campaignit.co.za/unsubscribe'
    };

    console.log('📧 Professional Email Service initialized');
    console.log(`📧 Default from address: ${this.defaultFromAddress}`);
    console.log(`📧 Company: ${this.companyInfo.name}`);
  }

  /**
   * Send a templated professional email
   */
  async sendTemplatedEmail(options: ProfessionalEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Validate template exists
      if (!availableTemplates.includes(options.template)) {
        throw new Error(`Template '${options.template}' not found. Available templates: ${availableTemplates.join(', ')}`);
      }

      // Render the email template
      const emailContent = renderEmailTemplate(options.template, options.context);

      // Prepare email options
      const fromAddress = options.from || this.getFromAddressForTemplate(options.template);
      const replyToAddress = options.replyTo || this.getReplyToForTemplate(options.template);

      const mailOptions = {
        from: `"${this.companyInfo.name}" <${fromAddress}>`,
        to: options.to,
        replyTo: replyToAddress,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        priority: options.priority || 'normal',
        headers: {
          'X-CRM-Template': options.template,
          'X-CRM-Customer': options.context.customerEmail,
          'X-Company': this.companyInfo.name
        }
      };

      // Add tracking headers if requested
      if (options.trackOpening) {
        mailOptions.headers['X-Track-Opening'] = 'true';
      }
      if (options.trackClicks) {
        mailOptions.headers['X-Track-Clicks'] = 'true';
      }

      // Send the email
      const info = await this.transporter.sendMail(mailOptions);

      console.log(`📧 Templated email sent successfully:`);
      console.log(`   Template: ${options.template}`);
      console.log(`   To: ${options.to}`);
      console.log(`   From: ${fromAddress}`);
      console.log(`   Subject: ${emailContent.subject}`);
      console.log(`   Message ID: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error) {
      console.error('📧 Error sending templated email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send a custom email (non-templated)
   */
  async sendCustomEmail(options: CustomEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const fromAddress = options.from || this.defaultFromAddress;
      const replyToAddress = options.replyTo || process.env.EMAIL_SUPPORT || 'support@campaignit.co.za';

      const mailOptions = {
        from: `"${this.companyInfo.name}" <${fromAddress}>`,
        to: options.to,
        replyTo: replyToAddress,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
        headers: {
          'X-CRM-Type': 'custom',
          'X-Company': this.companyInfo.name
        }
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log(`📧 Custom email sent successfully:`);
      console.log(`   To: ${options.to}`);
      console.log(`   From: ${fromAddress}`);
      console.log(`   Subject: ${options.subject}`);
      console.log(`   Message ID: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error) {
      console.error('📧 Error sending custom email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send welcome email to new customer
   */
  async sendWelcomeEmail(customerName: string, customerEmail: string, companyName?: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTemplatedEmail({
      to: customerEmail,
      template: 'welcome',
      context: {
        customerName,
        customerEmail,
        companyName
      }
    });
  }

  /**
   * Send follow-up email to lead
   */
  async sendFollowUpEmail(customerName: string, customerEmail: string, companyName?: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTemplatedEmail({
      to: customerEmail,
      template: 'followUp',
      context: {
        customerName,
        customerEmail,
        companyName
      }
    });
  }

  /**
   * Send lead nurturing email
   */
  async sendNurturingEmail(customerName: string, customerEmail: string, companyName?: string, leadScore?: number): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTemplatedEmail({
      to: customerEmail,
      template: 'leadNurturing',
      context: {
        customerName,
        customerEmail,
        companyName,
        leadScore
      }
    });
  }

  /**
   * Send system notification email
   */
  async sendNotificationEmail(customerName: string, customerEmail: string, title: string, message: string, actionText?: string, actionUrl?: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTemplatedEmail({
      to: customerEmail,
      template: 'notification',
      context: {
        customerName,
        customerEmail,
        customData: {
          title,
          message,
          action: actionText,
          actionUrl
        }
      }
    });
  }

  /**
   * Send reminder email
   */
  async sendReminderEmail(customerName: string, customerEmail: string, title: string, message: string, date?: string, actionText?: string, actionUrl?: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendTemplatedEmail({
      to: customerEmail,
      template: 'reminder',
      context: {
        customerName,
        customerEmail,
        customData: {
          title,
          message,
          date,
          action: actionText,
          actionUrl
        }
      }
    });
  }

  /**
   * Get appropriate from address based on template type
   */
  private getFromAddressForTemplate(template: string): string {
    switch (template) {
      case 'followUp':
      case 'leadNurturing':
        return process.env.EMAIL_SALES || 'sales@campaignit.co.za';
      case 'notification':
      case 'reminder':
        return process.env.EMAIL_SUPPORT || 'support@campaignit.co.za';
      case 'welcome':
      default:
        return this.defaultFromAddress;
    }
  }

  /**
   * Get appropriate reply-to address based on template type
   */
  private getReplyToForTemplate(template: string): string {
    switch (template) {
      case 'followUp':
      case 'leadNurturing':
        return process.env.EMAIL_SALES || 'sales@campaignit.co.za';
      case 'notification':
      case 'reminder':
        return process.env.EMAIL_SUPPORT || 'support@campaignit.co.za';
      case 'welcome':
      default:
        return process.env.EMAIL_SUPPORT || 'support@campaignit.co.za';
    }
  }

  /**
   * Get available email templates
   */
  getAvailableTemplates(): string[] {
    return availableTemplates;
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.transporter.verify();
      console.log('📧 Email service connection test successful');
      return { success: true };
    } catch (error) {
      console.error('📧 Email service connection test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  /**
   * Get service status and configuration
   */
  getStatus(): {
    configured: boolean;
    fromAddress: string;
    company: string;
    availableTemplates: string[];
    smtpHost: string;
    smtpUser: string;
  } {
    return {
      configured: true,
      fromAddress: this.defaultFromAddress,
      company: this.companyInfo.name,
      availableTemplates: this.getAvailableTemplates(),
      smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpUser: process.env.SMTP_USER || 'eli.ize.dev@gmail.com'
    };
  }
}

// Export singleton instance
export const professionalEmailService = new ProfessionalEmailService();