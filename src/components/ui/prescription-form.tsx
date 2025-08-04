"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";

const medicationSchema = z.object({
  drugName: z.string().min(1, "Drug name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
  notes: z.string().optional(),
});

const prescriptionSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  ehrId: z.string().optional(),
  prescriptionDate: z.string().min(1, "Prescription date is required"),
  medications: z.array(medicationSchema).min(1, "At least one medication is required"),
  notes: z.string().optional(),
  attachment: z.object({
    name: z.string().optional(),
    fileUrl: z.string().optional(),
    fileType: z.string().optional(),
    uploadedAt: z.date().optional(),
  }).optional(),
  status: z.enum(["active", "completed", "cancelled"]).default("active"),
});

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
}

interface EHRRecord {
  _id: string;
  diagnosis: string;
  visitDate: string;
}

interface PrescriptionFormProps {
  patientId: string;
  ehrId?: string;
  initialData?: any;
  onSuccess?: (data: any) => void;
}

export function PrescriptionForm({
  patientId,
  ehrId,
  initialData,
  onSuccess,
}: PrescriptionFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [ehrRecords, setEhrRecords] = useState<EHRRecord[]>([]);
  const [fileUploaded, setFileUploaded] = useState(false);

  const isEditing = !!initialData;

  // Set up form with validation
  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: initialData || {
      patientId,
      doctorId: session?.user?.id || "",
      ehrId: ehrId || "",
      prescriptionDate: new Date().toISOString().split("T")[0],
      medications: [{ drugName: "", dosage: "", frequency: "", duration: "", notes: "" }],
      notes: "",
      status: "active",
    },
  });

  // Set up field array for medications
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medications",
  });

  // Fetch doctors for the dropdown
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("/api/doctors");
        if (!response.ok) throw new Error("Failed to fetch doctors");
        const data = await response.json();
        setDoctors(data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to load doctors");
      }
    };

    fetchDoctors();
  }, []);

  // Fetch EHR records for this patient for the dropdown
  useEffect(() => {
    const fetchEHRRecords = async () => {
      if (!patientId) return;
      
      try {
        const response = await fetch(`/api/ehr?patientId=${patientId}`);
        if (!response.ok) throw new Error("Failed to fetch EHR records");
        const data = await response.json();
        setEhrRecords(data);
      } catch (error) {
        console.error("Error fetching EHR records:", error);
        toast.error("Failed to load EHR records");
      }
    };

    fetchEHRRecords();
  }, [patientId]);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ehr/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      
      // Update form with file data
      form.setValue("attachment", {
        name: file.name,
        fileUrl: data.fileUrl,
        fileType: file.type,
        uploadedAt: new Date(),
      });
      
      setFileUploaded(true);
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    }
  };

  // Handle form submission
  const onSubmit = async (data: PrescriptionFormValues) => {
    setIsSubmitting(true);
    
    try {
      const url = isEditing 
        ? `/api/prescriptions/${initialData._id}` 
        : "/api/prescriptions";
      
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save prescription");
      }

      const savedData = await response.json();
      
      toast.success(
        isEditing
          ? "Prescription updated successfully"
          : "Prescription created successfully"
      );
      
      if (onSuccess) {
        onSuccess(savedData);
      } else {
        router.push(`/dashboard/patients/${patientId}`);
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save prescription");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="prescriptionDate">Prescription Date</Label>
          <Input
            id="prescriptionDate"
            type="date"
            {...form.register("prescriptionDate")}
          />
          {form.formState.errors.prescriptionDate && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.prescriptionDate.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="doctorId">Prescribing Doctor</Label>
          <Select
            value={form.watch("doctorId")}
            onValueChange={(value) => form.setValue("doctorId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doctor) => (
                <SelectItem key={doctor._id} value={doctor._id}>
                  Dr. {doctor.firstName} {doctor.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.doctorId && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.doctorId.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="ehrId">Link to EHR Record (Optional)</Label>
          <Select
            value={form.watch("ehrId") || ""}
            onValueChange={(value) => form.setValue("ehrId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select EHR Record (Optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {ehrRecords.map((record) => (
                <SelectItem key={record._id} value={record._id}>
                  {new Date(record.visitDate).toLocaleDateString()} - {record.diagnosis}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={form.watch("status")}
            onValueChange={(value: "active" | "completed" | "cancelled") => 
              form.setValue("status", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.status && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.status.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Medications</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ drugName: "", dosage: "", frequency: "", duration: "", notes: "" })}
          >
            Add Medication
          </Button>
        </div>
        
        {fields.map((field, index) => (
          <Card key={field.id} className="mb-4">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`medications.${index}.drugName`}>Drug Name</Label>
                  <Input
                    id={`medications.${index}.drugName`}
                    {...form.register(`medications.${index}.drugName`)}
                  />
                  {form.formState.errors.medications?.[index]?.drugName && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.medications[index]?.drugName?.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor={`medications.${index}.dosage`}>Dosage</Label>
                  <Input
                    id={`medications.${index}.dosage`}
                    {...form.register(`medications.${index}.dosage`)}
                  />
                  {form.formState.errors.medications?.[index]?.dosage && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.medications[index]?.dosage?.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor={`medications.${index}.frequency`}>Frequency</Label>
                  <Input
                    id={`medications.${index}.frequency`}
                    {...form.register(`medications.${index}.frequency`)}
                    placeholder="e.g., Twice daily, Every 8 hours"
                  />
                  {form.formState.errors.medications?.[index]?.frequency && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.medications[index]?.frequency?.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor={`medications.${index}.duration`}>Duration</Label>
                  <Input
                    id={`medications.${index}.duration`}
                    {...form.register(`medications.${index}.duration`)}
                    placeholder="e.g., 7 days, 2 weeks"
                  />
                  {form.formState.errors.medications?.[index]?.duration && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.medications[index]?.duration?.message}
                    </p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor={`medications.${index}.notes`}>Notes (Optional)</Label>
                  <Textarea
                    id={`medications.${index}.notes`}
                    {...form.register(`medications.${index}.notes`)}
                    placeholder="Any special instructions for this medication"
                  />
                </div>
              </div>
              
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="mt-4"
                  onClick={() => remove(index)}
                >
                  Remove Medication
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        
        {form.formState.errors.medications && !Array.isArray(form.formState.errors.medications) && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.medications.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="notes">Additional Notes (Optional)</Label>
        <Textarea
          id="notes"
          {...form.register("notes")}
          placeholder="Any additional notes or instructions"
          rows={4}
        />
      </div>

      <div>
        <Label>Attach File (Optional)</Label>
        <FileUpload onUpload={handleFileUpload} />
        {fileUploaded && (
          <p className="text-sm text-green-600 mt-1">
            File uploaded successfully
          </p>
        )}
        {initialData?.attachment?.fileUrl && (
          <div className="mt-2">
            <p className="text-sm font-medium">Current attachment:</p>
            <a
              href={initialData.attachment.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              {initialData.attachment.name}
            </a>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Prescription" : "Create Prescription"}
        </Button>
      </div>
    </form>
  );
}