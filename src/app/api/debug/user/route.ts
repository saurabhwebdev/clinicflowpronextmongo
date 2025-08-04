import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Fetch the user from database
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      debug: {
        sessionUserId: session.user.id,
        sessionCurrency: session.user.currency,
        dbCurrency: user.currency,
        dbUser: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          currency: user.currency,
          country: user.country,
        }
      }
    });
  } catch (error) {
    console.error('Error in debug route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}