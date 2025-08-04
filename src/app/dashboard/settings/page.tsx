'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Palette, 
  Clock, 
  Globe, 
  Bell, 
  Save,
  Upload,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Settings,
  Stethoscope
} from 'lucide-react';
import { toast } from 'sonner';
import { getSupportedCurrencies } from '@/lib/currency';

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

const defaultSettings: ClinicSettings = {
  clinicName: '',
  clinicDescription: '',
  clinicAddress: '',
  clinicPhone: '',
  clinicEmail: '',
  clinicWebsite: '',
  logo: '',
  primaryColor: '#3b82f6',
  secondaryColor: '#1e40af',
  accentColor: '#10b981',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  licenseNumber: '',
  taxId: '',
  establishedYear: new Date().getFullYear(),
  specializations: [],
  operatingHours: {
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '09:00', close: '13:00', closed: false },
    sunday: { open: '09:00', close: '13:00', closed: true },
  },
  socialMedia: {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
  },
  appointmentDuration: 30,
  appointmentBuffer: 15,
  currency: 'USD',
  timezone: 'UTC',
  emailNotifications: true,
  smsNotifications: false,
  appointmentReminders: true,
};

const commonSpecializations = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'Neurology',
  'Psychiatry',
  'Gynecology',
  'Ophthalmology',
  'ENT',
  'Dentistry',
  'Physiotherapy',
];

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<ClinicSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSpecialization, setNewSpecialization] = useState('');
  
  const currencies = getSupportedCurrencies();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/clinic-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings({ ...defaultSettings, ...data.settings });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/clinic-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedSettings = (parent: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: { ...prev[parent as keyof ClinicSettings], [field]: value }
    }));
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !settings.specializations.includes(newSpecialization.trim())) {
      setSettings(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()]
      }));
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (spec: string) => {
    setSettings(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== spec)
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading settings...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-600" />
          Clinic Settings
        </h1>
        <p className="text-gray-600 mt-2">
          Customize your clinic's information, branding, and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic Information */}
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential details about your clinic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clinicName">Clinic Name *</Label>
                  <Input
                    id="clinicName"
                    value={settings.clinicName}
                    onChange={(e) => updateSettings('clinicName', e.target.value)}
                    placeholder="Enter clinic name"
                  />
                </div>
                <div>
                  <Label htmlFor="establishedYear">Established Year</Label>
                  <Input
                    id="establishedYear"
                    type="number"
                    value={settings.establishedYear}
                    onChange={(e) => updateSettings('establishedYear', parseInt(e.target.value))}
                    placeholder="2020"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="clinicDescription">Description</Label>
                <Textarea
                  id="clinicDescription"
                  value={settings.clinicDescription}
                  onChange={(e) => updateSettings('clinicDescription', e.target.value)}
                  placeholder="Describe your clinic, services, and mission..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clinicPhone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="clinicPhone"
                      value={settings.clinicPhone}
                      onChange={(e) => updateSettings('clinicPhone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="clinicEmail">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="clinicEmail"
                      type="email"
                      value={settings.clinicEmail}
                      onChange={(e) => updateSettings('clinicEmail', e.target.value)}
                      placeholder="contact@clinic.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="clinicAddress">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="clinicAddress"
                    value={settings.clinicAddress}
                    onChange={(e) => updateSettings('clinicAddress', e.target.value)}
                    placeholder="123 Medical Center Dr, City, State 12345"
                    rows={3}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clinicWebsite">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="clinicWebsite"
                      value={settings.clinicWebsite}
                      onChange={(e) => updateSettings('clinicWebsite', e.target.value)}
                      placeholder="https://www.clinic.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={settings.licenseNumber}
                    onChange={(e) => updateSettings('licenseNumber', e.target.value)}
                    placeholder="Medical license number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specializations */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-green-600" />
                Specializations
              </CardTitle>
              <CardDescription>
                Medical specialties and services offered
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={newSpecialization} onValueChange={setNewSpecialization}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonSpecializations
                      .filter(spec => !settings.specializations.includes(spec))
                      .map(spec => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button onClick={addSpecialization} disabled={!newSpecialization}>
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {settings.specializations.map(spec => (
                  <Badge
                    key={spec}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100 hover:text-red-800"
                    onClick={() => removeSpecialization(spec)}
                  >
                    {spec} ×
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Branding & Colors */}
        <div>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-600" />
                Branding
              </CardTitle>
              <CardDescription>
                Customize your clinic's visual identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {settings.logo ? (
                      <img src={settings.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Building2 className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => updateSettings('primaryColor', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => updateSettings('primaryColor', e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => updateSettings('secondaryColor', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => updateSettings('secondaryColor', e.target.value)}
                      placeholder="#1e40af"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="accentColor"
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => updateSettings('accentColor', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.accentColor}
                      onChange={(e) => updateSettings('accentColor', e.target.value)}
                      placeholder="#10b981"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border" style={{ backgroundColor: settings.backgroundColor }}>
                <div className="text-sm font-medium mb-2" style={{ color: settings.textColor }}>
                  Preview
                </div>
                <div className="flex gap-2">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: settings.primaryColor }}
                  />
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: settings.secondaryColor }}
                  />
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: settings.accentColor }}
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
            <Clock className="h-5 w-5 text-orange-600" />
            Operating Hours
          </CardTitle>
          <CardDescription>
            Set your clinic's working hours for each day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(settings.operatingHours).map(([day, hours]) => (
              <div key={day} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="capitalize font-medium">{day}</Label>
                  <Switch
                    checked={!hours.closed}
                    onCheckedChange={(checked) => 
                      updateNestedSettings('operatingHours', day, { ...hours, closed: !checked })
                    }
                  />
                </div>
                {!hours.closed && (
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={hours.open}
                      onChange={(e) => 
                        updateNestedSettings('operatingHours', day, { ...hours, open: e.target.value })
                      }
                      className="flex-1"
                    />
                    <Input
                      type="time"
                      value={hours.close}
                      onChange={(e) => 
                        updateNestedSettings('operatingHours', day, { ...hours, close: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                )}
                {hours.closed && (
                  <div className="text-sm text-gray-500 text-center py-2">Closed</div>
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
              <Globe className="h-5 w-5 text-blue-600" />
              Social Media
            </CardTitle>
            <CardDescription>
              Connect your social media profiles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <div className="relative">
                <Facebook className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
                <Input
                  id="facebook"
                  value={settings.socialMedia.facebook}
                  onChange={(e) => updateNestedSettings('socialMedia', 'facebook', e.target.value)}
                  placeholder="https://facebook.com/clinic"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <div className="relative">
                <Twitter className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                <Input
                  id="twitter"
                  value={settings.socialMedia.twitter}
                  onChange={(e) => updateNestedSettings('socialMedia', 'twitter', e.target.value)}
                  placeholder="https://twitter.com/clinic"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <div className="relative">
                <Instagram className="absolute left-3 top-3 h-4 w-4 text-pink-600" />
                <Input
                  id="instagram"
                  value={settings.socialMedia.instagram}
                  onChange={(e) => updateNestedSettings('socialMedia', 'instagram', e.target.value)}
                  placeholder="https://instagram.com/clinic"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-3 h-4 w-4 text-blue-700" />
                <Input
                  id="linkedin"
                  value={settings.socialMedia.linkedin}
                  onChange={(e) => updateNestedSettings('socialMedia', 'linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/clinic"
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-600" />
              Preferences
            </CardTitle>
            <CardDescription>
              Configure your clinic's operational settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appointmentDuration">Appointment Duration (min)</Label>
                <Select
                  value={settings.appointmentDuration.toString()}
                  onValueChange={(value) => updateSettings('appointmentDuration', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={settings.currency}
                  onValueChange={(value) => updateSettings('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => updateSettings('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map(tz => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive email updates</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSettings('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Receive text messages</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => updateSettings('smsNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Appointment Reminders</Label>
                  <p className="text-sm text-gray-500">Send patient reminders</p>
                </div>
                <Switch
                  checked={settings.appointmentReminders}
                  onCheckedChange={(checked) => updateSettings('appointmentReminders', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}