import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Patient ID is required"],
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // Optional - can be assigned later
  },
  dateTime: {
    type: Date,
    required: [true, "Appointment date and time is required"],
  },
  notes: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled", "no-show"],
    default: "scheduled",
  },
  ehrId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EHR",
    // Will be populated when an EHR is linked to this appointment
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

appointmentSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);

export default Appointment;