'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Palette, 
  Clock, 
  Globe, 
  Phone,
  Mail,
  MapPin,
  Calendar,
  Settings,
  Eye,
  Lock
} from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ClinicSettings {
  clinicName: string;
  clinicDescription: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
  clinicWebsite: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  licenseNumber: string;
  taxId: string;
  establishedYear: number;
  specializations: string[];
  operatingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  appointmentDuration: number;
  appointmentBuffer: number;
  currency: string;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
}

export default function PatientSettingsPage() {
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClinicSettings();
  }, []);

  const fetchClinicSettings = async () => {
    try {
      // Fetch clinic settings (now properly handles patients by fetching master admin settings)
      const response = await fetch('/api/clinic-settings');
      if (response.ok) {
        const data = await response.json();
        setClinicSettings(data.settings);
        console.log('Fetched clinic settings for patient settings:', data.settings);
      }
    } catch (error) {
      console.error('Error fetching clinic settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clinic settings...</p>
        </div>
      </div>
    );
  }

  if (!clinicSettings) {
    return (
      <div className="text-center py-12">
        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No clinic settings found</h3>
        <p className="text-gray-500">Clinic settings have not been configured yet.</p>
      </div>
    );
  }

  const primaryColor = clinicSettings.primaryColor || '#3b82f6';
  const secondaryColor = clinicSettings.secondaryColor || '#1e40af';
  const accentColor = clinicSettings.accentColor || '#10b981';

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl" style={{ 
              backgroundColor: primaryColor + '15',
              boxShadow: `0 4px 12px ${primaryColor}30`
            }}>
              <Settings className="h-8 w-8" style={{ color: primaryColor }} />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ 
                backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Clinic Information
              </h1>
              <p className="text-gray-600 mt-1">View clinic settings and branding (Read-only)</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">Read Only</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic Information */}
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" style={{ color: primaryColor }} />
                Clinic Information
              </CardTitle>
              <CardDescription>
                Basic details about the clinic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Clinic Name</Label>
                  <p className="text-lg font-semibold text-gray-800 mt-1">{clinicSettings.clinicName || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Established Year</Label>
                  <p className="text-lg font-semibold text-gray-800 mt-1">{clinicSettings.establishedYear || 'Not set'}</p>
                </div>
              </div>

              {clinicSettings.clinicDescription && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="text-gray-700 mt-1">{clinicSettings.clinicDescription}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clinicSettings.clinicPhone && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <p className="text-gray-700 mt-1">{clinicSettings.clinicPhone}</p>
                  </div>
                )}
                {clinicSettings.clinicEmail && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <p className="text-gray-700 mt-1">{clinicSettings.clinicEmail}</p>
                  </div>
                )}
              </div>

              {clinicSettings.clinicAddress && (
                <div>
                  <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </Label>
                  <p className="text-gray-700 mt-1">{clinicSettings.clinicAddress}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clinicSettings.clinicWebsite && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                    </Label>
                    <p className="text-gray-700 mt-1">{clinicSettings.clinicWebsite}</p>
                  </div>
                )}
                {clinicSettings.licenseNumber && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">License Number</Label>
                    <p className="text-gray-700 mt-1">{clinicSettings.licenseNumber}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Specializations */}
          {clinicSettings.specializations && clinicSettings.specializations.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" style={{ color: accentColor }} />
                  Specializations
                </CardTitle>
                <CardDescription>
                  Medical specialties and services offered
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {clinicSettings.specializations.map(spec => (
                    <Badge
                      key={spec}
                      variant="secondary"
                      style={{ 
                        backgroundColor: accentColor + '15',
                        color: accentColor
                      }}
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Branding & Colors */}
        <div>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" style={{ color: secondaryColor }} />
                Clinic Branding
              </CardTitle>
              <CardDescription>
                Visual identity and color scheme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {clinicSettings.logo && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Logo</Label>
                  <div className="mt-2">
                    <img src={clinicSettings.logo} alt="Clinic Logo" className="w-16 h-16 object-cover rounded-lg" />
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Primary Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: clinicSettings.primaryColor }}
                    />
                    <span className="text-sm font-mono text-gray-600">{clinicSettings.primaryColor}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Secondary Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: clinicSettings.secondaryColor }}
                    />
                    <span className="text-sm font-mono text-gray-600">{clinicSettings.secondaryColor}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Accent Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: clinicSettings.accentColor }}
                    />
                    <span className="text-sm font-mono text-gray-600">{clinicSettings.accentColor}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border" style={{ backgroundColor: clinicSettings.backgroundColor }}>
                <div className="text-sm font-medium mb-2" style={{ color: clinicSettings.textColor }}>
                  Color Preview
                </div>
                <div className="flex gap-2">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: clinicSettings.primaryColor }}
                  />
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: clinicSettings.secondaryColor }}
                  />
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: clinicSettings.accentColor }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Operating Hours */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" style={{ color: accentColor }} />
            Operating Hours
          </CardTitle>
          <CardDescription>
            Clinic working hours for each day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(clinicSettings.operatingHours).map(([day, hours]) => (
              <div key={day} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="capitalize font-medium">{day}</Label>
                  <Badge 
                    variant={hours.closed ? "destructive" : "default"}
                    style={!hours.closed ? { 
                      backgroundColor: accentColor + '15',
                      color: accentColor
                    } : undefined}
                  >
                    {hours.closed ? 'Closed' : 'Open'}
                  </Badge>
                </div>
                {!hours.closed && (
                  <div className="text-sm text-gray-600">
                    {hours.open} - {hours.close}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Social Media & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" style={{ color: primaryColor }} />
              Social Media
            </CardTitle>
            <CardDescription>
              Clinic's social media presence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(clinicSettings.socialMedia).map(([platform, url]) => (
              url && (
                <div key={platform}>
                  <Label className="text-sm font-medium text-gray-500 capitalize">{platform}</Label>
                  <p className="text-gray-700 mt-1">{url}</p>
                </div>
              )
            ))}
            {!Object.values(clinicSettings.socialMedia).some(url => url) && (
              <p className="text-gray-500 text-center py-4">No social media links configured</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" style={{ color: secondaryColor }} />
              Preferences
            </CardTitle>
            <CardDescription>
              Clinic operational settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Appointment Duration</Label>
                <p className="text-gray-700 mt-1">{clinicSettings.appointmentDuration} minutes</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Currency</Label>
                <p className="text-gray-700 mt-1">{clinicSettings.currency}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-500">Timezone</Label>
              <p className="text-gray-700 mt-1">{clinicSettings.timezone}</p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email Notifications</Label>
                  <p className="text-xs text-gray-500">Receive email updates</p>
                </div>
                <Badge variant={clinicSettings.emailNotifications ? "default" : "secondary"}>
                  {clinicSettings.emailNotifications ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-500">SMS Notifications</Label>
                  <p className="text-xs text-gray-500">Receive text messages</p>
                </div>
                <Badge variant={clinicSettings.smsNotifications ? "default" : "secondary"}>
                  {clinicSettings.smsNotifications ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Appointment Reminders</Label>
                  <p className="text-xs text-gray-500">Send patient reminders</p>
                </div>
                <Badge variant={clinicSettings.appointmentReminders ? "default" : "secondary"}>
                  {clinicSettings.appointmentReminders ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Read-only Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Read-Only View</span>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          These clinic settings are configured by the master administrator and cannot be modified by patients.
        </p>
      </div>
    </div>
  );
} 