import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Globe,
  Calculator,
  Phone as PhoneIcon,
  Megaphone,
  ShoppingCart,
  Building,
  Code,
  Briefcase,
  Palette,
  TrendingUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';

interface IndustryTemplate {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
  
  qualificationCategories: {
    name: string;
    description: string;
    criteria: string[];
  }[];
  
  campaignTemplate: {
    name: string;
    objective: string;
    script: string;
    targetAudience: string;
  };
  
  stats: {
    avgConversionRate: string;
    avgDealSize: string;
  };
}

export function IndustryTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<IndustryTemplate | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const templates: IndustryTemplate[] = [
    {
      id: 'web-design',
      name: 'Web Design Services',
      icon: Globe,
      color: 'blue',
      description: 'Sell website design, redesign, and maintenance services',
      qualificationCategories: [
        {
          name: 'No Website',
          description: 'Businesses without any website',
          criteria: ['No website URL found', 'Only social media presence', 'Domain not registered'],
        },
        {
          name: 'Outdated Design',
          description: 'Websites that look old or unprofessional',
          criteria: ['Design looks 5+ years old', 'Not mobile responsive', 'Slow loading speed'],
        },
        {
          name: 'Broken Website',
          description: 'Websites with technical issues',
          criteria: ['404 errors', 'SSL certificate issues', 'Broken functionality'],
        },
      ],
      campaignTemplate: {
        name: 'Web Design Outreach',
        objective: 'Book discovery calls for website design services',
        script: "Hi, I'm calling from [Your Company]. I noticed your business doesn't have a professional website. In today's market, that's costing you customers every day. We specialize in creating beautiful, high-converting websites that generate leads on autopilot. Can I show you how we helped businesses like yours increase their revenue by 40%?",
        targetAudience: 'Local businesses, restaurants, professional services',
      },
      stats: {
        avgConversionRate: '15-25%',
        avgDealSize: '$3,000 - $15,000',
      },
    },
    {
      id: 'ai-call-center',
      name: 'AI Call Center Services',
      icon: PhoneIcon,
      color: 'purple',
      description: 'Sell AI-powered call center and customer service automation',
      qualificationCategories: [
        {
          name: 'High Call Volume',
          description: 'Businesses with large customer service teams',
          criteria: ['10+ customer service reps', 'Long wait times', 'High call abandonment rate'],
        },
        {
          name: 'Manual Outbound',
          description: 'Companies doing manual cold calling',
          criteria: ['Sales team makes 50+ calls/day', 'Low connection rates', 'No automation'],
        },
        {
          name: 'Lead Follow-up Issues',
          description: 'Slow or inconsistent lead follow-up',
          criteria: ['Leads not contacted within 24h', 'No automated follow-up', 'Missing opportunities'],
        },
      ],
      campaignTemplate: {
        name: 'AI Automation Pitch',
        objective: 'Demo AI call center capabilities',
        script: "Hi, I'm calling from [Your Company]. I noticed your team is still manually handling customer calls. What if I told you AI agents could handle 80% of those calls, 24/7, at 1/10th the cost? Our clients are seeing 300% ROI in the first month. Would you like to see a demo of how it works?",
        targetAudience: 'Call centers, sales teams, customer service departments',
      },
      stats: {
        avgConversionRate: '20-30%',
        avgDealSize: '$5,000 - $50,000/month',
      },
    },
    {
      id: 'accounting-software',
      name: 'Accounting Software',
      icon: Calculator,
      color: 'green',
      description: 'Sell accounting, bookkeeping, and financial software',
      qualificationCategories: [
        {
          name: 'Using Spreadsheets',
          description: 'Still using Excel for accounting',
          criteria: ['No accounting software', 'Manual data entry', 'Error-prone processes'],
        },
        {
          name: 'Outdated Software',
          description: 'Using legacy accounting systems',
          criteria: ['Desktop-only software', 'No cloud access', 'No integrations'],
        },
        {
          name: 'Growing Business',
          description: 'Outgrown current solution',
          criteria: ['10+ employees', 'Multiple locations', 'Complex reporting needs'],
        },
      ],
      campaignTemplate: {
        name: 'Accounting Software Demo',
        objective: 'Schedule product demo',
        script: "Hi, I'm calling from [Your Company]. Are you still doing your accounting manually or using outdated software? Our cloud-based platform automates 90% of bookkeeping tasks, gives you real-time financial insights, and saves businesses an average of 20 hours per week. Can I show you how it works?",
        targetAudience: 'Small businesses, accountants, bookkeepers',
      },
      stats: {
        avgConversionRate: '18-28%',
        avgDealSize: '$100 - $500/month',
      },
    },
    {
      id: 'digital-marketing',
      name: 'Digital Marketing Services',
      icon: Megaphone,
      color: 'orange',
      description: 'Sell SEO, PPC, social media, and content marketing',
      qualificationCategories: [
        {
          name: 'No Online Presence',
          description: 'Businesses not visible online',
          criteria: ['No Google My Business', 'Not on first page of Google', 'No social media'],
        },
        {
          name: 'Low Website Traffic',
          description: 'Websites with poor organic traffic',
          criteria: ['Less than 500 visitors/month', 'No SEO optimization', 'High bounce rate'],
        },
        {
          name: 'No Paid Ads',
          description: 'Not running any digital ads',
          criteria: ['No Google Ads', 'No Facebook Ads', 'Competitors are advertising'],
        },
      ],
      campaignTemplate: {
        name: 'Marketing Services Pitch',
        objective: 'Book strategy call',
        script: "Hi, I'm calling from [Your Company]. I was looking at your business online and noticed you're not showing up when people search for [their service]. Your competitors are getting those customers instead. We specialize in getting businesses to the top of Google and generating qualified leads on autopilot. Can I show you a free analysis of what's costing you customers?",
        targetAudience: 'Local businesses, e-commerce, professional services',
      },
      stats: {
        avgConversionRate: '12-22%',
        avgDealSize: '$1,000 - $10,000/month',
      },
    },
    {
      id: 'business-consulting',
      name: 'Business Consulting',
      icon: Briefcase,
      color: 'indigo',
      description: 'Sell business strategy, operations, and consulting services',
      qualificationCategories: [
        {
          name: 'Scaling Challenges',
          description: 'Businesses struggling to scale',
          criteria: ['Revenue plateaued', 'Operational bottlenecks', 'Inefficient processes'],
        },
        {
          name: 'New Business',
          description: 'Startups needing guidance',
          criteria: ['Less than 2 years old', 'First-time founders', 'No clear strategy'],
        },
        {
          name: 'Underperforming',
          description: 'Below industry benchmarks',
          criteria: ['Low profit margins', 'High churn rate', 'Poor unit economics'],
        },
      ],
      campaignTemplate: {
        name: 'Consulting Outreach',
        objective: 'Book consultation',
        script: "Hi, I'm calling from [Your Company]. I help businesses like yours scale profitably without burning out. I noticed [specific pain point]. Most companies in your industry are growing 30% faster - would you like to know what they're doing differently? I offer a free 30-minute strategy session to show you exactly how to get there.",
        targetAudience: 'Business owners, executives, entrepreneurs',
      },
      stats: {
        avgConversionRate: '10-20%',
        avgDealSize: '$5,000 - $100,000',
      },
    },
    {
      id: 'ecommerce',
      name: 'E-commerce Solutions',
      icon: ShoppingCart,
      color: 'pink',
      description: 'Sell e-commerce platforms, Shopify development, online stores',
      qualificationCategories: [
        {
          name: 'No Online Store',
          description: 'Retail businesses without e-commerce',
          criteria: ['Physical store only', 'No online sales', 'Losing to online competitors'],
        },
        {
          name: 'Poor UX',
          description: 'Online stores with bad user experience',
          criteria: ['High cart abandonment', 'Low conversion rate', 'Slow checkout process'],
        },
        {
          name: 'Platform Migration',
          description: 'Need to switch platforms',
          criteria: ['Outgrown current platform', 'Too expensive', 'Limited features'],
        },
      ],
      campaignTemplate: {
        name: 'E-commerce Setup',
        objective: 'Demo online store capabilities',
        script: "Hi, I'm calling from [Your Company]. I noticed you're not selling online yet. During COVID, online shopping grew 300% and it's not slowing down. We build beautiful online stores that generate sales 24/7. Our clients typically see their first online sale within 48 hours of launch. Would you like to see how easy it is?",
        targetAudience: 'Retailers, product businesses, brands',
      },
      stats: {
        avgConversionRate: '15-25%',
        avgDealSize: '$5,000 - $30,000',
      },
    },
    {
      id: 'saas',
      name: 'SaaS Product Sales',
      icon: Code,
      color: 'cyan',
      description: 'Sell any SaaS product or software subscription',
      qualificationCategories: [
        {
          name: 'Right Company Size',
          description: 'Fits ideal customer profile',
          criteria: ['10-100 employees', 'In target industry', 'Growing revenue'],
        },
        {
          name: 'Using Competitor',
          description: 'Currently using competitor product',
          criteria: ['Complaints about current tool', 'Feature gaps', 'Pricing concerns'],
        },
        {
          name: 'Manual Process',
          description: 'Still doing things manually',
          criteria: ['No automation', 'Repetitive tasks', 'Inefficient workflows'],
        },
      ],
      campaignTemplate: {
        name: 'SaaS Demo Request',
        objective: 'Book product demo',
        script: "Hi, I'm calling from [Your Company]. I noticed you're [current situation]. Our platform helps companies like yours [solve specific problem] in half the time with better results. We've helped over [X] companies save [Y hours/dollars] per month. Would you like to see a quick 15-minute demo?",
        targetAudience: 'Decision-makers in target industries',
      },
      stats: {
        avgConversionRate: '8-18%',
        avgDealSize: '$200 - $2,000/month',
      },
    },
    {
      id: 'real-estate',
      name: 'Real Estate Services',
      icon: Building,
      color: 'red',
      description: 'Sell property management, real estate tech, services',
      qualificationCategories: [
        {
          name: 'Property Owners',
          description: 'Landlords with multiple properties',
          criteria: ['5+ rental properties', 'Self-managing', 'Tenant issues'],
        },
        {
          name: 'Realtors',
          description: 'Real estate agents needing tools',
          criteria: ['No CRM', 'Manual lead follow-up', 'Poor lead conversion'],
        },
        {
          name: 'Commercial',
          description: 'Commercial property needs',
          criteria: ['Office buildings', 'Retail spaces', 'Management challenges'],
        },
      ],
      campaignTemplate: {
        name: 'Property Management',
        objective: 'Offer free property assessment',
        script: "Hi, I'm calling from [Your Company]. Are you still managing your rental properties yourself? Most landlords don't realize they're losing 15-20% of potential rental income through vacancy periods, late maintenance, and tenant issues. We handle everything - from tenant screening to maintenance coordination - and our clients see their properties fully occupied year-round. Can I show you what that would mean for your properties?",
        targetAudience: 'Property owners, landlords, realtors',
      },
      stats: {
        avgConversionRate: '12-20%',
        avgDealSize: '$500 - $5,000/month',
      },
    },
  ];

  const handleApplyTemplate = (template: IndustryTemplate) => {
    // This would actually create the qualification categories and campaign
    toast.success(`${template.name} template applied!`, {
      description: 'Qualification categories and campaign created',
    });
    setShowDetailsDialog(false);
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      green: 'from-green-500 to-green-600',
      orange: 'from-orange-500 to-orange-600',
      indigo: 'from-indigo-500 to-indigo-600',
      pink: 'from-pink-500 to-pink-600',
      cyan: 'from-cyan-500 to-cyan-600',
      red: 'from-red-500 to-red-600',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="page-container">
      <div className="mb-6 md:mb-8">
        <h2 className="mb-2 text-gray-900">Industry Templates</h2>
        <p className="text-gray-600">
          Pre-configured qualification criteria and campaigns for different industries.
          Choose a template to get started instantly.
        </p>
      </div>

      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-blue-900 mb-1">Universal Sales Platform</h4>
              <p className="text-sm text-blue-700">
                This AI CRM can sell ANYTHING - web design, software, consulting, marketing, 
                call center services, accounting tools, and more. Select a template below or 
                create your own custom qualification criteria.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <Card
              key={template.id}
              className="border-gray-200 hover:shadow-lg transition-all cursor-pointer group hover-lift"
              onClick={() => {
                setSelectedTemplate(template);
                setShowDetailsDialog(true);
              }}
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getColorClass(template.color)} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="mb-2 text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Conversion Rate:</span>
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      {template.stats.avgConversionRate}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Avg Deal Size:</span>
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      {template.stats.avgDealSize}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center text-sm text-blue-600 font-medium group-hover:gap-2 transition-all">
                  View Details
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Template Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getColorClass(selectedTemplate.color)} flex items-center justify-center`}>
                    <selectedTemplate.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle>{selectedTemplate.name}</DialogTitle>
                    <DialogDescription>{selectedTemplate.description}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <p className="text-sm text-green-700 mb-1">Expected Conversion</p>
                      <p className="text-2xl text-green-900">{selectedTemplate.stats.avgConversionRate}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <p className="text-sm text-blue-700 mb-1">Average Deal Size</p>
                      <p className="text-2xl text-blue-900">{selectedTemplate.stats.avgDealSize}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Qualification Categories */}
                <div>
                  <h4 className="mb-3 text-gray-900">Qualification Categories</h4>
                  <div className="space-y-3">
                    {selectedTemplate.qualificationCategories.map((category, index) => (
                      <Card key={index} className="border-gray-200">
                        <CardContent className="p-4">
                          <h5 className="font-medium text-gray-900 mb-1">{category.name}</h5>
                          <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                          <div className="space-y-1">
                            {category.criteria.map((criterion, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                {criterion}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Campaign Template */}
                <div>
                  <h4 className="mb-3 text-gray-900">Campaign Template</h4>
                  <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-purple-700 mb-1">Campaign Name:</p>
                          <p className="font-medium text-purple-900">{selectedTemplate.campaignTemplate.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-purple-700 mb-1">Objective:</p>
                          <p className="text-purple-900">{selectedTemplate.campaignTemplate.objective}</p>
                        </div>
                        <div>
                          <p className="text-sm text-purple-700 mb-1">Target Audience:</p>
                          <p className="text-purple-900">{selectedTemplate.campaignTemplate.targetAudience}</p>
                        </div>
                        <div>
                          <p className="text-sm text-purple-700 mb-1">Sample Script:</p>
                          <p className="text-sm text-purple-900 italic leading-relaxed">
                            "{selectedTemplate.campaignTemplate.script}"
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDetailsDialog(false)}
                    className="min-w-[100px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 min-w-[180px]"
                    onClick={() => handleApplyTemplate(selectedTemplate)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Apply This Template
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
