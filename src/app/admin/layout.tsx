'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, Home } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && !['master_admin', 'admin'].includes(session?.user?.role || '')) {
      router.push('/dashboard');
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (status === 'authenticated' && ['master_admin', 'admin'].includes(session?.user?.role || '')) {
    return (
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Admin sidebar */}
        <div className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
            <nav className="space-y-2">
              <Link href="/admin/users" className="flex">
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  User Management
                </Button>
              </Link>
              <Link href="/dashboard" className="flex">
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </nav>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-auto bg-background">
          {children}
        </div>
      </div>
    );
  }

  return null;
}