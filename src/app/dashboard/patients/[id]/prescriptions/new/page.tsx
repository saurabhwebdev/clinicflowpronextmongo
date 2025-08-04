"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrescriptionForm } from "@/components/ui/prescription-form";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
}

export default function NewPrescriptionPage({ 
  params,
  searchParams
}: { 
  params: { id: string },
  searchParams: { ehrId?: string }
}) {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const ehrId = searchParams.ehrId;

  useEffect(() => {
    fetchPatient();
  }, [params.id]);

  const fetchPatient = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/patients/${params.id}`);
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

  const handleSuccess = (data: any) => {
    toast.success("Prescription created successfully");
    
    // If this was created from an EHR, go back to the EHR page
    if (ehrId) {
      router.push(`/dashboard/patients/${params.id}/ehr/${ehrId}`);
    } else {
      router.push(`/dashboard/patients/${params.id}/prescriptions`);
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
              New Prescription for {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-muted-foreground">
              Create a new prescription for this patient
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => ehrId 
              ? router.push(`/dashboard/patients/${params.id}/ehr/${ehrId}`)
              : router.push(`/dashboard/patients/${params.id}/prescriptions`)
            }
          >
            Cancel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prescription Details</CardTitle>
        </CardHeader>
        <CardContent>
          <PrescriptionForm 
            patientId={params.id} 
            ehrId={ehrId}
            onSuccess={handleSuccess}
          />
        </CardContent>
      </Card>
    </div>
  );
}