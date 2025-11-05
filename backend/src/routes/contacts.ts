import { Router, Request, Response } from 'express';
import logger from '../utils/logger';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all contacts
router.get('/', async (_req: Request, res: Response) => {
  try {
    logger.info('Fetching contacts from database');

    const contacts = await prisma.contact.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: contacts, // Return contacts directly, not nested
    });
  } catch (error) {
    logger.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contacts',
    });
  }
});

// Create contact
router.post('/', async (req: Request, res: Response) => {
  try {
    const contactData = req.body;
    logger.info('Creating contact:', contactData);

    // Get userId from request (you might want to get this from auth middleware)
    const userId = contactData.userId || 'a11f9e24-8631-46b5-bdb8-b5cfcb973140'; // Test user

    const contact = await prisma.contact.create({
      data: {
        user: {
          connect: { id: userId }
        },
        company: contactData.company || '',
        firstName: contactData.firstName || '',
        lastName: contactData.lastName || '',
        email: contactData.email,
        phone: contactData.phone,
        status: contactData.status || 'NEW',
        website: contactData.website,
        industry: contactData.industry,
        location: contactData.location,
        source: contactData.source,
        title: contactData.title,
        tags: contactData.tags,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    logger.error('Error creating contact:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create contact',
    });
  }
});

// Update contact
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contact = req.body;
    logger.info(`Updating contact ${id}:`, contact);

    // TODO: Implement with Prisma
    res.json({
      success: true,
      data: {
        id,
        ...contact,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error updating contact:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update contact',
    });
  }
});

// Delete contact
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info(`Deleting contact ${id}`);

    // TODO: Implement with Prisma
    res.json({
      success: true,
      message: 'Contact deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete contact',
    });
  }
});

export default router;