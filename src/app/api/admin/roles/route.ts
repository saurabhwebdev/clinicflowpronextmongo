import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Role from '@/models/Role';
import Permission from '@/models/Permission';

// GET /api/admin/roles - List all roles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !['master_admin', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const includePermissions = searchParams.get('includePermissions') === 'true';
    
    let query = Role.find();
    
    if (includePermissions) {
      query = query.populate('permissions');
    }
    
    const roles = await query.sort({ name: 1 });
    
    return NextResponse.json({ roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/roles - Create a new role
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { name, description, permissions } = await request.json();
    
    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }

    await connectDB();
    
    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return NextResponse.json({ error: 'Role already exists' }, { status: 400 });
    }
    
    // Create role
    const role = await Role.create({
      name,
      description,
      permissions: permissions || [],
      isActive: true,
      isSystem: false
    });
    
    const populatedRole = await Role.findById(role._id).populate('permissions');
    
    return NextResponse.json({ role: populatedRole }, { status: 201 });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/roles - Update a role
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { roleId, name, description, permissions, isActive } = await request.json();
    
    if (!roleId) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    await connectDB();
    
    const role = await Role.findById(roleId);
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }
    
    // Prevent modification of system roles
    if (role.isSystem) {
      return NextResponse.json({ error: 'Cannot modify system roles' }, { status: 400 });
    }
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const updatedRole = await Role.findByIdAndUpdate(
      roleId,
      updateData,
      { new: true }
    ).populate('permissions');
    
    return NextResponse.json({ role: updatedRole });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/roles - Delete a role
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');
    
    if (!roleId) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    await connectDB();
    
    const role = await Role.findById(roleId);
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }
    
    // Prevent deletion of system roles
    if (role.isSystem) {
      return NextResponse.json({ error: 'Cannot delete system roles' }, { status: 400 });
    }
    
    await Role.findByIdAndDelete(roleId);
    
    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 