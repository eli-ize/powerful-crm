import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'sales_rep' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  company?: string;
  phone?: string;
  
  permissions: {
    canManageUsers: boolean;
    canConfigureCampaigns: boolean;
    canManageVirtualAgents: boolean;
    canViewAllLeads: boolean;
    canExportData: boolean;
    canMakeCalls: boolean;
    canManageSettings: boolean;
  };
  
  createdAt: Date;
  lastLogin: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, company: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing
const DEMO_USERS: User[] = [
  {
    id: '1',
    name: 'John Admin',
    email: 'admin@crm.com',
    role: 'super_admin',
    avatar: '',
    company: 'CRM Corp',
    phone: '+1 (555) 123-4567',
    permissions: {
      canManageUsers: true,
      canConfigureCampaigns: true,
      canManageVirtualAgents: true,
      canViewAllLeads: true,
      canExportData: true,
      canMakeCalls: true,
      canManageSettings: true,
    },
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    lastLogin: new Date(),
  },
  {
    id: '2',
    name: 'Sarah Manager',
    email: 'manager@crm.com',
    role: 'manager',
    avatar: '',
    company: 'CRM Corp',
    phone: '+1 (555) 234-5678',
    permissions: {
      canManageUsers: false,
      canConfigureCampaigns: true,
      canManageVirtualAgents: true,
      canViewAllLeads: true,
      canExportData: true,
      canMakeCalls: true,
      canManageSettings: false,
    },
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    name: 'Mike Sales',
    email: 'sales@crm.com',
    role: 'sales_rep',
    avatar: '',
    company: 'CRM Corp',
    phone: '+1 (555) 345-6789',
    permissions: {
      canManageUsers: false,
      canConfigureCampaigns: false,
      canManageVirtualAgents: false,
      canViewAllLeads: false,
      canExportData: false,
      canMakeCalls: true,
      canManageSettings: false,
    },
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('crm_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        // Failed to parse saved user data - clear it
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Demo login - in production this would be an API call
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

    const demoUser = DEMO_USERS.find(u => u.email === email);
    
    if (demoUser && password === 'demo123') {
      const updatedUser = { ...demoUser, lastLogin: new Date() };
      setUser(updatedUser);
      setIsAuthenticated(true);
      localStorage.setItem('crm_user', JSON.stringify(updatedUser));
      return true;
    }

    return false;
  };

  const register = async (name: string, email: string, password: string, company: string): Promise<boolean> => {
    // Demo registration - in production this would be an API call
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

    // Check if email already exists
    if (DEMO_USERS.some(u => u.email === email)) {
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role: 'admin', // New registrations become admins
      avatar: '',
      company,
      phone: '',
      permissions: {
        canManageUsers: true,
        canConfigureCampaigns: true,
        canManageVirtualAgents: true,
        canViewAllLeads: true,
        canExportData: true,
        canMakeCalls: true,
        canManageSettings: true,
      },
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    DEMO_USERS.push(newUser);
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('crm_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('crm_user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('crm_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to check permissions
export function hasPermission(user: User | null, permission: keyof User['permissions']): boolean {
  return user?.permissions[permission] || false;
}

// Helper function to get role display name
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    manager: 'Manager',
    sales_rep: 'Sales Rep',
    viewer: 'Viewer',
  };
  return names[role];
}

// Helper function to get role color
export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    super_admin: 'bg-purple-100 text-purple-800 border-purple-300',
    admin: 'bg-blue-100 text-blue-800 border-blue-300',
    manager: 'bg-green-100 text-green-800 border-green-300',
    sales_rep: 'bg-orange-100 text-orange-800 border-orange-300',
    viewer: 'bg-gray-100 text-gray-800 border-gray-300',
  };
  return colors[role];
}
