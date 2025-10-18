import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Globe,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  Search,
  Eye,
  Zap,
  Image as ImageIcon,
  Type,
  Palette,
  Code,
  MapPin,
  TrendingUp,
  FileText,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

interface AnalysisResult {
  url: string;
  isReachable: boolean;
  overallScore: number;
  timestamp: Date;
  
  technical: {
    score: number;
    hasSSL: boolean;
    loadTime: number;
    jsErrors: number;
    brokenLinks: number;
    mobileResponsive: boolean;
    mapWorking: boolean;
    issues: string[];
  };
  
  design: {
    score: number;
    heroSection: {
      exists: boolean;
      quality: 'excellent' | 'good' | 'poor' | 'missing';
      issues: string[];
    };
    contrast: {
      score: number;
      issues: string[];
    };
    colorScheme: {
      score: number;
      palette: string[];
      accessibility: boolean;
    };
    layout: {
      score: number;
      issues: string[];
    };
    typography: {
      score: number;
      readability: number;
      hierarchy: boolean;
    };
  };
  
  content: {
    score: number;
    quality: 'excellent' | 'good' | 'poor';
    grammar: number;
    clarity: number;
    cta: {
      exists: boolean;
      effectiveness: number;
    };
    issues: string[];
  };
  
  seo: {
    score: number;
    title: { exists: boolean; quality: number };
    metaDescription: { exists: boolean; quality: number };
    headings: { structured: boolean; quality: number };
    images: { optimized: boolean; altText: number };
    schema: boolean;
    sitemap: boolean;
    robotsTxt: boolean;
    issues: string[];
  };
  
  images: {
    score: number;
    totalImages: number;
    optimized: number;
    missingAlt: number;
    oversized: number;
    modernFormats: boolean;
  };
  
  aiReasoning: {
    summary: string;
    qualificationCategory: string;
    criteriaUsed: string[];
    recommendations: string[];
    priority: 'high' | 'medium' | 'low';
    estimatedValue: string;
  };
}

