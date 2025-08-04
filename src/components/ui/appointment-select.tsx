"use client";

import { useState, useEffect } from "react";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { format } from "date-fns";

interface Appointment {
  _id: string;
  dateTime: string;
  status: string;
  notes?: string;
  doctorId?: {
    firstName: string;
    lastName: string;
  };
}

interface AppointmentSelectProps {
  patientId: string;
  value?: string;
  onChange: (appointmentId: string | undefined) => void;
  className?: string;
}

export function AppointmentSelect({
  patientId,
  value,
  onChange,
  className,
}: AppointmentSelectProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;

    const fetchAppointments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch recent appointments that are not completed or cancelled
        const response = await fetch(
          `/api/appointments?patientId=${patientId}&status=scheduled`
        );
        if (!response.ok) throw new Error("Failed to fetch appointments");
        const result = await response.json();
        setAppointments(result.appointments || []);
      } catch (err) {
        setError("Failed to load appointments");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [patientId]);

  const formatAppointment = (appointment: Appointment) => {
    const date = new Date(appointment.dateTime);
    const formattedDate = format(date, "MMM d, yyyy h:mm a");
    const doctor = appointment.doctorId
      ? `${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`
      : "No doctor assigned";
    
    return `${formattedDate} - ${doctor}`;
  };

  return (
    <div className={className}>
      <Label htmlFor="appointment-select">Related Appointment</Label>
      <Select
        value={value}
        onValueChange={(val) => onChange(val === "none" ? undefined : val)}
        disabled={isLoading || appointments.length === 0}
      >
        <SelectTrigger id="appointment-select">
          <SelectValue placeholder="Select an appointment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No appointment</SelectItem>
          {appointments.map((appointment) => (
            <SelectItem key={appointment._id} value={appointment._id}>
              {formatAppointment(appointment)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      {!isLoading && appointments.length === 0 && !error && (
        <p className="text-sm text-muted-foreground mt-1">
          No scheduled appointments found
        </p>
      )}
    </div>
  );
}