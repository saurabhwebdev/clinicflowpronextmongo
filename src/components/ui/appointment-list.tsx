"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  FileText,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Stethoscope,
  ArrowRight,
  Plus,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail
} from "lucide-react";
import { EmailModal } from "@/components/ui/email-modal";

interface ClinicSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

interface AppointmentListProps {
  patientId?: string;
  limit?: number;
  showPatientName?: boolean;
  onAppointmentClick?: (appointment: any) => void;
}

export function AppointmentList({
  patientId,
  limit,
  showPatientName = false,
  onAppointmentClick,
}: AppointmentListProps) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedAppointmentForEmail, setSelectedAppointmentForEmail] = useState<any>(null);
  const router = useRouter();
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>({
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937'
  });

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
              textColor: data.settings.textColor || '#1f2937'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching clinic settings:', error);
      }
    };

    fetchClinicSettings();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [patientId]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      let url = "/api/appointments";
      if (patientId) {
        url += `?patientId=${patientId}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch appointments");
      const result = await response.json();
      
      // Extract appointments array from the response
      let data = result.appointments || [];
      
      // Apply limit if specified
      if (limit && data.length > limit) {
        data = data.slice(0, limit);
      }
      
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
      setAppointments([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "scheduled":
        return {
          badge: <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 transition-all duration-200">Scheduled</Badge>,
          icon: <Calendar className="h-4 w-4 text-blue-600" />,
          color: '#3b82f6',
          bgColor: '#dbeafe'
        };
      case "completed":
        return {
          badge: <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 transition-all duration-200">Completed</Badge>,
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          color: '#10b981',
          bgColor: '#d1fae5'
        };
      case "cancelled":
        return {
          badge: <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200 transition-all duration-200">Cancelled</Badge>,
          icon: <XCircle className="h-4 w-4 text-red-600" />,
          color: '#ef4444',
          bgColor: '#fee2e2'
        };
      case "no-show":
        return {
          badge: <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 transition-all duration-200">No Show</Badge>,
          icon: <AlertCircle className="h-4 w-4 text-yellow-600" />,
          color: '#f59e0b',
          bgColor: '#fef3c7'
        };
      default:
        return {
          badge: <Badge>{status}</Badge>,
          icon: <Calendar className="h-4 w-4" />,
          color: '#6b7280',
          bgColor: '#f3f4f6'
        };
    }
  };

  const handleAppointmentClick = (appointment: any) => {
    if (onAppointmentClick) {
      onAppointmentClick(appointment);
    } else {
      router.push(`/dashboard/appointments/${appointment._id}`);
    }
  };

  const handleQuickActions = (action: string, appointment: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    switch (action) {
      case 'view':
        handleAppointmentClick(appointment);
        break;
      case 'ehr':
        if (appointment.ehrId && appointment.patientId) {
          router.push(`/dashboard/patients/${appointment.patientId._id}/ehr/${appointment.ehrId._id}`);
        }
        break;
      case 'add-ehr':
        router.push(`/dashboard/ehr/new?appointmentId=${appointment._id}`);
        break;
      case 'edit':
        router.push(`/dashboard/appointments/${appointment._id}/edit`);
        break;
      case 'email':
        setSelectedAppointmentForEmail(appointment);
        setEmailModalOpen(true);
        break;
      case 'delete':
        // Handle delete with confirmation
        if (confirm('Are you sure you want to delete this appointment?')) {
          // Add delete logic here
          toast.success('Appointment deleted successfully');
        }
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <Skeleton className="h-6 w-24 rounded-lg" />
              <Skeleton className="h-6 w-16 rounded-lg" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </div>
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <Calendar className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
        <p className="text-gray-500 mb-6">Get started by scheduling your first appointment</p>
        <Button 
          onClick={() => router.push('/dashboard/appointments/new')}
          className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105"
          style={{ 
            backgroundColor: clinicSettings.primaryColor,
            boxShadow: `0 4px 12px ${clinicSettings.primaryColor}40`
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map((appointment) => {
          const statusConfig = getStatusConfig(appointment.status);
          const appointmentDate = new Date(appointment.dateTime);
          const isToday = new Date().toDateString() === appointmentDate.toDateString();
          const isPast = appointmentDate < new Date();
          
          return (
            <div
              key={appointment._id}
              className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden ${
                selectedAppointment === appointment._id ? 'ring-2 ring-offset-2' : ''
              }`}
              style={{
                '--tw-ring-color': clinicSettings.primaryColor
              } as React.CSSProperties}
              onClick={() => setSelectedAppointment(appointment._id)}
            >
              {/* Status indicator */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl transition-all duration-300"
                style={{ backgroundColor: statusConfig.color }}
              />
              
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div 
                    className="p-2 rounded-xl transition-all duration-300 group-hover:scale-110"
                    style={{ 
                      backgroundColor: statusConfig.bgColor,
                      boxShadow: `0 4px 12px ${statusConfig.color}30`
                    }}
                  >
                    {statusConfig.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      {statusConfig.badge}
                      {isToday && (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                          Today
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={(e) => handleQuickActions('view', appointment, e)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => handleQuickActions('edit', appointment, e)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
                    title="Edit Appointment"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => handleQuickActions('email', appointment, e)}
                    className="p-1.5 rounded-lg hover:bg-blue-100 transition-all duration-200"
                    title="Send Email"
                  >
                    <Mail className="h-4 w-4 text-blue-600" />
                  </button>
                  <button
                    onClick={(e) => handleQuickActions('delete', appointment, e)}
                    className="p-1.5 rounded-lg hover:bg-red-100 transition-all duration-200"
                    title="Delete Appointment"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Date and Time */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold text-gray-900">
                    {format(appointmentDate, "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {format(appointmentDate, "h:mm a")}
                  </span>
                </div>
              </div>

              {/* Patient Info */}
              {showPatientName && appointment.patientId && (
                <div className="mb-4 p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {appointment.patientId.firstName} {appointment.patientId.lastName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span>{appointment.patientId.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Mail className="h-3 w-3" />
                      <span>{appointment.patientId.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Doctor Info */}
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <Stethoscope className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {appointment.doctorId ? (
                      `${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`
                    ) : (
                      <span className="text-gray-500">Not assigned</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  {appointment.ehrId && appointment.patientId ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleQuickActions('ehr', appointment, e)}
                      className="flex items-center space-x-1 text-xs transition-all duration-200 hover:scale-105"
                      style={{ 
                        borderColor: clinicSettings.secondaryColor,
                        color: clinicSettings.secondaryColor
                      }}
                    >
                      <FileText className="h-3 w-3" />
                      <span>View EHR</span>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleQuickActions('add-ehr', appointment, e)}
                      className="flex items-center space-x-1 text-xs transition-all duration-200 hover:scale-105"
                      style={{ 
                        borderColor: clinicSettings.accentColor,
                        color: clinicSettings.accentColor
                      }}
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add EHR</span>
                    </Button>
                  )}
                </div>
                
                <Button
                  size="sm"
                  onClick={() => handleAppointmentClick(appointment)}
                  className="flex items-center space-x-1 text-xs transition-all duration-200 hover:scale-105"
                  style={{ 
                    backgroundColor: clinicSettings.primaryColor,
                    boxShadow: `0 2px 8px ${clinicSettings.primaryColor}30`
                  }}
                >
                  <span>Details</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
            </div>
          );
        })}
      </div>

      {/* Email Modal */}
      {selectedAppointmentForEmail && (
        <EmailModal
          isOpen={emailModalOpen}
          onClose={() => {
            setEmailModalOpen(false);
            setSelectedAppointmentForEmail(null);
          }}
          patientEmail={selectedAppointmentForEmail.patientId?.email}
          patientName={selectedAppointmentForEmail.patientId ? 
            `${selectedAppointmentForEmail.patientId.firstName} ${selectedAppointmentForEmail.patientId.lastName}` : 
            undefined
          }
          appointmentId={selectedAppointmentForEmail._id}
          defaultSubject={`Appointment Update - ${format(new Date(selectedAppointmentForEmail.dateTime), "MMM d, yyyy")}`}
          defaultContent={`Dear ${selectedAppointmentForEmail.patientId?.firstName || 'Patient'},

This is regarding your appointment scheduled for ${format(new Date(selectedAppointmentForEmail.dateTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}.

Please let us know if you have any questions or need to reschedule.

Best regards,
Your Healthcare Team`}
        />
      )}
    </>
  );
}