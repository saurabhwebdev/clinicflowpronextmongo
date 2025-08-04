"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { FileText, Save, ArrowLeft, AlertCircle, Loader2, User, Users } from "lucide-react";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Appointment {
  _id: string;
  dateTime: string;
  patientId: Patient | null;
  doctorId?: Patient;
  notes?: string;
}

export default function NewEHRPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const patientId = searchParams.get("patientId");

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [availablePatients, setAvailablePatients] = useState<Patient[]>([]);
  const [showPatientSelector, setShowPatientSelector] = useState(false);

  const [formData, setFormData] = useState({
    chiefComplaint: "",
    historyOfPresentIllness: "",
    physicalExamination: "",
    diagnosis: "",
    treatmentPlan: "",
    medications: "",
    followUp: "",
    notes: "",
  });

  useEffect(() => {
    const initializeData = async () => {
      setIsFetching(true);
      setError(null);
      
      try {
        if (appointmentId) {
          await fetchAppointment();
        } else if (patientId) {
          await fetchPatient();
        } else {
          setError("No appointment or patient ID provided");
        }
      } catch (error) {
        console.error("Error initializing data:", error);
        setError("Failed to load required information");
      } finally {
        setIsFetching(false);
      }
    };

    initializeData();
  }, [appointmentId, patientId]);

  const fetchAppointment = async () => {
    try {
      console.log("Fetching appointment with ID:", appointmentId);
      const response = await fetch(`/api/appointments/${appointmentId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Appointment data received:", data);
      
      setAppointment(data);
      
      // Check if appointment has patient information
      if (!data.patientId) {
        console.log("Appointment has no linked patient, fetching available patients");
        await fetchAvailablePatients();
        setShowPatientSelector(true);
        return;
      }
      
      // Handle case where patientId might be a string ID instead of populated object
      if (typeof data.patientId === 'string') {
        console.log("PatientId is a string, fetching patient details separately");
        // Fetch patient details separately
        const patientResponse = await fetch(`/api/admin/users/${data.patientId}`);
        if (!patientResponse.ok) {
          throw new Error("Failed to fetch patient details");
        }
        const patientData = await patientResponse.json();
        setPatient(patientData);
      } else {
        // patientId is already populated
        setPatient(data.patientId);
      }
    } catch (error: any) {
      console.error("Error fetching appointment:", error);
      setError(`Failed to load appointment: ${error.message}`);
      toast.error("Failed to load appointment details");
    }
  };

  const fetchAvailablePatients = async () => {
    try {
      const response = await fetch("/api/admin/users?role=patient");
      if (!response.ok) {
        throw new Error("Failed to fetch available patients");
      }
      const data = await response.json();
      setAvailablePatients(data.users || []);
    } catch (error: any) {
      console.error("Error fetching available patients:", error);
      toast.error("Failed to load available patients");
    }
  };

  const fetchPatient = async () => {
    try {
      console.log("Fetching patient with ID:", patientId);
      
      // Try admin users API first
      let userResponse = await fetch(`/api/admin/users/${patientId}`);
      
      if (!userResponse.ok) {
        console.log("Admin users API failed, trying patients API");
        // Fallback to patients API
        userResponse = await fetch(`/api/patients/${patientId}`);
      }
      
      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.error || `HTTP ${userResponse.status}: ${userResponse.statusText}`);
      }
      
      const userData = await userResponse.json();
      console.log("Patient data received:", userData);
      setPatient(userData);
    } catch (error: any) {
      console.error("Error fetching patient:", error);
      setError(`Failed to load patient: ${error.message}`);
      toast.error("Failed to load patient details");
    }
  };

  const handlePatientSelection = (selectedPatientId: string) => {
    const selectedPatient = availablePatients.find(p => p._id === selectedPatientId);
    if (selectedPatient) {
      setPatient(selectedPatient);
      setShowPatientSelector(false);
      toast.success(`Selected patient: ${selectedPatient.firstName} ${selectedPatient.lastName}`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const ehrData = {
        ...formData,
        patientId: patient?._id,
        appointmentId: appointment?._id,
        date: new Date().toISOString(),
      };

      const response = await fetch("/api/ehr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ehrData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create EHR");
      }

      const result = await response.json();
      toast.success("EHR created successfully");

      // Navigate back to the appropriate page
      if (appointment) {
        router.push(`/dashboard/appointments/${appointment._id}`);
      } else if (patient) {
        router.push(`/dashboard/patients/${patient._id}`);
      } else {
        router.push("/dashboard/ehr");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create EHR");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <p className="text-lg">Loading patient information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 py-8">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div className="text-center">
                <p className="text-lg font-semibold text-red-600 mb-2">Error Loading Data</p>
                <p className="text-gray-600 mb-4">{error}</p>
                <div className="space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Go Back
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Patient selector state
  if (showPatientSelector) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Select Patient for EHR</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Patient
            </CardTitle>
            <CardDescription>
              This appointment is not linked to a patient. Please select a patient to create the EHR record.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patientSelect">Choose Patient</Label>
                <Select onValueChange={handlePatientSelection}>
                  <SelectTrigger id="patientSelect">
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePatients.map((patient) => (
                      <SelectItem key={patient._id} value={patient._id}>
                        {patient.firstName} {patient.lastName} - {patient.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No patient state
  if (!patient) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 py-8">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              <div className="text-center">
                <p className="text-lg font-semibold text-yellow-600 mb-2">No Patient Information</p>
                <p className="text-gray-600 mb-4">Unable to find patient information for this EHR record.</p>
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Go Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create New EHR Record</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Electronic Health Record
          </CardTitle>
          <CardDescription>
            Create a new EHR record for {patient.firstName} {patient.lastName}
            {appointment && (
              <>
                {" "}
                - Appointment on{" "}
                {new Date(appointment.dateTime).toLocaleDateString()}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chiefComplaint">Chief Complaint</Label>
                <Input
                  id="chiefComplaint"
                  name="chiefComplaint"
                  value={formData.chiefComplaint}
                  onChange={handleInputChange}
                  placeholder="Primary reason for visit"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input
                  id="diagnosis"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  placeholder="Medical diagnosis"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="historyOfPresentIllness">History of Present Illness</Label>
              <Textarea
                id="historyOfPresentIllness"
                name="historyOfPresentIllness"
                value={formData.historyOfPresentIllness}
                onChange={handleInputChange}
                placeholder="Detailed history of the current condition"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="physicalExamination">Physical Examination</Label>
              <Textarea
                id="physicalExamination"
                name="physicalExamination"
                value={formData.physicalExamination}
                onChange={handleInputChange}
                placeholder="Physical examination findings"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatmentPlan">Treatment Plan</Label>
              <Textarea
                id="treatmentPlan"
                name="treatmentPlan"
                value={formData.treatmentPlan}
                onChange={handleInputChange}
                placeholder="Recommended treatment plan"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medications">Medications</Label>
                <Textarea
                  id="medications"
                  name="medications"
                  value={formData.medications}
                  onChange={handleInputChange}
                  placeholder="Prescribed medications"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="followUp">Follow-up Instructions</Label>
                <Textarea
                  id="followUp"
                  name="followUp"
                  value={formData.followUp}
                  onChange={handleInputChange}
                  placeholder="Follow-up instructions"
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional notes or observations"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading ? "Creating..." : "Create EHR"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 