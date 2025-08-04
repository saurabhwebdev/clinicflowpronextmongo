import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// Generate a random temporary password
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only master admins can reset passwords
    if (!session || session.user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const userId = params.id;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate new temporary password
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

    // Update user with new password and require password change
    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      requirePasswordChange: true,
      passwordChangedAt: new Date(),
      temporaryPassword: temporaryPassword // Store temporarily for display
    });

    // Clear temporary password after 5 minutes for security
    setTimeout(async () => {
      try {
        await User.findByIdAndUpdate(userId, {
          $unset: { temporaryPassword: 1 }
        });
      } catch (error) {
        console.error('Error clearing temporary password:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return NextResponse.json({
      message: 'Password reset successfully',
      temporaryPassword: temporaryPassword
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}