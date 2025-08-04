"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Globe, Building, Clock, Calendar } from 'lucide-react';

interface ClinicInfo {
  clinicName: string;
  clinicDescription: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
  clinicWebsite: string;
  licenseNumber: string;
  establishedYear: number | null;
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
}

interface ClinicInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicSettings: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
  };
}

export function ClinicInfoModal({ isOpen, onClose, clinicSettings }: ClinicInfoModalProps) {
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchClinicInfo();
    }
  }, [isOpen]);

  const fetchClinicInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/clinic-info');
      if (response.ok) {
        const data = await response.json();
        setClinicInfo(data.clinicInfo);
      }
    } catch (error) {
      console.error('Error fetching clinic info:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDayStatus = (day: { open: string; close: string; closed: boolean }) => {
    if (day.closed) return 'Closed';
    return `${formatTime(day.open)} - ${formatTime(day.close)}`;
  };

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: clinicSettings.backgroundColor }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: clinicSettings.textColor }}>
            Clinic Information
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" 
                   style={{ borderColor: clinicSettings.primaryColor }}></div>
              <p style={{ color: clinicSettings.textColor }}>Loading clinic information...</p>
            </div>
          </div>
        ) : clinicInfo ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card style={{ backgroundColor: clinicSettings.backgroundColor }}>
              <CardHeader>
                <CardTitle style={{ color: clinicSettings.textColor }}>
                  <Building className="h-5 w-5 inline mr-2" style={{ color: clinicSettings.primaryColor }} />
                  {clinicInfo.clinicName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {clinicInfo.clinicDescription !== 'Data set pending' && (
                  <p style={{ color: clinicSettings.textColor }}>
                    {clinicInfo.clinicDescription}
                  </p>
                )}
                
                {clinicInfo.establishedYear && (
                  <p className="text-sm" style={{ color: clinicSettings.textColor }}>
                    <strong>Established:</strong> {clinicInfo.establishedYear}
                  </p>
                )}

                {clinicInfo.specializations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2" style={{ color: clinicSettings.textColor }}>
                      Specializations:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {clinicInfo.specializations.map((spec, index) => (
                        <Badge 
                          key={index}
                          style={{ 
                            backgroundColor: clinicSettings.secondaryColor,
                            color: 'white'
                          }}
                        >
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card style={{ backgroundColor: clinicSettings.backgroundColor }}>
              <CardHeader>
                <CardTitle style={{ color: clinicSettings.textColor }}>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {clinicInfo.clinicPhone !== 'Data set pending' && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4" style={{ color: clinicSettings.primaryColor }} />
                    <span style={{ color: clinicSettings.textColor }}>
                      {clinicInfo.clinicPhone}
                    </span>
                  </div>
                )}

                {clinicInfo.clinicEmail !== 'Data set pending' && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4" style={{ color: clinicSettings.primaryColor }} />
                    <span style={{ color: clinicSettings.textColor }}>
                      {clinicInfo.clinicEmail}
                    </span>
                  </div>
                )}

                {clinicInfo.clinicAddress !== 'Data set pending' && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4" style={{ color: clinicSettings.primaryColor }} />
                    <span style={{ color: clinicSettings.textColor }}>
                      {clinicInfo.clinicAddress}
                    </span>
                  </div>
                )}

                {clinicInfo.clinicWebsite !== 'Data set pending' && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4" style={{ color: clinicSettings.primaryColor }} />
                    <a 
                      href={clinicInfo.clinicWebsite.startsWith('http') ? clinicInfo.clinicWebsite : `https://${clinicInfo.clinicWebsite}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: clinicSettings.primaryColor }}
                      className="hover:underline"
                    >
                      {clinicInfo.clinicWebsite}
                    </a>
                  </div>
                )}

                {clinicInfo.licenseNumber !== 'Data set pending' && (
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4" style={{ color: clinicSettings.primaryColor }} />
                    <span style={{ color: clinicSettings.textColor }}>
                      <strong>License:</strong> {clinicInfo.licenseNumber}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card style={{ backgroundColor: clinicSettings.backgroundColor }}>
              <CardHeader>
                <CardTitle style={{ color: clinicSettings.textColor }}>
                  <Clock className="h-5 w-5 inline mr-2" style={{ color: clinicSettings.primaryColor }} />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {daysOfWeek.map(({ key, label }) => {
                    const day = clinicInfo.operatingHours[key as keyof typeof clinicInfo.operatingHours];
                    return (
                      <div key={key} className="flex justify-between items-center py-1">
                        <span className="font-medium" style={{ color: clinicSettings.textColor }}>
                          {label}
                        </span>
                        <span style={{ color: clinicSettings.textColor }}>
                          {getDayStatus(day)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <Building className="h-12 w-12 mx-auto mb-4" style={{ color: clinicSettings.primaryColor }} />
            <p style={{ color: clinicSettings.textColor }}>
              Unable to load clinic information. Please try again later.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 