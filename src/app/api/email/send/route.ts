import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import { sendEmail } from '@/lib/email';
import User from '@/models/User';

// Email log model (we'll create this)
import mongoose from 'mongoose';

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
  sentBy: { type: String, required: true }, // User who sent the email
  error: String, // Error message if failed
});

const EmailLog = mongoose.models.EmailLog || mongoose.model('EmailLog', emailLogSchema);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { to, subject, content, templateId } = body;

    // Validate required fields
    if (!to || !subject || !content) {
      return NextResponse.json({ 
        error: 'Missing required fields: to, subject, content' 
      }, { status: 400 });
    }

    // If 'to' is a patient ID, get the email address
    let recipientEmail = to;
    if (mongoose.Types.ObjectId.isValid(to)) {
      const patient = await User.findOne({ _id: to, role: 'patient' });
      if (!patient) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }
      recipientEmail = patient.email;
    }

    // Create email log entry
    const emailLog = new EmailLog({
      to: recipientEmail,
      subject,
      content,
      templateId: templateId || undefined,
      sentBy: session.user?.email || 'unknown',
      status: 'pending'
    });

    try {
      // Send the email
      await sendEmail({
        to: recipientEmail,
        subject,
        html: content.replace(/\n/g, '<br>'), // Convert line breaks to HTML
      });

      // Update log status to sent
      emailLog.status = 'sent';
      emailLog.sentAt = new Date();
      
    } catch (emailError: any) {
      console.error('Email sending failed:', emailError);
      
      // Update log status to failed
      emailLog.status = 'failed';
      emailLog.error = emailError.message || 'Unknown email error';
      
      await emailLog.save();
      
      return NextResponse.json({ 
        error: 'Failed to send email',
        details: emailError.message 
      }, { status: 500 });
    }

    // Save the log
    await emailLog.save();

    return NextResponse.json({ 
      message: 'Email sent successfully',
      logId: emailLog._id 
    });

  } catch (error) {
    console.error('Error in email send API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}