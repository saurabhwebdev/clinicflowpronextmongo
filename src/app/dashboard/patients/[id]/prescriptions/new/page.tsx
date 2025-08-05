"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PrescriptionForm } from "@/components/ui/prescription-form";
import { 
  ArrowLeft, 
  Pill, 
  User,
  FileText
} from "lucide-react";

interface Patient {
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

export default function NewPrescriptionPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ ehrId?: string }>
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
  
  // Unwrap the promises using React.use()
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const ehrId = resolvedSearchParams.ehrId;

  useEffect(() => {
    fetchClinicSettings();
    fetchPatient();
  }, [resolvedParams.id]);

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

  const fetchPatient = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/patients/${resolvedParams.id}`);
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
      router.push(`/dashboard/patients/${resolvedParams.id}/ehr/${ehrId}`);
    } else {
      router.push(`/dashboard/patients/${resolvedParams.id}/prescriptions`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Loading Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-8 mb-8">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-20 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-8 w-px bg-gray-200"></div>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-gray-200 animate-pulse">
                  <div className="h-6 w-6"></div>
                </div>
                <div>
                  <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Loading Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
            <div className="space-y-6">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-8 text-center">
            <div className="p-4 rounded-2xl bg-red-50 inline-block mb-4">
              <User className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Patient Not Found</h2>
            <p className="text-gray-600 mb-6">The requested patient could not be found.</p>
            <Button 
              onClick={() => router.push("/dashboard/patients")}
              className="transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: clinicSettings.primaryColor }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Patients
            </Button>
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
                onClick={() => ehrId 
                  ? router.push(`/dashboard/patients/${resolvedParams.id}/ehr/${ehrId}`)
                  : router.push(`/dashboard/patients/${resolvedParams.id}/prescriptions`)
                }
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
                  <Pill className="h-6 w-6" style={{ color: clinicSettings.primaryColor }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    New Prescription
                  </h1>
                  <p className="text-sm text-gray-500">
                    Create prescription for {patient.firstName} {patient.lastName}
                  </p>
                </div>
              </div>
            </div>
            
            {ehrId && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50/80 rounded-xl border border-blue-200/50">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Linked to EHR</span>
              </div>
            )}
          </div>
        </div>

        {/* Patient Info Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 mb-8 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-xl" style={{ 
              backgroundColor: clinicSettings.secondaryColor + '15',
              boxShadow: `0 4px 12px ${clinicSettings.secondaryColor}30`
            }}>
              <User className="h-5 w-5" style={{ color: clinicSettings.secondaryColor }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Patient Information</h3>
              <p className="text-sm text-gray-500">Prescription will be created for this patient</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50/80 to-white/80 rounded-xl p-4 border border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-white/80 shadow-sm">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-lg">
                  {patient.firstName} {patient.lastName}
                </p>
                <p className="text-sm text-gray-600">Patient ID: {patient._id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Prescription Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-xl" style={{ 
              backgroundColor: clinicSettings.accentColor + '15',
              boxShadow: `0 4px 12px ${clinicSettings.accentColor}30`
            }}>
              <Pill className="h-5 w-5" style={{ color: clinicSettings.accentColor }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Prescription Details</h3>
              <p className="text-sm text-gray-500">Enter medication information and instructions</p>
            </div>
          </div>
          
          <PrescriptionForm 
            patientId={resolvedParams.id} 
            ehrId={ehrId}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
}