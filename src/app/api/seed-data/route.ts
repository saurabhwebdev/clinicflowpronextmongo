import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Patient from '@/models/Patient';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Migration: Move patients from Patient model to User model
    const oldPatients = await Patient.find({});
    let migratedCount = 0;
    let skippedCount = 0;

    // Hash default password for patients
    const defaultPassword = 'pass@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    for (const oldPatient of oldPatients) {
      // Check if user with this email already exists
      const existingUser = await User.findOne({ email: oldPatient.email });
      
      if (existingUser) {
        console.log(`Skipping ${oldPatient.email} - user already exists`);
        skippedCount++;
        continue;
      }

      // Create new user with patient role and default password
      const newUser = new User({
        firstName: oldPatient.firstName,
        lastName: oldPatient.lastName,
        email: oldPatient.email,
        phone: oldPatient.phone,
        dateOfBirth: oldPatient.dateOfBirth,
        role: 'patient',
        password: hashedPassword,
        address: oldPatient.address?.street || '',
        country: oldPatient.address?.country || '',
        requirePasswordChange: true, // Require password change on first login
      });

      await newUser.save();
      migratedCount++;
      console.log(`Migrated patient: ${oldPatient.email}`);
    }

    return NextResponse.json({
      message: 'Migration completed',
      migrated: migratedCount,
      skipped: skippedCount,
      total: oldPatients.length
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
