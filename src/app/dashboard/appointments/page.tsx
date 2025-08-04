"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClinicInfoModal } from "@/components/ui/clinic-info-modal";
import { toast } from "sonner";
import { 
  Plus, 
  Calendar, 
  Users, 
  Filter, 
  Search, 
  Clock, 
  User, 
  Stethoscope, 
  Eye, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  ArrowRight,
  UserPlus,
  Printer,
  MoreHorizontal,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { AppointmentSlip } from "@/components/ui/appointment-slip";
import { EmailModal } from "@/components/ui/email-modal";

interface ClinicSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  clinicName: string;
}

interface Appointment {
  _id: string;
  dateTime: string;
  status: string;
  patientId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  doctorId?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  ehrId?: string;
  notes?: string;
}

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isClinicModalOpen, setIsClinicModalOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointmentForSlip, setSelectedAppointmentForSlip] = useState<Appointment | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedAppointmentForEmail, setSelectedAppointmentForEmail] = useState<Appointment | null>(null);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>({
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    clinicName: 'Clinic'
  });

  // Check if user is a patient
  const isPatient = session?.user?.role === 'patient';

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
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/appointments");
      if (!response.ok) throw new Error("Failed to fetch appointments");
      const result = await response.json();
      setAppointments(result.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAppointment = () => {
    if (isPatient) {
      // Patients can't create appointments for themselves
      toast.error("Please contact the clinic to schedule an appointment");
      return;
    }
    router.push("/dashboard/appointments/new");
  };

  const handleContactClinic = () => {
    setIsClinicModalOpen(true);
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

  const handleQuickActions = (action: string, appointment: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    
    switch (action) {
      case 'view':
        router.push(`/dashboard/appointments/${appointment._id}`);
        break;
      case 'ehr':
        if (appointment.ehrId && appointment.patientId) {
          router.push(`/dashboard/patients/${appointment.patientId._id}/ehr/${appointment.ehrId}`);
        }
        break;
      case 'add-ehr':
        router.push(`/dashboard/ehr/new?appointmentId=${appointment._id}`);
        break;
      case 'edit':
        router.push(`/dashboard/appointments/${appointment._id}/edit`);
        break;
      case 'slip':
        setSelectedAppointmentForSlip(appointment);
        break;
      case 'email':
        setSelectedAppointmentForEmail(appointment);
        setEmailModalOpen(true);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this appointment?')) {
          // Add delete logic here
          toast.success('Appointment deleted successfully');
        }
        break;
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update the appointment in the local state
        setAppointments(prevAppointments =>
          prevAppointments.map(appointment =>
            appointment._id === appointmentId
              ? { ...appointment, status: newStatus }
              : appointment
          )
        );
        toast.success(`Appointment status updated to ${newStatus}`);
      } else {
        throw new Error('Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  // Filter appointments based on search and filter
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      (appointment.patientId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       appointment.patientId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       appointment.patientId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       appointment.doctorId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       appointment.doctorId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = statusFilter === "all" || appointment.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getPageTitle = () => {
    if (isPatient) {
      return "My Appointments";
    }
    return "Appointments";
  };

  const getPageDescription = () => {
    if (isPatient) {
      return "View and manage your scheduled appointments";
    }
    return "Manage all clinic appointments";
  };

  const primaryColor = clinicSettings.primaryColor;
  const secondaryColor = clinicSettings.secondaryColor;
  const accentColor = clinicSettings.accentColor;

  if (isPatient) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center mb-6 shadow-lg border border-white/20">
            <Calendar className="h-12 w-12" style={{ color: primaryColor }} />
          </div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: clinicSettings.textColor }}>Patient Appointments</h3>
          <p className="mb-6 text-gray-600">
            View your scheduled appointments and medical records
          </p>
          <div className="space-y-4 max-w-md mx-auto">
            <p className="text-sm text-gray-500">
              • View your upcoming appointments<br/>
              • Check appointment status and details<br/>
              • Access your medical records<br/>
              • Contact the clinic for scheduling
            </p>
            <Button 
              variant="outline" 
              onClick={handleContactClinic}
              className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{ 
                borderColor: primaryColor,
                color: primaryColor 
              }}
            >
              Contact Clinic
            </Button>
          </div>
        </div>

              {/* Clinic Info Modal */}
      <ClinicInfoModal 
        isOpen={isClinicModalOpen}
        onClose={() => setIsClinicModalOpen(false)}
        clinicSettings={clinicSettings}
      />

      {/* Appointment Slip Modal */}
      {selectedAppointmentForSlip && (
        <AppointmentSlip
          appointment={selectedAppointmentForSlip}
          clinicSettings={{
            clinicName: clinicSettings.clinicName,
            primaryColor: clinicSettings.primaryColor
          }}
          showModal={true}
          onClose={() => setSelectedAppointmentForSlip(null)}
        />
      )}

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
    </div>
  );
}

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
              <Calendar className="h-8 w-8" style={{ color: primaryColor }} />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ 
                backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {getPageTitle()}
              </h1>
              <p className="text-gray-600 mt-1">{getPageDescription()}</p>
            </div>
          </div>
          
          <Button 
            onClick={handleCreateAppointment}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: primaryColor,
              boxShadow: `0 4px 12px ${primaryColor}40`
            }}
          >
            <UserPlus className="h-4 w-4" />
            <span>New Appointment</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
              backgroundColor: primaryColor + '15',
              boxShadow: `0 4px 12px ${primaryColor}30`
            }}>
              <Calendar className="h-5 w-5" style={{ color: primaryColor }} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-800">{appointments.length}</p>
            </div>
          </div>
          
          <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
              backgroundColor: secondaryColor + '15',
              boxShadow: `0 4px 12px ${secondaryColor}30`
            }}>
              <Clock className="h-5 w-5" style={{ color: secondaryColor }} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Scheduled</p>
              <p className="text-2xl font-bold text-gray-800">
                {appointments.filter(a => a.status === 'scheduled').length}
              </p>
            </div>
          </div>
          
          <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
              backgroundColor: accentColor + '15',
              boxShadow: `0 4px 12px ${accentColor}30`
            }}>
              <CheckCircle className="h-5 w-5" style={{ color: accentColor }} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Completed</p>
              <p className="text-2xl font-bold text-gray-800">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
            </div>
          </div>
          
          <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
              backgroundColor: '#f59e0b15',
              boxShadow: '0 4px 12px #f59e0b30'
            }}>
              <Users className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Today</p>
              <p className="text-2xl font-bold text-gray-800">
                {appointments.filter(a => {
                  const appointmentDate = new Date(a.dateTime);
                  const today = new Date();
                  return appointmentDate.toDateString() === today.toDateString();
                }).length}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search appointments by patient, doctor, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
              style={{ 
                '--tw-ring-color': primaryColor 
              } as React.CSSProperties}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48 border-0 bg-white/80 rounded-xl shadow-sm px-3 py-2 text-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
              style={{ 
                '--tw-ring-color': primaryColor 
              } as React.CSSProperties}
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-gray-800">Appointment Records</h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing {filteredAppointments.length} of {appointments.length} appointments
          </p>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: primaryColor }}></div>
            <p className="mt-4 text-gray-500">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No appointments found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Get started by scheduling your first appointment"
              }
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button 
                onClick={() => router.push('/dashboard/appointments/new')}
                className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: primaryColor,
                  boxShadow: `0 4px 12px ${primaryColor}40`
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white/50 border-b border-white/20">
                  <TableHead className="font-semibold text-gray-700">Date & Time</TableHead>
                  <TableHead className="font-semibold text-gray-700">Patient</TableHead>
                  <TableHead className="font-semibold text-gray-700">Doctor</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => {
                  const statusConfig = getStatusConfig(appointment.status);
                  const appointmentDate = new Date(appointment.dateTime);
                  const isToday = new Date().toDateString() === appointmentDate.toDateString();
                  
                  return (
                    <TableRow key={appointment._id} className="hover:bg-white/50 transition-all duration-200 border-b border-white/20">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="font-semibold text-gray-800">
                              {format(appointmentDate, "MMM d, yyyy")}
                            </span>
                            {isToday && (
                              <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                                Today
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {format(appointmentDate, "h:mm a")}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {appointment.patientId ? (
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ 
                              backgroundColor: primaryColor + '15'
                            }}>
                              <span className="text-sm font-semibold" style={{ color: primaryColor }}>
                                {appointment.patientId.firstName.charAt(0)}{appointment.patientId.lastName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {appointment.patientId.firstName} {appointment.patientId.lastName}
                              </p>
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
                          </div>
                        ) : (
                          <span className="text-gray-500">No patient assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {appointment.doctorId ? (
                          <div className="flex items-center space-x-2">
                            <Stethoscope className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {appointment.doctorId.firstName} {appointment.doctorId.lastName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="p-2 rounded-xl transition-all duration-300"
                            style={{ 
                              backgroundColor: statusConfig.bgColor,
                              boxShadow: `0 2px 8px ${statusConfig.color}30`
                            }}
                          >
                            {statusConfig.icon}
                          </div>
                          {statusConfig.badge}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleQuickActions('view', appointment, e)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleQuickActions('edit', appointment, e)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition-all duration-200 hover:scale-105"
                            title="Edit Appointment"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleQuickActions('slip', appointment, e)}
                            className="p-2 rounded-lg text-orange-600 hover:bg-orange-100 transition-all duration-200 hover:scale-105"
                            title="Print Slip"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleQuickActions('email', appointment, e)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition-all duration-200 hover:scale-105"
                            title="Send Email"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                          {appointment.ehrId && appointment.patientId ? (
                            <button
                              onClick={(e) => handleQuickActions('ehr', appointment, e)}
                              className="p-2 rounded-lg text-green-600 hover:bg-green-100 transition-all duration-200 hover:scale-105"
                              title="View EHR"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleQuickActions('add-ehr', appointment, e)}
                              className="p-2 rounded-lg text-purple-600 hover:bg-purple-100 transition-all duration-200 hover:scale-105"
                              title="Add EHR"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          )}
                          
                                                     {/* Status Change Dropdown */}
                           <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                               <button
                                 className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-100 transition-all duration-200 hover:scale-105"
                                 title="Change Status"
                               >
                                 <Settings className="h-4 w-4" />
                               </button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg rounded-lg p-1">
                               <DropdownMenuItem
                                 onClick={() => handleStatusChange(appointment._id, 'scheduled')}
                                 className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                   appointment.status === 'scheduled' 
                                     ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                                     : 'text-gray-700 hover:bg-gray-100'
                                 }`}
                               >
                                 <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                                 Mark as Scheduled
                               </DropdownMenuItem>
                               <DropdownMenuItem
                                 onClick={() => handleStatusChange(appointment._id, 'completed')}
                                 className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                   appointment.status === 'completed' 
                                     ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                                     : 'text-gray-700 hover:bg-gray-100'
                                 }`}
                               >
                                 <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                 Mark as Completed
                               </DropdownMenuItem>
                               <DropdownMenuItem
                                 onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                                 className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                   appointment.status === 'cancelled' 
                                     ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                                     : 'text-gray-700 hover:bg-gray-100'
                                 }`}
                               >
                                 <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                 Mark as Cancelled
                               </DropdownMenuItem>
                               <DropdownMenuItem
                                 onClick={() => handleStatusChange(appointment._id, 'no-show')}
                                 className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                   appointment.status === 'no-show' 
                                     ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' 
                                     : 'text-gray-700 hover:bg-gray-100'
                                 }`}
                               >
                                 <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                                 Mark as No Show
                               </DropdownMenuItem>
                             </DropdownMenuContent>
                           </DropdownMenu>
                          
                          <button
                            onClick={(e) => handleQuickActions('delete', appointment, e)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition-all duration-200 hover:scale-105"
                            title="Delete Appointment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Clinic Info Modal */}
      <ClinicInfoModal 
        isOpen={isClinicModalOpen}
        onClose={() => setIsClinicModalOpen(false)}
        clinicSettings={clinicSettings}
      />

             {/* Appointment Slip Modal */}
       {selectedAppointmentForSlip && (
         <AppointmentSlip
           appointment={selectedAppointmentForSlip}
           clinicSettings={{
             clinicName: clinicSettings.clinicName,
             primaryColor: clinicSettings.primaryColor
           }}
           showModal={true}
           onClose={() => setSelectedAppointmentForSlip(null)}
         />
       )}

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
     </div>
   );
 }