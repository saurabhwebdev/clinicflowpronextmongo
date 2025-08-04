import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import { sendEmail } from '@/lib/email';
import User from '@/models/User';
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
  isBulk: { type: Boolean, default: false },
  bulkId: String, // To group bulk emails together
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
    const { patientIds, subject, content, templateId } = body;

    // Validate required fields
    if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
      return NextResponse.json({ 
        error: 'Patient IDs array is required and cannot be empty' 
      }, { status: 400 });
    }

    if (!subject || !content) {
      return NextResponse.json({ 
        error: 'Subject and content are required' 
      }, { status: 400 });
    }

    // Get all patients
    const patients = await User.find({ _id: { $in: patientIds }, role: 'patient' });
    
    if (patients.length === 0) {
      return NextResponse.json({ error: 'No valid patients found' }, { status: 404 });
    }

    // Generate a unique bulk ID
    const bulkId = new mongoose.Types.ObjectId().toString();
    
    let successCount = 0;
    let failedCount = 0;
    const results = [];

    // Send emails to each patient
    for (const patient of patients) {
      const emailLog = new EmailLog({
        to: patient.email,
        subject,
        content,
        templateId: templateId || undefined,
        sentBy: session.user?.email || 'unknown',
        status: 'pending',
        isBulk: true,
        bulkId
      });

      try {
        // Send the email
        await sendEmail({
          to: patient.email,
          subject,
          html: content.replace(/\n/g, '<br>'), // Convert line breaks to HTML
        });

        // Update log status to sent
        emailLog.status = 'sent';
        emailLog.sentAt = new Date();
        successCount++;
        
        results.push({
          patientId: patient._id,
          email: patient.email,
          status: 'sent'
        });
        
      } catch (emailError: any) {
        console.error(`Email sending failed for ${patient.email}:`, emailError);
        
        // Update log status to failed
        emailLog.status = 'failed';
        emailLog.error = emailError.message || 'Unknown email error';
        failedCount++;
        
        results.push({
          patientId: patient._id,
          email: patient.email,
          status: 'failed',
          error: emailError.message
        });
      }

      // Save the log regardless of success/failure
      await emailLog.save();
    }

    return NextResponse.json({ 
      message: `Bulk email completed. ${successCount} sent, ${failedCount} failed.`,
      bulkId,
      successCount,
      failedCount,
      totalCount: patients.length,
      results
    });

  } catch (error) {
    console.error('Error in bulk email API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}