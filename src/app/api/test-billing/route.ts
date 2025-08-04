import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Bill from '@/models/Bill';
import Appointment from '@/models/Appointment';
import User from '@/models/User';

export async function GET() {
  try {
    console.log('Testing billing API components...');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', !!session, session?.user?.id);
    
    if (!session) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    console.log('Connecting to DB...');
    await connectDB();
    console.log('Connected to DB');

    console.log('Testing model imports...');
    const billCount = await Bill.countDocuments();
    const appointmentCount = await Appointment.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log('Counts:', { billCount, appointmentCount, userCount });

    return NextResponse.json({ 
      success: true,
      session: !!session,
      userId: session.user.id,
      userRole: session.user.role,
      counts: { billCount, appointmentCount, userCount }
    });
  } catch (error) {
    console.error('Test billing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}