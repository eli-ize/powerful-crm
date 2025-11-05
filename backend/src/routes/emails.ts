import express from 'express';
import { body, validationResult } from 'express-validator';
import emailService from '../services/email';
import logger from '../utils/logger';

const router = express.Router();

// Test email configuration
router.get('/test', async (req, res) => {
  try {
    const connectionResult = await emailService.testConnection();
    
    res.json({
      success: connectionResult.success,
      message: connectionResult.message,
      mode: connectionResult.mode,
    });
  } catch (error) {
    logger.error('Email test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Email test failed',
      mode: 'error'
    });
  }
});

// Send individual email
router.post('/send',
  [
    body('to').isEmail().withMessage('Valid email address is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('content').notEmpty().withMessage('Content is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { to, cc, bcc, subject, content, isHtml = true } = req.body;

      const emailOptions = {
        to,
        cc,
        bcc,
        subject,
        [isHtml ? 'html' : 'text']: content,
      };

      const success = await emailService.sendEmail(emailOptions);

      if (success) {
        logger.info(`Email sent successfully to ${to}`, { userId: (req as any).user?.id });
        res.json({
          success: true,
          message: 'Email sent successfully',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to send email',
        });
      }
    } catch (error) {
      logger.error('Send email failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send email',
      });
    }
  }
);

// Send welcome email to new contact
router.post('/welcome',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email address is required'),
    body('company').optional().isString(),
    body('phone').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { name, email, company, phone } = req.body;

      const success = await emailService.sendWelcomeEmail({
        name,
        email,
        company,
        phone,
      });

      if (success) {
        logger.info(`Welcome email sent to ${email}`, { userId: (req as any).user?.id });
        res.json({
          success: true,
          message: 'Welcome email sent successfully',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to send welcome email',
        });
      }
    } catch (error) {
      logger.error('Send welcome email failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send welcome email',
      });
    }
  }
);

// Send follow-up email
router.post('/followup',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email address is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('company').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { name, email, company, message } = req.body;

      const success = await emailService.sendFollowUpEmail(
        { name, email, company },
        message
      );

      if (success) {
        logger.info(`Follow-up email sent to ${email}`, { userId: (req as any).user?.id });
        res.json({
          success: true,
          message: 'Follow-up email sent successfully',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to send follow-up email',
        });
      }
    } catch (error) {
      logger.error('Send follow-up email failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send follow-up email',
      });
    }
  }
);

// Send bulk email campaign
router.post('/bulk',
  [
    body('contacts').isArray().withMessage('Contacts array is required'),
    body('contacts.*.name').notEmpty().withMessage('Contact name is required'),
    body('contacts.*.email').isEmail().withMessage('Valid email address is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('content').notEmpty().withMessage('Content is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { contacts, subject, content } = req.body;

      logger.info(`Starting bulk email campaign to ${contacts.length} contacts`, { 
        userId: (req as any).user?.id 
      });

      const result = await emailService.sendBulkEmail(contacts, subject, content);

      res.json({
        success: true,
        message: 'Bulk email campaign completed',
        data: result,
      });
    } catch (error) {
      logger.error('Bulk email campaign failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send bulk emails',
      });
    }
  }
);

// Send system notification
router.post('/notification',
  [
    body('to').isEmail().withMessage('Valid email address is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { to, title, message } = req.body;

      const success = await emailService.sendNotificationEmail(to, title, message);

      if (success) {
        logger.info(`Notification email sent to ${to}`, { userId: (req as any).user?.id });
        res.json({
          success: true,
          message: 'Notification email sent successfully',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to send notification email',
        });
      }
    } catch (error) {
      logger.error('Send notification email failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send notification email',
      });
    }
  }
);

// Get sent emails (for debugging in mock mode)
router.get('/sent', async (req, res) => {
  try {
    const sentEmails = emailService.getSentEmails();
    res.json({
      success: true,
      data: sentEmails,
      total: sentEmails.length,
    });
  } catch (error) {
    logger.error('Failed to get sent emails:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sent emails',
    });
  }
});

// Clear sent emails history
router.delete('/sent', async (req, res) => {
  try {
    emailService.clearSentEmails();
    res.json({
      success: true,
      message: 'Sent emails history cleared',
    });
  } catch (error) {
    logger.error('Failed to clear sent emails:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear sent emails',
    });
  }
});

export default router;