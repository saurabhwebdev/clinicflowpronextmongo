'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface Permission {
  _id: string;
  name: string;
  description: string;
  category: string;
  route: string;
  method: string;
}

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  const [newRoleForm, setNewRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  // Check if user is authorized to view this page
  useEffect(() => {
    if (session && session.user.role !== 'master_admin') {
      router.push('/dashboard');
    }
  }, [session, router]);

  // Fetch roles and permissions
  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        fetch('/api/admin/roles?includePermissions=true'),
        fetch('/api/admin/permissions')
      ]);
      
      if (!rolesResponse.ok || !permissionsResponse.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const rolesData = await rolesResponse.json();
      const permissionsData = await permissionsResponse.json();
      
      setRoles(rolesData.roles);
      setPermissions(permissionsData.permissions);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Error fetching data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRoleForm),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Role created successfully.');
        setNewRoleForm({
          name: '',
          description: '',
          permissions: []
        });
        setIsCreateDialogOpen(false);
        fetchData(); // Refresh data
      } else {
        setError(data.error || 'Failed to create role');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleId: editingRole._id,
          name: newRoleForm.name,
          description: newRoleForm.description,
          permissions: newRoleForm.permissions
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Role updated successfully.');
        setIsEditDialogOpen(false);
        setEditingRole(null);
        setNewRoleForm({
          name: '',
          description: '',
          permissions: []
        });
        fetchData(); // Refresh data
      } else {
        setError(data.error || 'Failed to update role');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    try {
      const response = await fetch(`/api/admin/roles?roleId=${roleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Role deleted successfully.');
        fetchData(); // Refresh data
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete role');
      }
    } catch (err) {
      setError('An error occurred while deleting the role.');
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setNewRoleForm({
      name: role.name,
      description: role.description,
      permissions: role.permissions.map(p => p._id)
    });
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setNewRoleForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissionToggle = (permissionId: string) => {
    setNewRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const groupPermissionsByCategory = () => {
    const grouped: Record<string, Permission[]> = {};
    permissions.forEach(permission => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });
    return grouped;
  };

  return (
    <div className="w-full px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Role</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Create a new role and assign permissions to it.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={newRoleForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRoleForm.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="max-h-60 overflow-y-auto border rounded-md p-4">
                  {Object.entries(groupPermissionsByCategory()).map(([category, perms]) => (
                    <div key={category} className="mb-4">
                      <h4 className="font-medium mb-2 text-sm text-gray-700">{category.toUpperCase()}</h4>
                      <div className="space-y-2">
                        {perms.map((permission) => (
                          <div key={permission._id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission._id}
                              checked={newRoleForm.permissions.includes(permission._id)}
                              onCheckedChange={() => handlePermissionToggle(permission._id)}
                            />
                            <Label htmlFor={permission._id} className="text-sm">
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit">Create Role</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>Manage user roles and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading roles...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <TableRow key={role._id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {role.permissions.length} permissions
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={role.isActive ? "default" : "secondary"}>
                          {role.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={role.isSystem ? "destructive" : "outline"}>
                          {role.isSystem ? 'System' : 'Custom'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRole(role)}
                            disabled={role.isSystem}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRole(role._id)}
                            disabled={role.isSystem}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No roles found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role details and permissions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateRole} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Role Name</Label>
              <Input
                id="edit-name"
                value={newRoleForm.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={newRoleForm.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="max-h-60 overflow-y-auto border rounded-md p-4">
                {Object.entries(groupPermissionsByCategory()).map(([category, perms]) => (
                  <div key={category} className="mb-4">
                    <h4 className="font-medium mb-2 text-sm text-gray-700">{category.toUpperCase()}</h4>
                    <div className="space-y-2">
                      {perms.map((permission) => (
                        <div key={permission._id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-${permission._id}`}
                            checked={newRoleForm.permissions.includes(permission._id)}
                            onCheckedChange={() => handlePermissionToggle(permission._id)}
                          />
                          <Label htmlFor={`edit-${permission._id}`} className="text-sm">
                            {permission.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit">Update Role</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 