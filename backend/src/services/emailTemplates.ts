// Professional Email Templates for CampaignIt CRM
// These templates provide consistent, branded communication with customers

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
  type: 'welcome' | 'follow-up' | 'lead-nurturing' | 'notification' | 'reminder';
}

export interface EmailContext {
  customerName: string;
  customerEmail: string;
  companyName?: string;
  leadScore?: number;
  lastContact?: Date;
  nextAction?: string;
  customData?: Record<string, any>;
}

// Professional email styling
const getEmailStyles = () => `
  <style>
    .email-container {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    .email-header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      padding: 30px 40px;
      text-align: center;
    }
    .email-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .email-body {
      padding: 40px;
      line-height: 1.6;
      color: #374151;
    }
    .email-footer {
      background: #f9fafb;
      padding: 30px 40px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
    }
    .btn-primary {
      display: inline-block;
      background: #2563eb;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .btn-secondary {
      display: inline-block;
      background: #f3f4f6;
      color: #374151;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      border: 1px solid #d1d5db;
    }
    .highlight-box {
      background: #ecfdf5;
      border: 1px solid #10b981;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .info-box {
      background: #eff6ff;
      border: 1px solid #3b82f6;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
    }
  </style>
`;

export const emailTemplates: Record<string, (context: EmailContext) => EmailTemplate> = {
  
  // Welcome Email for New Customers/Leads
  welcome: (context: EmailContext) => ({
    subject: `Welcome to CampaignIt, ${context.customerName}! 🚀`,
    html: `
      ${getEmailStyles()}
      <div class="email-container">
        <div class="email-header">
          <h1>Welcome to CampaignIt!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your journey to powerful campaigns starts here</p>
        </div>
        
        <div class="email-body">
          <h2 style="color: #2563eb;">Hello ${context.customerName}! 👋</h2>
          
          <p>Welcome to CampaignIt! We're thrilled to have you join our community of successful marketers and business owners.</p>
          
          <div class="highlight-box">
            <h3 style="margin-top: 0; color: #047857;">🎯 What's Next?</h3>
            <ul style="margin-bottom: 0;">
              <li>Complete your profile setup</li>
              <li>Explore our campaign templates</li>
              <li>Schedule your first strategy call</li>
              <li>Join our community forum</li>
            </ul>
          </div>
          
          <p>Our team is here to help you succeed. If you have any questions, don't hesitate to reach out!</p>
          
          <a href="https://campaignit.co.za/get-started" class="btn-primary">Get Started Now</a>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>The CampaignIt Team</strong><br>
            <em>Building powerful campaigns together</em>
          </p>
        </div>
        
        <div class="email-footer">
          <p><strong>CampaignIt</strong> | South Africa</p>
          <p>
            <a href="https://campaignit.co.za" style="color: #2563eb;">Website</a> | 
            <a href="https://campaignit.co.za/support" style="color: #2563eb;">Support</a> | 
            <a href="https://campaignit.co.za/unsubscribe" style="color: #6b7280;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `,
    text: `Welcome to CampaignIt, ${context.customerName}!

We're thrilled to have you join our community of successful marketers and business owners.

What's Next:
- Complete your profile setup
- Explore our campaign templates  
- Schedule your first strategy call
- Join our community forum

Our team is here to help you succeed. Visit https://campaignit.co.za/get-started to begin.

Best regards,
The CampaignIt Team
Building powerful campaigns together

CampaignIt | South Africa
Website: https://campaignit.co.za
Support: https://campaignit.co.za/support`,
    type: 'welcome'
  }),

  // Follow-up Email for Leads
  followUp: (context: EmailContext) => ({
    subject: `Following up on your CampaignIt inquiry, ${context.customerName}`,
    html: `
      ${getEmailStyles()}
      <div class="email-container">
        <div class="email-header">
          <h1>Let's Continue Your Journey</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Ready to take the next step?</p>
        </div>
        
        <div class="email-body">
          <h2 style="color: #2563eb;">Hi ${context.customerName},</h2>
          
          <p>I wanted to follow up on your recent interest in CampaignIt. ${context.companyName ? `I noticed you're with ${context.companyName} - ` : ''}We'd love to help you achieve your marketing goals.</p>
          
          <div class="info-box">
            <h3 style="margin-top: 0; color: #1d4ed8;">📈 Why CampaignIt?</h3>
            <ul style="margin-bottom: 0;">
              <li><strong>Proven Results:</strong> 300% average ROI increase</li>
              <li><strong>Easy to Use:</strong> No technical skills required</li>
              <li><strong>Full Support:</strong> Dedicated success manager</li>
              <li><strong>Local Expertise:</strong> South African market focus</li>
            </ul>
          </div>
          
          <p>I'd love to show you how CampaignIt can specifically help ${context.companyName || 'your business'}. Would you be available for a 15-minute demo this week?</p>
          
          <a href="https://campaignit.co.za/book-demo" class="btn-primary">Book Your Demo</a>
          <a href="https://campaignit.co.za/case-studies" class="btn-secondary">View Case Studies</a>
          
          <p style="margin-top: 30px;">
            Looking forward to hearing from you!<br>
            <strong>Sales Team</strong><br>
            <em>sales@campaignit.co.za</em>
          </p>
        </div>
        
        <div class="email-footer">
          <p><strong>CampaignIt</strong> | South Africa</p>
          <p>
            <a href="https://campaignit.co.za" style="color: #2563eb;">Website</a> | 
            <a href="mailto:sales@campaignit.co.za" style="color: #2563eb;">Contact Sales</a> | 
            <a href="https://campaignit.co.za/unsubscribe" style="color: #6b7280;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `,
    text: `Following up on your CampaignIt inquiry, ${context.customerName}

Hi ${context.customerName},

I wanted to follow up on your recent interest in CampaignIt. ${context.companyName ? `I noticed you're with ${context.companyName} - ` : ''}We'd love to help you achieve your marketing goals.

Why CampaignIt?
- Proven Results: 300% average ROI increase
- Easy to Use: No technical skills required  
- Full Support: Dedicated success manager
- Local Expertise: South African market focus

I'd love to show you how CampaignIt can specifically help ${context.companyName || 'your business'}. 

Book your demo: https://campaignit.co.za/book-demo
View case studies: https://campaignit.co.za/case-studies

Looking forward to hearing from you!
Sales Team
sales@campaignit.co.za

CampaignIt | South Africa`,
    type: 'follow-up'
  }),

  // Lead Nurturing Email
  leadNurturing: (context: EmailContext) => ({
    subject: `${context.customerName}, here's how to boost your campaign ROI by 200%`,
    html: `
      ${getEmailStyles()}
      <div class="email-container">
        <div class="email-header">
          <h1>Boost Your ROI by 200%</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Proven strategies from successful campaigns</p>
        </div>
        
        <div class="email-body">
          <h2 style="color: #2563eb;">Hi ${context.customerName},</h2>
          
          <p>I've been analyzing successful campaigns in your industry${context.companyName ? ` (similar to ${context.companyName})` : ''}, and I found some interesting patterns that could significantly boost your ROI.</p>
          
          <div class="highlight-box">
            <h3 style="margin-top: 0; color: #047857;">🚀 Top 3 ROI Boosters</h3>
            <ol style="margin-bottom: 0;">
              <li><strong>Personalized Messaging:</strong> 180% higher engagement rates</li>
              <li><strong>Multi-Channel Approach:</strong> 250% more conversions</li>
              <li><strong>AI-Powered Optimization:</strong> 40% lower cost per acquisition</li>
            </ol>
          </div>
          
          <p><strong>Real Success Story:</strong> A client similar to your business increased their monthly revenue by R125,000 using these exact strategies.</p>
          
          <div class="info-box">
            <h3 style="margin-top: 0; color: #1d4ed8;">📊 Free Campaign Analysis</h3>
            <p style="margin-bottom: 0;">I'd love to provide you with a free analysis of your current campaigns and show you exactly where these improvements could be applied. It takes just 15 minutes and could save you thousands in ad spend.</p>
          </div>
          
          <a href="https://campaignit.co.za/free-analysis" class="btn-primary">Get Free Analysis</a>
          
          <p style="margin-top: 30px;">
            Ready to maximize your marketing ROI?<br>
            <strong>CampaignIt Success Team</strong><br>
            <em>success@campaignit.co.za</em>
          </p>
        </div>
        
        <div class="email-footer">
          <p><strong>CampaignIt</strong> | South Africa</p>
          <p>
            <a href="https://campaignit.co.za/resources" style="color: #2563eb;">Free Resources</a> | 
            <a href="https://campaignit.co.za/support" style="color: #2563eb;">Support</a> | 
            <a href="https://campaignit.co.za/unsubscribe" style="color: #6b7280;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `,
    text: `${context.customerName}, here's how to boost your campaign ROI by 200%

Hi ${context.customerName},

I've been analyzing successful campaigns in your industry${context.companyName ? ` (similar to ${context.companyName})` : ''}, and I found some patterns that could significantly boost your ROI.

Top 3 ROI Boosters:
1. Personalized Messaging: 180% higher engagement rates
2. Multi-Channel Approach: 250% more conversions  
3. AI-Powered Optimization: 40% lower cost per acquisition

Real Success Story: A client similar to your business increased their monthly revenue by R125,000 using these exact strategies.

Free Campaign Analysis:
I'd love to provide you with a free analysis of your current campaigns and show you exactly where these improvements could be applied.

Get your free analysis: https://campaignit.co.za/free-analysis

Ready to maximize your marketing ROI?
CampaignIt Success Team
success@campaignit.co.za

CampaignIt | South Africa`,
    type: 'lead-nurturing'
  }),

  // System Notification Email
  notification: (context: EmailContext) => ({
    subject: `CampaignIt Update: ${context.customData?.title || 'Important Information'}`,
    html: `
      ${getEmailStyles()}
      <div class="email-container">
        <div class="email-header">
          <h1>CampaignIt Update</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Important information for your account</p>
        </div>
        
        <div class="email-body">
          <h2 style="color: #2563eb;">Hi ${context.customerName},</h2>
          
          <p>We have an important update regarding your CampaignIt account.</p>
          
          <div class="info-box">
            <h3 style="margin-top: 0; color: #1d4ed8;">${context.customData?.title || 'Account Update'}</h3>
            <p style="margin-bottom: 0;">${context.customData?.message || 'Please check your account dashboard for the latest updates.'}</p>
          </div>
          
          ${context.customData?.action ? `<a href="${context.customData.actionUrl || 'https://campaignit.co.za/dashboard'}" class="btn-primary">${context.customData.action}</a>` : ''}
          
          <p>If you have any questions about this update, please don't hesitate to contact our support team.</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>CampaignIt Support Team</strong><br>
            <em>support@campaignit.co.za</em>
          </p>
        </div>
        
        <div class="email-footer">
          <p><strong>CampaignIt</strong> | South Africa</p>
          <p>
            <a href="https://campaignit.co.za/dashboard" style="color: #2563eb;">Dashboard</a> | 
            <a href="https://campaignit.co.za/support" style="color: #2563eb;">Support</a> | 
            <a href="https://campaignit.co.za/unsubscribe" style="color: #6b7280;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `,
    text: `CampaignIt Update: ${context.customData?.title || 'Important Information'}

Hi ${context.customerName},

We have an important update regarding your CampaignIt account.

${context.customData?.title || 'Account Update'}:
${context.customData?.message || 'Please check your account dashboard for the latest updates.'}

${context.customData?.action ? `Action required: ${context.customData.actionUrl || 'https://campaignit.co.za/dashboard'}` : ''}

If you have any questions about this update, please contact our support team.

Best regards,
CampaignIt Support Team
support@campaignit.co.za

CampaignIt | South Africa`,
    type: 'notification'
  }),

  // Reminder Email
  reminder: (context: EmailContext) => ({
    subject: `Reminder: ${context.customData?.title || 'Don\'t miss out!'} - CampaignIt`,
    html: `
      ${getEmailStyles()}
      <div class="email-container">
        <div class="email-header">
          <h1>Friendly Reminder</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Don't let this opportunity slip away</p>
        </div>
        
        <div class="email-body">
          <h2 style="color: #2563eb;">Hi ${context.customerName},</h2>
          
          <p>Just a friendly reminder about ${context.customData?.title || 'your upcoming opportunity'} with CampaignIt.</p>
          
          <div class="highlight-box">
            <h3 style="margin-top: 0; color: #047857;">⏰ Reminder Details</h3>
            <p><strong>What:</strong> ${context.customData?.title || 'Important action required'}</p>
            ${context.customData?.date ? `<p><strong>When:</strong> ${context.customData.date}</p>` : ''}
            <p style="margin-bottom: 0;"><strong>Details:</strong> ${context.customData?.message || 'Please check your dashboard for more information.'}</p>
          </div>
          
          <p>Don't miss out on this opportunity to grow your business with CampaignIt!</p>
          
          ${context.customData?.action ? `<a href="${context.customData.actionUrl || 'https://campaignit.co.za/dashboard'}" class="btn-primary">${context.customData.action}</a>` : ''}
          
          <p style="margin-top: 30px;">
            Questions? We're here to help!<br>
            <strong>CampaignIt Team</strong><br>
            <em>support@campaignit.co.za</em>
          </p>
        </div>
        
        <div class="email-footer">
          <p><strong>CampaignIt</strong> | South Africa</p>
          <p>
            <a href="https://campaignit.co.za" style="color: #2563eb;">Website</a> | 
            <a href="https://campaignit.co.za/support" style="color: #2563eb;">Support</a> | 
            <a href="https://campaignit.co.za/unsubscribe" style="color: #6b7280;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `,
    text: `Reminder: ${context.customData?.title || 'Don\'t miss out!'} - CampaignIt

Hi ${context.customerName},

Just a friendly reminder about ${context.customData?.title || 'your upcoming opportunity'} with CampaignIt.

Reminder Details:
- What: ${context.customData?.title || 'Important action required'}
${context.customData?.date ? `- When: ${context.customData.date}` : ''}
- Details: ${context.customData?.message || 'Please check your dashboard for more information.'}

Don't miss out on this opportunity to grow your business!

${context.customData?.action ? `Take action: ${context.customData.actionUrl || 'https://campaignit.co.za/dashboard'}` : ''}

Questions? We're here to help!
CampaignIt Team
support@campaignit.co.za

CampaignIt | South Africa`,
    type: 'reminder'
  })
};

// Helper function to render templates
export const renderEmailTemplate = (templateName: string, context: EmailContext): EmailTemplate => {
  const template = emailTemplates[templateName];
  if (!template) {
    throw new Error(`Email template '${templateName}' not found`);
  }
  return template(context);
};

// Available template names
export const availableTemplates = Object.keys(emailTemplates);