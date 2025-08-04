"use client";

import { useState, useEffect } from "react";
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
import { ArrowLeft, Send, Save, Eye } from "lucide-react";
import { toast } from "sonner";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  content: string;
  type: string;
}

export default function ComposeEmailPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipient: "",
    subject: "",
    content: "",
    template: "",
  });

  useEffect(() => {
    fetchPatients();
    fetchTemplates();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/admin/users?role=patient");
      if (response.ok) {
        const data = await response.json();
        setPatients(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/email/templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t._id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        template: templateId,
        subject: template.subject,
        content: template.content,
      }));
    }
  };

  const handleSendEmail = async () => {
    if (!formData.recipient || !formData.subject || !formData.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: formData.recipient,
          subject: formData.subject,
          content: formData.content,
          templateId: formData.template || undefined,
        }),
      });

      if (response.ok) {
        toast.success("Email sent successfully!");
        router.push("/dashboard/email");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to send email");
      }
    } catch (error) {
      toast.error("Failed to send email");
      console.error("Error sending email:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    // Implementation for saving as draft
    toast.info("Draft functionality coming soon!");
  };

  const selectedPatient = patients.find(p => p._id === formData.recipient);

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
        <h1 className="text-3xl font-bold text-gray-900">Compose Email</h1>
        <p className="text-gray-600 mt-2">
          Send an email to a patient
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Compose Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>New Email</CardTitle>
              <CardDescription>
                Compose and send an email to a patient
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Selection */}
              <div>
                <Label htmlFor="template">Use Template (Optional)</Label>
                <Select
                  value={formData.template}
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template._id} value={template._id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Recipient Selection */}
              <div>
                <Label htmlFor="recipient">Recipient *</Label>
                <Select
                  value={formData.recipient}
                  onValueChange={(value) =>
                    setFormData({ ...formData, recipient: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient._id} value={patient._id}>
                        {patient.firstName} {patient.lastName} ({patient.email})
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
                <Label htmlFor="content">Message *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Enter your message here..."
                  rows={12}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSendEmail}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? "Sending..." : "Send Email"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSaveAsDraft}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
              </div>
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
                  <Label className="text-sm font-medium text-gray-500">To:</Label>
                  <p className="text-sm">
                    {selectedPatient
                      ? `${selectedPatient.firstName} ${selectedPatient.lastName} <${selectedPatient.email}>`
                      : "No recipient selected"}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Subject:</Label>
                  <p className="text-sm">{formData.subject || "No subject"}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Message:</Label>
                  <div className="text-sm bg-gray-50 p-3 rounded-md min-h-[200px] whitespace-pre-wrap">
                    {formData.content || "No message content"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}