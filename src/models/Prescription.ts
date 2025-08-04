import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema({
  drugName: {
    type: String,
    required: [true, "Drug name is required"],
    trim: true,
  },
  dosage: {
    type: String,
    required: [true, "Dosage is required"],
    trim: true,
  },
  frequency: {
    type: String,
    required: [true, "Frequency is required"],
    trim: true,
  },
  duration: {
    type: String,
    required: [true, "Duration is required"],
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
});

const prescriptionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: [true, "Patient ID is required"],
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Doctor ID is required"],
  },
  ehrId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EHR",
    // Optional - can be linked to an EHR record
  },
  prescriptionDate: {
    type: Date,
    required: [true, "Prescription date is required"],
    default: Date.now,
  },
  medications: [medicationSchema],
  notes: {
    type: String,
    trim: true,
  },
  attachment: {
    name: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active",
    required: true,
  },
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

prescriptionSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

const Prescription = mongoose.models.Prescription || mongoose.model("Prescription", prescriptionSchema);

export default Prescription;