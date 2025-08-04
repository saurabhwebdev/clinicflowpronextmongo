import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import Prescription from '@/models/Prescription';
import Bill from '@/models/Bill';
import EHR from '@/models/EHR';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow doctors to access their stats
    if (session.user.role !== 'doctor') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await connectDB();

    const doctorId = session.user.id;

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Get current month for monthly stats
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Fetch doctor statistics
    const [
      todaysAppointments,
      totalAppointments,
      completedAppointments,
      totalPrescriptions,
      todaysPrescriptions,
      totalPatients,
      totalBills,
      monthlyRevenue,
      totalEHRs
    ] = await Promise.all([
      // Today's appointments
      Appointment.countDocuments({
        doctorId,
        appointmentDate: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }),
      
      // Total appointments
      Appointment.countDocuments({ doctorId }),
      
      // Completed appointments (today)
      Appointment.countDocuments({
        doctorId,
        appointmentDate: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: 'completed'
      }),
      
      // Total prescriptions
      Prescription.countDocuments({ doctorId }),
      
      // Today's prescriptions
      Prescription.countDocuments({
        doctorId,
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }),
      
      // Total unique patients
      Appointment.distinct('patientId', { doctorId }).then(patientIds => patientIds.length),
      
      // Total bills
      Bill.countDocuments({ doctorId }),
      
      // Monthly revenue
      Bill.aggregate([
        {
          $match: {
            doctorId,
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
      ]),
      
      // Total EHRs
      EHR.countDocuments({ createdBy: doctorId })
    ]);

    // Calculate percentage changes (mock data for now, could be calculated from previous periods)
    const appointmentChange = todaysAppointments > 0 ? `+${todaysAppointments}` : '0';
    const patientChange = completedAppointments > 0 ? `+${completedAppointments}` : '0';
    const prescriptionChange = todaysPrescriptions > 0 ? `+${todaysPrescriptions}` : '0';

    const stats = {
      appointments: {
        today: todaysAppointments,
        total: totalAppointments,
        completed: completedAppointments,
        change: appointmentChange,
        changeType: todaysAppointments > 0 ? 'positive' : 'neutral'
      },
      patients: {
        total: totalPatients,
        seenToday: completedAppointments,
        change: patientChange,
        changeType: completedAppointments > 0 ? 'positive' : 'neutral'
      },
      prescriptions: {
        total: totalPrescriptions,
        today: todaysPrescriptions,
        change: prescriptionChange,
        changeType: todaysPrescriptions > 0 ? 'positive' : 'neutral'
      },
      revenue: {
        monthly: monthlyRevenue[0]?.total || 0,
        bills: totalBills
      },
      ehrs: {
        total: totalEHRs
      }
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctor statistics' },
      { status: 500 }
    );
  }
} 