"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useCurrency } from "@/hooks/use-currency";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BillPDF } from "@/components/billing/BillPDF";
import { downloadPDF, printPDF } from "@/lib/pdf-utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  Download,
  Send,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Printer,
  Eye,
} from "lucide-react";

interface Bill {
  _id: string;
  billNumber: string;
  patientId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  doctorId?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  appointmentId: {
    _id: string;
    dateTime: string;
    notes?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  status: string;
  paymentMethod?: string;
  paymentDate?: string;
  dueDate: string;
  notes?: string;
  createdAt: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export default function BillDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { format: formatCurrency, currency } = useCurrency();
  const [bill, setBill] = useState<Bill | null>(null);
  const [clinicSettings, setClinicSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchBill();
  }, [id]);

  const fetchBill = async () => {
    setIsLoading(true);
    try {
      const [billResponse, pdfDataResponse] = await Promise.all([
        fetch(`/api/billing/${id}`),
        fetch(`/api/billing/${id}/pdf`)
      ]);

      if (!billResponse.ok) throw new Error("Failed to fetch bill");
      if (!pdfDataResponse.ok) throw new Error("Failed to fetch PDF data");

      const billData = await billResponse.json();
      const pdfData = await pdfDataResponse.json();

      setBill(billData);
      setClinicSettings(pdfData.clinicSettings);
    } catch (error) {
      console.error("Error fetching bill:", error);
      toast.error("Failed to load bill details");
      router.push("/dashboard/billing");
    } finally {
      setIsLoading(false);
    }
  };

  const updateBillStatus = async (newStatus: string, paymentMethod?: string) => {
    setIsUpdating(true);
    try {
      const updateData: any = { status: newStatus };
      if (paymentMethod) updateData.paymentMethod = paymentMethod;
      if (newStatus === 'paid') updateData.paymentDate = new Date().toISOString();

      const response = await fetch(`/api/billing/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error("Failed to update bill status");

      const updatedBill = await response.json();
      setBill(updatedBill);
      toast.success("Bill status updated successfully");
    } catch (error) {
      console.error("Error updating bill status:", error);
      toast.error("Failed to update bill status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!bill || !clinicSettings) return;

    setIsGeneratingPDF(true);
    try {
      const patientName = bill.patientId ?
        `${bill.patientId.firstName || 'Unknown'}_${bill.patientId.lastName || 'Patient'}` :
        'Unknown_Patient';
      const filename = `${bill.billNumber}_${patientName}.pdf`;
      
      // Use the improved PDF generation with proper options
      await downloadPDF('bill-pdf-content', filename, {
        format: 'a4',
        orientation: 'portrait',
        margin: 10,
        scale: 2
      });
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrintBill = async () => {
    if (!bill || !clinicSettings) return;

    setIsGeneratingPDF(true);
    try {
      // Use the improved PDF generation with proper options
      await printPDF('bill-pdf-content', {
        format: 'a4',
        orientation: 'portrait',
        margin: 10,
        scale: 2
      });
      
      toast.success('Print dialog opened');
    } catch (error) {
      console.error('Error printing bill:', error);
      toast.error('Failed to print bill');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "sent":
        return <Badge className="bg-blue-100 text-blue-800">Sent</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-20"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Bill not found</p>
            <Button
              onClick={() => router.push("/dashboard/billing")}
              className="mt-4"
            >
              Back to Billing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Bill {bill.billNumber}</h1>
            <p className="text-gray-600">View and manage bill details</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/billing/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPDFPreview(!showPDFPreview)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {showPDFPreview ? 'Hide Preview' : 'Preview'}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
          >
            <Download className="mr-2 h-4 w-4" />
            {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
          </Button>
          <Button
            variant="outline"
            onClick={handlePrintBill}
            disabled={isGeneratingPDF}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bill Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bill Information</CardTitle>
            <CardDescription>Details about this invoice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Patient</h3>
                <p className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4" />
                  {bill.patientId?.firstName || 'Unknown'} {bill.patientId?.lastName || 'Patient'}
                </p>
                <p className="text-sm text-gray-600 ml-6">{bill.patientId?.email || 'No email'}</p>
                {bill.patientId?.phone && (
                  <p className="text-sm text-gray-600 ml-6">{bill.patientId.phone}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Doctor</h3>
                <p className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4" />
                  {bill.doctorId?.firstName || 'Unknown'} {bill.doctorId?.lastName || 'Doctor'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Appointment Date</h3>
                <p className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  {bill.appointmentId?.dateTime ?
                    format(new Date(bill.appointmentId.dateTime), "MMMM d, yyyy 'at' h:mm a") :
                    'No date available'
                  }
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <div className="mt-1">{getStatusBadge(bill.status)}</div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                <p className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(bill.dueDate), "MMMM d, yyyy")}
                </p>
              </div>

              {bill.paymentDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Payment Date</h3>
                  <p className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(bill.paymentDate), "MMMM d, yyyy")}
                  </p>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div>
              <h3 className="text-lg font-medium mb-4">Bill Items</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bill.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(bill.subtotal)}</span>
                  </div>
                  {bill.tax > 0 && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatCurrency(bill.tax)}</span>
                    </div>
                  )}
                  {bill.discount > 0 && (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-{formatCurrency(bill.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(bill.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {bill.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                <p className="text-sm bg-gray-50 p-3 rounded-md">{bill.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Manage this bill</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {bill.status === "draft" && (
              <Button
                className="w-full"
                onClick={() => updateBillStatus("sent")}
                disabled={isUpdating}
              >
                <Send className="mr-2 h-4 w-4" />
                Send to Patient
              </Button>
            )}

            {(bill.status === "sent" || bill.status === "overdue") && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mark as Paid</label>
                  <Select onValueChange={(method) => updateBillStatus("paid", method)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => updateBillStatus("cancelled")}
                  disabled={isUpdating}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Bill
                </Button>
              </>
            )}

            {bill.status === "paid" && (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">Bill Paid</p>
                {bill.paymentMethod && (
                  <p className="text-sm text-green-600 capitalize">
                    via {bill.paymentMethod.replace('_', ' ')}
                  </p>
                )}
              </div>
            )}

            {bill.patientId?._id && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/dashboard/patients/${bill.patientId._id}`)}
              >
                View Patient Profile
              </Button>
            )}

            {bill.appointmentId?._id && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/dashboard/appointments/${bill.appointmentId._id}`)}
              >
                View Appointment
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* PDF Preview */}
      {showPDFPreview && bill && clinicSettings && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                PDF Preview
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePrintBill}
                    disabled={isGeneratingPDF}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Preview how the bill will appear in PDF format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-gray-50 p-4">
                <BillPDF
                  bill={bill}
                  clinicSettings={clinicSettings}
                  formatCurrency={formatCurrency}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hidden PDF content for generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {bill && clinicSettings && (
          <BillPDF
            bill={bill}
            clinicSettings={clinicSettings}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    </div>
  );
}