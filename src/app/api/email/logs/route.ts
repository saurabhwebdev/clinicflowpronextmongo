import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// Email log model (same as in send route)
const emailLogSchema = new mongoose.Schema({
  to: { type: String, required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['sent', 'failed', 'pending'], 
    default: 'pending' 
  },
  sentAt: { type: Date, default: Date.now },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailTemplate' },
  sentBy: { type: String, required: true },
  error: String,
});

const EmailLog = mongoose.models.EmailLog || mongoose.model('EmailLog', emailLogSchema);

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
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const logs = await EmailLog.find(filter)
      .populate('templateId', 'name')
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await EmailLog.countDocuments(filter);

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching email logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}