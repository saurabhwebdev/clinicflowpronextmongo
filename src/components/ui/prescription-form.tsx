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
  status: z.enum(["active", "completed", "cancelled"]),
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
        console.log("Doctors API response:", data); // Debug log
        
        // The API returns { doctors: [...] }, so we need to access data.doctors
        const doctorsList = data.doctors || [];
        console.log("Doctors list:", doctorsList); // Debug log
        setDoctors(Array.isArray(doctorsList) ? doctorsList : []);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to load doctors");
        setDoctors([]);
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
        setEhrRecords(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching EHR records:", error);
        toast.error("Failed to load EHR records");
        setEhrRecords([]);
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-md transition-all duration-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="prescriptionDate" className="text-sm font-semibold text-gray-700">
              Prescription Date *
            </Label>
            <Input
              id="prescriptionDate"
              type="date"
              {...form.register("prescriptionDate")}
              className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
            />
            {form.formState.errors.prescriptionDate && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.prescriptionDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctorId" className="text-sm font-semibold text-gray-700">
              Prescribing Doctor *
            </Label>
            <Select
              value={form.watch("doctorId")}
              onValueChange={(value) => form.setValue("doctorId", value)}
            >
              <SelectTrigger className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200">
                <SelectValue placeholder="Select Doctor" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-0 shadow-lg">
                {Array.isArray(doctors) && doctors.length > 0 ? (
                  doctors.map((doctor) => (
                    <SelectItem key={doctor._id} value={doctor._id}>
                      Dr. {doctor.firstName} {doctor.lastName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-doctors" disabled>
                    No doctors available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {form.formState.errors.doctorId && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.doctorId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ehrId" className="text-sm font-semibold text-gray-700">
              Link to EHR Record (Optional)
            </Label>
            <Select
              value={form.watch("ehrId") || "none"}
              onValueChange={(value) => form.setValue("ehrId", value === "none" ? "" : value)}
            >
              <SelectTrigger className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200">
                <SelectValue placeholder="Select EHR Record (Optional)" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-0 shadow-lg">
                <SelectItem value="none">None</SelectItem>
                {Array.isArray(ehrRecords) && ehrRecords.map((record) => (
                  <SelectItem key={record._id} value={record._id}>
                    {new Date(record.visitDate).toLocaleDateString()} - {record.diagnosis}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-semibold text-gray-700">
              Status *
            </Label>
            <Select
              value={form.watch("status")}
              onValueChange={(value: "active" | "completed" | "cancelled") =>
                form.setValue("status", value)
              }
            >
              <SelectTrigger className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-0 shadow-lg">
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
      </div>

      {/* Medications Section */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Medications</h3>
            <p className="text-sm text-gray-500">Add prescribed medications with dosage instructions</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ drugName: "", dosage: "", frequency: "", duration: "", notes: "" })}
            className="transition-all duration-200 hover:scale-105 border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            Add Medication
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-700">Medication {index + 1}</h4>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="hover:bg-red-50 text-red-500 transition-all duration-200"
                  >
                    Remove
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`medications.${index}.drugName`} className="text-sm font-semibold text-gray-700">
                    Drug Name *
                  </Label>
                  <Input
                    id={`medications.${index}.drugName`}
                    {...form.register(`medications.${index}.drugName`)}
                    className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                    placeholder="Enter medication name"
                  />
                  {form.formState.errors.medications?.[index]?.drugName && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.medications[index]?.drugName?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`medications.${index}.dosage`} className="text-sm font-semibold text-gray-700">
                    Dosage *
                  </Label>
                  <Input
                    id={`medications.${index}.dosage`}
                    {...form.register(`medications.${index}.dosage`)}
                    className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                    placeholder="e.g., 500mg, 2 tablets"
                  />
                  {form.formState.errors.medications?.[index]?.dosage && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.medications[index]?.dosage?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`medications.${index}.frequency`} className="text-sm font-semibold text-gray-700">
                    Frequency *
                  </Label>
                  <Input
                    id={`medications.${index}.frequency`}
                    {...form.register(`medications.${index}.frequency`)}
                    className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                    placeholder="e.g., Twice daily, Every 8 hours"
                  />
                  {form.formState.errors.medications?.[index]?.frequency && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.medications[index]?.frequency?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`medications.${index}.duration`} className="text-sm font-semibold text-gray-700">
                    Duration *
                  </Label>
                  <Input
                    id={`medications.${index}.duration`}
                    {...form.register(`medications.${index}.duration`)}
                    className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                    placeholder="e.g., 7 days, 2 weeks"
                  />
                  {form.formState.errors.medications?.[index]?.duration && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.medications[index]?.duration?.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor={`medications.${index}.notes`} className="text-sm font-semibold text-gray-700">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id={`medications.${index}.notes`}
                    {...form.register(`medications.${index}.notes`)}
                    className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200 resize-none"
                    placeholder="Any special instructions for this medication"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {form.formState.errors.medications && !Array.isArray(form.formState.errors.medications) && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.medications.message}
          </p>
        )}
      </div>

      {/* Additional Notes */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-md transition-all duration-200">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Additional Notes</h3>
            <p className="text-sm text-gray-500 mb-4">Any additional instructions or comments</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200 resize-none"
              placeholder="Any additional notes or instructions"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-md transition-all duration-200">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Attachments</h3>
            <p className="text-sm text-gray-500 mb-4">Upload supporting documents (optional)</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Attach File (Optional)
            </Label>
            <FileUpload onUpload={handleFileUpload} />
            {fileUploaded && (
              <div className="flex items-center space-x-2 p-3 bg-green-50/80 rounded-xl border border-green-200/50">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-green-700 font-medium">
                  File uploaded successfully
                </p>
              </div>
            )}
            {initialData?.attachment?.fileUrl && (
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/50">
                <p className="text-sm font-medium text-blue-700 mb-1">Current attachment:</p>
                <a
                  href={initialData.attachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm transition-colors duration-200"
                >
                  {initialData.attachment.name}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 rounded-xl"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Prescription" : "Create Prescription"}
        </Button>
      </div>
    </form>
  );
}