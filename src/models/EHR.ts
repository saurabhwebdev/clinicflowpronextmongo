import mongoose from "mongoose";

const ehrSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Patient ID is required"],
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    // Optional - can be linked to an appointment
  },
  prescriptionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prescription",
    // Optional - can be linked to prescriptions
  }],
  visitDate: {
    type: Date,
    required: [true, "Visit date is required"],
    default: Date.now,
  },
  vitals: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
    },
    heartRate: Number,
    respiratoryRate: Number,
    temperature: Number,
    oxygenSaturation: Number,
    height: Number,
    weight: Number,
  },
  diagnosis: {
    type: String,
    required: [true, "Diagnosis is required"],
  },
  diagnosisSummary: {
    type: String,
    required: [true, "Diagnosis summary is required"],
  },
  notes: {
    subjective: String,
    objective: String,
    assessment: String,
    plan: String,
    additionalNotes: String,
  },
  tags: [String],
  attachments: [
    {
      name: String,
      fileUrl: String,
      fileType: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ehrSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

const EHR = mongoose.models.EHR || mongoose.model("EHR", ehrSchema);

export default EHR;