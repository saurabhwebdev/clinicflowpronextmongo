'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function SeedRBACPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [result, setResult] = useState<any>(null);
  const { data: session } = useSession();
  const router = useRouter();

  // Check if user is authorized to view this page
  if (session && session.user.role !== 'master_admin') {
    router.push('/dashboard');
    return null;
  }

  const handleSeedRBAC = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setResult(null);
    
    try {
      const response = await fetch('/api/admin/seed-rbac', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('RBAC system initialized successfully!');
        setResult(data);
      } else {
        setError(data.error || 'Failed to initialize RBAC system');
      }
    } catch (err) {
      setError('An error occurred while initializing the RBAC system.');
    } finally {
      setLoading(false);
    }
  };

  const handleMigratePatients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/seed-data', {
        method: 'POST',
      });
      const data = await response.json();
      toast.success(`Migration completed! Migrated: ${data.migrated}, Skipped: ${data.skipped}`);
      console.log("Migration result:", data);
    } catch (error) {
      toast.error("Failed to migrate patients");
      console.error("Migration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">RBAC System Setup</h1>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Initialize RBAC System</CardTitle>
            <CardDescription>
              This will scan all routes in your application and create a comprehensive role-based access control system.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">What this will do:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Scan all routes in your application</li>
                <li>Create permissions for each route and HTTP method</li>
                <li>Create default roles (master_admin, admin, doctor, patient)</li>
                <li>Assign appropriate permissions to each role</li>
                <li>Set up the foundation for fine-grained access control</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Default Roles:</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Master Admin</span>
                  <Badge variant="destructive">Full Access</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Admin</span>
                  <Badge variant="default">Most Access</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Doctor</span>
                  <Badge variant="secondary">Clinical Access</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Patient</span>
                  <Badge variant="outline">Limited Access</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleSeedRBAC} 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Initializing...' : 'Initialize RBAC System'}
              </Button>
              
              <Button 
                onClick={handleMigratePatients} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? 'Migrating...' : 'Migrate Patients to User Model'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Setup Results</CardTitle>
              <CardDescription>Summary of the RBAC initialization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Routes Scanned:</span>
                  <Badge variant="outline">{result.routes?.scanned || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Categories Found:</span>
                  <Badge variant="outline">{result.routes?.categories || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Permissions Created:</span>
                  <Badge variant="outline">{result.permissions?.created || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Permissions Updated:</span>
                  <Badge variant="outline">{result.permissions?.updated || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Permissions:</span>
                  <Badge variant="outline">{result.permissions?.total || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Roles Created:</span>
                  <Badge variant="outline">{result.roles?.created || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Roles Updated:</span>
                  <Badge variant="outline">{result.roles?.updated || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Roles:</span>
                  <Badge variant="outline">{result.roles?.total || 0}</Badge>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Next Steps:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Review and customize permissions in the Permission Management section</li>
                  <li>Create custom roles or modify existing ones in the Role Management section</li>
                  <li>Assign roles to users in the User Management section</li>
                  <li>Test access control by logging in with different user roles</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 