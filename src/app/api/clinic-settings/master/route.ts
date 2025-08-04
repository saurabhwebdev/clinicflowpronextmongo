import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import ClinicSettings from '@/models/ClinicSettings';
import User from '@/models/User';

export async function GET() {
  try {
    console.log('GET master clinic settings - starting');
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user?.id);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Connecting to DB...');
    await connectDB();
    console.log('Connected to DB');

    // Find master admin user
    console.log('Finding master admin...');
    const masterAdmin = await User.findOne({ role: 'master_admin' });
    console.log('Found master admin:', !!masterAdmin);
    
    if (!masterAdmin) {
      return NextResponse.json({ error: 'No master admin found' }, { status: 404 });
    }

    // Get master admin's clinic settings
    console.log('Finding settings for master admin:', masterAdmin._id);
    let settings = await ClinicSettings.findOne({ userId: masterAdmin._id });
    console.log('Found master admin settings:', !!settings);
    
    // If no settings exist, create default ones for master admin
    if (!settings) {
      console.log('Creating default settings for master admin...');
      settings = new ClinicSettings({
        userId: masterAdmin._id,
        clinicName: masterAdmin?.clinicName || 'My Clinic',
        clinicDescription: masterAdmin?.clinicProfile || '',
        specializations: [],
        operatingHours: {
          monday: { open: '09:00', close: '17:00', closed: false },
          tuesday: { open: '09:00', close: '17:00', closed: false },
          wednesday: { open: '09:00', close: '17:00', closed: false },
          thursday: { open: '09:00', close: '17:00', closed: false },
          friday: { open: '09:00', close: '17:00', closed: false },
          saturday: { open: '09:00', close: '13:00', closed: false },
          sunday: { open: '09:00', close: '13:00', closed: true },
        },
        socialMedia: {
          facebook: '',
          twitter: '',
          instagram: '',
          linkedin: '',
          youtube: '',
        },
      });
      
      console.log('Saving master admin settings...');
      await settings.save();
      console.log('Master admin settings saved');
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching master clinic settings:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to fetch master clinic settings', details: error.message },
      { status: 500 }
    );
  }
} 