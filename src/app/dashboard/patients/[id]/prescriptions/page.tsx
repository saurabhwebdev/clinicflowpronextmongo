"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PrescriptionList } from "@/components/ui/prescription-list";
import { User, FileText, Plus, ArrowLeft } from "lucide-react";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

interface ClinicSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

export default function PatientPrescriptionsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>({
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937'
  });

  const { id } = use(params);

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
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 rounded-md w-64 animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded-md w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-md w-40 animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded-md w-32 animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-md w-40 animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-28 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3 shadow-sm">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded-md w-40 animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-md w-64 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6">
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <p>Patient not found</p>
            <Button
              onClick={() => router.push("/dashboard/patients")}
              className="mt-4"
            >
              Back to Patients
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: clinicSettings.primaryColor }}>
            <FileText className="h-6 w-6" />
            Prescriptions for {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-muted-foreground">
            Manage and view patient prescriptions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/patients/${id}`)}
            className="flex items-center gap-2"
            style={{ borderColor: clinicSettings.primaryColor, color: clinicSettings.primaryColor }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patient
          </Button>
          <Button
            onClick={() => router.push(`/dashboard/patients/${id}/prescriptions/new`)}
            className="flex items-center gap-2"
            style={{ backgroundColor: clinicSettings.accentColor, borderColor: clinicSettings.accentColor }}
          >
            <Plus className="h-4 w-4" />
            Create Prescription
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Patient Info Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: clinicSettings.primaryColor }}>
              <User className="h-5 w-5" />
              Patient Info
            </CardTitle>
            <CardDescription>Basic patient information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
              <p className="font-medium">{patient.firstName} {patient.lastName}</p>
            </div>
            {patient.email && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p className="text-sm">{patient.email}</p>
              </div>
            )}
            {patient.phone && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                <p className="text-sm">{patient.phone}</p>
              </div>
            )}
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/patients/${id}`)}
                className="w-full"
                style={{ borderColor: clinicSettings.secondaryColor, color: clinicSettings.secondaryColor }}
              >
                View Full Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions List */}
        <Card className="md:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle style={{ color: clinicSettings.primaryColor }}>Prescription History</CardTitle>
            <CardDescription>All prescriptions for this patient</CardDescription>
          </CardHeader>
          <CardContent>
            <PrescriptionList patientId={id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}