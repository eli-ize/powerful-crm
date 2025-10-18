import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone as PhoneIcon,
  Calendar,
  Search,
  MoreVertical,
  UserPlus,
  Lock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuth, UserRole, getRoleDisplayName, getRoleColor, User } from '../auth/AuthContext';

export function UserManagement() {
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Admin',
      email: 'admin@crm.com',
      role: 'super_admin',
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
    {
      id: '4',
      name: 'Emily Chen',
      email: 'emily@crm.com',
      role: 'sales_rep',
      company: 'CRM Corp',
      phone: '+1 (555) 456-7890',
      permissions: {
        canManageUsers: false,
        canConfigureCampaigns: false,
        canManageVirtualAgents: false,
        canViewAllLeads: false,
        canExportData: false,
        canMakeCalls: true,
        canManageSettings: false,
      },
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      lastLogin: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      id: '5',
      name: 'David Kumar',
      email: 'david@crm.com',
      role: 'admin',
      company: 'CRM Corp',
      phone: '+1 (555) 567-8901',
      permissions: {
        canManageUsers: true,
        canConfigureCampaigns: true,
        canManageVirtualAgents: true,
        canViewAllLeads: true,
        canExportData: true,
        canMakeCalls: true,
        canManageSettings: true,
      },
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'sales_rep' as UserRole,
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Please fill in required fields');
      return;
    }

    const permissions = {
      canManageUsers: newUser.role === 'super_admin' || newUser.role === 'admin',
      canConfigureCampaigns: newUser.role !== 'viewer' && newUser.role !== 'sales_rep',
      canManageVirtualAgents: newUser.role !== 'viewer' && newUser.role !== 'sales_rep',
      canViewAllLeads: newUser.role !== 'sales_rep',
      canExportData: newUser.role !== 'viewer',
      canMakeCalls: newUser.role !== 'viewer',
      canManageSettings: newUser.role === 'super_admin' || newUser.role === 'admin',
    };

    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      company: 'CRM Corp',
      phone: newUser.phone,
      permissions,
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    setUsers([...users, user]);
    toast.success(`User ${user.name} added successfully!`);
    setShowAddDialog(false);
    setNewUser({ name: '', email: '', phone: '', role: 'sales_rep' });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleUpdateRole = (userId: string, newRole: UserRole) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        const permissions = {
          canManageUsers: newRole === 'super_admin' || newRole === 'admin',
          canConfigureCampaigns: newRole !== 'viewer' && newRole !== 'sales_rep',
          canManageVirtualAgents: newRole !== 'viewer' && newRole !== 'sales_rep',
          canViewAllLeads: newRole !== 'sales_rep',
          canExportData: newRole !== 'viewer',
          canMakeCalls: newRole !== 'viewer',
          canManageSettings: newRole === 'super_admin' || newRole === 'admin',
        };
        return { ...u, role: newRole, permissions };
      }
      return u;
    }));
    toast.success('User role updated');
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setUsers(users.filter(u => u.id !== userId));
    toast.success(`User ${user?.name} removed`);
  };

  const handleResetPassword = (user: User) => {
    toast.success(`Password reset email sent to ${user.email}`, {
      description: 'Demo: This would send a real email in production',
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (date: Date) => {
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'super_admin' || u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length,
    salesReps: users.filter(u => u.role === 'sales_rep').length,
  };

  return (
    <div className="page-container">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mb-1 text-gray-900">User Management</h2>
            <p className="text-gray-500">Manage team members, roles, and permissions</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-3xl text-blue-600 mt-1">{stats.admins}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Managers</p>
                <p className="text-3xl text-green-600 mt-1">{stats.managers}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sales Reps</p>
                <p className="text-3xl text-orange-600 mt-1">{stats.salesReps}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="sales_rep">Sales Rep</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm text-gray-600">User</th>
                  <th className="text-left p-4 text-sm text-gray-600">Role</th>
                  <th className="text-left p-4 text-sm text-gray-600">Contact</th>
                  <th className="text-left p-4 text-sm text-gray-600">Last Active</th>
                  <th className="text-left p-4 text-sm text-gray-600">Permissions</th>
                  <th className="text-right p-4 text-sm text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getRoleColor(user.role)} border`}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <PhoneIcon className="h-3 w-3" />
                            {user.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className={`status-dot ${formatDate(user.lastLogin).includes('m') ? 'online' : 'offline'}`}></div>
                        {formatDate(user.lastLogin)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.canManageUsers && (
                          <Badge variant="outline" className="text-xs">Users</Badge>
                        )}
                        {user.permissions.canConfigureCampaigns && (
                          <Badge variant="outline" className="text-xs">Campaigns</Badge>
                        )}
                        {user.permissions.canMakeCalls && (
                          <Badge variant="outline" className="text-xs">Calls</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                              <Lock className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.id !== currentUser?.id && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account and assign permissions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label>Email Address *</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="john@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label>Role *</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="sales_rep">Sales Rep</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
                Add User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user role and permissions
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {getInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={selectedUser.role}
                  onValueChange={(value) => handleUpdateRole(selectedUser.id, value as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="sales_rep">Sales Rep</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">Permissions</p>
                {Object.entries(selectedUser.permissions).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    {value ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
