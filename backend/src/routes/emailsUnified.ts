import express from 'express';
import { body, validationResult } from 'express-validator';
import unifiedEmailService from '../services/unifiedEmail';
import logger from '../utils/logger';

const router = express.Router();

// Test email configuration and get status
router.get('/status', async (req, res) => {
  try {
    const status = await unifiedEmailService.getConnectionStatus();
    
    res.json({
      success: true,
      ...status,
    });
  } catch (error) {
    logger.error('Email status check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Email status check failed',
    });
  }
});

// Legacy test endpoint (for backward compatibility)
router.get('/test', async (req, res) => {
  try {
    const status = await unifiedEmailService.getConnectionStatus();
    
    res.json({
      success: status.connected,
      message: status.message,
      mode: status.provider,
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
        ...(isHtml ? { html: content } : { text: content }),
      };

      const success = await unifiedEmailService.sendEmail(emailOptions);

      if (success) {
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
      logger.error('Email send failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send email',
      });
    }
  }
);

// Send welcome email
router.post('/welcome',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email address is required'),
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

      const success = await unifiedEmailService.sendWelcomeEmail({
        name,
        email,
        company,
        phone,
      });

      if (success) {
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
      logger.error('Welcome email failed:', error);
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

      const { name, email, company, phone, message } = req.body;

      const success = await unifiedEmailService.sendFollowUpEmail(
        { name, email, company, phone },
        message
      );

      if (success) {
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
      logger.error('Follow-up email failed:', error);
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
    body('contacts').isArray({ min: 1 }).withMessage('Contacts array is required'),
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

      const result = await unifiedEmailService.sendBulkEmail(contacts, subject, content);

      res.json({
        success: true,
        message: 'Bulk email campaign completed',
        data: result,
      });
    } catch (error) {
      logger.error('Bulk email failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send bulk email',
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

      const { to, title, message, data } = req.body;

      const success = await unifiedEmailService.sendNotificationEmail(to, title, message, data);

      if (success) {
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
      logger.error('Notification email failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send notification email',
      });
    }
  }
);

// Get received emails (Gmail API only)
router.get('/inbox', async (req, res) => {
  try {
    const { query = '', limit = 10 } = req.query;
    
    const emails = await unifiedEmailService.getEmails(
      query as string, 
      parseInt(limit as string) || 10
    );

    res.json({
      success: true,
      data: emails,
      total: emails.length,
    });
  } catch (error) {
    logger.error('Get inbox failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get inbox emails',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get unread emails (Gmail API only)
router.get('/unread', async (req, res) => {
  try {
    const emails = await unifiedEmailService.getUnreadEmails();

    res.json({
      success: true,
      data: emails,
      total: emails.length,
    });
  } catch (error) {
    logger.error('Get unread emails failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread emails',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Mark email as read (Gmail API only)
router.post('/mark-read/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const success = await unifiedEmailService.markAsRead(messageId);

    if (success) {
      res.json({
        success: true,
        message: 'Email marked as read',
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to mark email as read',
      });
    }
  } catch (error) {
    logger.error('Mark as read failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark email as read',
    });
  }
});

// Gmail API OAuth setup routes
router.get('/gmail/auth-url', (req, res) => {
  try {
    const authUrl = unifiedEmailService.getGmailAuthUrl();
    res.json({
      success: true,
      authUrl,
      message: 'Visit this URL to authorize Gmail API access',
    });
  } catch (error) {
    logger.error('Gmail auth URL generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate Gmail auth URL',
    });
  }
});

router.post('/gmail/callback',
  [
    body('code').notEmpty().withMessage('Authorization code is required'),
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

      const { code } = req.body;
      const tokens = await unifiedEmailService.processGmailAuthCode(code);

      res.json({
        success: true,
        message: 'Gmail API authorization successful',
        tokens: {
          refresh_token: tokens.refresh_token,
          // Don't send access_token in response for security
        },
        instructions: 'Add the refresh_token to your .env file as GMAIL_REFRESH_TOKEN',
      });
    } catch (error) {
      logger.error('Gmail auth callback failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process Gmail authorization',
      });
    }
  }
);

// Get sent emails (for debugging in mock mode)
router.get('/sent', async (req, res) => {
  try {
    const sentEmails = unifiedEmailService.getSentEmails();
    res.json({
      success: true,
      data: sentEmails,
      total: sentEmails.length,
      provider: unifiedEmailService.getCurrentProvider(),
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
    unifiedEmailService.clearSentEmails();
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