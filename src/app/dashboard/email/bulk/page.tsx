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
// Using native HTML checkbox instead of custom component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Send, Users, Search } from "lucide-react";
import { toast } from "sonner";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  content: string;
  type: string;
}

export default function BulkEmailPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
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

  const handlePatientSelect = (patientId: string, checked: boolean) => {
    if (checked) {
      setSelectedPatients(prev => [...prev, patientId]);
    } else {
      setSelectedPatients(prev => prev.filter(id => id !== patientId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPatients(filteredPatients.map(p => p._id));
    } else {
      setSelectedPatients([]);
    }
  };

  const handleSendBulkEmail = async () => {
    if (selectedPatients.length === 0) {
      toast.error("Please select at least one patient");
      return;
    }

    if (!formData.subject || !formData.content) {
      toast.error("Please fill in subject and content");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/email/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientIds: selectedPatients,
          subject: formData.subject,
          content: formData.content,
          templateId: formData.template || undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Bulk email sent to ${result.successCount} patients`);
        if (result.failedCount > 0) {
          toast.warning(`${result.failedCount} emails failed to send`);
        }
        router.push("/dashboard/email");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to send bulk email");
      }
    } catch (error) {
      toast.error("Failed to send bulk email");
      console.error("Error sending bulk email:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName} ${patient.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const allSelected = filteredPatients.length > 0 && 
    filteredPatients.every(p => selectedPatients.includes(p._id));

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
        <h1 className="text-3xl font-bold text-gray-900">Bulk Email</h1>
        <p className="text-gray-600 mt-2">
          Send emails to multiple patients at once
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Select Recipients
            </CardTitle>
            <CardDescription>
              Choose patients to send the email to
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Select All */}
            <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="select-all"
                checked={allSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="select-all" className="font-medium">
                Select All ({filteredPatients.length} patients)
              </Label>
            </div>

            {/* Patient List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPatients.map((patient) => (
                <div
                  key={patient._id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    id={patient._id}
                    checked={selectedPatients.includes(patient._id)}
                    onChange={(e) => handlePatientSelect(patient._id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <Label htmlFor={patient._id} className="cursor-pointer">
                      <div className="font-medium">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {patient.email}
                      </div>
                    </Label>
                  </div>
                </div>
              ))}
              {filteredPatients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No patients found
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{selectedPatients.length}</strong> patients selected
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Email Composition */}
        <Card>
          <CardHeader>
            <CardTitle>Email Content</CardTitle>
            <CardDescription>
              Compose the email to send to selected patients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                rows={10}
                required
              />
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendBulkEmail}
              disabled={isLoading || selectedPatients.length === 0}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoading 
                ? "Sending..." 
                : `Send to ${selectedPatients.length} patients`
              }
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}