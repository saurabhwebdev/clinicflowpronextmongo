import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryTransaction extends Document {
  itemId: mongoose.Types.ObjectId;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  notes?: string;
  reference?: string; // Bill ID, Purchase Order, etc.
  performedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const InventoryTransactionSchema = new Schema<IInventoryTransaction>({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true,
  },
  type: {
    type: String,
    enum: ['in', 'out', 'adjustment'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  previousQuantity: {
    type: Number,
    required: true,
  },
  newQuantity: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  reference: {
    type: String,
    trim: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Indexes for better performance
InventoryTransactionSchema.index({ itemId: 1, createdAt: -1 });
InventoryTransactionSchema.index({ type: 1 });
InventoryTransactionSchema.index({ performedBy: 1 });

export default mongoose.models.InventoryTransaction || mongoose.model<IInventoryTransaction>('InventoryTransaction', InventoryTransactionSchema);