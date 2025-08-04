import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Bill from '@/models/Bill';
import Appointment from '@/models/Appointment';
import Patient from '@/models/Patient';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow master_admin and admin to access stats
    if (!['master_admin', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await connectDB();

    // Get current month and year for monthly stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Fetch user statistics
    const [
      totalUsers,
      usersByRole,
      totalPatients,
      totalDoctors,
      totalAdmins,
      totalBills,
      totalAppointments,
      monthlyRevenue
    ] = await Promise.all([
      // Total users
      User.countDocuments(),
      
      // Users by role
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Total patients
      User.countDocuments({ role: 'patient' }),
      
      // Total doctors
      User.countDocuments({ role: 'doctor' }),
      
      // Total admins (excluding master_admin)
      User.countDocuments({ role: 'admin' }),
      
      // Total bills
      Bill.countDocuments(),
      
      // Total appointments
      Appointment.countDocuments(),
      
      // Monthly revenue
      Bill.aggregate([
        {
          $match: {
            status: 'paid',
            paymentDate: {
              $gte: startOfMonth,
              $lte: endOfMonth
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Convert users by role to object
    const usersByRoleObj = usersByRole.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Calculate percentage changes (mock data for now)
    const userChange = '+12%'; // This could be calculated by comparing with previous month
    const userChangeType = 'positive';

    const stats = {
      users: {
        total: totalUsers,
        change: userChange,
        changeType: userChangeType,
        byRole: usersByRoleObj,
        patients: totalPatients,
        doctors: totalDoctors,
        admins: totalAdmins
      },
      revenue: {
        monthly: monthlyRevenue[0]?.total || 0,
        bills: totalBills,
        appointments: totalAppointments
      }
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
} 