const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Fix uptime data
async function fixUptimeData() {
  try {
    await connectDB();
    
    // Get the SystemUptime model
    const SystemUptime = mongoose.model('SystemUptime', new mongoose.Schema({
      systemId: String,
      totalUptimeMs: { type: Number, default: 0 },
      lastStartTime: Date,
      lastStopTime: Date,
      isCurrentlyRunning: { type: Boolean, default: true },
      currentSessionStartTime: Date,
      currentSessionUptimeMs: { type: Number, default: 0 },
      totalSessions: { type: Number, default: 1 },
      longestSessionMs: { type: Number, default: 0 },
      averageSessionMs: { type: Number, default: 0 },
      environment: String,
      version: String,
      lastUpdated: Date
    }, { timestamps: true }));

    // Find the existing uptime record
    const uptimeRecord = await SystemUptime.findOne({ systemId: 'main-system' });
    
    if (!uptimeRecord) {
      console.log('No uptime record found. Creating a new one...');
      return;
    }

    console.log('Current uptime record:', {
      totalUptimeMs: uptimeRecord.totalUptimeMs,
      currentSessionUptimeMs: uptimeRecord.currentSessionUptimeMs,
      longestSessionMs: uptimeRecord.longestSessionMs,
      averageSessionMs: uptimeRecord.averageSessionMs,
      isCurrentlyRunning: uptimeRecord.isCurrentlyRunning,
      currentSessionStartTime: uptimeRecord.currentSessionStartTime
    });

    // Calculate the actual current session uptime
    const now = new Date();
    const currentSessionUptimeMs = uptimeRecord.isCurrentlyRunning && uptimeRecord.currentSessionStartTime 
      ? now.getTime() - uptimeRecord.currentSessionStartTime.getTime() 
      : uptimeRecord.currentSessionUptimeMs;

    // Update the record with proper calculations
    uptimeRecord.currentSessionUptimeMs = currentSessionUptimeMs;
    
    // If this is the first session and it's still running, set longest session to current
    if (uptimeRecord.totalSessions === 1 && uptimeRecord.isCurrentlyRunning) {
      uptimeRecord.longestSessionMs = currentSessionUptimeMs;
      uptimeRecord.averageSessionMs = currentSessionUptimeMs;
    }
    
    // Update lastUpdated
    uptimeRecord.lastUpdated = now;
    
    await uptimeRecord.save();
    
    console.log('Fixed uptime record:', {
      totalUptimeMs: uptimeRecord.totalUptimeMs,
      currentSessionUptimeMs: uptimeRecord.currentSessionUptimeMs,
      longestSessionMs: uptimeRecord.longestSessionMs,
      averageSessionMs: uptimeRecord.averageSessionMs,
      isCurrentlyRunning: uptimeRecord.isCurrentlyRunning
    });

    console.log('Uptime data fixed successfully!');
    
  } catch (error) {
    console.error('Error fixing uptime data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the fix
fixUptimeData(); 