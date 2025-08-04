"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";

interface EHRRecord {
  _id: string;
  patientId: string;
  visitDate: string;
  diagnosis: string;
  diagnosisSummary: string;
  tags: string[];
}

export function EHRTimeline({ patientId }: { patientId: string }) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse">Loading records...</div>
      </div>
    );
  }

  if (ehrRecords.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No EHR records found for this patient</p>
        <Button 
          onClick={() => router.push(`/dashboard/patients/${patientId}/ehr/new`)}
          className="mt-4"
        >
          Create First Record
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <ul className="space-y-4">
        {ehrRecords.slice(0, 5).map((record) => (
          <li key={record._id} className="border rounded-md p-4 hover:bg-accent/50 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formatDate(record.visitDate)}</span>
                </div>
                <h3 className="font-medium">{record.diagnosis}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {record.diagnosisSummary}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {record.tags?.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {record.tags?.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{record.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 md:mt-0 shrink-0"
                onClick={() => router.push(`/dashboard/patients/${patientId}/ehr/${record._id}`)}
              >
                View Details
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {ehrRecords.length > 5 && (
        <div className="flex justify-center mt-4">
          <Button
            variant="link"
            onClick={() => router.push(`/dashboard/patients/${patientId}/ehr`)}
          >
            View All Records ({ehrRecords.length})
          </Button>
        </div>
      )}
    </div>
  );
}