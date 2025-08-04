'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, FileSearch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardNotFound() {
  // Add some subtle animation when the page loads
  useEffect(() => {
    const element = document.getElementById('dashboard-not-found-container');
    if (element) {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }
  }, []);

  return (
    <div className="p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">404 - Page Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            id="dashboard-not-found-container"
            className="flex flex-col items-center justify-center transition-all duration-500 ease-out opacity-0 transform translate-y-4"
          >
            <div className="mb-8 text-center">
              <div className="flex justify-center mb-6">
                <FileSearch className="h-32 w-32 text-gray-300" />
              </div>
              <h2 className="text-xl font-medium text-gray-700 mb-4">
                We couldn't find the page you're looking for
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                The page you requested could not be found. It might have been moved, deleted, or never existed.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" className="gap-2" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4" />
                Go Back
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