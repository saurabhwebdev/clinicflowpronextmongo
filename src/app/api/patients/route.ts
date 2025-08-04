import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

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

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build filter for patients (users with role 'patient')
    const filter: any = { role: 'patient' };
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const patientsData = await User.find(filter)
      .select('firstName lastName email phone dateOfBirth gender role')
      .sort({ firstName: 1, lastName: 1 })
      .skip(skip)
      .limit(limit);

    // Add age calculation to each patient
    const patients = patientsData.map(patient => {
      const age = calculateAge(patient.dateOfBirth);
      return {
        ...patient.toObject(),
        age
      };
    });

    const total = await User.countDocuments(filter);

    return NextResponse.json({
      patients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    console.log('Received patient data:', body);
    const { firstName, lastName, email, phone, dateOfBirth, gender } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !dateOfBirth) {
      return NextResponse.json({ error: 'First name, last name, email, and date of birth are required' }, { status: 400 });
    }

    // Check if patient with email already exists
    const existingPatient = await User.findOne({ email, role: 'patient' });
    if (existingPatient) {
      return NextResponse.json({ error: 'Patient with this email already exists' }, { status: 400 });
    }

    // Hash the default password for patients
    const defaultPassword = 'pass@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    console.log('Creating new patient with data:', {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth: new Date(dateOfBirth),
      role: 'patient',
      password: '[HASHED]', // Don't log the actual password
    });

    const patient = new User({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      role: 'patient',
      password: hashedPassword,
      roles: [], // Add empty roles array
      requirePasswordChange: true, // Require password change on first login
    });

    console.log('Patient object created, saving...');
    await patient.save();
    console.log('Patient saved successfully:', patient._id);

    // Return patient data without password
    const patientResponse = patient.toObject();
    delete patientResponse.password;

    return NextResponse.json(patientResponse, { status: 201 });
  } catch (error: any) {
    console.error('Error creating patient:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}