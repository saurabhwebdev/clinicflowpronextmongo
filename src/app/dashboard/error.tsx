'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-red-600">Something Went Wrong</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center">
            <div className="mb-8 text-center">
              <div className="flex justify-center mb-6">
                <AlertTriangle className="h-24 w-24 text-red-200" />
              </div>
              <h2 className="text-xl font-medium text-gray-700 mb-4">
                We encountered an unexpected error
              </h2>
              <p className="text-gray-500 max-w-md mx-auto mb-2">
                We apologize for the inconvenience. Please try again or return to the dashboard.
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Error: {error.message || 'Unknown error'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={reset} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              
              <Button asChild className="gap-2">
                <Link href="/dashboard">
                  <Home className="h-4 w-4" />
                  Dashboard Home
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}