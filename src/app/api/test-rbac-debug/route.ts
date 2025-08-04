import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Role from '@/models/Role';
import Permission from '@/models/Permission';
import { scanRoutes, groupRoutesByCategory } from '@/lib/route-scanner';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const debugSteps = [];
    
    // Step 1: Test database connection
    try {
      await connectDB();
      debugSteps.push({ step: 'Database Connection', status: 'SUCCESS' });
    } catch (error) {
      debugSteps.push({ step: 'Database Connection', status: 'FAILED', error: error.message });
      return NextResponse.json({ debugSteps }, { status: 500 });
    }

    // Step 2: Test route scanning
    try {
      const routes = scanRoutes();
      debugSteps.push({ 
        step: 'Route Scanning', 
        status: 'SUCCESS', 
        routesFound: routes.length 
      });
    } catch (error) {
      debugSteps.push({ step: 'Route Scanning', status: 'FAILED', error: error.message });
      return NextResponse.json({ debugSteps }, { status: 500 });
    }

    // Step 3: Test route categorization
    try {
      const routes = scanRoutes();
      const categories = groupRoutesByCategory(routes);
      debugSteps.push({ 
        step: 'Route Categorization', 
        status: 'SUCCESS', 
        categoriesFound: categories.length 
      });
    } catch (error) {
      debugSteps.push({ step: 'Route Categorization', status: 'FAILED', error: error.message });
      return NextResponse.json({ debugSteps }, { status: 500 });
    }

    // Step 4: Test permission model
    try {
      const permissionCount = await Permission.countDocuments();
      debugSteps.push({ 
        step: 'Permission Model', 
        status: 'SUCCESS', 
        existingPermissions: permissionCount 
      });
    } catch (error) {
      debugSteps.push({ step: 'Permission Model', status: 'FAILED', error: error.message });
      return NextResponse.json({ debugSteps }, { status: 500 });
    }

    // Step 5: Test role model
    try {
      const roleCount = await Role.countDocuments();
      debugSteps.push({ 
        step: 'Role Model', 
        status: 'SUCCESS', 
        existingRoles: roleCount 
      });
    } catch (error) {
      debugSteps.push({ step: 'Role Model', status: 'FAILED', error: error.message });
      return NextResponse.json({ debugSteps }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Debug completed successfully',
      debugSteps 
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      debugSteps: [{ step: 'General Error', status: 'FAILED', error: error.message }]
    }, { status: 500 });
  }
} 