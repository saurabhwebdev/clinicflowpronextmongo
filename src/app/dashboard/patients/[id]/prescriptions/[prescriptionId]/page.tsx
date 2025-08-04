"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PrescriptionForm } from "@/components/ui/prescription-form";

interface Prescription {
  _id: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  doctorId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  ehrId?: {
    _id: string;
    diagnosis: string;
    visitDate: string;
  };
  prescriptionDate: string;
  medications: {
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
  }[];
  notes?: string;
  attachment?: {
    name: string;
    fileUrl: string;
    fileType: string;
    uploadedAt: string;
  };
  status: "active" | "completed" | "cancelled";
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  updatedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function PrescriptionDetailPage({ 
  params 
}: { 
  params: { id: string; prescriptionId: string } 
}) {
  const router = useRouter();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchPrescription();
  }, [params.prescriptionId]);

  const fetchPrescription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/prescriptions/${params.prescriptionId}`);
      if (!response.ok) throw new Error("Failed to fetch prescription");
      
      const data = await response.json();
      setPrescription(data);
    } catch (error) {
      console.error("Error fetching prescription:", error);
      toast.error("Failed to load prescription");
      router.push(`/dashboard/patients/${params.id}/prescriptions`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this prescription? This action cannot be undone.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/prescriptions/${params.prescriptionId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete prescription");
      }
      
      toast.success("Prescription deleted successfully");
      router.push(`/dashboard/patients/${params.id}/prescriptions`);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete prescription");
    }
  };

  const handleUpdateSuccess = (data: any) => {
    setPrescription(data);
    setIsEditing(false);
    toast.success("Prescription updated successfully");
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "success";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-pulse">Loading prescription...</div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Prescription not found</p>
            <Button 
              onClick={() => router.push(`/dashboard/patients/${params.id}/prescriptions`)}
              className="mt-4"
            >
              Back to Prescriptions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="p-6 bg-background">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Edit Prescription
              </h1>
              <p className="text-muted-foreground">
                Update prescription details
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <PrescriptionForm 
              patientId={params.id}
              initialData={prescription}
              onSuccess={handleUpdateSuccess}
            />
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
            Prescription
          </h1>
          <p className="text-muted-foreground">
            Date: {formatDate(prescription.prescriptionDate)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/patients/${params.id}/prescriptions`)}
          >
            Back to Prescriptions
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            Edit Prescription
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Medications</CardTitle>
              <Badge variant={getStatusBadgeVariant(prescription.status)}>
                {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {prescription.medications.map((medication, index) => (
                  <div key={index} className="border p-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium">Drug Name</h3>
                        <p>{medication.drugName}</p>
                      </div>
                      <div>
                        <h3 className="font-medium">Dosage</h3>
                        <p>{medication.dosage}</p>
                      </div>
                      <div>
                        <h3 className="font-medium">Frequency</h3>
                        <p>{medication.frequency}</p>
                      </div>
                      <div>
                        <h3 className="font-medium">Duration</h3>
                        <p>{medication.duration}</p>
                      </div>
                      {medication.notes && (
                        <div className="md:col-span-2">
                          <h3 className="font-medium">Notes</h3>
                          <p className="whitespace-pre-wrap">{medication.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {prescription.notes && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{prescription.notes}</p>
              </CardContent>
            </Card>
          )}

          {prescription.attachment && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Attachment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-3">
                  <p className="font-medium">{prescription.attachment.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(prescription.attachment.uploadedAt)}
                  </p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto" 
                    asChild
                  >
                    <a href={prescription.attachment.fileUrl} target="_blank" rel="noopener noreferrer">
                      View File
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Name:</span>{" "}
                  {prescription.patientId.firstName} {prescription.patientId.lastName}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => router.push(`/dashboard/patients/${params.id}`)}
                >
                  View Patient Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Prescribing Doctor</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <span className="font-medium">Doctor:</span>{" "}
                Dr. {prescription.doctorId.firstName} {prescription.doctorId.lastName}
              </div>
            </CardContent>
          </Card>

          {prescription.ehrId && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Linked EHR Record</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Diagnosis:</span>{" "}
                    {prescription.ehrId.diagnosis}
                  </div>
                  <div>
                    <span className="font-medium">Visit Date:</span>{" "}
                    {formatDate(prescription.ehrId.visitDate)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => router.push(`/dashboard/patients/${params.id}/ehr/${prescription.ehrId._id}`)}
                  >
                    View EHR Record
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Record Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Created By:</span>
                  <span>
                    {prescription.createdBy?.firstName} {prescription.createdBy?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Created At:</span>
                  <span>{formatDateTime(prescription.createdAt)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="font-medium">Last Updated By:</span>
                  <span>
                    {prescription.updatedBy?.firstName} {prescription.updatedBy?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Last Updated At:</span>
                  <span>{formatDateTime(prescription.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}