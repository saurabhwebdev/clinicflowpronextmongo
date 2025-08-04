'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, FileSearch } from 'lucide-react';

export default function DefaultNotFound() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check if user is authenticated
  useEffect(() => {
    // Simple check for authentication - you might want to improve this
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const session = await res.json();
        setIsAuthenticated(!!session?.user);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  // Add some subtle animation when the page loads
  useEffect(() => {
    const element = document.getElementById('not-found-container');
    if (element) {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div 
        id="not-found-container"
        className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center transition-all duration-500 ease-out opacity-0 transform translate-y-4"
      >
        <div className="mb-6">
          <div className="flex justify-center mb-6">
            <FileSearch className="h-24 w-24 text-gray-300" />
          </div>
          <div className="text-6xl font-extrabold text-gray-900 tracking-tight mb-2">404</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Page not found</h1>
          <p className="text-gray-600 mb-6">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" className="gap-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          
          {isAuthenticated ? (
            <Button asChild className="gap-2">
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          ) : (
            <Button asChild className="gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} ClinicFlow Pro. All rights reserved.
      </div>
    </div>
  );
}