// Autopilot API Service
const API_BASE_URL = 'http://localhost:8000/api';

export interface AutopilotConfig {
  enabled: boolean;
  industry: string;
  leadFinding: {
    enabled: boolean;
    searchQuery: string;
    targetCount: number;
  };
  qualification: {
    enabled: boolean;
    websiteAnalysis: boolean;
    aiCriteria: string[];
  };
  calling: {
    enabled: boolean;
    dailyLimit: number;
    voiceId: string;
  };
  taskAssignment: {
    enabled: boolean;
    autoAssignDesigner: boolean;
    designerPool: string[];
  };
  emailAutomation: {
    enabled: boolean;
    sendAfterDemo: boolean;
    followUpDays: number;
  };
}

export interface AutopilotTask {
  id: string;
  type: 'find_leads' | 'qualify_leads' | 'analyze_website' | 'make_calls' | 'assign_designer' | 'send_emails';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  result?: any;
  assignedTo?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface AutopilotStatus {
  status: 'active' | 'inactive' | 'paused';
  currentStep?: number;
  totalSteps?: number;
  progress?: number;
  stats?: {
    leadsFound: number;
    callsMade: number;
    meetingsBooked: number;
    demosAssigned: number;
    emailsSent: number;
    revenue: number;
  };
}

class AutopilotAPI {
  private async fetchAPI(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get autopilot system information
  async getInfo() {
    return this.fetchAPI('/autopilot/info');
  }

  // Get autopilot status
  async getStatus(): Promise<AutopilotStatus> {
    const response = await this.fetchAPI('/autopilot/status');
    return response.data || response;
  }

  // Get autopilot configuration
  async getConfig(): Promise<AutopilotConfig | null> {
    try {
      const response = await this.fetchAPI('/autopilot/config');
      return response.data || null;
    } catch (error) {
      console.warn('No autopilot config found, using defaults:', error);
      return null;
    }
  }

  // Save autopilot configuration
  async saveConfig(config: AutopilotConfig): Promise<boolean> {
    try {
      await this.fetchAPI('/autopilot/config', {
        method: 'POST',
        body: JSON.stringify(config),
      });
      return true;
    } catch (error) {
      console.error('Failed to save autopilot config:', error);
      return false;
    }
  }

  // Start autopilot
  async start(): Promise<boolean> {
    try {
      const response = await this.fetchAPI('/autopilot/start', {
        method: 'POST',
      });
      return response.success || false;
    } catch (error) {
      console.error('Failed to start autopilot:', error);
      return false;
    }
  }

  // Stop autopilot
  async stop(): Promise<boolean> {
    try {
      const response = await this.fetchAPI('/autopilot/stop', {
        method: 'POST',
      });
      return response.success || false;
    } catch (error) {
      console.error('Failed to stop autopilot:', error);
      return false;
    }
  }

  // Get autopilot tasks
  async getTasks(limit = 50): Promise<AutopilotTask[]> {
    try {
      const response = await this.fetchAPI(`/autopilot/tasks?limit=${limit}`);
      return response.data?.tasks || [];
    } catch (error) {
      console.error('Failed to get autopilot tasks:', error);
      return [];
    }
  }

  // Test API connectivity
  async testConnection(): Promise<boolean> {
    try {
      await this.fetchAPI('/autopilot/status');
      return true;
    } catch (error) {
      console.error('Autopilot API connection test failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const autopilotAPI = new AutopilotAPI();

// Default configuration
export const DEFAULT_AUTOPILOT_CONFIG: AutopilotConfig = {
  enabled: false,
  industry: 'web_design',
  leadFinding: {
    enabled: true,
    searchQuery: 'restaurants in Miami',
    targetCount: 100,
  },
  qualification: {
    enabled: true,
    websiteAnalysis: true,
    aiCriteria: ['No Website', 'Outdated Design', 'Poor SEO'],
  },
  calling: {
    enabled: true,
    dailyLimit: 200,
    voiceId: 'professional_female',
  },
  taskAssignment: {
    enabled: true,
    autoAssignDesigner: true,
    designerPool: ['John Designer', 'Sarah Creative', 'Mike Graphics'],
  },
  emailAutomation: {
    enabled: true,
    sendAfterDemo: true,
    followUpDays: 3,
  },
};