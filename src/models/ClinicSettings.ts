import mongoose, { Document, Schema } from 'mongoose';

export interface IClinicSettings extends Document {
    userId: mongoose.Types.ObjectId;

    // Basic Clinic Information
    clinicName: string;
    clinicDescription?: string;
    clinicAddress?: string;
    clinicPhone?: string;
    clinicEmail?: string;
    clinicWebsite?: string;

    // Branding & Visual Identity
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;

    // Business Information
    licenseNumber?: string;
    taxId?: string;
    establishedYear?: number;
    specializations: string[];

    // Operating Hours
    operatingHours: {
        monday: { open: string; close: string; closed: boolean };
        tuesday: { open: string; close: string; closed: boolean };
        wednesday: { open: string; close: string; closed: boolean };
        thursday: { open: string; close: string; closed: boolean };
        friday: { open: string; close: string; closed: boolean };
        saturday: { open: string; close: string; closed: boolean };
        sunday: { open: string; close: string; closed: boolean };
    };

    // Social Media & Online Presence
    socialMedia: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
        youtube?: string;
    };

    // Appointment & Billing Settings
    appointmentDuration: number; // in minutes
    appointmentBuffer: number; // buffer time between appointments
    currency: string;
    timezone: string;

    // Notification Preferences
    emailNotifications: boolean;
    smsNotifications: boolean;
    appointmentReminders: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const ClinicSettingsSchema = new Schema<IClinicSettings>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },

    // Basic Clinic Information
    clinicName: {
        type: String,
        required: true,
        trim: true,
    },
    clinicDescription: {
        type: String,
        trim: true,
    },
    clinicAddress: {
        type: String,
        trim: true,
    },
    clinicPhone: {
        type: String,
        trim: true,
    },
    clinicEmail: {
        type: String,
        trim: true,
        lowercase: true,
    },
    clinicWebsite: {
        type: String,
        trim: true,
    },

    // Branding & Visual Identity
    logo: {
        type: String,
    },
    primaryColor: {
        type: String,
        default: '#3b82f6', // Blue
    },
    secondaryColor: {
        type: String,
        default: '#1e40af', // Dark Blue
    },
    accentColor: {
        type: String,
        default: '#10b981', // Green
    },
    backgroundColor: {
        type: String,
        default: '#ffffff', // White
    },
    textColor: {
        type: String,
        default: '#1f2937', // Dark Gray
    },

    // Business Information
    licenseNumber: {
        type: String,
        trim: true,
    },
    taxId: {
        type: String,
        trim: true,
    },
    establishedYear: {
        type: Number,
    },
    specializations: {
        type: [{
            type: String,
            trim: true,
        }],
        default: []
    },

    // Operating Hours
    operatingHours: {
        type: {
            monday: {
                open: { type: String, default: '09:00' },
                close: { type: String, default: '17:00' },
                closed: { type: Boolean, default: false },
            },
            tuesday: {
                open: { type: String, default: '09:00' },
                close: { type: String, default: '17:00' },
                closed: { type: Boolean, default: false },
            },
            wednesday: {
                open: { type: String, default: '09:00' },
                close: { type: String, default: '17:00' },
                closed: { type: Boolean, default: false },
            },
            thursday: {
                open: { type: String, default: '09:00' },
                close: { type: String, default: '17:00' },
                closed: { type: Boolean, default: false },
            },
            friday: {
                open: { type: String, default: '09:00' },
                close: { type: String, default: '17:00' },
                closed: { type: Boolean, default: false },
            },
            saturday: {
                open: { type: String, default: '09:00' },
                close: { type: String, default: '13:00' },
                closed: { type: Boolean, default: false },
            },
            sunday: {
                open: { type: String, default: '09:00' },
                close: { type: String, default: '13:00' },
                closed: { type: Boolean, default: true },
            },
        },
        default: () => ({
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '09:00', close: '13:00', closed: false },
            sunday: { open: '09:00', close: '13:00', closed: true },
        })
    },

    // Social Media & Online Presence
    socialMedia: {
        type: {
            facebook: { type: String, trim: true, default: '' },
            twitter: { type: String, trim: true, default: '' },
            instagram: { type: String, trim: true, default: '' },
            linkedin: { type: String, trim: true, default: '' },
            youtube: { type: String, trim: true, default: '' },
        },
        default: () => ({
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: '',
            youtube: '',
        })
    },

    // Appointment & Billing Settings
    appointmentDuration: {
        type: Number,
        default: 30, // 30 minutes
    },
    appointmentBuffer: {
        type: Number,
        default: 15, // 15 minutes buffer
    },
    currency: {
        type: String,
        default: 'USD',
    },
    timezone: {
        type: String,
        default: 'UTC',
    },

    // Notification Preferences
    emailNotifications: {
        type: Boolean,
        default: true,
    },
    smsNotifications: {
        type: Boolean,
        default: false,
    },
    appointmentReminders: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Prevent re-compilation during development
export default mongoose.models.ClinicSettings || mongoose.model<IClinicSettings>('ClinicSettings', ClinicSettingsSchema);