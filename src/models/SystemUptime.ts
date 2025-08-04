import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemUptime extends Document {
  // System identification
  systemId: string;
  
  // Uptime tracking
  totalUptimeMs: number; // Total cumulative uptime in milliseconds
  lastStartTime: Date; // When the system last started
  lastStopTime?: Date; // When the system last stopped (if applicable)
  isCurrentlyRunning: boolean; // Whether the system is currently running
  
  // Session tracking
  currentSessionStartTime?: Date; // Start time of current session
  currentSessionUptimeMs: number; // Uptime of current session
  
  // Statistics
  totalSessions: number; // Total number of sessions
  longestSessionMs: number; // Longest session duration
  averageSessionMs: number; // Average session duration
  
  // Metadata
  environment: string; // production, development, staging
  version: string; // System version
  lastUpdated: Date;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  updateCurrentSessionUptime(): ISystemUptime;
  getTotalUptime(): number;
  getFormattedUptime(): string;
}

const SystemUptimeSchema = new Schema<ISystemUptime>({
  systemId: {
    type: String,
    required: true,
    unique: true,
    default: 'main-system'
  },
  
  // Uptime tracking
  totalUptimeMs: {
    type: Number,
    default: 0,
    min: 0
  },
  lastStartTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  lastStopTime: {
    type: Date
  },
  isCurrentlyRunning: {
    type: Boolean,
    default: true
  },
  
  // Session tracking
  currentSessionStartTime: {
    type: Date,
    default: Date.now
  },
  currentSessionUptimeMs: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Statistics
  totalSessions: {
    type: Number,
    default: 1,
    min: 1
  },
  longestSessionMs: {
    type: Number,
    default: 0,
    min: 0
  },
  averageSessionMs: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Metadata
  environment: {
    type: String,
    default: 'development',
    enum: ['development', 'staging', 'production']
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
SystemUptimeSchema.index({ systemId: 1 });
SystemUptimeSchema.index({ isCurrentlyRunning: 1 });

// Method to update current session uptime
SystemUptimeSchema.methods.updateCurrentSessionUptime = function() {
  if (this.isCurrentlyRunning && this.currentSessionStartTime) {
    const now = new Date();
    this.currentSessionUptimeMs = now.getTime() - this.currentSessionStartTime.getTime();
    this.lastUpdated = now;
  }
  return this;
};

// Method to get total uptime including current session
SystemUptimeSchema.methods.getTotalUptime = function() {
  this.updateCurrentSessionUptime();
  return this.totalUptimeMs + this.currentSessionUptimeMs;
};

// Method to format uptime as human readable string
SystemUptimeSchema.methods.getFormattedUptime = function() {
  const totalMs = this.getTotalUptime();
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

// Prevent re-compilation during development
const SystemUptime = mongoose.models.SystemUptime || mongoose.model<ISystemUptime>('SystemUptime', SystemUptimeSchema);

export default SystemUptime; 