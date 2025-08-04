'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Permission {
  _id: string;
  route: string;
  method: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [scanning, setScanning] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  // Check if user is authorized to view this page
  useEffect(() => {
    if (session && session.user.role !== 'master_admin') {
      router.push('/dashboard');
    }
  }, [session, router]);

  // Fetch permissions
  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter);

      const response = await fetch(`/api/admin/permissions?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch permissions: ${response.status}`);
      }
      
      const data = await response.json();
      setPermissions(data.permissions);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(`Error fetching permissions: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchPermissions();
    }
  }, [categoryFilter, session]);

  const handleScanRoutes = async () => {
    setScanning(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Routes scanned successfully! Created: ${data.created}, Updated: ${data.updated}`);
        fetchPermissions(); // Refresh permissions list
      } else {
        setError(data.error || 'Failed to scan routes');
      }
    } catch (err) {
      setError('An error occurred while scanning routes.');
    } finally {
      setScanning(false);
    }
  };

  const handleTogglePermission = async (permissionId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/permissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissionId, isActive }),
      });

      if (response.ok) {
        setPermissions(prev => 
          prev.map(p => 
            p._id === permissionId ? { ...p, isActive } : p
          )
        );
      } else {
        setError('Failed to update permission');
      }
    } catch (err) {
      setError('An error occurred while updating permission.');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      dashboard: 'bg-blue-100 text-blue-800',
      patients: 'bg-green-100 text-green-800',
      appointments: 'bg-purple-100 text-purple-800',
      billing: 'bg-yellow-100 text-yellow-800',
      inventory: 'bg-orange-100 text-orange-800',
      prescriptions: 'bg-pink-100 text-pink-800',
      ehr: 'bg-indigo-100 text-indigo-800',
      email: 'bg-cyan-100 text-cyan-800',
      api: 'bg-gray-100 text-gray-800',
      settings: 'bg-teal-100 text-teal-800',
      profile: 'bg-emerald-100 text-emerald-800',
      reports: 'bg-violet-100 text-violet-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-green-100 text-green-800',
      POST: 'bg-blue-100 text-blue-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      PATCH: 'bg-purple-100 text-purple-800',
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="w-full px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Permission Management</h1>
        <Button 
          onClick={handleScanRoutes} 
          disabled={scanning}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {scanning ? 'Scanning...' : 'Scan Routes'}
        </Button>
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
          <CardTitle>Permissions</CardTitle>
          <CardDescription>Manage route permissions and access control</CardDescription>
          <div className="flex items-center gap-4">
            <Label htmlFor="categoryFilter">Filter by category:</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="patients">Patients</SelectItem>
                <SelectItem value="appointments">Appointments</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="prescriptions">Prescriptions</SelectItem>
                <SelectItem value="ehr">EHR</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
                <SelectItem value="profile">Profile</SelectItem>
                <SelectItem value="reports">Reports</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading permissions...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.length > 0 ? (
                  permissions.map((permission) => (
                    <TableRow key={permission._id}>
                      <TableCell className="font-medium">{permission.name}</TableCell>
                      <TableCell className="font-mono text-sm">{permission.route}</TableCell>
                      <TableCell>
                        <Badge className={getMethodColor(permission.method)}>
                          {permission.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(permission.category)}>
                          {permission.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={permission.isActive ? "default" : "secondary"}>
                          {permission.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={permission.isActive}
                            onCheckedChange={(checked) => handleTogglePermission(permission._id, checked)}
                          />
                          <Label className="text-sm">
                            {permission.isActive ? 'Enabled' : 'Disabled'}
                          </Label>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No permissions found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 