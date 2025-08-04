'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { data: session } = useSession();
  
  return (
    <div className="w-full px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Create and manage user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Create new users, manage roles, and control access.</p>
            <Link href="/admin/users">
              <Button>Manage Users</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>Create and manage user roles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Define roles and assign permissions to control access.</p>
            <Link href="/admin/roles">
              <Button>Manage Roles</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Permission Management</CardTitle>
            <CardDescription>Manage route permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Scan routes and manage access permissions automatically.</p>
            <Link href="/admin/permissions">
              <Button>Manage Permissions</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>RBAC Setup</CardTitle>
            <CardDescription>Initialize the RBAC system</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Seed the system with default roles and permissions.</p>
            <Link href="/admin/seed-rbac">
              <Button variant="outline">Setup RBAC</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Role</CardTitle>
            <CardDescription>Your current permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You are logged in as: <strong>{session?.user.role}</strong></p>
            <p>
              {session?.user.role === 'master_admin' 
                ? 'You have full administrative access to all features.'
                : 'You have limited administrative access.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}