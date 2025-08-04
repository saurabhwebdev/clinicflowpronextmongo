'use client';

import { usePathname } from 'next/navigation';
import DashboardNotFound from './dashboard/not-found';
import DefaultNotFound from './default-not-found';

export default function NotFoundHandler() {
  const pathname = usePathname();
  
  // If the path starts with /dashboard, use the dashboard not-found page
  if (pathname.startsWith('/dashboard')) {
    return <DashboardNotFound />;
  }
  
  // Otherwise, use the default not-found page
  return <DefaultNotFound />;
}