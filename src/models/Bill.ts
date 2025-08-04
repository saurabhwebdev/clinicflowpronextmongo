import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      // Fallback default if not provided
      return `BILL-${Date.now().toString().slice(-6)}`;
    }
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
  },
  items: [{
    description: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  }],
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'insurance', 'bank_transfer', 'other'],
  },
  paymentDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Generate bill number automatically (backup to manual generation in API)
billSchema.pre('save', async function(next) {
  if (!this.billNumber || this.billNumber.includes('Date.now()')) {
    try {
      const count = await this.constructor.countDocuments();
      this.billNumber = `BILL-${String(count + 1).padStart(6, '0')}`;
      console.log('Generated bill number in pre-save hook:', this.billNumber);
    } catch (error) {
      console.error('Error generating bill number in pre-save hook:', error);
      // Fallback to timestamp-based number if count fails
      const timestamp = Date.now().toString().slice(-6);
      this.billNumber = `BILL-${timestamp}`;
      console.log('Using fallback bill number:', this.billNumber);
    }
  }
  next();
});

export default mongoose.models.Bill || mongoose.model('Bill', billSchema);