import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Bill from '@/models/Bill';
import ClinicSettings from '@/models/ClinicSettings';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    // Fetch bill with populated data
    const bill = await Bill.findById(id)
      .populate('patientId', 'firstName lastName email phone address')
      .populate('doctorId', 'firstName lastName')
      .populate('appointmentId', 'dateTime notes')
      .populate('createdBy', 'firstName lastName');

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    // Check permissions
    if (session.user.role === 'patient' && bill.patientId._id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (session.user.role === 'doctor' && bill.doctorId._id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch clinic settings for the current user
    console.log('Fetching clinic settings for user:', session.user.id);
    let clinicSettings = await ClinicSettings.findOne({ userId: session.user.id });
    console.log('Found clinic settings:', !!clinicSettings);
    
    // If no settings exist, create default ones
    if (!clinicSettings) {
      console.log('Creating default clinic settings...');
      const user = await User.findById(session.user.id);
      console.log('Found user:', !!user, 'User clinic name:', user?.clinicName);
      clinicSettings = {
        clinicName: user?.clinicName || 'Medical Clinic',
        clinicDescription: user?.clinicProfile || '',
        clinicAddress: user?.address || '',
        clinicPhone: user?.phone || '',
        clinicEmail: user?.email || '',
        clinicWebsite: '',
        logo: '',
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        accentColor: '#10b981',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        licenseNumber: '',
        taxId: '',
        establishedYear: new Date().getFullYear(),
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
        appointmentDuration: 30,
        appointmentBuffer: 15,
        currency: 'USD',
        timezone: 'UTC',
        emailNotifications: true,
        smsNotifications: false,
        appointmentReminders: true,
      };
    }

    // Return bill data with clinic settings for PDF generation
    console.log('Returning clinic settings:', {
      clinicName: clinicSettings.clinicName,
      clinicDescription: clinicSettings.clinicDescription,
      clinicAddress: clinicSettings.clinicAddress,
      clinicPhone: clinicSettings.clinicPhone,
      clinicEmail: clinicSettings.clinicEmail,
      establishedYear: clinicSettings.establishedYear,
      licenseNumber: clinicSettings.licenseNumber
    });
    
    return NextResponse.json({
      bill,
      clinicSettings,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching bill PDF data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}