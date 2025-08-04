"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ModernHamburgerProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface HamburgerIconProps {
  isOpen: boolean;
  className?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Simple arrow-based toggle that's always visible
export function SimpleHamburger({ 
  isOpen, 
  onClick, 
  className,
  color = '#3b82f6',
  size = 'md'
}: ModernHamburgerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center rounded-lg transition-all duration-200 ease-in-out",
        "hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
        "border border-gray-200 hover:border-gray-300",
        sizeClasses[size],
        className
      )}
      style={{ 
        '--ring-color': color + '40'
      } as React.CSSProperties}
      aria-label="Toggle sidebar"
      aria-expanded={isOpen}
    >
      {isOpen ? (
        <ChevronLeft 
          className={cn(iconSizes[size], "transition-transform duration-200")}
          style={{ color: color }}
        />
      ) : (
        <ChevronRight 
          className={cn(iconSizes[size], "transition-transform duration-200")}
          style={{ color: color }}
        />
      )}
    </button>
  );
}

// Icon-only version for use inside buttons
export function HamburgerIcon({ 
  isOpen, 
  className,
  color = '#3b82f6',
  size = 'md'
}: HamburgerIconProps) {
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {isOpen ? (
        <ChevronLeft 
          className={cn(iconSizes[size], "transition-transform duration-200")}
          style={{ color: color }}
        />
      ) : (
        <ChevronRight 
          className={cn(iconSizes[size], "transition-transform duration-200")}
          style={{ color: color }}
        />
      )}
    </div>
  );
}

// Alternative hamburger-style toggle for those who prefer it
export function HamburgerToggle({ 
  isOpen, 
  onClick, 
  className,
  color = '#3b82f6',
  size = 'md'
}: ModernHamburgerProps) {
  const sizeClasses = {
    sm: 'w-6 h-5',
    md: 'w-7 h-6',
    lg: 'w-8 h-7'
  };

  const lineClasses = {
    sm: 'h-0.5',
    md: 'h-0.5',
    lg: 'h-0.5'
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col justify-center items-center cursor-pointer transition-all duration-300 ease-in-out",
        "hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg p-1",
        "border border-gray-200 hover:border-gray-300 hover:bg-gray-50",
        sizeClasses[size],
        className
      )}
      aria-label="Toggle menu"
      aria-expanded={isOpen}
    >
      {/* Top line */}
      <span
        className={cn(
          "absolute transition-all duration-300 ease-in-out transform origin-center",
          lineClasses[size],
          "rounded-full",
          isOpen 
            ? "rotate-45 translate-y-0" 
            : "-translate-y-2"
        )}
        style={{ backgroundColor: color }}
      />
      
      {/* Middle line */}
      <span
        className={cn(
          "absolute transition-all duration-300 ease-in-out transform origin-center",
          lineClasses[size],
          "rounded-full",
          isOpen 
            ? "scale-x-0 opacity-0" 
            : "scale-x-100 opacity-100"
        )}
        style={{ backgroundColor: color }}
      />
      
      {/* Bottom line */}
      <span
        className={cn(
          "absolute transition-all duration-300 ease-in-out transform origin-center",
          lineClasses[size],
          "rounded-full",
          isOpen 
            ? "-rotate-45 translate-y-0" 
            : "translate-y-2"
        )}
        style={{ backgroundColor: color }}
      />
    </button>
  );
}

// Legacy function for backward compatibility
export function ModernHamburger({ 
  isOpen, 
  onClick, 
  className,
  color = '#3b82f6',
  size = 'md'
}: ModernHamburgerProps) {
  return SimpleHamburger({ isOpen, onClick, className, color, size });
}

// Enhanced version with micro-interactions (keeping for reference)
export function EnhancedHamburger({ 
  isOpen, 
  onClick, 
  className,
  color = '#3b82f6',
  size = 'md'
}: ModernHamburgerProps) {
  return SimpleHamburger({ isOpen, onClick, className, color, size });
} 