import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import SystemUptime from '@/models/SystemUptime';

// Helper function to get or create system uptime record
async function getOrCreateSystemUptime(systemId = 'main-system') {
  await connectDB();
  let systemUptime = await SystemUptime.findOne({ systemId });
  
  if (!systemUptime) {
    systemUptime = new SystemUptime({
      systemId,
      lastStartTime: new Date(),
      currentSessionStartTime: new Date(),
      isCurrentlyRunning: true,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0'
    });
    await systemUptime.save();
  }
  
  return systemUptime;
}

// Helper function to update system uptime
async function updateSystemUptime(systemId = 'main-system') {
  const systemUptime = await getOrCreateSystemUptime(systemId);
  
  // Always update session statistics when fetching
  systemUptime.updateSessionStatistics();
  await systemUptime.save();
  
  return systemUptime;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow master_admin to access system uptime
    if (session.user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const systemUptime = await updateSystemUptime();
    
    return NextResponse.json({
      success: true,
      data: {
        systemId: systemUptime.systemId,
        totalUptimeMs: systemUptime.getTotalUptime(),
        formattedUptime: systemUptime.getFormattedUptime(),
        isCurrentlyRunning: systemUptime.isCurrentlyRunning,
        lastStartTime: systemUptime.lastStartTime,
        currentSessionStartTime: systemUptime.currentSessionStartTime,
        totalSessions: systemUptime.totalSessions,
        longestSessionMs: systemUptime.longestSessionMs,
        averageSessionMs: systemUptime.averageSessionMs,
        environment: systemUptime.environment,
        version: systemUptime.version,
        lastUpdated: systemUptime.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error fetching system uptime:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system uptime' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow master_admin to update system uptime
    if (session.user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { action, systemId = 'main-system' } = body;

    let systemUptime = await getOrCreateSystemUptime(systemId);
    
    switch (action) {
      case 'start':
        // Start a new session
        if (!systemUptime.isCurrentlyRunning) {
          // If there was a previous session, add it to total uptime
          if (systemUptime.currentSessionUptimeMs > 0) {
            systemUptime.totalUptimeMs += systemUptime.currentSessionUptimeMs;
          }
          
          systemUptime.isCurrentlyRunning = true;
          systemUptime.currentSessionStartTime = new Date();
          systemUptime.currentSessionUptimeMs = 0;
          systemUptime.totalSessions += 1;
        }
        break;
        
      case 'stop':
        // Stop current session and add to total uptime
        if (systemUptime.isCurrentlyRunning) {
          systemUptime.updateCurrentSessionUptime();
          systemUptime.totalUptimeMs += systemUptime.currentSessionUptimeMs;
          systemUptime.lastStopTime = new Date();
          systemUptime.isCurrentlyRunning = false;
          
          // Update statistics
          systemUptime.updateSessionStatistics();
        }
        break;
        
      case 'reset':
        // Reset all uptime statistics
        systemUptime.totalUptimeMs = 0;
        systemUptime.currentSessionUptimeMs = 0;
        systemUptime.totalSessions = 1;
        systemUptime.longestSessionMs = 0;
        systemUptime.averageSessionMs = 0;
        systemUptime.lastStartTime = new Date();
        systemUptime.currentSessionStartTime = new Date();
        systemUptime.isCurrentlyRunning = true;
        systemUptime.lastStopTime = undefined;
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "start", "stop", or "reset"' },
          { status: 400 }
        );
    }
    
    // Always update session statistics after any action
    systemUptime.updateSessionStatistics();
    await systemUptime.save();
    
    return NextResponse.json({
      success: true,
      message: `System uptime ${action}ed successfully`,
      data: {
        systemId: systemUptime.systemId,
        totalUptimeMs: systemUptime.getTotalUptime(),
        formattedUptime: systemUptime.getFormattedUptime(),
        isCurrentlyRunning: systemUptime.isCurrentlyRunning,
        action: action
      }
    });
  } catch (error) {
    console.error('Error updating system uptime:', error);
    return NextResponse.json(
      { error: 'Failed to update system uptime' },
      { status: 500 }
    );
  }
} 