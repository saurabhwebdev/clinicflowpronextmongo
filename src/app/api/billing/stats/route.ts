import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Bill from '@/models/Bill';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Build filter based on user role
    const filter: any = {};
    if (session.user.role === 'doctor') {
      filter.doctorId = session.user.id;
    } else if (session.user.role === 'patient') {
      filter.patientId = session.user.id;
    }

    // Get current month and year
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Total bills
    const totalBills = await Bill.countDocuments(filter);

    // Bills by status
    const billsByStatus = await Bill.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    // Monthly revenue
    const monthlyRevenue = await Bill.aggregate([
      {
        $match: {
          ...filter,
          status: 'paid',
          paymentDate: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Overdue bills
    const overdueBills = await Bill.countDocuments({
      ...filter,
      status: { $in: ['sent', 'draft'] },
      dueDate: { $lt: new Date() },
    });

    // Recent bills (last 5)
    const recentBills = await Bill.find(filter)
      .populate('patientId', 'firstName lastName')
      .populate('doctorId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('billNumber totalAmount status createdAt patientId doctorId');

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Bill.aggregate([
      {
        $match: {
          ...filter,
          status: 'paid',
          paymentDate: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' },
          },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const stats = {
      totalBills,
      billsByStatus: billsByStatus.reduce((acc, item) => {
        acc[item._id] = {
          count: item.count,
          totalAmount: item.totalAmount,
        };
        return acc;
      }, {}),
      monthlyRevenue: monthlyRevenue[0] || { total: 0, count: 0 },
      overdueBills,
      recentBills,
      monthlyTrend,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching billing stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}