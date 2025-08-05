"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PrescriptionList } from "@/components/ui/prescription-list";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
}

export default function PatientPrescriptionsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { id } = use(params);

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/patients/${id}`);
      if (!response.ok) throw new Error("Failed to fetch patient");

      const data = await response.json();
      setPatient(data);
    } catch (error) {
      console.error("Error fetching patient:", error);
      toast.error("Failed to load patient information");
      router.push("/dashboard/patients");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-pulse">Loading patient information...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6">
        <p>Patient not found</p>
        <Button
          onClick={() => router.push("/dashboard/patients")}
          className="mt-4"
        >
          Back to Patients
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Prescriptions for {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-muted-foreground">
              Manage patient prescriptions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/patients/${id}`)}
            >
              Back to Patient
            </Button>
            <Button
              onClick={() => router.push(`/dashboard/patients/${id}/prescriptions/new`)}
            >
              Create Prescription
            </Button>
          </div>
        </div>
      </div>

      <PrescriptionList patientId={id} />
    </div>
  );
}