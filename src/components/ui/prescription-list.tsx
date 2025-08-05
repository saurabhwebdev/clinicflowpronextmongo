"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  ehrId?: string;
  prescriptionDate: string;
  medications: {
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
  }[];
  status: "active" | "completed" | "cancelled";
  createdAt: string;
}

interface PrescriptionListProps {
  patientId: string;
}

export function PrescriptionList({ patientId }: PrescriptionListProps) {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId, statusFilter]);

  const fetchPrescriptions = async () => {
    setIsLoading(true);
    try {
      let url = `/api/prescriptions?patientId=${patientId}`;
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch prescriptions");
      
      const data = await response.json();
      setPrescriptions(data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      toast.error("Failed to load prescriptions");
    } finally {
      setIsLoading(false);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleViewPrescription = (prescriptionId: string) => {
    router.push(`/dashboard/patients/${patientId}/prescriptions/${prescriptionId}`);
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading prescriptions...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label htmlFor="status-filter">Filter by Status:</Label>
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger id="status-filter" className="w-[180px]">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {prescriptions.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-muted-foreground">No prescriptions found</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Medications</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((prescription) => (
                <TableRow key={prescription._id}>
                  <TableCell>{formatDate(prescription.prescriptionDate)}</TableCell>
                  <TableCell>
                    Dr. {prescription.doctorId.firstName} {prescription.doctorId.lastName}
                  </TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside">
                      {prescription.medications.slice(0, 2).map((med, index) => (
                        <li key={index} className="truncate max-w-[200px]">
                          {med.drugName} - {med.dosage}
                        </li>
                      ))}
                      {prescription.medications.length > 2 && (
                        <li className="text-muted-foreground">
                          +{prescription.medications.length - 2} more
                        </li>
                      )}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(prescription.status)}>
                      {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPrescription(prescription._id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}