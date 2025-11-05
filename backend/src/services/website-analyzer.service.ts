/**
 * Website Analyzer Service
 * Uses Azure OpenAI to analyze business websites and qualify leads
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { AzureOpenAIService } from './azureOpenAI';
import logger from '../utils/logger';

const azureAI = new AzureOpenAIService();

export interface WebsiteAnalysis {
  url: string;
  businessName: string;
  industry: string;
  services: string[];
  targetMarket: string;
  qualificationScore: number; // 0-100
  qualificationReason: string;
  recommendedAction: 'high-priority' | 'medium-priority' | 'low-priority' | 'not-qualified';
  insights: {
    hasModernWebsite: boolean;
    websiteQuality: 'excellent' | 'good' | 'average' | 'poor';
    needsRedesign: boolean;
    missingFeatures: string[];
    opportunities: string[];
  };
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
    socialMedia: string[];
  };
  analyzedAt: string;
}

/**
 * Scrape website content
 */
async function scrapeWebsite(url: string): Promise<{ title: string; text: string; html: string }> {
  try {
    logger.info(`🔍 Scraping website: ${url}`);

    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      maxRedirects: 5,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove script and style tags
    $('script, style, noscript, iframe').remove();

    // Get page title
    const title = $('title').text().trim() || $('h1').first().text().trim();

    // Extract main content
    const text = $('body').text()
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 4000); // Limit to 4000 chars

    logger.info(`✅ Scraped ${text.length} characters from ${url}`);

    return { title, text, html };
  } catch (error: any) {
    logger.error(`Failed to scrape ${url}:`, error.message);
    throw new Error(`Failed to scrape website: ${error.message}`);
  }
}

/**
 * Analyze website using Azure OpenAI
 */
export async function analyzeWebsite(url: string, businessName: string, industry: string): Promise<WebsiteAnalysis> {
  try {
    logger.info(`🤖 Analyzing website: ${url} (${businessName}, ${industry})`);

    // Scrape website
    const { title, text } = await scrapeWebsite(url);

    // Prepare AI prompt
    const prompt = `Analyze this business website and provide a detailed qualification assessment.

Business Name: ${businessName}
Industry: ${industry}
Website Title: ${title}
Website Content: ${text.substring(0, 3000)}

Analyze the following:
1. What services do they offer?
2. Who is their target market?
3. Does their website look modern and professional?
4. What features are they missing (e.g., online booking, mobile-responsive, SEO)?
5. Would they benefit from a website redesign or digital marketing services?
6. Qualification score (0-100) - how good a prospect are they?
7. Recommended action: high-priority, medium-priority, low-priority, or not-qualified

Respond in JSON format:
{
  "services": ["service1", "service2"],
  "targetMarket": "description",
  "websiteQuality": "excellent|good|average|poor",
  "hasModernWebsite": true/false,
  "needsRedesign": true/false,
  "missingFeatures": ["feature1", "feature2"],
  "opportunities": ["opportunity1", "opportunity2"],
  "qualificationScore": 0-100,
  "qualificationReason": "detailed explanation",
  "recommendedAction": "high-priority|medium-priority|low-priority|not-qualified"
}`;

    // Call Azure OpenAI
    const response = await azureAI.generateChatCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are an expert business analyst specializing in website evaluation and lead qualification for digital marketing and web design services. Analyze websites and provide detailed, actionable insights.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      maxTokens: 1000,
    });

    logger.info(`✅ Received AI analysis: ${response.content.substring(0, 100)}...`);

    // Parse AI response
    let analysis;
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonText = response.content.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }
      
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      logger.error('Failed to parse AI response as JSON:', response.content);
      // Fallback analysis
      analysis = {
        services: ['Unknown'],
        targetMarket: 'Not determined',
        websiteQuality: 'average',
        hasModernWebsite: false,
        needsRedesign: true,
        missingFeatures: ['Unable to analyze'],
        opportunities: ['Further manual review needed'],
        qualificationScore: 50,
        qualificationReason: 'AI analysis incomplete - manual review recommended',
        recommendedAction: 'medium-priority',
      };
    }

    // Extract contact information from scraped text
    const contactInfo = extractContactInfo(text);

    const websiteAnalysis: WebsiteAnalysis = {
      url,
      businessName,
      industry,
      services: analysis.services || [],
      targetMarket: analysis.targetMarket || 'Not specified',
      qualificationScore: analysis.qualificationScore || 50,
      qualificationReason: analysis.qualificationReason || 'No reason provided',
      recommendedAction: analysis.recommendedAction || 'medium-priority',
      insights: {
        hasModernWebsite: analysis.hasModernWebsite ?? false,
        websiteQuality: analysis.websiteQuality || 'average',
        needsRedesign: analysis.needsRedesign ?? true,
        missingFeatures: analysis.missingFeatures || [],
        opportunities: analysis.opportunities || [],
      },
      contactInfo,
      analyzedAt: new Date().toISOString(),
    };

    logger.info(`🎯 Website analysis complete: Score ${websiteAnalysis.qualificationScore}/100, Action: ${websiteAnalysis.recommendedAction}`);

    return websiteAnalysis;
  } catch (error: any) {
    logger.error(`Website analysis failed for ${url}:`, error.message);
    throw new Error(`Failed to analyze website: ${error.message}`);
  }
}

/**
 * Extract contact information from website text
 */
function extractContactInfo(text: string): WebsiteAnalysis['contactInfo'] {
  const contactInfo: WebsiteAnalysis['contactInfo'] = {
    socialMedia: [],
  };

  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    contactInfo.email = emailMatch[0];
  }

  // Extract phone (various formats)
  const phoneMatch = text.match(/(\+?\d{1,4}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}/);
  if (phoneMatch) {
    contactInfo.phone = phoneMatch[0].trim();
  }

  // Extract social media
  if (text.includes('facebook.com')) contactInfo.socialMedia.push('Facebook');
  if (text.includes('twitter.com') || text.includes('x.com')) contactInfo.socialMedia.push('Twitter/X');
  if (text.includes('instagram.com')) contactInfo.socialMedia.push('Instagram');
  if (text.includes('linkedin.com')) contactInfo.socialMedia.push('LinkedIn');

  return contactInfo;
}

/**
 * Batch analyze multiple websites
 */
export async function analyzeMultipleWebsites(
  websites: Array<{ url: string; businessName: string; industry: string }>
): Promise<WebsiteAnalysis[]> {
  const results: WebsiteAnalysis[] = [];

  for (const site of websites) {
    try {
      const analysis = await analyzeWebsite(site.url, site.businessName, site.industry);
      results.push(analysis);

      // Rate limiting: wait 2 seconds between analyses
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error: any) {
      logger.error(`Failed to analyze ${site.url}:`, error.message);
      // Continue with next website
    }
  }

  return results;
}

export const websiteAnalyzerService = {
  analyzeWebsite,
  analyzeMultipleWebsites,
  scrapeWebsite,
};
