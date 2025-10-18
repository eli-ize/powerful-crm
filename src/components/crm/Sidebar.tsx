import { useState } from 'react';
import { LayoutDashboard, Users, TrendingUp, CheckSquare, Settings, Mail, BarChart3, Zap, FileText, Target, Search, Key, Phone, Tag, Megaphone, Bot, Shield, Sparkles, Globe, ListTodo, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { useAuth } from '../auth/AuthContext';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leadfinder', label: 'Lead Finder', icon: Search },
    { id: 'qualification', label: 'Qualification', icon: Tag },
    { id: 'industry-templates', label: 'Industry Templates', icon: Sparkles, badge: 'New' },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'deals', label: 'Deals', icon: TrendingUp },
    { id: 'activities', label: 'Activities', icon: CheckSquare },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'phone', label: 'Phone & SMS', icon: Phone },
  ];

  const aiItems = [
    { id: 'autopilot', label: 'Autopilot Mode', icon: Zap, badge: 'NEW' },
    { id: 'website-analyzer', label: 'Website Analyzer', icon: Globe, badge: 'AI' },
    { id: 'task-management', label: 'Task Management', icon: ListTodo },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone, badge: 'AI' },
    { id: 'virtual-agents', label: 'Virtual Agents', icon: Bot, badge: 'AI' },
  ];

  const advancedItems = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'goals', label: 'Goals & Quotas', icon: Target },
  ];

  const settingsItems = [
    ...(user?.permissions.canManageUsers ? [{ id: 'user-management', label: 'Users', icon: Shield }] : []),
    { id: 'telnyx-manager', label: 'Telnyx PBX', icon: Phone },
    { id: 'api-setup', label: 'API Setup', icon: Key },
  ];

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 relative`}>
      {/* Collapse Toggle - Arrow changes based on state */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-50 h-6 w-6 min-w-[24px] rounded-full border-2 border-gray-200 bg-white p-0 shadow-sm hover:shadow-md"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {/* Show < when open (to close), > when closed (to open) */}
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Logo */}
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        {isCollapsed ? (
          <div className="flex items-center justify-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">AI CRM</h1>
              <p className="text-xs text-gray-500">Sales Automation</p>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
        {/* Main Menu */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
              Main Menu
            </h3>
          )}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[42px] ${
                    activeView === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <Badge className="bg-blue-100 text-blue-700 border-0 text-xs px-2 py-0.5">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Automation */}
        <div>
          {!isCollapsed && (
            <>
              <Separator className="my-4" />
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                AI Automation
              </h3>
            </>
          )}
          <div className="space-y-1">
            {aiItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[42px] ${
                    activeView === item.id
                      ? 'bg-purple-50 text-purple-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <Badge className={`${item.badge === 'NEW' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'} border-0 text-xs px-2 py-0.5`}>
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced */}
        <div>
          {!isCollapsed && (
            <>
              <Separator className="my-4" />
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                Advanced
              </h3>
            </>
          )}
          <div className="space-y-1">
            {advancedItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[42px] ${
                    activeView === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings */}
        <div>
          {!isCollapsed && (
            <>
              <Separator className="my-4" />
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                Settings
              </h3>
            </>
          )}
          <div className="space-y-1">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[42px] ${
                    activeView === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {user?.name.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
              </span>
            </div>
            <button
              onClick={logout}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all flex items-center justify-center"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-white">
                  {user?.name.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize truncate">{user?.role.replace('_', ' ')}</p>
              </div>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="w-full min-h-[40px] font-medium"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
