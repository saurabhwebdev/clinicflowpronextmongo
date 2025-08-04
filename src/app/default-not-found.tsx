'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Search, AlertTriangle } from 'lucide-react';
import Lottie from 'lottie-react';
import { useClinicSettings } from '@/hooks/use-clinic-settings';

export default function DefaultNotFound() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const { settings, loading } = useClinicSettings();
  
  // Load animation data
  useEffect(() => {
    fetch('/animation/Error 404.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error));
  }, []);
  
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

  // Default colors if settings are not loaded yet
  const primaryColor = settings?.primaryColor || '#3b82f6';
  const secondaryColor = settings?.secondaryColor || '#1e40af';
  const accentColor = settings?.accentColor || '#10b981';
  const backgroundColor = settings?.backgroundColor || '#ffffff';
  const textColor = settings?.textColor || '#1f2937';

  return (
    <div className="min-h-screen flex items-center justify-center p-6" 
         style={{ backgroundColor: backgroundColor }}>
      <div className="w-full max-w-4xl">
        <div 
          id="not-found-container"
          className="bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-700 ease-out opacity-0 transform translate-y-8"
          style={{ backgroundColor: backgroundColor }}
        >
          <div className="flex flex-col lg:flex-row items-center">
            {/* Left Side - Animation */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col items-center justify-center">
              <div className="relative">
                {/* Background decorative elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-80 h-80 rounded-full opacity-5"
                       style={{ backgroundColor: primaryColor }}></div>
                </div>
                
                {/* Animation Container */}
                <div className="relative w-64 h-64">
                  {animationData ? (
                    <Lottie 
                      animationData={animationData} 
                      loop={true}
                      autoplay={true}
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <AlertTriangle className="w-24 h-24 mx-auto mb-4" 
                                     style={{ color: primaryColor }} />
                        <div className="text-5xl font-black" 
                             style={{ color: primaryColor }}>404</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
              <div className="text-center lg:text-left">
                {/* Error Code */}
                <div className="mb-6">
                  <div className="text-7xl font-black mb-2 tracking-tighter"
                       style={{ color: primaryColor }}>404</div>
                  <div className="text-sm font-medium uppercase tracking-widest"
                       style={{ color: secondaryColor }}>Page Not Found</div>
                </div>

                {/* Main Message */}
                <div className="mb-8">
                  <h1 className="text-2xl lg:text-3xl font-bold mb-4"
                      style={{ color: textColor }}>
                    Oops! We're lost in space
                  </h1>
                  <p className="text-base text-gray-600 mb-6 leading-relaxed">
                    The page you're looking for seems to have floated away into the digital cosmos. 
                    Don't worry, we'll help you navigate back to familiar territory.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Button 
                    variant="outline" 
                    className="gap-2 group transition-all duration-300 hover:scale-105"
                    onClick={() => window.history.back()}
                    style={{ 
                      borderColor: primaryColor,
                      color: primaryColor
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Go Back
                  </Button>
                  
                  {isAuthenticated ? (
                    <Button 
                      asChild 
                      className="gap-2 group transition-all duration-300 hover:scale-105 shadow-lg"
                      style={{ 
                        backgroundColor: primaryColor,
                        borderColor: primaryColor
                      }}
                    >
                      <Link href="/dashboard">
                        <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        Dashboard
                      </Link>
                    </Button>
                  ) : (
                    <Button 
                      asChild 
                      className="gap-2 group transition-all duration-300 hover:scale-105 shadow-lg"
                      style={{ 
                        backgroundColor: primaryColor,
                        borderColor: primaryColor
                      }}
                    >
                      <Link href="/">
                        <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        Home
                      </Link>
                    </Button>
                  )}
                </div>

                {/* Additional Help */}
                <div className="mt-6 p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3 mb-2">
                    <Search className="h-4 w-4" style={{ color: accentColor }} />
                    <span className="font-medium text-sm" style={{ color: textColor }}>
                      Need help finding something?
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Try using the search function or check our navigation menu to find what you're looking for.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {settings?.clinicName || 'ClinicFlow Pro'}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}