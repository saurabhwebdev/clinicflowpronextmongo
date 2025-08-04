import fs from 'fs';
import path from 'path';

export interface RouteInfo {
  path: string;
  methods: string[];
  filePath: string;
  category: string;
}

export interface RouteCategory {
  name: string;
  description: string;
  routes: RouteInfo[];
}

// Define route categories and their descriptions
const ROUTE_CATEGORIES: Record<string, string> = {
  'dashboard': 'Dashboard and main application pages',
  'admin': 'Administrative functions and user management',
  'auth': 'Authentication and authorization',
  'patients': 'Patient management and records',
  'appointments': 'Appointment scheduling and management',
  'billing': 'Billing and payment processing',
  'inventory': 'Inventory and stock management',
  'prescriptions': 'Prescription management',
  'ehr': 'Electronic Health Records',
  'email': 'Email and communication',
  'api': 'API endpoints',
  'settings': 'System and user settings',
  'profile': 'User profile management',
  'reports': 'Reports and analytics',
};

export function scanRoutes(baseDir: string = 'src/app'): RouteInfo[] {
  const routes: RouteInfo[] = [];
  
  function scanDirectory(dir: string, currentPath: string = '') {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules and other non-route directories
          if (item.startsWith('.') || item === 'node_modules' || item === 'components') {
            continue;
          }
          
          // Handle dynamic routes [id]
          const routePath = item.startsWith('[') && item.endsWith(']') 
            ? `:${item.slice(1, -1)}` 
            : item;
          
          const newPath = currentPath ? `${currentPath}/${routePath}` : `/${routePath}`;
          scanDirectory(fullPath, newPath);
        } else if (item === 'page.tsx' || item === 'route.ts') {
          // This is a route file
          const routePath = currentPath || '/';
          const category = getRouteCategory(routePath);
          
          // Determine HTTP methods based on file content
          const methods = getRouteMethods(fullPath);
          
          routes.push({
            path: routePath,
            methods,
            filePath: fullPath,
            category,
          });
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error);
    }
  }
  
  scanDirectory(baseDir);
  return routes;
}

function getRouteCategory(routePath: string): string {
  const segments = routePath.split('/').filter(Boolean);
  
  if (segments.length === 0) return 'dashboard';
  
  const firstSegment = segments[0];
  
  // Map route patterns to categories
  if (firstSegment === 'admin') return 'admin';
  if (firstSegment === 'auth') return 'auth';
  if (firstSegment === 'dashboard') {
    if (segments.includes('patients')) return 'patients';
    if (segments.includes('appointments')) return 'appointments';
    if (segments.includes('billing')) return 'billing';
    if (segments.includes('inventory')) return 'inventory';
    if (segments.includes('prescriptions')) return 'prescriptions';
    if (segments.includes('ehr')) return 'ehr';
    if (segments.includes('email')) return 'email';
    if (segments.includes('settings')) return 'settings';
    if (segments.includes('profile')) return 'profile';
    if (segments.includes('reports')) return 'reports';
    return 'dashboard';
  }
  if (firstSegment === 'api') return 'api';
  
  return 'dashboard';
}

function getRouteMethods(filePath: string): string[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const methods: string[] = [];
    
    // Check for exported HTTP method functions
    if (content.includes('export async function GET')) methods.push('GET');
    if (content.includes('export async function POST')) methods.push('POST');
    if (content.includes('export async function PUT')) methods.push('PUT');
    if (content.includes('export async function DELETE')) methods.push('DELETE');
    if (content.includes('export async function PATCH')) methods.push('PATCH');
    
    // If no specific methods found, assume GET for pages
    if (methods.length === 0 && filePath.includes('page.tsx')) {
      methods.push('GET');
    }
    
    return methods;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return ['GET'];
  }
}

export function groupRoutesByCategory(routes: RouteInfo[]): RouteCategory[] {
  const categories: Record<string, RouteInfo[]> = {};
  
  for (const route of routes) {
    if (!categories[route.category]) {
      categories[route.category] = [];
    }
    categories[route.category].push(route);
  }
  
  return Object.entries(categories).map(([name, routes]) => ({
    name,
    description: ROUTE_CATEGORIES[name] || 'Other routes',
    routes,
  }));
}

export function generatePermissionName(route: RouteInfo): string {
  const segments = route.path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  // Convert route path to readable name
  let name = segments.map(segment => {
    if (segment.startsWith(':')) {
      return segment.slice(1);
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }).join(' ');
  
  // Add method to name
  if (route.methods.length > 0) {
    name += ` (${route.methods.join(', ')})`;
  }
  
  return name;
}

export function generatePermissionDescription(route: RouteInfo): string {
  const segments = route.path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  let description = `Access to ${route.path}`;
  
  if (route.methods.length > 0) {
    description += ` with ${route.methods.join(', ')} methods`;
  }
  
  return description;
} 