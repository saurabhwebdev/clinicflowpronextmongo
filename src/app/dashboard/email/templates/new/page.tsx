"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { toast } from "sonner";

export default function NewTemplatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    content: "",
    type: "general",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.subject || !formData.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/email/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Template created successfully!");
        router.push("/dashboard/email");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create template");
      }
    } catch (error) {
      toast.error("Failed to create template");
      console.error("Error creating template:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const templateTypes = [
    { value: "general", label: "General" },
    { value: "appointment_reminder", label: "Appointment Reminder" },
    { value: "follow_up", label: "Follow Up" },
    { value: "billing", label: "Billing" },
  ];

  return (
    <div className="p-6 bg-background">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Create Email Template</h1>
        <p className="text-gray-600 mt-2">
          Create a reusable email template
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
              <CardDescription>
                Fill in the template information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Template Name */}
                <div>
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter template name"
                    required
                  />
                </div>

                {/* Template Type */}
                <div>
                  <Label htmlFor="type">Template Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="Enter email subject"
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Enter template content..."
                    rows={12}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    You can use placeholders like {"{patient_name}"}, {"{appointment_date}"}, etc.
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Creating..." : "Create Template"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Name:</Label>
                  <p className="text-sm">{formData.name || "No name"}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Type:</Label>
                  <p className="text-sm capitalize">
                    {templateTypes.find(t => t.value === formData.type)?.label || "General"}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Subject:</Label>
                  <p className="text-sm">{formData.subject || "No subject"}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Content:</Label>
                  <div className="text-sm bg-gray-50 p-3 rounded-md min-h-[200px] whitespace-pre-wrap">
                    {formData.content || "No content"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template Variables Help */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Available Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div>
                  <code className="bg-gray-100 px-1 rounded">{"{patient_name}"}</code>
                  <span className="ml-2 text-gray-600">Patient's full name</span>
                </div>
                <div>
                  <code className="bg-gray-100 px-1 rounded">{"{patient_email}"}</code>
                  <span className="ml-2 text-gray-600">Patient's email</span>
                </div>
                <div>
                  <code className="bg-gray-100 px-1 rounded">{"{clinic_name}"}</code>
                  <span className="ml-2 text-gray-600">Your clinic name</span>
                </div>
                <div>
                  <code className="bg-gray-100 px-1 rounded">{"{date}"}</code>
                  <span className="ml-2 text-gray-600">Current date</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}