"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/ui/file-upload";
import { AppointmentSelect } from "@/components/ui/appointment-select";
import { X } from "lucide-react";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
}

export default function NewEHRPage({ params }: { params: { id: string } }) {
  // Unwrap params with React.use()
  const unwrappedParams = use(params);
  const patientId = unwrappedParams.id;
  
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPatient, setIsFetchingPatient] = useState(true);
  const [tagInput, setTagInput] = useState("");
  const [formData, setFormData] = useState({
    patientId: patientId,
    appointmentId: undefined as string | undefined,
    visitDate: new Date().toISOString().split("T")[0],
    vitals: {
      bloodPressure: {
        systolic: "",
        diastolic: "",
      },
      heartRate: "",
      respiratoryRate: "",
      temperature: "",
      oxygenSaturation: "",
      height: "",
      weight: "",
    },
    diagnosis: "",
    diagnosisSummary: "",
    notes: {
      subjective: "",
      objective: "",
      assessment: "",
      plan: "",
      additionalNotes: "",
    },
    tags: [] as string[],
    attachments: [] as { name: string; fileUrl: string; fileType: string }[],
  });

  useEffect(() => {
    fetchPatient();
  }, [patientId]);

  const fetchPatient = async () => {
    setIsFetchingPatient(true);
    try {
      const response = await fetch(`/api/patients/${patientId}`);
      if (!response.ok) throw new Error("Failed to fetch patient");
      const data = await response.json();
      setPatient(data);
    } catch (error) {
      toast.error("Failed to fetch patient details");
      router.push("/dashboard/patients");
    } finally {
      setIsFetchingPatient(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof typeof formData],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleVitalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes(".")) {
      const [_, vitalType, subType] = name.split(".");
      
      if (subType) {
        setFormData({
          ...formData,
          vitals: {
            ...formData.vitals,
            [vitalType]: {
              ...formData.vitals[vitalType as keyof typeof formData.vitals],
              [subType]: value,
            },
          },
        });
      } else {
        setFormData({
          ...formData,
          vitals: {
            ...formData.vitals,
            [vitalType]: value,
          },
        });
      }
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const noteType = name.split(".")[1];
    
    setFormData({
      ...formData,
      notes: {
        ...formData.notes,
        [noteType]: value,
      },
    });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tagInput.trim()],
        });
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Convert string values to numbers for vitals
      const processedFormData = {
        ...formData,
        vitals: {
          bloodPressure: {
            systolic: formData.vitals.bloodPressure.systolic ? 
              Number(formData.vitals.bloodPressure.systolic) : undefined,
            diastolic: formData.vitals.bloodPressure.diastolic ? 
              Number(formData.vitals.bloodPressure.diastolic) : undefined,
          },
          heartRate: formData.vitals.heartRate ? 
            Number(formData.vitals.heartRate) : undefined,
          respiratoryRate: formData.vitals.respiratoryRate ? 
            Number(formData.vitals.respiratoryRate) : undefined,
          temperature: formData.vitals.temperature ? 
            Number(formData.vitals.temperature) : undefined,
          oxygenSaturation: formData.vitals.oxygenSaturation ? 
            Number(formData.vitals.oxygenSaturation) : undefined,
          height: formData.vitals.height ? 
            Number(formData.vitals.height) : undefined,
          weight: formData.vitals.weight ? 
            Number(formData.vitals.weight) : undefined,
        }
      };
      
      const response = await fetch("/api/ehr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedFormData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create EHR record");
      }
      
      toast.success("EHR record created successfully");
      router.push(`/dashboard/patients/${patientId}/ehr`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create EHR record");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingPatient) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-pulse">Loading patient details...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6">
        <Card>
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
    <div className="p-6 bg-background">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          New EHR Record for {patient.firstName} {patient.lastName}
        </h1>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/patients/${patientId}/ehr`)}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Visit Information</CardTitle>
            <CardDescription>Basic information about this visit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <AppointmentSelect
                patientId={patientId}
                value={formData.appointmentId}
                onChange={(appointmentId) => {
                  setFormData({
                    ...formData,
                    appointmentId,
                  });
                }}
                className="mb-4"
              />
              <div>
                <Label htmlFor="visitDate">Visit Date</Label>
                <Input
                  id="visitDate"
                  name="visitDate"
                  type="date"
                  value={formData.visitDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="diagnosis">Primary Diagnosis</Label>
                <Input
                  id="diagnosis"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  placeholder="Primary diagnosis"
                  required
                />
              </div>
              <div>
                <Label htmlFor="diagnosisSummary">Diagnosis Summary</Label>
                <Textarea
                  id="diagnosisSummary"
                  name="diagnosisSummary"
                  value={formData.diagnosisSummary}
                  onChange={handleInputChange}
                  placeholder="Brief summary of the diagnosis"
                  required
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (press Enter to add)</Label>
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add tags (e.g., Follow-up, Critical)"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Vitals</CardTitle>
            <CardDescription>Patient vital signs during this visit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vitals.bloodPressure.systolic">Blood Pressure (Systolic)</Label>
                <Input
                  id="vitals.bloodPressure.systolic"
                  name="vitals.bloodPressure.systolic"
                  type="number"
                  value={formData.vitals.bloodPressure.systolic}
                  onChange={handleVitalsChange}
                  placeholder="mmHg"
                />
              </div>
              <div>
                <Label htmlFor="vitals.bloodPressure.diastolic">Blood Pressure (Diastolic)</Label>
                <Input
                  id="vitals.bloodPressure.diastolic"
                  name="vitals.bloodPressure.diastolic"
                  type="number"
                  value={formData.vitals.bloodPressure.diastolic}
                  onChange={handleVitalsChange}
                  placeholder="mmHg"
                />
              </div>
              <div>
                <Label htmlFor="vitals.heartRate">Heart Rate</Label>
                <Input
                  id="vitals.heartRate"
                  name="vitals.heartRate"
                  type="number"
                  value={formData.vitals.heartRate}
                  onChange={handleVitalsChange}
                  placeholder="bpm"
                />
              </div>
              <div>
                <Label htmlFor="vitals.respiratoryRate">Respiratory Rate</Label>
                <Input
                  id="vitals.respiratoryRate"
                  name="vitals.respiratoryRate"
                  type="number"
                  value={formData.vitals.respiratoryRate}
                  onChange={handleVitalsChange}
                  placeholder="breaths/min"
                />
              </div>
              <div>
                <Label htmlFor="vitals.temperature">Temperature</Label>
                <Input
                  id="vitals.temperature"
                  name="vitals.temperature"
                  type="number"
                  step="0.1"
                  value={formData.vitals.temperature}
                  onChange={handleVitalsChange}
                  placeholder="°C"
                />
              </div>
              <div>
                <Label htmlFor="vitals.oxygenSaturation">Oxygen Saturation</Label>
                <Input
                  id="vitals.oxygenSaturation"
                  name="vitals.oxygenSaturation"
                  type="number"
                  value={formData.vitals.oxygenSaturation}
                  onChange={handleVitalsChange}
                  placeholder="%"
                />
              </div>
              <div>
                <Label htmlFor="vitals.height">Height</Label>
                <Input
                  id="vitals.height"
                  name="vitals.height"
                  type="number"
                  step="0.01"
                  value={formData.vitals.height}
                  onChange={handleVitalsChange}
                  placeholder="cm"
                />
              </div>
              <div>
                <Label htmlFor="vitals.weight">Weight</Label>
                <Input
                  id="vitals.weight"
                  name="vitals.weight"
                  type="number"
                  step="0.1"
                  value={formData.vitals.weight}
                  onChange={handleVitalsChange}
                  placeholder="kg"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>SOAP Notes</CardTitle>
            <CardDescription>Detailed clinical notes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="notes.subjective">Subjective</Label>
                <Textarea
                  id="notes.subjective"
                  name="notes.subjective"
                  value={formData.notes.subjective}
                  onChange={handleNotesChange}
                  placeholder="Patient's symptoms, complaints, and history"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="notes.objective">Objective</Label>
                <Textarea
                  id="notes.objective"
                  name="notes.objective"
                  value={formData.notes.objective}
                  onChange={handleNotesChange}
                  placeholder="Measurable, observable data from examination"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="notes.assessment">Assessment</Label>
                <Textarea
                  id="notes.assessment"
                  name="notes.assessment"
                  value={formData.notes.assessment}
                  onChange={handleNotesChange}
                  placeholder="Analysis and interpretation of the findings"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="notes.plan">Plan</Label>
                <Textarea
                  id="notes.plan"
                  name="notes.plan"
                  value={formData.notes.plan}
                  onChange={handleNotesChange}
                  placeholder="Treatment plan, medications, follow-up"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="notes.additionalNotes">Additional Notes</Label>
                <Textarea
                  id="notes.additionalNotes"
                  name="notes.additionalNotes"
                  value={formData.notes.additionalNotes}
                  onChange={handleNotesChange}
                  placeholder="Any additional information"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
            <CardDescription>Upload related files or documents</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileUpload={(fileData) => {
                setFormData({
                  ...formData,
                  attachments: [...formData.attachments, {
                    ...fileData,
                    uploadedAt: new Date().toISOString()
                  }],
                });
              }}
            />
            
            {formData.attachments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Uploaded Files</h4>
                <ul className="space-y-2">
                  {formData.attachments.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            attachments: formData.attachments.filter((_, i) => i !== index),
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/patients/${patientId}/ehr`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create EHR Record"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}