import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Bill from '@/models/Bill';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const bill = await Bill.findById(id)
      .populate('patientId', 'firstName lastName email phone')
      .populate('doctorId', 'firstName lastName')
      .populate('appointmentId', 'dateTime notes')
      .populate('createdBy', 'firstName lastName');

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    // Check permissions
    if (session.user.role === 'patient' && bill.patientId._id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (session.user.role === 'doctor' && bill.doctorId._id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(bill);
  } catch (error) {
    console.error('Error fetching bill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin, master_admin, and doctors can update bills
    if (!['admin', 'master_admin', 'doctor'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const data = await request.json();
    const {
      items,
      tax,
      discount,
      status,
      paymentMethod,
      paymentDate,
      dueDate,
      notes,
    } = data;

    const bill = await Bill.findById(id);
    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    // Check permissions for doctors
    if (session.user.role === 'doctor' && bill.doctorId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Recalculate totals if items are updated
    if (items) {
      let subtotal = 0;
      const processedItems = items.map((item: any) => {
        const total = item.quantity * item.unitPrice;
        subtotal += total;
        return {
          ...item,
          total,
        };
      });

      const taxAmount = tax !== undefined ? (subtotal * tax) / 100 : bill.tax;
      const discountAmount = discount !== undefined ? (subtotal * discount) / 100 : bill.discount;
      const totalAmount = subtotal + taxAmount - discountAmount;

      bill.items = processedItems;
      bill.subtotal = subtotal;
      bill.tax = taxAmount;
      bill.discount = discountAmount;
      bill.totalAmount = totalAmount;
    }

    // Update other fields
    if (status !== undefined) bill.status = status;
    if (paymentMethod !== undefined) bill.paymentMethod = paymentMethod;
    if (paymentDate !== undefined) bill.paymentDate = paymentDate;
    if (dueDate !== undefined) bill.dueDate = dueDate;
    if (notes !== undefined) bill.notes = notes;

    // Set payment date when status changes to paid
    if (status === 'paid' && !bill.paymentDate) {
      bill.paymentDate = new Date();
    }

    await bill.save();

    const updatedBill = await Bill.findById(id)
      .populate('patientId', 'firstName lastName email phone')
      .populate('doctorId', 'firstName lastName')
      .populate('appointmentId', 'dateTime notes')
      .populate('createdBy', 'firstName lastName');

    return NextResponse.json(updatedBill);
  } catch (error) {
    console.error('Error updating bill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and master_admin can delete bills
    if (!['admin', 'master_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const bill = await Bill.findById(id);
    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    await Bill.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}