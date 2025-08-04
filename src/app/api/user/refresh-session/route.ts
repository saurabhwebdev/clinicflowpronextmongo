import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Fetch the latest user data from database
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return the updated user data that can be used to update the session
    return NextResponse.json({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        country: user.country,
        currency: user.currency,
        clinicName: user.clinicName,
        clinicProfile: user.clinicProfile,
      }
    });
  } catch (error) {
    console.error('Error refreshing session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}