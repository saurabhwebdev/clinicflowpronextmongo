import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// Email template model
const emailTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['appointment_reminder', 'follow_up', 'general', 'billing'],
    default: 'general'
  },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

emailTemplateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const EmailTemplate = mongoose.models.EmailTemplate || mongoose.model('EmailTemplate', emailTemplateSchema);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const filter: any = {};
    if (type) {
      filter.type = type;
    }

    const templates = await EmailTemplate.find(filter)
      .sort({ createdAt: -1 });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { name, subject, content, type } = body;

    // Validate required fields
    if (!name || !subject || !content) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, subject, content' 
      }, { status: 400 });
    }

    // Check if template name already exists
    const existingTemplate = await EmailTemplate.findOne({ name });
    if (existingTemplate) {
      return NextResponse.json({ 
        error: 'Template with this name already exists' 
      }, { status: 400 });
    }

    const template = new EmailTemplate({
      name,
      subject,
      content,
      type: type || 'general',
      createdBy: session.user?.email || 'unknown'
    });

    await template.save();

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating email template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}