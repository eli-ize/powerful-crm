import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Search, Calendar, Users, TrendingUp, Mail, Settings, Plus, FileText, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Command {
  id: string;
  label: string;
  icon: any;
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: string) => void;
}

export function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleNavigate = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    } else {
      navigate(`/${view}`);
    }
  };

  const commands: Command[] = [
    { id: '1', label: 'Go to Dashboard', icon: TrendingUp, category: 'Navigation', action: () => handleNavigate('dashboard') },
    { id: '2', label: 'Go to Contacts', icon: Users, category: 'Navigation', action: () => handleNavigate('contacts') },
    { id: '3', label: 'Go to Deals', icon: TrendingUp, category: 'Navigation', action: () => handleNavigate('deals') },
    { id: '4', label: 'Go to Activities', icon: Calendar, category: 'Navigation', action: () => handleNavigate('activities') },
    { id: '5', label: 'Go to Email', icon: Mail, category: 'Navigation', action: () => handleNavigate('email') },
    { id: '6', label: 'Go to Phone & SMS', icon: Phone, category: 'Navigation', action: () => handleNavigate('phone') },
    { id: '7', label: 'Go to Lead Finder', icon: Search, category: 'Navigation', action: () => handleNavigate('leadfinder') },
    { id: '8', label: 'Create New Contact', icon: Plus, category: 'Actions', action: () => {} },
    { id: '9', label: 'Create New Deal', icon: Plus, category: 'Actions', action: () => {} },
    { id: '10', label: 'Create New Task', icon: Plus, category: 'Actions', action: () => {} },
    { id: '11', label: 'Settings', icon: Settings, category: 'System', action: () => {} },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, onClose]);

  const handleCommandSelect = (command: Command) => {
    command.action();
    onClose();
    setSearch('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
          <DialogDescription>
            Search for commands and navigate quickly through the app
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center border-b px-4">
          <Search className="h-4 w-4 text-gray-400 mr-3" />
          <Input
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
            <span className="text-xs">ESC</span>
          </kbd>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              No results found
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="mb-4">
                <div className="px-2 py-1.5 text-xs font-medium text-gray-500">
                  {category}
                </div>
                {cmds.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => handleCommandSelect(cmd)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                    >
                      <Icon className="h-4 w-4 text-gray-500" />
                      <span>{cmd.label}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="border-t px-4 py-3 text-xs text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">↑</kbd>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">↓</kbd>
              <span className="ml-1">Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd>
              <span className="ml-1">Select</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘</kbd>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">K</kbd>
            <span className="ml-1">Toggle</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
