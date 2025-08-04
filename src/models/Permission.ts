import mongoose, { Document, Schema } from 'mongoose';

export interface IPermission extends Document {
  route: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new Schema<IPermission>({
  route: {
    type: String,
    required: true,
    trim: true,
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Create compound index for route and method
PermissionSchema.index({ route: 1, method: 1 }, { unique: true });

export default mongoose.models.Permission || mongoose.model<IPermission>('Permission', PermissionSchema); 