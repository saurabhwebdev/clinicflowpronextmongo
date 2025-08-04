"use client";

import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  Download,
  Printer,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  CalendarDays
} from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface AppointmentSlipProps {
  appointment: {
    _id: string;
    dateTime: string;
    status: string;
    notes?: string;
    patientId?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    doctorId?: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  };
  clinicSettings?: {
    clinicName: string;
    primaryColor: string;
  };
  onClose?: () => void;
  showModal?: boolean;
}

export function AppointmentSlip({ 
  appointment, 
  clinicSettings = { clinicName: "ClinicFlow", primaryColor: "#007AFF" },
  onClose,
  showModal = false
}: AppointmentSlipProps) {
  const slipRef = useRef<HTMLDivElement>(null);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "scheduled":
        return {
          badge: <Badge className="bg-blue-50 text-blue-600 border-blue-200 font-medium">Scheduled</Badge>,
          icon: <CalendarDays className="h-4 w-4 text-blue-600" />,
          color: '#007AFF',
          bgColor: '#F0F8FF'
        };
      case "completed":
        return {
          badge: <Badge className="bg-green-50 text-green-600 border-green-200 font-medium">Completed</Badge>,
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          color: '#34C759',
          bgColor: '#F0FFF4'
        };
      case "cancelled":
        return {
          badge: <Badge className="bg-red-50 text-red-600 border-red-200 font-medium">Cancelled</Badge>,
          icon: <XCircle className="h-4 w-4 text-red-600" />,
          color: '#FF3B30',
          bgColor: '#FFF5F5'
        };
      case "no-show":
        return {
          badge: <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200 font-medium">No Show</Badge>,
          icon: <AlertCircle className="h-4 w-4 text-yellow-600" />,
          color: '#FF9500',
          bgColor: '#FFFBEB'
        };
      default:
        return {
          badge: <Badge className="bg-gray-50 text-gray-600 border-gray-200 font-medium">{status}</Badge>,
          icon: <CalendarDays className="h-4 w-4 text-gray-600" />,
          color: '#8E8E93',
          bgColor: '#F2F2F7'
        };
    }
  };

  const appointmentDate = new Date(appointment.dateTime);
  const statusConfig = getStatusConfig(appointment.status);

  // Print functionality
  const handlePrint = useReactToPrint({
    content: () => slipRef.current,
    pageStyle: `
      @media print {
        body { margin: 0; }
        .no-print { display: none !important; }
        .appointment-slip { 
          page-break-inside: avoid; 
          margin: 0;
          padding: 40px;
          background: white;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
        }
        .print-header {
          border-bottom: 1px solid #E5E5E7;
          padding-bottom: 32px;
          margin-bottom: 40px;
        }
        .print-section {
          margin-bottom: 32px;
          padding: 24px;
          border-radius: 16px;
          background: #FAFAFA;
          border: 1px solid #F2F2F7;
        }
        .print-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
      }
    `
  } as any);

  // PDF download functionality
  const handleDownloadPDF = () => {
    if (!slipRef.current) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 25;
    const contentWidth = pageWidth - (2 * margin);
    
    // Set font
    pdf.setFont('helvetica');
    
    // Clean, minimal header
    pdf.setFontSize(32);
    pdf.setTextColor(0, 0, 0);
    pdf.text(clinicSettings.clinicName, margin, 35);
    
    pdf.setFontSize(14);
    pdf.setTextColor(128, 128, 128);
    pdf.text("Appointment Details", margin, 45);
    
    let currentY = 60;
    
    // Appointment ID - minimal design
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text("Appointment ID", margin, currentY);
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(appointment._id, margin, currentY + 8);
    currentY += 25;
    
    // Date and Time - clean layout
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text("Date & Time", margin, currentY);
    
    pdf.setFontSize(18);
    pdf.setTextColor(0, 0, 0);
    pdf.text(format(appointmentDate, "EEEE, MMMM d, yyyy"), margin, currentY + 12);
    pdf.text(format(appointmentDate, "h:mm a"), margin, currentY + 22);
    currentY += 40;
    
    // Status - minimal badge
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text("Status", margin, currentY);
    
    pdf.setFontSize(14);
    pdf.setTextColor(0, 122, 255);
    pdf.text(appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1), margin, currentY + 8);
    currentY += 30;
    
    // Patient Information - clean section
    if (appointment.patientId) {
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text("Patient", margin, currentY);
      
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${appointment.patientId.firstName} ${appointment.patientId.lastName}`, margin, currentY + 8);
      
      pdf.setFontSize(12);
      pdf.setTextColor(128, 128, 128);
      pdf.text(appointment.patientId.phone || "N/A", margin, currentY + 20);
      pdf.text(appointment.patientId.email || "N/A", margin, currentY + 30);
      currentY += 50;
    }
    
    // Doctor Information - clean section
    if (appointment.doctorId) {
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text("Doctor", margin, currentY);
      
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`, margin, currentY + 8);
      currentY += 30;
    }
    
    // Notes - minimal design
    if (appointment.notes) {
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text("Notes", margin, currentY);
      
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      const notesLines = pdf.splitTextToSize(appointment.notes, contentWidth - 20);
      pdf.text(notesLines, margin, currentY + 8);
      currentY += 20 + (notesLines.length * 8);
    }
    
    // Minimal footer
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Generated on ${format(new Date(), "MMM d, yyyy 'at' h:mm a")}`, margin, pageHeight - 20);
    
    pdf.save(`appointment-${appointment._id}-${format(appointmentDate, "yyyy-MM-dd")}.pdf`);
  };

  const SlipContent = () => (
    <div ref={slipRef} className="appointment-slip bg-white min-h-screen" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif' }}>
      {/* Header */}
      <div className="print-header">
        <div className="max-w-4xl mx-auto px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">
              {clinicSettings.clinicName}
            </h1>
            <p className="text-xl text-gray-500 font-medium">Appointment Details</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Appointment ID */}
        <div className="mb-12">
          <p className="text-sm font-medium text-gray-500 mb-3 tracking-wide">Appointment ID</p>
          <p className="text-2xl font-mono font-semibold text-gray-900 bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100">
            {appointment._id}
          </p>
        </div>

        {/* Date, Time & Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Date */}
          <div className="print-section bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center space-x-4 mb-4">
              <Calendar className="h-6 w-6 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-700 tracking-wide">Date</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {format(appointmentDate, "MMM d")}
            </p>
            <p className="text-xl text-gray-500">
              {format(appointmentDate, "yyyy")}
            </p>
          </div>

          {/* Time */}
          <div className="print-section bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center space-x-4 mb-4">
              <Clock className="h-6 w-6 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-700 tracking-wide">Time</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {format(appointmentDate, "h:mm")}
            </p>
            <p className="text-xl text-gray-500">
              {format(appointmentDate, "a")}
            </p>
          </div>

          {/* Status */}
          <div className="print-section bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center space-x-4 mb-4">
              {React.cloneElement(statusConfig.icon, { className: "h-6 w-6 text-gray-600" })}
              <h3 className="text-sm font-semibold text-gray-700 tracking-wide">Status</h3>
            </div>
            <div className="flex items-center space-x-3">
              {statusConfig.badge}
            </div>
          </div>
        </div>

        {/* Patient & Doctor Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Patient Information */}
          {appointment.patientId && (
            <div className="print-section bg-white border border-gray-100 rounded-3xl p-10 shadow-sm">
              <div className="flex items-center space-x-4 mb-8">
                <User className="h-7 w-7 text-gray-600" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Patient</h3>
                  <p className="text-sm text-gray-500">Personal Information</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2 tracking-wide">Full Name</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {appointment.patientId.firstName} {appointment.patientId.lastName}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700 font-medium">{appointment.patientId.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700 font-medium">{appointment.patientId.email || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Doctor Information */}
          {appointment.doctorId && (
            <div className="print-section bg-white border border-gray-100 rounded-3xl p-10 shadow-sm">
              <div className="flex items-center space-x-4 mb-8">
                <Stethoscope className="h-7 w-7 text-gray-600" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Doctor</h3>
                  <p className="text-sm text-gray-500">Assigned Physician</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2 tracking-wide">Name</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {appointment.doctorId.firstName} {appointment.doctorId.lastName}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Notes Section */}
        {appointment.notes && (
          <div className="print-section bg-white border border-gray-100 rounded-3xl p-10 shadow-sm mb-12">
            <div className="flex items-center space-x-4 mb-8">
              <FileText className="h-7 w-7 text-gray-600" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Notes</h3>
                <p className="text-sm text-gray-500">Additional Information</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8">
              <p className="text-gray-700 leading-relaxed text-lg">{appointment.notes}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-12 border-t border-gray-100">
          <p className="text-sm text-gray-500 font-medium tracking-wide">
            Generated on {format(new Date(), "MMM d, yyyy 'at' h:mm a")}
          </p>
          <p className="text-xs text-gray-400 mt-2 tracking-wide">
            Keep this slip for your records
          </p>
        </div>
      </div>
    </div>
  );

  if (showModal) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-8 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <Calendar className="h-6 w-6 text-gray-600" />
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">Appointment Slip</h3>
                <p className="text-sm text-gray-500">View and print appointment details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          
          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto">
            <SlipContent />
          </div>
          
          {/* Modal Actions */}
          <div className="flex gap-4 p-8 border-t border-gray-100 bg-gray-50 no-print flex-shrink-0">
            <Button
              onClick={handlePrint}
              className="flex-1 bg-gray-900 hover:bg-gray-800 py-4 text-white font-medium rounded-2xl transition-all duration-200"
            >
              <Printer className="h-5 w-5 mr-3" />
              Print Slip
            </Button>
            <Button
              onClick={handleDownloadPDF}
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-4 text-white font-medium rounded-2xl transition-all duration-200"
            >
              <Download className="h-5 w-5 mr-3" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <SlipContent />;
} 