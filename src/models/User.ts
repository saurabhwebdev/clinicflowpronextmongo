import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: 'master_admin' | 'admin' | 'doctor' | 'patient';
  roles: mongoose.Types.ObjectId[];
  phone?: string;
  address?: string;
  country?: string;
  currency?: string;
  clinicName?: string;
  clinicProfile?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  createdAt: Date;
  updatedAt: Date;
  emailVerified?: Date;
  image?: string;
  requirePasswordChange?: boolean;
  passwordChangedAt?: Date;
  temporaryPassword?: string;
  createdBy?: mongoose.Types.ObjectId;
}

const UserSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    select: false, // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['master_admin', 'admin', 'doctor', 'patient'],
    default: 'patient',
  },
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
  }],
  requirePasswordChange: {
    type: Boolean,
    default: false,
  },
  passwordChangedAt: {
    type: Date,
  },
  temporaryPassword: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
  },
  currency: {
    type: String,
    trim: true,
    default: 'USD',
  },
  clinicName: {
    type: String,
    trim: true,
  },
  clinicProfile: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  emailVerified: {
    type: Date,
  },
  image: {
    type: String,
  },
}, {
  timestamps: true,
});

// Prevent re-compilation during development
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);