import { useState, useEffect } from 'react';
import { Sidebar } from './components/crm/Sidebar';
import { MobileBottomNav } from './components/crm/MobileBottomNav';
import { Dashboard } from './components/crm/Dashboard';
import { Contacts } from './components/crm/Contacts';
import { Deals } from './components/crm/Deals';
import { Activities } from './components/crm/Activities';
import { Email } from './components/crm/Email';
import { Analytics } from './components/crm/Analytics';
import { Automation } from './components/crm/Automation';
import { Templates } from './components/crm/Templates';
import { Goals } from './components/crm/Goals';
import { LeadFinderEnhanced } from './components/crm/LeadFinderEnhanced';
import { LeadQualification } from './components/crm/LeadQualification';
import { Campaigns } from './components/crm/Campaigns';
import { VirtualAgents } from './components/crm/VirtualAgents';
import { UserManagement } from './components/crm/UserManagement';
import { IndustryTemplates } from './components/crm/IndustryTemplates';
import { WebsiteAnalyzer } from './components/crm/WebsiteAnalyzer';
import { AutopilotMode } from './components/crm/AutopilotMode';
import { TaskManagement } from './components/crm/TaskManagement';
import { CommandPalette } from './components/crm/CommandPalette';
import { ApiSetup } from './components/crm/ApiSetup';
import { ApiTester } from './components/crm/ApiTester';
import { Phone } from './components/crm/Phone';
import { TelnyxManager } from './components/crm/TelnyxManager';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Search, Bell, HelpCircle, LogOut, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';
import { Badge } from './components/ui/badge';
import { Toaster } from './components/ui/sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';

function AppContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const handleNavigate = (view: string) => {
    setActiveView(view);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        {authView === 'login' ? (
          <Login onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <Register onSwitchToLogin={() => setAuthView('login')} />
        )}
        <Toaster position="top-right" />
      </>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'contacts':
        return <Contacts />;
      case 'deals':
        return <Deals />;
      case 'activities':
        return <Activities />;
      case 'email':
        return <Email />;
      case 'analytics':
        return <Analytics />;
      case 'automation':
        return <Automation />;
      case 'templates':
        return <Templates />;
      case 'goals':
        return <Goals />;
      case 'leadfinder':
        return <LeadFinderEnhanced onNavigate={handleNavigate} />;
      case 'qualification':
        return <LeadQualification />;
      case 'industry-templates':
        return <IndustryTemplates />;
      case 'website-analyzer':
        return <WebsiteAnalyzer />;
      case 'autopilot':
        return <AutopilotMode />;
      case 'task-management':
        return <TaskManagement />;
      case 'campaigns':
        return <Campaigns />;
      case 'virtual-agents':
        return <VirtualAgents />;
      case 'user-management':
        return <UserManagement />;
      case 'phone':
        return <Phone onNavigate={handleNavigate} />;
      case 'telnyx-manager':
        return <TelnyxManager />;
      case 'api-setup':
        return <ApiSetup />;
      case 'api-tester':
        return <ApiTester />;
      default:
        return <Dashboard />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile, visible on tablet and up */}
      <div className="hidden md:block">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setIsCommandPaletteOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span className="text-sm text-gray-500 hidden sm:inline">Search...</span>
              <Badge variant="outline" className="ml-2 text-xs hidden md:inline-block">⌘K</Badge>
            </Button>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" size="sm" className="relative hidden sm:flex">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
            </Button>

            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <HelpCircle className="h-5 w-5" />
            </Button>

            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-2 transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                      {user && getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800 border-0 text-xs">
                    {user?.role.replace('_', ' ')}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveView('dashboard')}>
                  <UserIcon className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                {user?.permissions.canManageUsers && (
                  <DropdownMenuItem onClick={() => setActiveView('user-management')}>
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    User Management
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setActiveView('api-setup')}>
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-16 md:pb-0">
          {renderView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation - visible only on mobile */}
      <MobileBottomNav activeView={activeView} onViewChange={setActiveView} />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
      />

      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
