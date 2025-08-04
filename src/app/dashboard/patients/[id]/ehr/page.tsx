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
} from "@/components/ui/card";
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
import { toast } from "sonner";

interface EHRRecord {
  _id: string;
  patientId: string;
  visitDate: string;
  diagnosis: string;
  diagnosisSummary: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function PatientEHRPage({ params }: { params: { id: string } }) {
  // Unwrap params with React.use()
  const unwrappedParams = use(params);
  const patientId = unwrappedParams.id;
  
  const router = useRouter();
  const [ehrRecords, setEhrRecords] = useState<EHRRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEHRRecords();
  }, [patientId]);

  const fetchEHRRecords = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ehr?patientId=${patientId}`);
      if (!response.ok) throw new Error("Failed to fetch EHR records");
      const data = await response.json();
      setEhrRecords(data);
    } catch (error) {
      toast.error("Failed to fetch EHR records");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEHR = async (ehrId: string) => {
    if (!confirm("Are you sure you want to delete this EHR record? This action cannot be undone.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/ehr/${ehrId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete EHR record");
      }
      
      toast.success("EHR record deleted successfully");
      fetchEHRRecords();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete EHR record");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 bg-background">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Patient EHR Records</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/patients/${patientId}`)}
          >
            Back to Patient
          </Button>
          <Button onClick={() => router.push(`/dashboard/patients/${patientId}/ehr/new`)}>
            Add New EHR Record
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Electronic Health Records</CardTitle>
          <CardDescription>
            View and manage patient health records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse">Loading records...</div>
            </div>
          ) : ehrRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No EHR records found for this patient</p>
              <Button 
                onClick={() => router.push(`/dashboard/patients/${patientId}/ehr/new`)}
                className="mt-4"
              >
                Create First Record
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visit Date</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ehrRecords.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>{formatDate(record.visitDate)}</TableCell>
                      <TableCell>{record.diagnosis}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {record.diagnosisSummary}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {record.tags?.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/dashboard/patients/${patientId}/ehr/${record._id}`)
                            }
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/dashboard/patients/${patientId}/ehr/${record._id}/edit`)
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteEHR(record._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}