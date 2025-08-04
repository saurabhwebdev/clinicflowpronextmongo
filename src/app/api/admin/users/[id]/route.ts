import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if session exists, has user property, and user has appropriate role
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 403 });
    }
    
    // Check if user has role property and if it's one of the allowed roles
    const userRole = session.user.role;
    if (!userRole || !['master_admin', 'admin', 'doctor'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized - Invalid role' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if session exists, has user property, and user has appropriate role
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 403 });
    }
    
    // Check if user has role property and if it's one of the allowed roles
    const userRole = session.user.role;
    if (!userRole || !['master_admin', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized - Invalid role' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const data = await request.json();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { ...data, updatedBy: session.user.id },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if session exists, has user property, and user has appropriate role
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 403 });
    }
    
    // Check if user has role property and if it's one of the allowed roles
    const userRole = session.user.role;
    if (!userRole || !['master_admin', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized - Invalid role' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;

    const user = await User.findById(id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    await User.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 