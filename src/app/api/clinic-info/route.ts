import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import ClinicSettings from '@/models/ClinicSettings';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // For patients, get master admin's clinic settings
    let settings;
    if (session.user.role === 'patient') {
      // Find master admin's clinic settings
      const masterAdmin = await User.findOne({ role: 'master_admin' });
      if (masterAdmin) {
        settings = await ClinicSettings.findOne({ userId: masterAdmin._id });
      }
    } else {
      // For other roles, get their own clinic settings
      settings = await ClinicSettings.findOne({ userId: session.user.id });
    }

    if (!settings) {
      return NextResponse.json({
        clinicInfo: {
          clinicName: 'Data set pending',
          clinicDescription: 'Data set pending',
          clinicAddress: 'Data set pending',
          clinicPhone: 'Data set pending',
          clinicEmail: 'Data set pending',
          clinicWebsite: 'Data set pending',
          licenseNumber: 'Data set pending',
          establishedYear: null,
          specializations: [],
          operatingHours: {
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '09:00', close: '17:00', closed: false },
            sunday: { open: '09:00', close: '17:00', closed: false },
          }
        }
      });
    }

    return NextResponse.json({
      clinicInfo: {
        clinicName: settings.clinicName || 'Data set pending',
        clinicDescription: settings.clinicDescription || 'Data set pending',
        clinicAddress: settings.clinicAddress || 'Data set pending',
        clinicPhone: settings.clinicPhone || 'Data set pending',
        clinicEmail: settings.clinicEmail || 'Data set pending',
        clinicWebsite: settings.clinicWebsite || 'Data set pending',
        licenseNumber: settings.licenseNumber || 'Data set pending',
        establishedYear: settings.establishedYear || null,
        specializations: settings.specializations || [],
        operatingHours: settings.operatingHours || {
          monday: { open: '09:00', close: '17:00', closed: false },
          tuesday: { open: '09:00', close: '17:00', closed: false },
          wednesday: { open: '09:00', close: '17:00', closed: false },
          thursday: { open: '09:00', close: '17:00', closed: false },
          friday: { open: '09:00', close: '17:00', closed: false },
          saturday: { open: '09:00', close: '17:00', closed: false },
          sunday: { open: '09:00', close: '17:00', closed: false },
        }
      }
    });

  } catch (error) {
    console.error('Error fetching clinic info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 