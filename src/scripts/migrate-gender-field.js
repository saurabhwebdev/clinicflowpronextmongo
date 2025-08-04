const mongoose = require('mongoose');
require('dotenv').config();

// Define the User schema and model inline since we can't import ES modules
const UserSchema = new mongoose.Schema({
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
    select: false,
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

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function migrateGenderField() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all patients without gender field
    const patientsWithoutGender = await User.find({ 
      role: 'patient',
      gender: { $exists: false }
    });

    console.log(`Found ${patientsWithoutGender.length} patients without gender field`);

    // Update all patients to have a default gender value
    const updateResult = await User.updateMany(
      { 
        role: 'patient',
        gender: { $exists: false }
      },
      { 
        $set: { gender: 'other' } // Set default gender to 'other'
      }
    );

    console.log(`Updated ${updateResult.modifiedCount} patients with default gender`);

    // Verify the update
    const updatedPatients = await User.find({ role: 'patient' }).select('firstName lastName gender');
    console.log('Updated patients:', updatedPatients);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateGenderField(); 