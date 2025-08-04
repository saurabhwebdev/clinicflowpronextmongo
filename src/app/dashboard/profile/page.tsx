'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { User, Mail, Phone, MapPin, Globe, CreditCard, Building, Edit, Save, X, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { getSupportedCurrencies } from '@/lib/currency';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string;
  address: string;
  country: string;
  currency: string;
  clinicName: string;
  clinicProfile: string;
  dateOfBirth?: string;
  age?: number | null;
  gender?: string;
}

interface ClinicSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  clinicName: string;
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({});
  const [tempValues, setTempValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>({
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    clinicName: 'Clinic'
  });

  const currencies = getSupportedCurrencies();

  // Fetch clinic settings
  useEffect(() => {
    const fetchClinicSettings = async () => {
      try {
        const response = await fetch('/api/clinic-settings');
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            setClinicSettings({
              primaryColor: data.settings.primaryColor || '#3b82f6',
              secondaryColor: data.settings.secondaryColor || '#1e40af',
              accentColor: data.settings.accentColor || '#10b981',
              backgroundColor: data.settings.backgroundColor || '#ffffff',
              textColor: data.settings.textColor || '#1f2937',
              clinicName: data.settings.clinicName || 'Clinic'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching clinic settings:', error);
      }
    };

    fetchClinicSettings();
  }, []);

  // Fetch fresh profile data from the database
  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            setProfile(data.user);
          } else {
            // Fallback to session data if API fails
            setProfile({
              firstName: session.user.firstName || '',
              lastName: session.user.lastName || '',
              email: session.user.email || '',
              role: session.user.role || 'doctor',
              phone: session.user.phone || '',
              address: session.user.address || '',
              country: session.user.country || '',
              currency: session.user.currency || 'USD',
              clinicName: session.user.clinicName || '',
              clinicProfile: session.user.clinicProfile || '',
              dateOfBirth: session.user.dateOfBirth || '',
              age: session.user.age || null,
              gender: session.user.gender || ''
            });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          // Fallback to session data
          setProfile({
            firstName: session.user.firstName || '',
            lastName: session.user.lastName || '',
            email: session.user.email || '',
            role: session.user.role || 'doctor',
            phone: session.user.phone || '',
            address: session.user.address || '',
            country: session.user.country || '',
            currency: session.user.currency || 'USD',
            clinicName: session.user.clinicName || '',
            clinicProfile: session.user.clinicProfile || '',
            dateOfBirth: session.user.dateOfBirth || '',
            age: session.user.age || null,
            gender: session.user.gender || ''
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [session]);

  const startEditing = (section: string, currentValues: any) => {
    setEditingSections(prev => ({ ...prev, [section]: true }));
    setTempValues(prev => ({ ...prev, [section]: currentValues }));
  };

  const cancelEditing = (section: string) => {
    setEditingSections(prev => ({ ...prev, [section]: false }));
    setTempValues(prev => ({ ...prev, [section]: undefined }));
  };

  const saveSection = async (section: string, data: any) => {
    setSaving(prev => ({ ...prev, [section]: true }));

    try {
      console.log('Saving section:', section, 'with data:', data);

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('Save response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update profile');
      }

      // Update local state with the returned data
      setProfile(prev => prev ? { ...prev, ...responseData.user } : null);

      // Fetch fresh user data and update session
      const refreshResponse = await fetch('/api/user/refresh-session', {
        method: 'POST',
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        // Update session with fresh data from database
        await update(refreshData.user);
      }

      // Reset editing state
      setEditingSections(prev => ({ ...prev, [section]: false }));
      setTempValues(prev => ({ ...prev, [section]: undefined }));

      toast.success('Profile updated successfully');

      // If currency was updated, force a page reload to refresh session
      if (data.currency) {
        toast.success('Currency updated! Refreshing page...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        return;
      }

      // Refresh profile data to ensure consistency
      setTimeout(async () => {
        try {
          const freshResponse = await fetch('/api/user/profile');
          if (freshResponse.ok) {
            const freshData = await freshResponse.json();
            setProfile(freshData.user);
          }
        } catch (error) {
          console.error('Error refreshing profile:', error);
        }
      }, 1000);

    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(prev => ({ ...prev, [section]: false }));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="flex items-center justify-center h-full">Profile not found</div>;
  }

  return (
    <div style={{ backgroundColor: clinicSettings.backgroundColor }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: clinicSettings.textColor }}>Your Profile</h1>
        <p className="mt-2" style={{ color: clinicSettings.textColor }}>
          View and manage your account information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card style={{ backgroundColor: clinicSettings.backgroundColor }}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle style={{ color: clinicSettings.textColor }}>Personal Information</CardTitle>
                <CardDescription style={{ color: clinicSettings.textColor }}>Your basic account details</CardDescription>
              </div>
              {!editingSections.personal && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing('personal', {
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    phone: profile.phone,
                    dateOfBirth: profile.dateOfBirth,
                    gender: profile.gender
                  })}
                  style={{ color: clinicSettings.primaryColor }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {editingSections.personal ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" style={{ color: clinicSettings.textColor }}>First Name</Label>
                      <Input
                        id="firstName"
                        value={tempValues.personal?.firstName || ''}
                        onChange={(e) => setTempValues(prev => ({
                          ...prev,
                          personal: { ...prev.personal, firstName: e.target.value }
                        }))}
                        style={{ 
                          borderColor: clinicSettings.primaryColor,
                          '--tw-ring-color': clinicSettings.primaryColor 
                        } as React.CSSProperties}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" style={{ color: clinicSettings.textColor }}>Last Name</Label>
                      <Input
                        id="lastName"
                        value={tempValues.personal?.lastName || ''}
                        onChange={(e) => setTempValues(prev => ({
                          ...prev,
                          personal: { ...prev.personal, lastName: e.target.value }
                        }))}
                        style={{ 
                          borderColor: clinicSettings.primaryColor,
                          '--tw-ring-color': clinicSettings.primaryColor 
                        } as React.CSSProperties}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" style={{ color: clinicSettings.textColor }}>Phone</Label>
                    <Input
                      id="phone"
                      value={tempValues.personal?.phone || ''}
                      onChange={(e) => setTempValues(prev => ({
                        ...prev,
                        personal: { ...prev.personal, phone: e.target.value }
                      }))}
                      style={{ 
                        borderColor: clinicSettings.primaryColor,
                        '--tw-ring-color': clinicSettings.primaryColor 
                      } as React.CSSProperties}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateOfBirth" style={{ color: clinicSettings.textColor }}>Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={tempValues.personal?.dateOfBirth ? new Date(tempValues.personal.dateOfBirth).toISOString().split('T')[0] : ''}
                        onChange={(e) => setTempValues(prev => ({
                          ...prev,
                          personal: { ...prev.personal, dateOfBirth: e.target.value }
                        }))}
                        style={{ 
                          borderColor: clinicSettings.primaryColor,
                          '--tw-ring-color': clinicSettings.primaryColor 
                        } as React.CSSProperties}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender" style={{ color: clinicSettings.textColor }}>Gender</Label>
                      <Select
                        value={tempValues.personal?.gender || ''}
                        onValueChange={(value) => setTempValues(prev => ({
                          ...prev,
                          personal: { ...prev.personal, gender: value }
                        }))}
                      >
                        <SelectTrigger style={{ 
                          borderColor: clinicSettings.primaryColor,
                          '--tw-ring-color': clinicSettings.primaryColor 
                        } as React.CSSProperties}>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => saveSection('personal', tempValues.personal)}
                      disabled={saving.personal}
                      style={{ 
                        backgroundColor: clinicSettings.primaryColor,
                        borderColor: clinicSettings.primaryColor
                      }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving.personal ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelEditing('personal')}
                      disabled={saving.personal}
                      style={{ 
                        borderColor: clinicSettings.primaryColor,
                        color: clinicSettings.primaryColor 
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full" style={{ backgroundColor: `${clinicSettings.primaryColor}20` }}>
                      <User className="h-6 w-6" style={{ color: clinicSettings.primaryColor }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: clinicSettings.textColor }}>Full Name</p>
                      <p className="font-medium" style={{ color: clinicSettings.textColor }}>{profile.firstName} {profile.lastName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full" style={{ backgroundColor: `${clinicSettings.primaryColor}20` }}>
                      <Mail className="h-6 w-6" style={{ color: clinicSettings.primaryColor }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: clinicSettings.textColor }}>Email</p>
                      <p className="font-medium" style={{ color: clinicSettings.textColor }}>{profile.email}</p>
                      <p className="text-xs" style={{ color: clinicSettings.textColor }}>Email cannot be changed</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full" style={{ backgroundColor: `${clinicSettings.primaryColor}20` }}>
                      <User className="h-6 w-6" style={{ color: clinicSettings.primaryColor }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: clinicSettings.textColor }}>Role</p>
                      <p className="font-medium capitalize" style={{ color: clinicSettings.textColor }}>{profile.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full" style={{ backgroundColor: `${clinicSettings.primaryColor}20` }}>
                      <Phone className="h-6 w-6" style={{ color: clinicSettings.primaryColor }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: clinicSettings.textColor }}>Phone</p>
                      <p className="font-medium" style={{ color: clinicSettings.textColor }}>{profile.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full" style={{ backgroundColor: `${clinicSettings.primaryColor}20` }}>
                      <Calendar className="h-6 w-6" style={{ color: clinicSettings.primaryColor }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: clinicSettings.textColor }}>Date of Birth</p>
                      <p className="font-medium" style={{ color: clinicSettings.textColor }}>
                        {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </p>
                      {profile.age !== null && profile.age !== undefined && (
                        <p className="text-xs" style={{ color: clinicSettings.textColor }}>
                          Age: {profile.age} years
                        </p>
                      )}
                    </div>
                  </div>

                  {profile.gender && (
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full" style={{ backgroundColor: `${clinicSettings.primaryColor}20` }}>
                        <User className="h-6 w-6" style={{ color: clinicSettings.primaryColor }} />
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: clinicSettings.textColor }}>Gender</p>
                        <p className="font-medium capitalize" style={{ color: clinicSettings.textColor }}>{profile.gender}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="mb-8" style={{ backgroundColor: clinicSettings.backgroundColor }}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle style={{ color: clinicSettings.textColor }}>Location & Currency</CardTitle>
                <CardDescription style={{ color: clinicSettings.textColor }}>Your location and payment settings</CardDescription>
              </div>
              {!editingSections.location && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing('location', {
                    address: profile.address,
                    country: profile.country,
                    currency: profile.currency
                  })}
                  style={{ color: clinicSettings.primaryColor }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {editingSections.location ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address" style={{ color: clinicSettings.textColor }}>Address</Label>
                    <Textarea
                      id="address"
                      value={tempValues.location?.address || ''}
                      onChange={(e) => setTempValues(prev => ({
                        ...prev,
                        location: { ...prev.location, address: e.target.value }
                      }))}
                      rows={3}
                      style={{ 
                        borderColor: clinicSettings.primaryColor,
                        '--tw-ring-color': clinicSettings.primaryColor 
                      } as React.CSSProperties}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country" style={{ color: clinicSettings.textColor }}>Country</Label>
                      <Input
                        id="country"
                        value={tempValues.location?.country || ''}
                        onChange={(e) => setTempValues(prev => ({
                          ...prev,
                          location: { ...prev.location, country: e.target.value }
                        }))}
                        style={{ 
                          borderColor: clinicSettings.primaryColor,
                          '--tw-ring-color': clinicSettings.primaryColor 
                        } as React.CSSProperties}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency" style={{ color: clinicSettings.textColor }}>Currency</Label>
                      <Select
                        value={tempValues.location?.currency || ''}
                        onValueChange={(value) => setTempValues(prev => ({
                          ...prev,
                          location: { ...prev.location, currency: value }
                        }))}
                      >
                        <SelectTrigger style={{ 
                          borderColor: clinicSettings.primaryColor,
                          '--tw-ring-color': clinicSettings.primaryColor 
                        } as React.CSSProperties}>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px] overflow-y-auto">
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.symbol} {currency.name} ({currency.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => saveSection('location', tempValues.location)}
                      disabled={saving.location}
                      style={{ 
                        backgroundColor: clinicSettings.primaryColor,
                        borderColor: clinicSettings.primaryColor
                      }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving.location ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelEditing('location')}
                      disabled={saving.location}
                      style={{ 
                        borderColor: clinicSettings.primaryColor,
                        color: clinicSettings.primaryColor 
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full" style={{ backgroundColor: `${clinicSettings.primaryColor}20` }}>
                      <MapPin className="h-6 w-6" style={{ color: clinicSettings.primaryColor }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: clinicSettings.textColor }}>Address</p>
                      <p className="font-medium" style={{ color: clinicSettings.textColor }}>{profile.address || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full" style={{ backgroundColor: `${clinicSettings.primaryColor}20` }}>
                      <Globe className="h-6 w-6" style={{ color: clinicSettings.primaryColor }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: clinicSettings.textColor }}>Country</p>
                      <p className="font-medium" style={{ color: clinicSettings.textColor }}>{profile.country || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full" style={{ backgroundColor: `${clinicSettings.primaryColor}20` }}>
                      <CreditCard className="h-6 w-6" style={{ color: clinicSettings.primaryColor }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: clinicSettings.textColor }}>Currency</p>
                      <p className="font-medium" style={{ color: clinicSettings.textColor }}>
                        {currencies.find(c => c.code === profile.currency)?.name || profile.currency} ({profile.currency})
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {profile.role === 'doctor' && (
            <Card style={{ backgroundColor: clinicSettings.backgroundColor }}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle style={{ color: clinicSettings.textColor }}>Clinic Information</CardTitle>
                  <CardDescription style={{ color: clinicSettings.textColor }}>Your practice details</CardDescription>
                </div>
                {!editingSections.clinic && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing('clinic', {
                      clinicName: profile.clinicName,
                      clinicProfile: profile.clinicProfile
                    })}
                    style={{ color: clinicSettings.primaryColor }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {editingSections.clinic ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="clinicName" style={{ color: clinicSettings.textColor }}>Clinic Name</Label>
                      <Input
                        id="clinicName"
                        value={tempValues.clinic?.clinicName || ''}
                        onChange={(e) => setTempValues(prev => ({
                          ...prev,
                          clinic: { ...prev.clinic, clinicName: e.target.value }
                        }))}
                        style={{ 
                          borderColor: clinicSettings.primaryColor,
                          '--tw-ring-color': clinicSettings.primaryColor 
                        } as React.CSSProperties}
                      />
                    </div>
                    <div>
                      <Label htmlFor="clinicProfile" style={{ color: clinicSettings.textColor }}>Clinic Profile</Label>
                      <Textarea
                        id="clinicProfile"
                        value={tempValues.clinic?.clinicProfile || ''}
                        onChange={(e) => setTempValues(prev => ({
                          ...prev,
                          clinic: { ...prev.clinic, clinicProfile: e.target.value }
                        }))}
                        rows={4}
                        placeholder="Describe your clinic, services, specializations..."
                        style={{ 
                          borderColor: clinicSettings.primaryColor,
                          '--tw-ring-color': clinicSettings.primaryColor 
                        } as React.CSSProperties}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => saveSection('clinic', tempValues.clinic)}
                        disabled={saving.clinic}
                        style={{ 
                          backgroundColor: clinicSettings.primaryColor,
                          borderColor: clinicSettings.primaryColor
                        }}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving.clinic ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelEditing('clinic')}
                        disabled={saving.clinic}
                        style={{ 
                          borderColor: clinicSettings.primaryColor,
                          color: clinicSettings.primaryColor 
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full" style={{ backgroundColor: `${clinicSettings.primaryColor}20` }}>
                        <Building className="h-6 w-6" style={{ color: clinicSettings.primaryColor }} />
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: clinicSettings.textColor }}>Clinic Name</p>
                        <p className="font-medium" style={{ color: clinicSettings.textColor }}>{profile.clinicName || 'Not provided'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm mb-2" style={{ color: clinicSettings.textColor }}>Clinic Profile</p>
                      <p style={{ color: clinicSettings.textColor }}>{profile.clinicProfile || 'No description provided'}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}