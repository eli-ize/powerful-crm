// Professional Email Routes for CampaignIt CRM Customer Communications
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { professionalEmailService } from '../services/professionalEmailService';
import { EmailContext } from '../services/emailTemplates';

const router = Router();

// Validation middleware
const validateEmailRequest = [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerEmail').isEmail().withMessage('Valid customer email is required'),
  body('companyName').optional().isString(),
];

const validateTemplateRequest = [
  ...validateEmailRequest,
  body('template').notEmpty().withMessage('Template name is required'),
  body('context').optional().isObject()
];

const validateCustomEmailRequest = [
  body('to').isEmail().withMessage('Valid recipient email is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('html').optional().isString(),
  body('text').optional().isString(),
  body('from').optional().isEmail()
];

// Error handler for validation
const handleValidationErrors = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * GET /api/customer-communications/status
 * Get email service status and available templates
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = professionalEmailService.getStatus();
    const connectionTest = await professionalEmailService.testConnection();
    
    res.json({
      success: true,
      data: {
        ...status,
        connectionStatus: connectionTest.success ? 'connected' : 'failed',
        connectionError: connectionTest.error
      }
    });
  } catch (error) {
    console.error('Error getting email service status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email service status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/customer-communications/templates
 * Get available email templates
 */
router.get('/templates', (req: Request, res: Response) => {
  try {
    const templates = professionalEmailService.getAvailableTemplates();
    res.json({
      success: true,
      data: {
        templates,
        count: templates.length
      }
    });
  } catch (error) {
    console.error('Error getting email templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get email templates',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/customer-communications/send-welcome
 * Send welcome email to new customer
 */
router.post('/send-welcome', validateEmailRequest, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, companyName } = req.body;

    console.log(`📧 Sending welcome email to ${customerName} (${customerEmail})`);
    
    const result = await professionalEmailService.sendWelcomeEmail(
      customerName,
      customerEmail,
      companyName
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Welcome email sent successfully',
        data: {
          messageId: result.messageId,
          recipient: customerEmail,
          template: 'welcome'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send welcome email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send welcome email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/customer-communications/send-follow-up
 * Send follow-up email to lead
 */
router.post('/send-follow-up', validateEmailRequest, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, companyName } = req.body;

    console.log(`📧 Sending follow-up email to ${customerName} (${customerEmail})`);
    
    const result = await professionalEmailService.sendFollowUpEmail(
      customerName,
      customerEmail,
      companyName
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Follow-up email sent successfully',
        data: {
          messageId: result.messageId,
          recipient: customerEmail,
          template: 'followUp'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send follow-up email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending follow-up email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send follow-up email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/customer-communications/send-nurturing
 * Send lead nurturing email
 */
router.post('/send-nurturing', [
  ...validateEmailRequest,
  body('leadScore').optional().isNumeric()
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, companyName, leadScore } = req.body;

    console.log(`📧 Sending nurturing email to ${customerName} (${customerEmail}) - Lead Score: ${leadScore || 'N/A'}`);
    
    const result = await professionalEmailService.sendNurturingEmail(
      customerName,
      customerEmail,
      companyName,
      leadScore
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Lead nurturing email sent successfully',
        data: {
          messageId: result.messageId,
          recipient: customerEmail,
          template: 'leadNurturing',
          leadScore
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send lead nurturing email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending lead nurturing email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send lead nurturing email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/customer-communications/send-notification
 * Send system notification email
 */
router.post('/send-notification', [
  ...validateEmailRequest,
  body('title').notEmpty().withMessage('Notification title is required'),
  body('message').notEmpty().withMessage('Notification message is required'),
  body('actionText').optional().isString(),
  body('actionUrl').optional().isURL()
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, title, message, actionText, actionUrl } = req.body;

    console.log(`📧 Sending notification email to ${customerName} (${customerEmail}): ${title}`);
    
    const result = await professionalEmailService.sendNotificationEmail(
      customerName,
      customerEmail,
      title,
      message,
      actionText,
      actionUrl
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Notification email sent successfully',
        data: {
          messageId: result.messageId,
          recipient: customerEmail,
          template: 'notification',
          title
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send notification email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending notification email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/customer-communications/send-reminder
 * Send reminder email
 */
router.post('/send-reminder', [
  ...validateEmailRequest,
  body('title').notEmpty().withMessage('Reminder title is required'),
  body('message').notEmpty().withMessage('Reminder message is required'),
  body('date').optional().isString(),
  body('actionText').optional().isString(),
  body('actionUrl').optional().isURL()
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, title, message, date, actionText, actionUrl } = req.body;

    console.log(`📧 Sending reminder email to ${customerName} (${customerEmail}): ${title}`);
    
    const result = await professionalEmailService.sendReminderEmail(
      customerName,
      customerEmail,
      title,
      message,
      date,
      actionText,
      actionUrl
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Reminder email sent successfully',
        data: {
          messageId: result.messageId,
          recipient: customerEmail,
          template: 'reminder',
          title
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send reminder email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending reminder email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reminder email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/customer-communications/send-template
 * Send any template with custom context
 */
router.post('/send-template', validateTemplateRequest, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, companyName, template, context: customContext } = req.body;

    // Build email context
    const emailContext: EmailContext = {
      customerName,
      customerEmail,
      companyName,
      ...customContext
    };

    console.log(`📧 Sending templated email (${template}) to ${customerName} (${customerEmail})`);
    
    const result = await professionalEmailService.sendTemplatedEmail({
      to: customerEmail,
      template,
      context: emailContext
    });

    if (result.success) {
      res.json({
        success: true,
        message: `${template} email sent successfully`,
        data: {
          messageId: result.messageId,
          recipient: customerEmail,
          template
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Failed to send ${template} email`,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending templated email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send templated email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/customer-communications/send-custom
 * Send custom email (non-templated)
 */
router.post('/send-custom', validateCustomEmailRequest, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { to, subject, html, text, from, attachments } = req.body;

    console.log(`📧 Sending custom email to ${to}: ${subject}`);
    
    const result = await professionalEmailService.sendCustomEmail({
      to,
      subject,
      html,
      text,
      from,
      attachments
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Custom email sent successfully',
        data: {
          messageId: result.messageId,
          recipient: to,
          subject
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send custom email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending custom email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send custom email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/customer-communications/test
 * Test email system with sample data
 */
router.post('/test', [
  body('recipientEmail').isEmail().withMessage('Valid recipient email is required'),
  body('template').optional().isString()
], handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { recipientEmail, template = 'welcome' } = req.body;

    console.log(`📧 Testing email system - sending ${template} to ${recipientEmail}`);
    
    // Test context
    const testContext: EmailContext = {
      customerName: 'Test Customer',
      customerEmail: recipientEmail,
      companyName: 'Test Company Ltd'
    };

    const result = await professionalEmailService.sendTemplatedEmail({
      to: recipientEmail,
      template,
      context: testContext
    });

    if (result.success) {
      res.json({
        success: true,
        message: `Test ${template} email sent successfully`,
        data: {
          messageId: result.messageId,
          recipient: recipientEmail,
          template,
          testMode: true
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Failed to send test ${template} email`,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;