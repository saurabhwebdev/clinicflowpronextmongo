import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Permission from '@/models/Permission';
import { scanRoutes, groupRoutesByCategory, generatePermissionName, generatePermissionDescription } from '@/lib/route-scanner';

// GET /api/admin/permissions - List all permissions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !['master_admin', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const permissions = await Permission.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ category: 1, name: 1 });
      
    const total = await Permission.countDocuments(query);
    
    return NextResponse.json({
      permissions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/permissions - Create or update permissions from route scan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    
    // Scan routes and create permissions
    const routes = scanRoutes();
    const categories = groupRoutesByCategory(routes);
    
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const category of categories) {
      for (const route of category.routes) {
        for (const method of route.methods) {
          const permissionKey = `${route.path}:${method}`;
          const name = generatePermissionName(route);
          const description = generatePermissionDescription(route);
          
          // Check if permission already exists
          const existingPermission = await Permission.findOne({
            route: route.path,
            method: method as any
          });
          
          if (existingPermission) {
            // Update existing permission
            await Permission.findByIdAndUpdate(existingPermission._id, {
              name,
              description,
              category: category.name,
              isActive: true
            });
            updatedCount++;
          } else {
            // Create new permission
            await Permission.create({
              route: route.path,
              method: method as any,
              name,
              description,
              category: category.name,
              isActive: true
            });
            createdCount++;
          }
        }
      }
    }
    
    return NextResponse.json({
      message: 'Permissions updated successfully',
      created: createdCount,
      updated: updatedCount,
      totalRoutes: routes.length
    });
  } catch (error) {
    console.error('Error updating permissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/permissions - Update permission status
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { permissionId, isActive } = await request.json();
    
    if (!permissionId) {
      return NextResponse.json({ error: 'Permission ID is required' }, { status: 400 });
    }

    await connectDB();
    
    const permission = await Permission.findByIdAndUpdate(
      permissionId,
      { isActive },
      { new: true }
    );
    
    if (!permission) {
      return NextResponse.json({ error: 'Permission not found' }, { status: 404 });
    }
    
    return NextResponse.json({ permission });
  } catch (error) {
    console.error('Error updating permission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 