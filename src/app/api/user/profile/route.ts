import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

// Helper function to calculate age
const calculateAge = (dateOfBirth: Date | string | null): number | null => {
  if (!dateOfBirth) return null;
  
  const birthDate = new Date(dateOfBirth);
  if (isNaN(birthDate.getTime())) return null;
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const age = calculateAge(user.dateOfBirth);

    return NextResponse.json({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        country: user.country,
        currency: user.currency,
        clinicName: user.clinicName,
        clinicProfile: user.clinicProfile,
        role: user.role,
        dateOfBirth: user.dateOfBirth,
        age: age,
        gender: user.gender,
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Profile update - User ID:', session.user.id);
    console.log('Profile update - User ID type:', typeof session.user.id);

    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
      console.log('Profile update - Invalid user ID format');
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    await connectDB();

    const data = await request.json();
    console.log('Profile update - Received data:', data);
    
    // Remove email from updates as it shouldn't be editable
    const { email, role, ...updateData } = data;
    console.log('Profile update - Update data:', updateData);

    // Validate required fields
    if (updateData.firstName && updateData.firstName.trim().length === 0) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 });
    }
    
    if (updateData.lastName && updateData.lastName.trim().length === 0) {
      return NextResponse.json({ error: 'Last name is required' }, { status: 400 });
    }

    // Handle dateOfBirth conversion
    if (updateData.dateOfBirth) {
      const dateOfBirth = new Date(updateData.dateOfBirth);
      if (isNaN(dateOfBirth.getTime())) {
        return NextResponse.json({ error: 'Invalid date of birth format' }, { status: 400 });
      }
      updateData.dateOfBirth = dateOfBirth;
    }

    // Check if user exists first
    const existingUser = await User.findById(session.user.id);
    console.log('Profile update - Existing user found:', !!existingUser);
    
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    console.log('Profile update - Updated user:', user ? 'Success' : 'Failed');

    if (!user) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    const age = calculateAge(user.dateOfBirth);

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        country: user.country,
        currency: user.currency,
        clinicName: user.clinicName,
        clinicProfile: user.clinicProfile,
        dateOfBirth: user.dateOfBirth,
        age: age,
        gender: user.gender,
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}