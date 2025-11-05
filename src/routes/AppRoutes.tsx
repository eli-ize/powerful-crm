import { 
  Routes, 
  Route, 
  Navigate
} from 'react-router-dom';
import { Dashboard } from '../components/crm/Dashboard';
import Contacts from '../components/crm/Contacts';
import { Deals } from '../components/crm/Deals';
import { Activities } from '../components/crm/Activities';
import { Email } from '../components/crm/Email';
import { Analytics } from '../components/crm/Analytics';
import { Automation } from '../components/crm/Automation';
import { Templates } from '../components/crm/Templates';
import { Goals } from '../components/crm/Goals';
import { LeadFinder } from '../components/crm/LeadFinder';
import { LeadQualification } from '../components/crm/LeadQualification';
import { Campaigns } from '../components/crm/Campaigns';
import { VirtualAgents } from '../components/crm/VirtualAgents';
import { UserManagement } from '../components/crm/UserManagement';
import { IndustryTemplates } from '../components/crm/IndustryTemplates';
import { WebsiteAnalyzer } from '../components/crm/WebsiteAnalyzer';
import { AutopilotMode } from '../components/crm/AutopilotMode';
import { TaskManagement } from '../components/crm/TaskManagement';
import { ApiSetup } from '../components/crm/ApiSetup';
import { Phone } from '../components/crm/Phone';
import { PhoneSystemManager } from '../components/crm/PhoneSystemManager';
import { AzureAudioTester } from '../components/crm/AzureAudioTester';
import { VoiceCallSimulator } from '../components/crm/VoiceCallSimulator';
import { PhoneCall } from '../components/crm/PhoneCall';

export function AppRoutes() {
  return (
    <Routes>
      {/* Main Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/deals" element={<Deals />} />
      <Route path="/activities" element={<Activities />} />
      <Route path="/email" element={<Email />} />
      <Route path="/phone" element={<Phone />} />
      
      {/* Lead Generation */}
      <Route path="/leadfinder" element={<LeadFinder />} />
      <Route path="/qualification" element={<LeadQualification />} />
      <Route path="/industry-templates" element={<IndustryTemplates />} />
      <Route path="/website-analyzer" element={<WebsiteAnalyzer />} />
      
      {/* AI & Automation */}
      <Route path="/autopilot" element={<AutopilotMode />} />
      <Route path="/task-management" element={<TaskManagement />} />
      <Route path="/campaigns" element={<Campaigns />} />
      <Route path="/virtual-agents" element={<VirtualAgents />} />
      
      {/* Advanced */}
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/automation" element={<Automation />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/goals" element={<Goals />} />
      
      {/* Settings */}
      <Route path="/user-management" element={<UserManagement />} />
                <Route path="/phone-system" element={<PhoneSystemManager />} />
          <Route path="/telnyx-manager" element={<Navigate to="/phone-system" replace />} /> {/* Legacy redirect */}
      <Route path="/api-setup" element={<ApiSetup />} />
      <Route path="/azure-audio-tester" element={<AzureAudioTester />} />
      <Route path="/azure-speech-testing" element={<AzureAudioTester />} />
      <Route path="/voice-call-simulator" element={<VoiceCallSimulator />} />
      <Route path="/phone-call" element={<PhoneCall />} />
      
      {/* Demo Pages */}
      
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
