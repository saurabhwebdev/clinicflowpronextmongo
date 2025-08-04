"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { File, X, Upload } from "lucide-react";

interface FileUploadProps {
  onFileUpload: (fileData: { name: string; fileUrl: string; fileType: string }) => void;
  maxSizeMB?: number;
  allowedFileTypes?: string[];
}

export function FileUpload({
  onFileUpload,
  maxSizeMB = 5,
  allowedFileTypes = ["image/jpeg", "image/png", "application/pdf", "image/gif"],
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    // Check file size
    if (file.size > maxSizeBytes) {
      toast.error(`File size exceeds the maximum allowed size (${maxSizeMB}MB)`);
      return;
    }

    // Check file type
    if (!allowedFileTypes.includes(file.type)) {
      toast.error("File type not supported");
      return;
    }

    setUploadedFiles([...uploadedFiles, file]);
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);

    try {
      // In a real implementation, you would upload to a storage service
      // For now, we'll simulate a successful upload with a local URL
      
      // Create a FormData object
      const formData = new FormData();
      formData.append("file", file);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would get the URL from the server response
      // For now, we'll create a fake URL
      const fileUrl = URL.createObjectURL(file);
      
      // Call the callback with the file information
      onFileUpload({
        name: file.name,
        fileUrl: fileUrl,
        fileType: file.type,
      });
      
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload file");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="file-upload">Upload File</Label>
        <div className="flex items-center gap-2">
          <Input
            id="file-upload"
            type="file"
            className="cursor-pointer"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {isUploading && <div className="animate-spin">⏳</div>}
        </div>
        <p className="text-xs text-muted-foreground">
          Max size: {maxSizeMB}MB. Allowed types: {allowedFileTypes.map(type => type.split("/")[1]).join(", ")}
        </p>
      </div>
    </div>
  );
}