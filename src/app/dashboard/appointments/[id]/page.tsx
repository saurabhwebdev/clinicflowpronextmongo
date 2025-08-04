"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppointmentForm } from "@/components/ui/appointment-form";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  User,
  FileText,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  CreditCard,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ClinicSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

export default function AppointmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [appointment, setAppointment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
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
    fetchAppointment();
  }, [id]);

  const fetchAppointment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/appointments/${id}`);
      if (!response.ok) throw new Error("Failed to fetch appointment");
      const data = await response.json();
      setAppointment(data);
    } catch (error) {
      console.error("Error fetching appointment:", error);
      toast.error("Failed to load appointment details");
      router.push("/dashboard/appointments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsChangingStatus(true);
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update appointment status");

      toast.success("Appointment status updated successfully");
      fetchAppointment();

      // If marked as completed, offer to create EHR
      if (newStatus === "completed" && !appointment.ehrId && appointment.patientId) {
        const shouldCreateEHR = window.confirm("Would you like to create an EHR record for this appointment?");
        if (shouldCreateEHR) {
          router.push(`/dashboard/ehr/new?appointmentId=${id}`);
        }
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Failed to update appointment status");
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete appointment");

      toast.success("Appointment deleted successfully");
      router.push("/dashboard/appointments");
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Failed to delete appointment");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 rounded-md w-48 animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded-md w-20 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-md w-24 animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded-md w-40 animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-md w-64 animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded-md w-20 animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-md w-40 animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Appointment not found</p>
            <Button
              onClick={() => router.push("/dashboard/appointments")}
              className="mt-4"
            >
              Back to Appointments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline">Scheduled</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "no-show":
        return <Badge variant="secondary">No Show</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: clinicSettings.primaryColor }}>Appointment Details</h1>
        <div className="flex gap-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" style={{ borderColor: clinicSettings.accentColor, color: clinicSettings.accentColor }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Appointment</DialogTitle>
                <DialogDescription>
                  Update the appointment details
                </DialogDescription>
              </DialogHeader>
              <AppointmentForm
                patientId={appointment.patientId?._id}
                initialData={appointment}
                onSuccess={() => {
                  setIsEditDialogOpen(false);
                  fetchAppointment();
                }}
              />
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this appointment. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle style={{ color: clinicSettings.primaryColor }}>Appointment Information</CardTitle>
            <CardDescription>Details about this appointment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(appointment.dateTime), "MMMM d, yyyy")}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Time</h3>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {format(new Date(appointment.dateTime), "h:mm a")}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Patient</h3>
                <p className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {appointment.patientId ? (
                    `${appointment.patientId.firstName} ${appointment.patientId.lastName}`
                  ) : (
                    "Not assigned"
                  )}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Doctor</h3>
                <p className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {appointment.doctorId ? (
                    `${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`
                  ) : (
                    "Not assigned"
                  )}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <div>{getStatusBadge(appointment.status)}</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">EHR Record</h3>
                                 {appointment.ehrId && appointment.patientId ? (
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() =>
                       router.push(
                         `/dashboard/patients/${appointment.patientId._id}/ehr/${appointment.ehrId._id}`
                       )
                     }
                     className="flex items-center gap-2"
                     style={{ borderColor: clinicSettings.primaryColor, color: clinicSettings.primaryColor }}
                   >
                     <FileText className="h-4 w-4" />
                     View EHR
                   </Button>
                 ) : (
                   <p className="text-muted-foreground">No EHR record linked</p>
                 )}
              </div>
            </div>

            {appointment.notes && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Notes / Reason for Visit
                </h3>
                <p className="text-sm bg-muted p-3 rounded-md">{appointment.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle style={{ color: clinicSettings.primaryColor }}>Actions</CardTitle>
            <CardDescription>Manage this appointment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointment.status === "scheduled" && (
              <>
                <Button
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => handleStatusChange("completed")}
                  disabled={isChangingStatus}
                  style={{ backgroundColor: clinicSettings.accentColor, borderColor: clinicSettings.accentColor }}
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark as Completed
                </Button>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={isChangingStatus}
                  style={{ borderColor: clinicSettings.secondaryColor, color: clinicSettings.secondaryColor }}
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Appointment
                </Button>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => handleStatusChange("no-show")}
                  disabled={isChangingStatus}
                  style={{ borderColor: clinicSettings.secondaryColor, color: clinicSettings.secondaryColor }}
                >
                  <AlertTriangle className="h-4 w-4" />
                  Mark as No-Show
                </Button>
              </>
            )}

                        {appointment.status !== "scheduled" && !appointment.ehrId && appointment.patientId && (
                               <Button
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() =>
                    router.push(
                      `/dashboard/ehr/new?appointmentId=${appointment._id}`
                    )
                  }
                  style={{ backgroundColor: clinicSettings.primaryColor, borderColor: clinicSettings.primaryColor }}
                >
                  <FileText className="h-4 w-4" />
                  Create EHR Record
                </Button>
            )}

            {appointment.status === "completed" && (
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() =>
                  router.push(
                    `/dashboard/billing/new?appointmentId=${appointment._id}&patientId=${appointment.patientId?._id}&doctorId=${appointment.doctorId?._id}`
                  )
                }
                style={{ borderColor: clinicSettings.accentColor, color: clinicSettings.accentColor }}
              >
                <CreditCard className="h-4 w-4" />
                Create Bill
              </Button>
            )}

            {appointment.patientId && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  router.push(`/dashboard/patients/${appointment.patientId._id}`)
                }
                style={{ borderColor: clinicSettings.primaryColor, color: clinicSettings.primaryColor }}
              >
                View Patient Profile
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}