export function WebsiteAnalyzer() {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);

  const analyzeWebsite = async (websiteUrl: string) => {
    setAnalyzing(true);
    
    // Simulate AI analysis - in production, this would call backend API
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generate mock analysis result
    const result: AnalysisResult = {
      url: websiteUrl,
      isReachable: Math.random() > 0.1,
      overallScore: Math.floor(Math.random() * 40) + 35, // 35-75
      timestamp: new Date(),
      
      technical: {
        score: Math.floor(Math.random() * 30) + 50,
        hasSSL: Math.random() > 0.3,
        loadTime: Math.random() * 5 + 1,
        jsErrors: Math.floor(Math.random() * 5),
        brokenLinks: Math.floor(Math.random() * 3),
        mobileResponsive: Math.random() > 0.4,
        mapWorking: Math.random() > 0.5,
        issues: [
          'SSL certificate expired',
          'Slow page load time (4.2s)',
          '3 JavaScript errors detected',
          'Not mobile responsive',
        ].filter(() => Math.random() > 0.5),
      },
      
      design: {
        score: Math.floor(Math.random() * 40) + 30,
        heroSection: {
          exists: Math.random() > 0.3,
          quality: Math.random() > 0.6 ? 'poor' : Math.random() > 0.3 ? 'good' : 'excellent',
          issues: [
            'Hero section lacks clear value proposition',
            'CTA button has poor contrast',
            'Hero image is low quality',
          ].filter(() => Math.random() > 0.6),
        },
        contrast: {
          score: Math.floor(Math.random() * 40) + 40,
          issues: [
            'Text on background fails WCAG AA standards',
            'Button colors have insufficient contrast',
            'Link colors too similar to body text',
          ].filter(() => Math.random() > 0.5),
        },
        colorScheme: {
          score: Math.floor(Math.random() * 30) + 50,
          palette: ['#FF5733', '#3498db', '#2ecc71'],
          accessibility: Math.random() > 0.4,
        },
        layout: {
          score: Math.floor(Math.random() * 40) + 40,
          issues: [
            'Poor visual hierarchy',
            'Inconsistent spacing',
            'Elements not aligned properly',
          ].filter(() => Math.random() > 0.5),
        },
        typography: {
          score: Math.floor(Math.random() * 30) + 50,
          readability: Math.floor(Math.random() * 30) + 60,
          hierarchy: Math.random() > 0.4,
        },
      },
      
      content: {
        score: Math.floor(Math.random() * 40) + 40,
        quality: Math.random() > 0.6 ? 'poor' : Math.random() > 0.3 ? 'good' : 'excellent',
        grammar: Math.floor(Math.random() * 30) + 60,
        clarity: Math.floor(Math.random() * 30) + 50,
        cta: {
          exists: Math.random() > 0.3,
          effectiveness: Math.floor(Math.random() * 40) + 40,
        },
        issues: [
          'Multiple grammar errors detected',
          'Jargon makes content unclear',
          'No clear call-to-action',
          'Content is too generic',
        ].filter(() => Math.random() > 0.5),
      },
      
      seo: {
        score: Math.floor(Math.random() * 40) + 35,
        title: { exists: Math.random() > 0.2, quality: Math.floor(Math.random() * 40) + 40 },
        metaDescription: { exists: Math.random() > 0.4, quality: Math.floor(Math.random() * 40) + 40 },
        headings: { structured: Math.random() > 0.5, quality: Math.floor(Math.random() * 30) + 50 },
        images: { optimized: Math.random() > 0.4, altText: Math.floor(Math.random() * 50) + 30 },
        schema: Math.random() > 0.7,
        sitemap: Math.random() > 0.5,
        robotsTxt: Math.random() > 0.6,
        issues: [
          'Missing meta description',
          'Title tag too long (85 characters)',
          'No structured data (Schema.org)',
          'Images missing alt text',
          'No XML sitemap detected',
        ].filter(() => Math.random() > 0.5),
      },
      
      images: {
        score: Math.floor(Math.random() * 40) + 40,
        totalImages: Math.floor(Math.random() * 20) + 5,
        optimized: Math.floor(Math.random() * 10) + 2,
        missingAlt: Math.floor(Math.random() * 8) + 3,
        oversized: Math.floor(Math.random() * 5) + 1,
        modernFormats: Math.random() > 0.6,
      },
      
      aiReasoning: {
        summary: 'This website has significant design and technical issues that are costing the business customers. The outdated design, poor mobile responsiveness, and slow load times are major red flags.',
        qualificationCategory: Math.random() > 0.5 ? 'Outdated Design' : Math.random() > 0.5 ? 'Technical Issues' : 'Poor SEO',
        criteriaUsed: [
          'Website design age > 5 years',
          'Mobile responsiveness score < 60%',
          'Page load time > 3 seconds',
          'SEO score < 50/100',
          'Accessibility issues detected',
          'No SSL certificate or expired',
        ].filter(() => Math.random() > 0.4),
        recommendations: [
          'Complete website redesign needed',
          'Implement modern, mobile-first design',
          'Optimize images and page speed',
          'Fix technical SEO issues',
          'Add SSL certificate',
          'Improve content quality and CTAs',
        ],
        priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        estimatedValue: Math.random() > 0.5 ? '$5,000 - $15,000' : '$3,000 - $8,000',
      },
    };

    setResults([result, ...results]);
    setSelectedResult(result);
    setAnalyzing(false);
    toast.success('Website analysis complete!');
  };

  const handleAnalyze = () => {
    if (!url) {
      toast.error('Please enter a website URL');
      return;
    }
    
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = 'https://' + url;
    }
    
    analyzeWebsite(formattedUrl);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="page-container">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-gray-900">AI Website Analyzer</h2>
            <p className="text-gray-600">Deep analysis of design, SEO, technical quality, and content</p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <Card className="mb-6 border-gray-200">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter website URL (e.g., example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                className="h-12 text-base"
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={analyzing}
              size="lg"
              className="h-12 bg-purple-600 hover:bg-purple-700 px-8 min-w-[180px]"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            AI will analyze design quality, technical issues, SEO, content, and explain qualification criteria
          </p>
        </CardContent>
      </Card>

      {/* Results */}
      {selectedResult && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card className="border-2 border-purple-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                  <div className="text-center">
                    <div className={`text-5xl mb-2 ${getScoreColor(selectedResult.overallScore)}`}>
                      {selectedResult.overallScore}
                    </div>
                    <p className="text-sm text-gray-500">Overall Score</p>
                    <Badge className={`mt-2 ${getScoreBadge(selectedResult.overallScore)} border`}>
                      {selectedResult.overallScore >= 80 ? 'Excellent' : 
                       selectedResult.overallScore >= 60 ? 'Needs Work' : 'Poor'}
                    </Badge>
                  </div>
                </div>

                <div className="md:col-span-3">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Design Quality</span>
                        <span className={`text-sm ${getScoreColor(selectedResult.design.score)}`}>
                          {selectedResult.design.score}/100
                        </span>
                      </div>
                      <Progress value={selectedResult.design.score} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Technical Performance</span>
                        <span className={`text-sm ${getScoreColor(selectedResult.technical.score)}`}>
                          {selectedResult.technical.score}/100
                        </span>
                      </div>
                      <Progress value={selectedResult.technical.score} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">SEO Optimization</span>
                        <span className={`text-sm ${getScoreColor(selectedResult.seo.score)}`}>
                          {selectedResult.seo.score}/100
                        </span>
                      </div>
                      <Progress value={selectedResult.seo.score} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Content Quality</span>
                        <span className={`text-sm ${getScoreColor(selectedResult.content.score)}`}>
                          {selectedResult.content.score}/100
                        </span>
                      </div>
                      <Progress value={selectedResult.content.score} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Reasoning */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Sparkles className="h-5 w-5" />
                AI Qualification Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-blue-700 mb-1">AI Summary:</p>
                <p className="text-blue-900">{selectedResult.aiReasoning.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-blue-700 mb-2">Qualification Category:</p>
                  <Badge className="bg-blue-600 text-white">
                    {selectedResult.aiReasoning.qualificationCategory}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-blue-700 mb-2">Priority Level:</p>
                  <Badge className={
                    selectedResult.aiReasoning.priority === 'high' 
                      ? 'bg-red-100 text-red-800 border-red-300 border'
                      : selectedResult.aiReasoning.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-300 border'
                      : 'bg-gray-100 text-gray-800 border-gray-300 border'
                  }>
                    {selectedResult.aiReasoning.priority.toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-blue-700 mb-2">Estimated Value:</p>
                  <Badge className="bg-green-100 text-green-800 border-green-300 border">
                    {selectedResult.aiReasoning.estimatedValue}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-blue-700 mb-2">Criteria Used by AI:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedResult.aiReasoning.criteriaUsed.map((criterion, index) => (
                    <Badge key={index} variant="outline" className="text-blue-800 border-blue-300">
                      ✓ {criterion}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-blue-700 mb-2">AI Recommendations:</p>
                <div className="space-y-1">
                  {selectedResult.aiReasoning.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-blue-900">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <Tabs defaultValue="design" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="design">
                <Palette className="h-4 w-4 mr-2" />
                Design
              </TabsTrigger>
              <TabsTrigger value="technical">
                <Code className="h-4 w-4 mr-2" />
                Technical
              </TabsTrigger>
              <TabsTrigger value="seo">
                <TrendingUp className="h-4 w-4 mr-2" />
                SEO
              </TabsTrigger>
              <TabsTrigger value="content">
                <FileText className="h-4 w-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="images">
                <ImageIcon className="h-4 w-4 mr-2" />
                Images
              </TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Design Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="hero">
                      <AccordionTrigger>
                        Hero Section - {selectedResult.design.heroSection.quality}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {selectedResult.design.heroSection.exists ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span>Hero section {selectedResult.design.heroSection.exists ? 'exists' : 'missing'}</span>
                          </div>
                          {selectedResult.design.heroSection.issues.map((issue, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                              <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-600" />
                              {issue}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="contrast">
                      <AccordionTrigger>
                        Contrast & Accessibility - {selectedResult.design.contrast.score}/100
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {selectedResult.design.contrast.issues.map((issue, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                              <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-600" />
                              {issue}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="colors">
                      <AccordionTrigger>
                        Color Scheme - {selectedResult.design.colorScheme.score}/100
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex gap-2 mb-3">
                          {selectedResult.design.colorScheme.palette.map((color, i) => (
                            <div
                              key={i}
                              className="w-12 h-12 rounded border-2 border-gray-300"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedResult.design.colorScheme.accessibility ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span>Accessibility {selectedResult.design.colorScheme.accessibility ? 'passed' : 'failed'}</span>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        {selectedResult.technical.hasSSL ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">SSL Certificate</span>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Load Time</p>
                      <p className="text-lg">{selectedResult.technical.loadTime.toFixed(1)}s</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">JS Errors</p>
                      <p className="text-lg text-red-600">{selectedResult.technical.jsErrors}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Broken Links</p>
                      <p className="text-lg text-red-600">{selectedResult.technical.brokenLinks}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        {selectedResult.technical.mobileResponsive ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">Mobile Responsive</span>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        {selectedResult.technical.mapWorking ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">Map Working</span>
                      </div>
                    </div>
                  </div>

                  {selectedResult.technical.issues.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Issues Detected:</p>
                      <div className="space-y-1">
                        {selectedResult.technical.issues.map((issue, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <XCircle className="h-4 w-4 mt-0.5 text-red-600" />
                            {issue}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>SEO Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Title Tag</span>
                        <span className="text-sm text-gray-600">{selectedResult.seo.title.quality}/100</span>
                      </div>
                      {selectedResult.seo.title.exists ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Meta Description</span>
                        <span className="text-sm text-gray-600">{selectedResult.seo.metaDescription.quality}/100</span>
                      </div>
                      {selectedResult.seo.metaDescription.exists ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        {selectedResult.seo.schema ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">Schema Markup</span>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        {selectedResult.seo.sitemap ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">XML Sitemap</span>
                      </div>
                    </div>
                  </div>

                  {selectedResult.seo.issues.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">SEO Issues:</p>
                      <div className="space-y-1">
                        {selectedResult.seo.issues.map((issue, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-600" />
                            {issue}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Content Quality</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-1">Overall Quality</p>
                      <Badge className={getScoreBadge(selectedResult.content.score)}>
                        {selectedResult.content.quality}
                      </Badge>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-1">Grammar</p>
                      <p className={`text-xl ${getScoreColor(selectedResult.content.grammar)}`}>
                        {selectedResult.content.grammar}%
                      </p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-1">Clarity</p>
                      <p className={`text-xl ${getScoreColor(selectedResult.content.clarity)}`}>
                        {selectedResult.content.clarity}%
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Call-to-Action</span>
                      {selectedResult.content.cta.exists ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <Progress value={selectedResult.content.cta.effectiveness} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      Effectiveness: {selectedResult.content.cta.effectiveness}%
                    </p>
                  </div>

                  {selectedResult.content.issues.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Content Issues:</p>
                      <div className="space-y-1">
                        {selectedResult.content.issues.map((issue, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-600" />
                            {issue}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Image Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl mb-1">{selectedResult.images.totalImages}</p>
                      <p className="text-xs text-gray-600">Total Images</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl text-green-600 mb-1">{selectedResult.images.optimized}</p>
                      <p className="text-xs text-gray-600">Optimized</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl text-red-600 mb-1">{selectedResult.images.missingAlt}</p>
                      <p className="text-xs text-gray-600">Missing Alt</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl text-yellow-600 mb-1">{selectedResult.images.oversized}</p>
                      <p className="text-xs text-gray-600">Oversized</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    {selectedResult.images.modernFormats ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">
                      Using modern image formats (WebP, AVIF)
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Recent Analyses */}
      {results.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => setSelectedResult(result)}
                >
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{result.url}</p>
                      <p className="text-xs text-gray-500">
                        {result.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getScoreBadge(result.overallScore)}>
                      {result.overallScore}/100
                    </Badge>
                    {result.isReachable ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
