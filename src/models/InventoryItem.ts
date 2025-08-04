import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryItem extends Document {
  name: string;
  description?: string;
  category: string;
  sku: string;
  quantity: number;
  minQuantity: number;
  maxQuantity?: number;
  unitPrice: number;
  supplier?: string;
  supplierContact?: string;
  expiryDate?: Date;
  batchNumber?: string;
  location?: string;
  status: 'active' | 'inactive' | 'discontinued';
  lastRestocked?: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryItemSchema = new Schema<IInventoryItem>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  minQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 10,
  },
  maxQuantity: {
    type: Number,
    min: 0,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  supplier: {
    type: String,
    trim: true,
  },
  supplierContact: {
    type: String,
    trim: true,
  },
  expiryDate: {
    type: Date,
  },
  batchNumber: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active',
  },
  lastRestocked: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes for better performance
InventoryItemSchema.index({ sku: 1 });
InventoryItemSchema.index({ category: 1 });
InventoryItemSchema.index({ status: 1 });
InventoryItemSchema.index({ quantity: 1, minQuantity: 1 });

export default mongoose.models.InventoryItem || mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema);