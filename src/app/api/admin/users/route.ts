import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Role from '@/models/Role';
import { sendEmail } from '@/lib/email';

// Helper function to generate a random password
function generateRandomPassword(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// GET /api/admin/users - List all users
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('Session in GET /api/admin/users:', JSON.stringify(session, null, 2));

    // Check if session exists, has user property, and user has appropriate role
    if (!session || !session.user) {
      console.log('No session or user found');
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 403 });
    }

    // Check if user has role property and if it's one of the allowed roles
    const userRole = session.user.role;
    if (!userRole || !['master_admin', 'admin'].includes(userRole)) {
      console.log('Invalid role:', userRole);
      return NextResponse.json({ error: 'Unauthorized - Invalid role' }, { status: 403 });
    }

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (role) {
      query.role = role;
    }

    // If not master admin, don't show master admins
    if (session.user.role !== 'master_admin') {
      query.role = { $ne: 'master_admin' };
    }

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('Session in POST /api/admin/users:', JSON.stringify(session, null, 2));

    // Check if session exists, has user property, and user has appropriate role
    if (!session || !session.user) {
      console.log('No session or user found');
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 403 });
    }

    // Check if user has role property and if it's one of the allowed roles
    const userRole = session.user.role;
    if (!userRole || !['master_admin', 'admin'].includes(userRole)) {
      console.log('Invalid role:', userRole);
      return NextResponse.json({ error: 'Unauthorized - Invalid role' }, { status: 403 });
    }

    const {
      firstName,
      lastName,
      email,
      role = 'patient',
      phone,
      address,
      country,
      currency,
      clinicName,
      clinicProfile
    } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role permissions
    if (role === 'master_admin' && userRole !== 'master_admin') {
      return NextResponse.json(
        { error: 'Only master admins can create master admin accounts' },
        { status: 403 }
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

    // Generate password based on role
    let password;
    if (role === 'patient') {
      // Use default password for patients
      password = 'pass@123';
    } else {
      // Generate random password for other roles
      password = generateRandomPassword();
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    // Get the default role for the user type
    let defaultRoleId = null;
    if (role) {
      const defaultRole = await Role.findOne({ name: role, isSystem: true });
      if (defaultRole) {
        defaultRoleId = defaultRole._id;
      }
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      roles: defaultRoleId ? [defaultRoleId] : [],
      phone,
      address,
      country,
      currency,
      clinicName,
      clinicProfile,
      requirePasswordChange: true,
      createdBy: session.user.id || (session.user as any).sub
    });

    // Send email with credentials
    await sendEmail({
      to: email,
      subject: 'Your ClinicFlow Account',
      html: `
        <h1>Welcome to ClinicFlow, ${firstName} ${lastName}!</h1>
        <p>An account has been created for you by an administrator.</p>
        <p>Here are your login credentials:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> ${password}</p>
        <p>Please log in and change your password immediately.</p>
        <p><a href="${process.env.NEXTAUTH_URL}/auth/signin">Click here to login</a></p>
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
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}