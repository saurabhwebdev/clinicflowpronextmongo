"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  ArrowLeft,
  Save,
  Plus,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon
} from "lucide-react";

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
}

interface ClinicSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

interface AppointmentFormProps {
  patientId: string;
  initialData?: any;
  onSuccess?: () => void;
}

export function AppointmentForm({
  patientId,
  initialData,
  onSuccess,
}: AppointmentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>({
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937'
  });
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    patientId: patientId,
    doctorId: initialData?.doctorId?._id || "",
    dateTime: initialData
      ? format(new Date(initialData.dateTime), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    notes: initialData?.notes || "",
    status: initialData?.status || "scheduled",
  });

  useEffect(() => {
    fetchDoctors();
    fetchClinicSettings();
  }, []);

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

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors");
      if (!response.ok) throw new Error("Failed to fetch doctors");
      const data = await response.json();
      // API returns { doctors: [...] } so we need to extract the doctors array
      if (data && data.doctors && Array.isArray(data.doctors)) {
        setDoctors(data.doctors);
      } else {
        setDoctors([]);
        console.error("Unexpected API response format:", data);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors");
      setDoctors([]);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value === "none" ? "" : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = isEditMode
        ? `/api/appointments/${initialData._id}`
        : "/api/appointments";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save appointment");
      }

      toast.success(
        isEditMode
          ? "Appointment updated successfully"
          : "Appointment created successfully"
      );

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/dashboard/patients/${patientId}`);
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save appointment");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "scheduled":
        return {
          icon: <Calendar className="h-4 w-4 text-blue-600" />,
          color: '#3b82f6',
          bgColor: '#dbeafe'
        };
      case "completed":
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          color: '#10b981',
          bgColor: '#d1fae5'
        };
      case "cancelled":
        return {
          icon: <XCircle className="h-4 w-4 text-red-600" />,
          color: '#ef4444',
          bgColor: '#fee2e2'
        };
      case "no-show":
        return {
          icon: <AlertCircle className="h-4 w-4 text-yellow-600" />,
          color: '#f59e0b',
          bgColor: '#fef3c7'
        };
      default:
        return {
          icon: <Calendar className="h-4 w-4" />,
          color: '#6b7280',
          bgColor: '#f3f4f6'
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
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
                  <CalendarIcon className="h-6 w-6" style={{ color: clinicSettings.primaryColor }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {isEditMode ? "Edit Appointment" : "Schedule New Appointment"}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {isEditMode
                      ? "Update appointment details and status"
                      : "Create a new appointment for the patient"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date & Time Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-xl" style={{ 
                  backgroundColor: clinicSettings.secondaryColor + '15',
                  boxShadow: `0 4px 12px ${clinicSettings.secondaryColor}30`
                }}>
                  <Clock className="h-5 w-5" style={{ color: clinicSettings.secondaryColor }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Date & Time</h3>
                  <p className="text-sm text-gray-500">Select appointment date and time</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dateTime" className="text-sm font-semibold text-gray-700">
                    Appointment Date & Time
                  </Label>
                  <Input
                    id="dateTime"
                    name="dateTime"
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={handleInputChange}
                    required
                    className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                    style={{ 
                      '--tw-ring-color': clinicSettings.secondaryColor 
                    } as React.CSSProperties}
                  />
                </div>
              </div>
            </div>

            {/* Doctor Assignment */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-xl" style={{ 
                  backgroundColor: clinicSettings.accentColor + '15',
                  boxShadow: `0 4px 12px ${clinicSettings.accentColor}30`
                }}>
                  <Stethoscope className="h-5 w-5" style={{ color: clinicSettings.accentColor }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Doctor Assignment</h3>
                  <p className="text-sm text-gray-500">Assign a doctor to this appointment</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="doctorId" className="text-sm font-semibold text-gray-700">
                  Select Doctor
                </Label>
                <Select
                  value={formData.doctorId}
                  onValueChange={(value) => handleSelectChange("doctorId", value)}
                >
                  <SelectTrigger 
                    id="doctorId"
                    className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                    style={{ 
                      '--tw-ring-color': clinicSettings.accentColor 
                    } as React.CSSProperties}
                  >
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-0 shadow-lg">
                    <SelectItem value="none">No doctor assigned</SelectItem>
                    {Array.isArray(doctors) && doctors.map((doctor) => (
                      <SelectItem key={doctor._id} value={doctor._id}>
                        Dr. {doctor.firstName} {doctor.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-xl" style={{ 
                  backgroundColor: '#8b5cf615',
                  boxShadow: '0 4px 12px #8b5cf630'
                }}>
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Notes & Details</h3>
                  <p className="text-sm text-gray-500">Add notes or reason for visit</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                  Notes / Reason for Visit
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Enter reason for visit or any notes..."
                  rows={4}
                  className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200 resize-none"
                  style={{ 
                    '--tw-ring-color': '#8b5cf6' 
                  } as React.CSSProperties}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Section (Edit Mode Only) */}
            {isEditMode && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 rounded-xl" style={{ 
                    backgroundColor: getStatusConfig(formData.status).bgColor,
                    boxShadow: `0 4px 12px ${getStatusConfig(formData.status).color}30`
                  }}>
                    {getStatusConfig(formData.status).icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Status</h3>
                    <p className="text-sm text-gray-500">Update appointment status</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-semibold text-gray-700">
                    Current Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger 
                      id="status"
                      className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                      style={{ 
                        '--tw-ring-color': getStatusConfig(formData.status).color 
                      } as React.CSSProperties}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-0 shadow-lg">
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no-show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-xl" style={{ 
                  backgroundColor: '#f59e0b15',
                  boxShadow: '0 4px 12px #f59e0b30'
                }}>
                  <User className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
                  <p className="text-sm text-gray-500">Common actions</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full justify-start transition-all duration-200 hover:scale-105"
                  style={{ 
                    borderColor: '#f59e0b',
                    color: '#f59e0b'
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full justify-start transition-all duration-200 hover:scale-105"
                  style={{ 
                    backgroundColor: clinicSettings.primaryColor,
                    boxShadow: `0 4px 12px ${clinicSettings.primaryColor}40`
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditMode ? "Update Appointment" : "Create Appointment"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}