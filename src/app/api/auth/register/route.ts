import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      role = 'patient',
      phone,
      address,
      country,
      currency,
      clinicName,
      clinicProfile
    } = await request.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
      country,
      currency,
      clinicName,
      clinicProfile
    });

    // Send welcome email
    await sendEmail({
      to: email,
      subject: 'Welcome to ClinicFlow',
      html: `
        <h1>Welcome to ClinicFlow, ${firstName} ${lastName}!</h1>
        <p>Your account has been successfully created.</p>
        <p>You can now log in to access your dashboard.</p>
      `,
    });

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}