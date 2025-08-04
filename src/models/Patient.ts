import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: [true, "Date of birth is required"],
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: [true, "Gender is required"],
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  medicalHistory: {
    conditions: [String],
    allergies: [String],
    medications: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

patientSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

const Patient = mongoose.models.Patient || mongoose.model("Patient", patientSchema);

export default Patient;