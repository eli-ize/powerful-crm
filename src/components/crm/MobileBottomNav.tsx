import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, TrendingUp, CheckSquare, Mail, BarChart3, Zap, FileText, Target, Search, Key, Phone, Tag, Megaphone, Bot, Shield, Sparkles, Globe, ListTodo, MoreHorizontal, X, Edit3, Check } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useAuth } from '../auth/AuthContext';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

interface MobileBottomNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any; // Lucide icon component
  badge?: string;
  section: string;
}

interface DragItem {
  index: number;
  item: MenuItem;
  isBottomNav: boolean;
}

interface DraggableNavItemProps {
  item: MenuItem;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number, isBottomNav: boolean) => void;
  swapBetweenSections: (item: MenuItem, fromBottomNav: boolean, toIndex: number) => void;
  isEditing: boolean;
  isActive: boolean;
  onClick: () => void;
  isBottomNav: boolean;
}

const STORAGE_KEY = 'crm_mobile_nav_order';

function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

function DraggableNavItem({ item, index, moveItem, swapBetweenSections, isEditing, isActive, onClick, isBottomNav }: DraggableNavItemProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'NAV_ITEM',
    item: { index, item, isBottomNav } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isEditing,
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'NAV_ITEM',
    hover: (draggedItem: DragItem) => {
      if (draggedItem.isBottomNav === isBottomNav && draggedItem.index !== index) {
        moveItem(draggedItem.index, index, isBottomNav);
        draggedItem.index = index;
      }
    },
    drop: (draggedItem: DragItem) => {
      if (draggedItem.isBottomNav !== isBottomNav) {
        swapBetweenSections(draggedItem.item, draggedItem.isBottomNav, index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    canDrop: () => isEditing,
  });

  const Icon = item.icon;

  if (isBottomNav) {
    return (
      <div ref={(node) => drag(drop(node))} className={`flex-1 ${isDragging ? 'opacity-50' : ''} ${isOver && isEditing ? 'bg-blue-100 rounded-lg' : ''}`}>
        <button onClick={onClick} disabled={isEditing} className="flex flex-col items-center justify-center w-full h-full min-w-0 px-1 gap-1 relative">
          {isEditing && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white z-10">
              <span className="text-xs">−</span>
            </div>
          )}
          <div className="relative">
            <Icon className={`h-6 w-6 ${isActive && !isEditing ? 'text-blue-600' : 'text-gray-600'}`} />
            {isActive && !isEditing && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
            )}
          </div>
          <span className={`text-xs truncate w-full text-center ${isActive && !isEditing ? 'text-blue-600' : 'text-gray-600'}`}>
            {item.label}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div ref={(node) => drag(drop(node))} className={`${isDragging ? 'opacity-50' : ''} ${isOver && isEditing ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}>
      <button onClick={onClick} disabled={isEditing} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all min-h-[42px] ${isActive ? item.section === 'ai' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'} ${isEditing ? 'opacity-60' : ''}`}>
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 flex-shrink-0" />
          <span className="whitespace-nowrap">{item.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {item.badge && (
            <Badge className={`${item.badge === 'NEW' ? 'bg-green-100 text-green-700' : item.badge === 'AI' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'} border-0 text-xs px-2 py-0.5`}>
              {item.badge}
            </Badge>
          )}
          {isEditing && (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">
              <span className="text-xs">+</span>
            </div>
          )}
        </div>
      </button>
    </div>
  );
}

function MobileBottomNavContent({ activeView, onViewChange }: MobileBottomNavProps) {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const allMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'main' },
    { id: 'leadfinder', label: 'Lead Finder', icon: Search, section: 'main' },
    { id: 'qualification', label: 'Qualification', icon: Tag, section: 'main' },
    { id: 'industry-templates', label: 'Industry Templates', icon: Sparkles, badge: 'New', section: 'main' },
    { id: 'contacts', label: 'Contacts', icon: Users, section: 'main' },
    { id: 'deals', label: 'Deals', icon: TrendingUp, section: 'main' },
    { id: 'activities', label: 'Activities', icon: CheckSquare, section: 'main' },
    { id: 'email', label: 'Email', icon: Mail, section: 'main' },
    { id: 'phone', label: 'Phone & SMS', icon: Phone, section: 'main' },
    { id: 'autopilot', label: 'Autopilot Mode', icon: Zap, badge: 'NEW', section: 'ai' },
    { id: 'website-analyzer', label: 'Website Analyzer', icon: Globe, badge: 'AI', section: 'ai' },
    { id: 'task-management', label: 'Task Management', icon: ListTodo, section: 'ai' },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone, badge: 'AI', section: 'ai' },
    { id: 'virtual-agents', label: 'Virtual Agents', icon: Bot, badge: 'AI', section: 'ai' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, section: 'advanced' },
    { id: 'automation', label: 'Automation', icon: Zap, section: 'advanced' },
    { id: 'templates', label: 'Templates', icon: FileText, section: 'advanced' },
    { id: 'goals', label: 'Goals & Quotas', icon: Target, section: 'advanced' },
    ...(user?.permissions.canManageUsers ? [{ id: 'user-management', label: 'Users', icon: Shield, section: 'settings' as const }] : []),
    { id: 'api-setup', label: 'API Setup', icon: Key, section: 'settings' },
  ];

  const defaultBottomItems = ['dashboard', 'contacts', 'deals', 'activities'];
  
  const [bottomNavItems, setBottomNavItems] = useState<MenuItem[]>([]);
  const [moreMenuItems, setMoreMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { bottom, more } = JSON.parse(stored);
      const bottomItems = bottom.map((id: string) => allMenuItems.find(item => item.id === id)).filter(Boolean);
      const moreItems = more.map((id: string) => allMenuItems.find(item => item.id === id)).filter(Boolean);
      setBottomNavItems(bottomItems);
      setMoreMenuItems(moreItems);
    } else {
      const bottom = allMenuItems.filter(item => defaultBottomItems.includes(item.id));
      const more = allMenuItems.filter(item => !defaultBottomItems.includes(item.id));
      setBottomNavItems(bottom);
      setMoreMenuItems(more);
    }
  }, [user]);

  const saveOrder = (bottom: MenuItem[], more: MenuItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      bottom: bottom.map(item => item.id),
      more: more.map(item => item.id),
    }));
  };

  const moveItem = (fromIndex: number, toIndex: number, isBottomNav: boolean) => {
    if (isBottomNav) {
      const newItems = [...bottomNavItems];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      setBottomNavItems(newItems);
      saveOrder(newItems, moreMenuItems);
    } else {
      const newItems = [...moreMenuItems];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      setMoreMenuItems(newItems);
      saveOrder(bottomNavItems, newItems);
    }
  };

  const swapBetweenSections = (draggedItem: MenuItem, fromBottom: boolean, targetIndex: number) => {
    if (fromBottom) {
      if (bottomNavItems.length <= 1) return;
      const newBottom = bottomNavItems.filter(i => i.id !== draggedItem.id);
      const newMore = [...moreMenuItems];
      newMore.splice(targetIndex, 0, draggedItem);
      setBottomNavItems(newBottom);
      setMoreMenuItems(newMore);
      saveOrder(newBottom, newMore);
    } else {
      if (bottomNavItems.length >= 4) return;
      const newMore = moreMenuItems.filter(i => i.id !== draggedItem.id);
      const newBottom = [...bottomNavItems];
      newBottom.splice(targetIndex, 0, draggedItem);
      if (newBottom.length > 4) {
        const removed = newBottom.pop()!;
        newMore.unshift(removed);
      }
      setBottomNavItems(newBottom);
      setMoreMenuItems(newMore);
      saveOrder(newBottom, newMore);
    }
  };

  const moveToBottomNav = (item: MenuItem) => {
    if (bottomNavItems.length >= 4) return;
    const newMore = moreMenuItems.filter(i => i.id !== item.id);
    const newBottom = [...bottomNavItems, item];
    setMoreMenuItems(newMore);
    setBottomNavItems(newBottom);
    saveOrder(newBottom, newMore);
  };

  const moveToMoreMenu = (item: MenuItem) => {
    if (bottomNavItems.length <= 1) return;
    const newBottom = bottomNavItems.filter(i => i.id !== item.id);
    const newMore = [item, ...moreMenuItems];
    setBottomNavItems(newBottom);
    setMoreMenuItems(newMore);
    saveOrder(newBottom, newMore);
  };

  const handleNavClick = (itemId: string) => {
    if (isEditing) return;
    onViewChange(itemId);
    setIsMenuOpen(false);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const mainMenuItems = moreMenuItems.filter(item => item.section === 'main');
  const aiItems = moreMenuItems.filter(item => item.section === 'ai');
  const advancedItems = moreMenuItems.filter(item => item.section === 'advanced');
  const settingsItems = moreMenuItems.filter(item => item.section === 'settings');

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-pb">
        <nav className="flex items-center justify-around h-16 px-2">
          {bottomNavItems.map((item, index) => (
            <DraggableNavItem
              key={item.id}
              item={item}
              index={index}
              moveItem={moveItem}
              swapBetweenSections={swapBetweenSections}
              isEditing={isEditing}
              isActive={activeView === item.id}
              onClick={isEditing ? () => moveToMoreMenu(item) : () => handleNavClick(item.id)}
              isBottomNav={true}
            />
          ))}

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex flex-col items-center justify-center flex-1 h-full min-w-0 px-1 gap-1">
            <MoreHorizontal className={`h-6 w-6 ${isMenuOpen ? 'text-blue-600' : 'text-gray-600'}`} />
            <span className={`text-xs ${isMenuOpen ? 'text-blue-600' : 'text-gray-600'}`}>More</span>
          </button>
        </nav>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 md:hidden flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1>AI CRM</h1>
                  <p className="text-xs text-gray-500">Sales Automation</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant={isEditing ? 'default' : 'ghost'} size="icon" onClick={toggleEdit} className="h-10 w-10 rounded-full">
                  {isEditing ? <Check className="h-5 w-5" /> : <Edit3 className="h-5 w-5 text-gray-600" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)} className="h-10 w-10 rounded-full hover:bg-gray-100">
                  <X className="h-5 w-5 text-gray-600" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-20">
            <div className="p-4 space-y-6">
              {isEditing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Edit Mode:</strong> Drag any item to reorder or swap between bottom bar and More menu. Tap "−" to remove from bottom, "+" to add (max 4 items in bottom bar).
                  </p>
                </div>
              )}

              {mainMenuItems.length > 0 && (
                <div>
                  <h3 className="text-xs px-2 mb-3 text-gray-400 uppercase tracking-wider">Main Menu</h3>
                  <div className="space-y-1">
                    {mainMenuItems.map((item, index) => (
                      <DraggableNavItem
                        key={item.id}
                        item={item}
                        index={index}
                        moveItem={moveItem}
                        swapBetweenSections={swapBetweenSections}
                        isEditing={isEditing}
                        isActive={activeView === item.id}
                        onClick={isEditing ? () => moveToBottomNav(item) : () => handleNavClick(item.id)}
                        isBottomNav={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {aiItems.length > 0 && (
                <div>
                  <Separator className="my-4" />
                  <h3 className="text-xs px-2 mb-3 text-gray-400 uppercase tracking-wider">AI Automation</h3>
                  <div className="space-y-1">
                    {aiItems.map((item, index) => (
                      <DraggableNavItem
                        key={item.id}
                        item={item}
                        index={index}
                        moveItem={moveItem}
                        swapBetweenSections={swapBetweenSections}
                        isEditing={isEditing}
                        isActive={activeView === item.id}
                        onClick={isEditing ? () => moveToBottomNav(item) : () => handleNavClick(item.id)}
                        isBottomNav={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {advancedItems.length > 0 && (
                <div>
                  <Separator className="my-4" />
                  <h3 className="text-xs px-2 mb-3 text-gray-400 uppercase tracking-wider">Advanced</h3>
                  <div className="space-y-1">
                    {advancedItems.map((item, index) => (
                      <DraggableNavItem
                        key={item.id}
                        item={item}
                        index={index}
                        moveItem={moveItem}
                        swapBetweenSections={swapBetweenSections}
                        isEditing={isEditing}
                        isActive={activeView === item.id}
                        onClick={isEditing ? () => moveToBottomNav(item) : () => handleNavClick(item.id)}
                        isBottomNav={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {settingsItems.length > 0 && (
                <div>
                  <Separator className="my-4" />
                  <h3 className="text-xs px-2 mb-3 text-gray-400 uppercase tracking-wider">Settings</h3>
                  <div className="space-y-1 pb-6">
                    {settingsItems.map((item, index) => (
                      <DraggableNavItem
                        key={item.id}
                        item={item}
                        index={index}
                        moveItem={moveItem}
                        swapBetweenSections={swapBetweenSections}
                        isEditing={isEditing}
                        isActive={activeView === item.id}
                        onClick={isEditing ? () => moveToBottomNav(item) : () => handleNavClick(item.id)}
                        isBottomNav={false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function MobileBottomNav(props: MobileBottomNavProps) {
  const backend = isTouchDevice() ? TouchBackend : HTML5Backend;
  return (
    <DndProvider backend={backend}>
      <MobileBottomNavContent {...props} />
    </DndProvider>
  );
}
