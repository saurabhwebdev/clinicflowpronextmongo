"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface EHRRecord {
  _id: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  visitDate: string;
  vitals: {
    bloodPressure?: {
      systolic?: number;
      diastolic?: number;
    };
    heartRate?: number;
    respiratoryRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    height?: number;
    weight?: number;
  };
  diagnosis: string;
  diagnosisSummary: string;
  notes: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    additionalNotes?: string;
  };
  tags: string[];
  attachments: {
    name: string;
    fileUrl: string;
    fileType: string;
    uploadedAt: string;
  }[];
  prescriptionIds?: {
    _id: string;
    prescriptionDate: string;
    status: string;
    medications: {
      drugName: string;
      dosage: string;
      frequency: string;
      duration: string;
    }[];
  }[];
  createdBy: {
    _id: string;
    name: string;
  };
  updatedBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function EHRDetailPage({ 
  params 
}: { 
  params: { id: string; ehrId: string } 
}) {
  const router = useRouter();
  const [ehrRecord, setEhrRecord] = useState<EHRRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEHRRecord();
  }, [params.ehrId]);

  const fetchEHRRecord = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ehr/${params.ehrId}`);
      if (!response.ok) throw new Error("Failed to fetch EHR record");
      const data = await response.json();
      setEhrRecord(data);
    } catch (error) {
      toast.error("Failed to fetch EHR record");
      router.push(`/dashboard/patients/${params.id}/ehr`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this EHR record? This action cannot be undone.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/ehr/${params.ehrId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete EHR record");
      }
      
      toast.success("EHR record deleted successfully");
      router.push(`/dashboard/patients/${params.id}/ehr`);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete EHR record");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-pulse">Loading EHR record...</div>
      </div>
    );
  }

  if (!ehrRecord) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>EHR record not found</p>
            <Button 
              onClick={() => router.push(`/dashboard/patients/${params.id}/ehr`)}
              className="mt-4"
            >
              Back to EHR Records
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            EHR Record: {ehrRecord.diagnosis}
          </h1>
          <p className="text-muted-foreground">
            Visit Date: {formatDate(ehrRecord.visitDate)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/patients/${params.id}/ehr`)}
          >
            Back to Records
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/patients/${params.id}/ehr/${params.ehrId}/edit`)}
          >
            Edit Record
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Delete Record
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Diagnosis</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {ehrRecord.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Primary Diagnosis</h3>
                  <p>{ehrRecord.diagnosis}</p>
                </div>
                <div>
                  <h3 className="font-medium">Summary</h3>
                  <p>{ehrRecord.diagnosisSummary}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>SOAP Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {ehrRecord.notes.subjective && (
                  <div>
                    <h3 className="font-medium mb-2">Subjective</h3>
                    <p className="whitespace-pre-wrap">{ehrRecord.notes.subjective}</p>
                  </div>
                )}
                
                {ehrRecord.notes.objective && (
                  <div>
                    <h3 className="font-medium mb-2">Objective</h3>
                    <p className="whitespace-pre-wrap">{ehrRecord.notes.objective}</p>
                  </div>
                )}
                
                {ehrRecord.notes.assessment && (
                  <div>
                    <h3 className="font-medium mb-2">Assessment</h3>
                    <p className="whitespace-pre-wrap">{ehrRecord.notes.assessment}</p>
                  </div>
                )}
                
                {ehrRecord.notes.plan && (
                  <div>
                    <h3 className="font-medium mb-2">Plan</h3>
                    <p className="whitespace-pre-wrap">{ehrRecord.notes.plan}</p>
                  </div>
                )}
                
                {ehrRecord.notes.additionalNotes && (
                  <div>
                    <h3 className="font-medium mb-2">Additional Notes</h3>
                    <p className="whitespace-pre-wrap">{ehrRecord.notes.additionalNotes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {ehrRecord.attachments && ehrRecord.attachments.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ehrRecord.attachments.map((attachment, index) => (
                    <div key={index} className="border rounded-md p-3">
                      <p className="font-medium">{attachment.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(attachment.uploadedAt)}
                      </p>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto" 
                        asChild
                      >
                        <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer">
                          View File
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Vitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ehrRecord.vitals.bloodPressure?.systolic && ehrRecord.vitals.bloodPressure?.diastolic && (
                  <div className="flex justify-between">
                    <span className="font-medium">Blood Pressure:</span>
                    <span>{ehrRecord.vitals.bloodPressure.systolic}/{ehrRecord.vitals.bloodPressure.diastolic} mmHg</span>
                  </div>
                )}
                
                {ehrRecord.vitals.heartRate && (
                  <div className="flex justify-between">
                    <span className="font-medium">Heart Rate:</span>
                    <span>{ehrRecord.vitals.heartRate} bpm</span>
                  </div>
                )}
                
                {ehrRecord.vitals.respiratoryRate && (
                  <div className="flex justify-between">
                    <span className="font-medium">Respiratory Rate:</span>
                    <span>{ehrRecord.vitals.respiratoryRate} breaths/min</span>
                  </div>
                )}
                
                {ehrRecord.vitals.temperature && (
                  <div className="flex justify-between">
                    <span className="font-medium">Temperature:</span>
                    <span>{ehrRecord.vitals.temperature} °C</span>
                  </div>
                )}
                
                {ehrRecord.vitals.oxygenSaturation && (
                  <div className="flex justify-between">
                    <span className="font-medium">Oxygen Saturation:</span>
                    <span>{ehrRecord.vitals.oxygenSaturation}%</span>
                  </div>
                )}
                
                {ehrRecord.vitals.height && (
                  <div className="flex justify-between">
                    <span className="font-medium">Height:</span>
                    <span>{ehrRecord.vitals.height} cm</span>
                  </div>
                )}
                
                {ehrRecord.vitals.weight && (
                  <div className="flex justify-between">
                    <span className="font-medium">Weight:</span>
                    <span>{ehrRecord.vitals.weight} kg</span>
                  </div>
                )}
                
                {Object.values(ehrRecord.vitals).every(v => 
                  v === undefined || 
                  (typeof v === 'object' && Object.values(v).every(sv => sv === undefined))
                ) && (
                  <p className="text-muted-foreground">No vitals recorded</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Prescriptions</CardTitle>
              <Button
                size="sm"
                onClick={() => router.push(`/dashboard/patients/${params.id}/prescriptions/new?ehrId=${params.ehrId}`)}
              >
                Add Prescription
              </Button>
            </CardHeader>
            <CardContent>
              {ehrRecord.prescriptionIds && ehrRecord.prescriptionIds.length > 0 ? (
                <div className="space-y-3">
                  {ehrRecord.prescriptionIds.map((prescription: any) => (
                    <div key={prescription._id} className="border rounded-md p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">
                            {formatDate(prescription.prescriptionDate)}
                          </p>
                          <div className="mt-1">
                            <Badge variant={
                              prescription.status === "active" ? "default" : 
                              prescription.status === "completed" ? "success" : 
                              "destructive"
                            }>
                              {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/patients/${params.id}/prescriptions/${prescription._id}`)}
                        >
                          View Full Prescription
                        </Button>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium">Medications:</p>
                        <ul className="list-disc list-inside text-sm mt-1">
                          {prescription.medications.slice(0, 3).map((med: any, index: number) => (
                            <li key={index} className="text-muted-foreground">
                              {med.drugName} - {med.dosage}
                            </li>
                          ))}
                          {prescription.medications.length > 3 && (
                            <li className="text-muted-foreground">
                              +{prescription.medications.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No prescriptions linked to this EHR record</p>
                  <Button
                    className="mt-2"
                    onClick={() => router.push(`/dashboard/patients/${params.id}/prescriptions/new?ehrId=${params.ehrId}`)}
                  >
                    Create Prescription
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Record Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Created By:</span>
                  <span>{ehrRecord.createdBy?.name || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Created At:</span>
                  <span>{formatDateTime(ehrRecord.createdAt)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="font-medium">Last Updated By:</span>
                  <span>{ehrRecord.updatedBy?.name || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Last Updated At:</span>
                  <span>{formatDateTime(ehrRecord.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}