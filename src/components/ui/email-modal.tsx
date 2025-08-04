"use client";

import { useState, useEffect } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, X, Mail, FileText } from "lucide-react";
import { toast } from "sonner";

interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  content: string;
  type: string;
}

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientEmail?: string;
  patientName?: string;
  appointmentId?: string;
  defaultSubject?: string;
  defaultContent?: string;
}

export function EmailModal({
  isOpen,
  onClose,
  patientEmail,
  patientName,
  appointmentId,
  defaultSubject = "",
  defaultContent = ""
}: EmailModalProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipient: patientEmail || "",
    subject: defaultSubject,
    content: defaultContent,
    template: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      setFormData({
        recipient: patientEmail || "",
        subject: defaultSubject,
        content: defaultContent,
        template: "",
      });
    }
  }, [isOpen, patientEmail, defaultSubject, defaultContent]);

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
        onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="pb-6 border-b border-gray-100/50">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <span>Send Email</span>
              {patientName && (
                <div className="text-sm font-normal text-gray-500 mt-1">
                  to <span className="font-semibold text-gray-700">{patientName}</span>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

                 <div className="space-y-6 py-4">
          {/* Template Selection */}
          <div className="group">
            <Label htmlFor="template" className="text-sm font-semibold text-gray-700 mb-3 block">
              <FileText className="h-4 w-4 inline mr-2 text-blue-500" />
              Use Template (Optional)
            </Label>
            <Select
              value={formData.template}
              onValueChange={handleTemplateSelect}
            >
              <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm">
                <SelectValue placeholder="Choose an email template..." />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-xl">
                {templates.map((template) => (
                  <SelectItem key={template._id} value={template._id} className="py-3 hover:bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{template.name}</div>
                        <div className="text-xs text-gray-500">{template.subject}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipient */}
          <div className="group">
            <Label htmlFor="recipient" className="text-sm font-semibold text-gray-700 mb-3 block">
              <Mail className="h-4 w-4 inline mr-2 text-green-500" />
              Recipient Email *
            </Label>
            <Input
              id="recipient"
              value={formData.recipient}
              onChange={(e) =>
                setFormData({ ...formData, recipient: e.target.value })
              }
              placeholder="patient@example.com"
              required
              className="h-12 border-2 border-gray-200 rounded-xl hover:border-green-300 transition-all duration-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white/80 backdrop-blur-sm"
            />
          </div>

          {/* Subject */}
          <div className="group">
            <Label htmlFor="subject" className="text-sm font-semibold text-gray-700 mb-3 block">
              <span className="inline-block w-4 h-4 mr-2 text-orange-500">📧</span>
              Subject *
            </Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              placeholder="Enter a clear and concise subject..."
              required
              className="h-12 border-2 border-gray-200 rounded-xl hover:border-orange-300 transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white/80 backdrop-blur-sm"
            />
          </div>

          {/* Content */}
          <div className="group">
            <Label htmlFor="content" className="text-sm font-semibold text-gray-700 mb-3 block">
              <span className="inline-block w-4 h-4 mr-2 text-purple-500">✍️</span>
              Message *
            </Label>
                         <Textarea
               id="content"
               value={formData.content}
               onChange={(e) =>
                 setFormData({ ...formData, content: e.target.value })
               }
               placeholder="Write your message here... You can use templates or write a custom message."
               rows={8}
               required
               className="border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all duration-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white/80 backdrop-blur-sm resize-none"
             />
            <div className="text-xs text-gray-500 mt-2">
              💡 Tip: Personalize your message to make it more engaging for the patient.
            </div>
          </div>

                     {/* Action Buttons */}
           <div className="flex gap-4 pt-4 border-t border-gray-100/50">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-white"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 