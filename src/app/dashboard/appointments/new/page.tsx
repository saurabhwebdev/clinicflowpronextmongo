"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppointmentForm } from "@/components/ui/appointment-form";
import { toast } from "sonner";
import { 
  Calendar, 
  Plus, 
  AlertCircle, 
  ArrowLeft, 
  User, 
  Clock,
  Users,
  ArrowRight,
  Shield
} from "lucide-react";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface ClinicSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

export default function NewAppointmentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdFromQuery = searchParams.get("patientId");
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patientIdFromQuery || "");
  const [isLoading, setIsLoading] = useState(true);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>({
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937'
  });

  // Check if user is a patient
  const isPatient = session?.user?.role === 'patient';

  useEffect(() => {
    if (isPatient) {
      // Patients can't create appointments
      toast.error("Please contact the clinic to schedule an appointment");
      router.push("/dashboard/appointments");
      return;
    }
    fetchPatients();
    fetchClinicSettings();
  }, [isPatient, router]);

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
            textColor: data.settings.textColor || '#1f2937'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching clinic settings:', error);
    }
  };

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/users?role=patient");
      if (!response.ok) throw new Error("Failed to fetch patients");
      const data = await response.json();
      setPatients(data.users || []);
      
      // If we have a patientId from query and it's valid, use it
      if (patientIdFromQuery) {
        const patientExists = data.users?.some((p: Patient) => p._id === patientIdFromQuery);
        if (patientExists) {
          setSelectedPatientId(patientIdFromQuery);
        } else {
          toast.error("Selected patient not found");
        }
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    } finally {
      setIsLoading(false);
    }
  };

  // If user is a patient, show access denied
  if (isPatient) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="hover:bg-white/80 transition-all duration-200 rounded-xl px-4 py-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl" style={{ 
                    backgroundColor: '#ef444415',
                    boxShadow: '0 4px 12px #ef444430'
                  }}>
                    <Shield className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
                    <p className="text-sm text-gray-500">Patients cannot create appointments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-8 hover:shadow-lg transition-all duration-300">
            <div className="text-center py-8">
              <div className="p-4 rounded-2xl bg-red-50/50 inline-block mb-6">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Access Restricted</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Patients cannot create appointments directly. Please contact the clinic to schedule an appointment.
              </p>
              <Button 
                variant="outline" 
                onClick={() => router.push("/dashboard/appointments")}
                className="transition-all duration-200 hover:scale-105"
                style={{ 
                  borderColor: '#ef4444',
                  color: '#ef4444'
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Appointments
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-white/80 transition-all duration-200 rounded-xl px-4 py-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl" style={{ 
                  backgroundColor: clinicSettings.primaryColor + '15',
                  boxShadow: `0 4px 12px ${clinicSettings.primaryColor}30`
                }}>
                  <Calendar className="h-6 w-6" style={{ color: clinicSettings.primaryColor }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">New Appointment</h1>
                  <p className="text-sm text-gray-500">Schedule a new appointment for a patient</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!selectedPatientId ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 rounded-xl" style={{ 
                    backgroundColor: clinicSettings.secondaryColor + '15',
                    boxShadow: `0 4px 12px ${clinicSettings.secondaryColor}30`
                  }}>
                    <Users className="h-5 w-5" style={{ color: clinicSettings.secondaryColor }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Select Patient</h3>
                    <p className="text-sm text-gray-500">Choose a patient to schedule an appointment for</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="patientId" className="text-sm font-semibold text-gray-700">
                      Patient
                    </Label>
                    <Select
                      value={selectedPatientId}
                      onValueChange={setSelectedPatientId}
                      disabled={isLoading}
                    >
                      <SelectTrigger 
                        id="patientId"
                        className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                        style={{ 
                          '--tw-ring-color': clinicSettings.secondaryColor 
                        } as React.CSSProperties}
                      >
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-0 shadow-lg">
                        {patients.map((patient) => (
                          <SelectItem key={patient._id} value={patient._id}>
                            {patient.firstName} {patient.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/dashboard/appointments")}
                      className="transition-all duration-200 hover:scale-105"
                      style={{ 
                        borderColor: '#6b7280',
                        color: '#6b7280'
                      }}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      disabled={!selectedPatientId}
                      onClick={() => router.push(`/dashboard/appointments/new?patientId=${selectedPatientId}`)}
                      className="transition-all duration-200 hover:scale-105"
                      style={{ 
                        backgroundColor: clinicSettings.primaryColor,
                        boxShadow: `0 4px 12px ${clinicSettings.primaryColor}40`
                      }}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 rounded-xl" style={{ 
                    backgroundColor: '#f59e0b15',
                    boxShadow: '0 4px 12px #f59e0b30'
                  }}>
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Quick Info</h3>
                    <p className="text-sm text-gray-500">Appointment details</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50/50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Patient Selection</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Choose a patient to proceed with appointment scheduling
                    </p>
                  </div>

                  <div className="p-3 bg-green-50/50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Next Steps</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      After selecting a patient, you'll be able to set date, time, and doctor
                    </p>
                  </div>
                </div>
              </div>

              {/* Help */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 rounded-xl" style={{ 
                    backgroundColor: '#8b5cf615',
                    boxShadow: '0 4px 12px #8b5cf630'
                  }}>
                    <AlertCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Need Help?</h3>
                    <p className="text-sm text-gray-500">Get assistance</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    If you can't find a patient, they may need to be registered first.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/patients")}
                    className="w-full justify-start transition-all duration-200 hover:scale-105"
                    style={{ 
                      borderColor: '#8b5cf6',
                      color: '#8b5cf6'
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Manage Patients
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <AppointmentForm
            patientId={selectedPatientId}
            onSuccess={() => {
              router.push("/dashboard/appointments");
              router.refresh();
            }}
          />
        )}
      </div>
    </div>
  );
}