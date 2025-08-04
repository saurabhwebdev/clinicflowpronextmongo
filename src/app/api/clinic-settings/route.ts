import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import ClinicSettings from '@/models/ClinicSettings';
import User from '@/models/User';

export async function GET() {
  try {
    console.log('GET clinic settings - starting');
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user?.id);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Connecting to DB...');
    await connectDB();
    console.log('Connected to DB');

    console.log('Finding settings for user:', session.user.id);
    let settings = await ClinicSettings.findOne({ userId: session.user.id });
    console.log('Found settings:', !!settings);
    
    // If no settings exist, create default ones (but not for patients)
    if (!settings && session.user.role !== 'patient') {
      console.log('Creating default settings...');
      const user = await User.findById(session.user.id);
      console.log('Found user:', !!user);
      
      settings = new ClinicSettings({
        userId: session.user.id,
        clinicName: user?.clinicName || 'My Clinic',
        clinicDescription: user?.clinicProfile || '',
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
      
      console.log('Saving new settings...');
      await settings.save();
      console.log('Settings saved');
    }

    // For patients, always fetch master admin settings instead of creating patient-specific settings
    if (session.user.role === 'patient') {
      console.log('Patient user, fetching master admin settings...');
      const masterAdmin = await User.findOne({ role: 'master_admin' });
      if (masterAdmin) {
        const masterSettings = await ClinicSettings.findOne({ userId: masterAdmin._id });
        if (masterSettings) {
          settings = masterSettings;
          console.log('Found master admin settings for patient:', !!settings);
        }
      }
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching clinic settings:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to fetch clinic settings', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('PUT clinic settings - starting');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Getting request data...');
    const data = await request.json();
    console.log('Request data keys:', Object.keys(data));
    
    console.log('Connecting to DB...');
    await connectDB();

    console.log('Finding existing settings...');
    let settings = await ClinicSettings.findOne({ userId: session.user.id });
    
    if (!settings) {
      console.log('Creating new settings...');
      settings = new ClinicSettings({
        userId: session.user.id,
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
        ...data,
      });
    } else {
      console.log('Updating existing settings...');
      Object.assign(settings, data);
    }

    console.log('Saving settings...');
    await settings.save();
    console.log('Settings saved successfully');

    return NextResponse.json({ 
      message: 'Clinic settings updated successfully',
      settings 
    });
  } catch (error) {
    console.error('Error updating clinic settings:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to update clinic settings', details: error.message },
      { status: 500 }
    );
  }
}