import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Bill from '@/models/Bill';
import Appointment from '@/models/Appointment';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');

    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (status) filter.status = status;
    if (patientId) filter.patientId = patientId;
    if (doctorId) filter.doctorId = doctorId;

    // Role-based filtering
    if (session.user.role === 'doctor') {
      filter.doctorId = session.user.id;
    } else if (session.user.role === 'patient') {
      filter.patientId = session.user.id;
    }

    const bills = await Bill.find(filter)
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName')
      .populate('appointmentId', 'dateTime notes')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Bill.countDocuments(filter);

    return NextResponse.json({
      bills,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST billing - starting');
    const session = await getServerSession(authOptions);
    console.log('Session user:', session?.user?.id, session?.user?.role);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin, master_admin, and doctors can create bills
    if (!['admin', 'master_admin', 'doctor'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.log('Connecting to DB...');
    await connectDB();
    console.log('Connected to DB');

    console.log('Getting request data...');
    const data = await request.json();
    console.log('Request data:', JSON.stringify(data, null, 2));
    
    const {
      patientId,
      doctorId,
      appointmentId,
      items,
      tax = 0,
      discount = 0,
      dueDate,
      notes,
    } = data;

    console.log('Validating required fields...');
    // Validate required fields
    if (!patientId || !doctorId || !appointmentId || !items || !Array.isArray(items) || items.length === 0) {
      console.log('Missing required fields:', { patientId, doctorId, appointmentId, items: items?.length });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Validating appointment...');
    // Validate appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      console.log('Appointment not found:', appointmentId);
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    console.log('Appointment found:', appointment._id);

    console.log('Calculating totals...');
    // Calculate totals
    let subtotal = 0;
    const processedItems = items.map((item: any) => {
      const total = item.quantity * item.unitPrice;
      subtotal += total;
      return {
        ...item,
        total,
      };
    });

    const taxAmount = (subtotal * tax) / 100;
    const discountAmount = (subtotal * discount) / 100;
    const totalAmount = subtotal + taxAmount - discountAmount;

    console.log('Generating bill number...');
    // Generate bill number manually
    const billCount = await Bill.countDocuments();
    const billNumber = `BILL-${String(billCount + 1).padStart(6, '0')}`;
    console.log('Generated bill number:', billNumber);

    console.log('Creating bill object...');
    const bill = new Bill({
      billNumber,
      patientId,
      doctorId,
      appointmentId,
      items: processedItems,
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      totalAmount,
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes,
      createdBy: session.user.id,
    });

    console.log('Saving bill...');
    await bill.save();
    console.log('Bill saved with ID:', bill._id);

    console.log('Populating bill data...');
    const populatedBill = await Bill.findById(bill._id)
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName')
      .populate('appointmentId', 'dateTime notes');

    console.log('Bill creation successful');
    return NextResponse.json(populatedBill, { status: 201 });
  } catch (error) {
    console.error('Error creating bill:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}