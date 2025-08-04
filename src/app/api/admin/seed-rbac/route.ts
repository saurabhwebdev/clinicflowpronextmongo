import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Role from '@/models/Role';
import Permission from '@/models/Permission';
import { scanRoutes, groupRoutesByCategory, generatePermissionName, generatePermissionDescription } from '@/lib/route-scanner';

// POST /api/admin/seed-rbac - Seed RBAC system with default roles and permissions
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully');
    
    // Step 1: Scan routes and create permissions
    console.log('Scanning routes...');
    let routes;
    try {
      routes = scanRoutes();
      console.log(`Found ${routes.length} routes`);
    } catch (error) {
      console.error('Error scanning routes:', error);
      return NextResponse.json({ error: `Route scanning failed: ${error.message}` }, { status: 500 });
    }
    
    let categories;
    try {
      categories = groupRoutesByCategory(routes);
      console.log(`Found ${categories.length} categories`);
    } catch (error) {
      console.error('Error grouping routes:', error);
      return NextResponse.json({ error: `Route categorization failed: ${error.message}` }, { status: 500 });
    }
    
    let createdPermissions = 0;
    let updatedPermissions = 0;
    
    for (const category of categories) {
      for (const route of category.routes) {
        for (const method of route.methods) {
          try {
            const name = generatePermissionName(route);
            const description = generatePermissionDescription(route);
            
            console.log(`Processing permission: ${route.path} ${method}`);
            
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
              updatedPermissions++;
              console.log(`Updated permission: ${route.path} ${method}`);
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
              createdPermissions++;
              console.log(`Created permission: ${route.path} ${method}`);
            }
          } catch (error) {
            console.error(`Error processing permission ${route.path} ${method}:`, error);
            return NextResponse.json({ 
              error: `Permission creation failed for ${route.path} ${method}: ${error.message}` 
            }, { status: 500 });
          }
        }
      }
    }
    
    // Step 2: Create default roles
    console.log('Creating default roles...');
    
    // Get all permissions for role assignment
    const allPermissions = await Permission.find({ isActive: true });
    
    // Create system roles with appropriate permissions
    const defaultRoles = [
      {
        name: 'master_admin',
        description: 'Full system administrator with all permissions',
        isSystem: true,
        permissions: allPermissions.map(p => p._id)
      },
      {
        name: 'admin',
        description: 'Administrator with most permissions except system management',
        isSystem: true,
        permissions: allPermissions
          .filter(p => !p.route.startsWith('/admin/seed-rbac') && !p.route.startsWith('/admin/permissions'))
          .map(p => p._id)
      },
      {
        name: 'doctor',
        description: 'Medical professional with patient and appointment management',
        isSystem: true,
        permissions: allPermissions
          .filter(p => 
            p.category === 'patients' || 
            p.category === 'appointments' || 
            p.category === 'prescriptions' || 
            p.category === 'ehr' ||
            p.category === 'billing' ||
            p.category === 'inventory' ||
            p.category === 'email' ||
            p.category === 'profile' ||
            p.category === 'dashboard'
          )
          .map(p => p._id)
      },
      {
        name: 'patient',
        description: 'Patient with limited access to their own records',
        isSystem: true,
        permissions: allPermissions
          .filter(p => 
            p.category === 'profile' ||
            p.category === 'dashboard' ||
            (p.category === 'patients' && p.route.includes('/profile'))
          )
          .map(p => p._id)
      }
    ];
    
    let createdRoles = 0;
    let updatedRoles = 0;
    
    for (const roleData of defaultRoles) {
      try {
        console.log(`Processing role: ${roleData.name}`);
        
        const existingRole = await Role.findOne({ name: roleData.name });
        
        if (existingRole) {
          // Update existing role
          await Role.findByIdAndUpdate(existingRole._id, {
            description: roleData.description,
            permissions: roleData.permissions,
            isSystem: roleData.isSystem
          });
          updatedRoles++;
          console.log(`Updated role: ${roleData.name}`);
        } else {
          // Create new role
          await Role.create(roleData);
          createdRoles++;
          console.log(`Created role: ${roleData.name}`);
        }
      } catch (error) {
        console.error(`Error processing role ${roleData.name}:`, error);
        return NextResponse.json({ 
          error: `Role creation failed for ${roleData.name}: ${error.message}` 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({
      message: 'RBAC system seeded successfully',
      permissions: {
        created: createdPermissions,
        updated: updatedPermissions,
        total: allPermissions.length
      },
      roles: {
        created: createdRoles,
        updated: updatedRoles,
        total: defaultRoles.length
      },
      routes: {
        scanned: routes.length,
        categories: categories.length
      }
    });
  } catch (error) {
    console.error('Error seeding RBAC system:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 