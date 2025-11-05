import { useState, useEffect } from 'react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/crm/Sidebar';
import { MobileBottomNav } from './components/crm/MobileBottomNav';
import { AppRoutes } from './routes/AppRoutes';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Search, Bell, HelpCircle, LogOut, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';
import { Badge } from './components/ui/badge';
import { Toaster } from './components/ui/sonner';
import { CommandPalette } from './components/crm/CommandPalette';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';

function AppContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Get active view from URL pathname
  const activeView = location.pathname.slice(1) || 'dashboard';

  const handleNavigate = (view: string) => {
    navigate(`/${view}`);
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get page title from pathname
  const getPageTitle = () => {
    const path = location.pathname.slice(1);
    if (!path || path === 'dashboard') return 'Dashboard';
    
    // Convert path to readable title (e.g., "lead-finder" -> "Lead Finder")
    return path
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile, visible on tablet and up */}
      <div className="hidden md:block">
        <Sidebar activeView={activeView} onViewChange={handleNavigate} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Page Title - Shows current page */}
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900 hidden sm:block">
                {getPageTitle()}
              </h2>
              <Badge variant="outline" className="hidden lg:inline-flex">
                {location.pathname}
              </Badge>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 ml-4"
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
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <UserIcon className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                {user?.permissions.canManageUsers && (
                  <DropdownMenuItem onClick={() => navigate('/user-management')}>
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    User Management
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate('/api-setup')}>
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

        {/* Main Content - Routed */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-16 md:pb-0">
          <AppRoutes />
        </main>
      </div>

      {/* Mobile Bottom Navigation - visible only on mobile */}
      <MobileBottomNav activeView={activeView} onViewChange={handleNavigate} />

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
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
