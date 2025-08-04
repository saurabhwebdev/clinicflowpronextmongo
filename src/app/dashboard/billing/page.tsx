"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClinicInfoModal } from "@/components/ui/clinic-info-modal";
import { toast } from "sonner";
import { 
  Plus, 
  CreditCard, 
  DollarSign, 
  Filter, 
  Search, 
  Clock, 
  User, 
  Eye, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  ArrowRight,
  UserPlus,
  Printer,
  MoreHorizontal,
  Settings,
  Calendar,
  TrendingUp,
  Receipt,
  Wallet
} from "lucide-react";
import { format } from "date-fns";
import { useCurrency } from "@/hooks/use-currency";

interface ClinicSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  clinicName: string;
  currency?: string;
}

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

export default function BillingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { format: formatCurrency, symbol: currencySymbol } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isClinicModalOpen, setIsClinicModalOpen] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>({
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    clinicName: 'Clinic',
    currency: 'USD'
  });

  // Check if user is a patient
  const isPatient = session?.user?.role === 'patient';

  // Fetch clinic settings and bills
  useEffect(() => {
    const fetchClinicSettings = async () => {
      try {
        const response = await fetch('/api/clinic-settings');
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            setClinicSettings({
              primaryColor: data.settings.primaryColor || '#3b82f6',
              secondaryColor: data.settings.secondaryColor || '#1e40af',
              accentColor: data.settings.accentColor || '#10b981',
              backgroundColor: data.settings.backgroundColor || '#ffffff',
              textColor: data.settings.textColor || '#1f2937',
              clinicName: data.settings.clinicName || 'Clinic',
              currency: data.settings.currency || 'USD'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching clinic settings:', error);
      }
    };

    fetchClinicSettings();
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/billing");
      if (!response.ok) throw new Error("Failed to fetch bills");
      const result = await response.json();
      setBills(result.bills || []);
    } catch (error) {
      console.error("Error fetching bills:", error);
      toast.error("Failed to load bills");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBill = () => {
    if (isPatient) {
      // Patients can't create bills
      toast.error("Please contact the clinic for billing inquiries");
      return;
    }
    router.push("/dashboard/billing/new");
  };

  const handleContactClinic = () => {
    setIsClinicModalOpen(true);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          badge: <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 transition-all duration-200">Pending</Badge>,
          icon: <Clock className="h-4 w-4 text-yellow-600" />,
          color: '#f59e0b',
          bgColor: '#fef3c7'
        };
      case "paid":
        return {
          badge: <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 transition-all duration-200">Paid</Badge>,
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          color: '#10b981',
          bgColor: '#d1fae5'
        };
      case "overdue":
        return {
          badge: <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200 transition-all duration-200">Overdue</Badge>,
          icon: <AlertCircle className="h-4 w-4 text-red-600" />,
          color: '#ef4444',
          bgColor: '#fee2e2'
        };
      case "cancelled":
        return {
          badge: <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 transition-all duration-200">Cancelled</Badge>,
          icon: <XCircle className="h-4 w-4 text-gray-600" />,
          color: '#6b7280',
          bgColor: '#f3f4f6'
        };
      default:
        return {
          badge: <Badge>{status}</Badge>,
          icon: <CreditCard className="h-4 w-4" />,
          color: '#6b7280',
          bgColor: '#f3f4f6'
        };
    }
  };

  const handleQuickActions = (action: string, bill: Bill, e: React.MouseEvent) => {
    e.stopPropagation();
    
    switch (action) {
      case 'view':
        router.push(`/dashboard/billing/${bill._id}`);
        break;
      case 'edit':
        router.push(`/dashboard/billing/${bill._id}/edit`);
        break;
      case 'print':
        router.push(`/dashboard/billing/${bill._id}`);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this bill?')) {
          // Add delete logic here
          toast.success('Bill deleted successfully');
        }
        break;
    }
  };

  const handleStatusChange = async (billId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/billing/${billId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update the bill in the local state
        setBills(prevBills =>
          prevBills.map(bill =>
            bill._id === billId
              ? { ...bill, status: newStatus }
              : bill
          )
        );
        toast.success(`Bill status updated to ${newStatus}`);
      } else {
        throw new Error('Failed to update bill status');
      }
    } catch (error) {
      console.error('Error updating bill status:', error);
      toast.error('Failed to update bill status');
    }
  };

  // Filter bills based on search and filter
  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bill.patientId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       bill.patientId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       bill.patientId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       bill.doctorId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       bill.doctorId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = statusFilter === "all" || bill.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getPageTitle = () => {
    if (isPatient) {
      return "My Bills";
    }
    return "Billing";
  };

  const getPageDescription = () => {
    if (isPatient) {
      return "View and manage your medical bills and payments";
    }
    return "Manage all clinic billing and payments";
  };

  const primaryColor = clinicSettings.primaryColor;
  const secondaryColor = clinicSettings.secondaryColor;
  const accentColor = clinicSettings.accentColor;

  // Calculate stats
  const totalBills = bills.length;
  const pendingBills = bills.filter(b => b.status === 'pending').length;
  const paidBills = bills.filter(b => b.status === 'paid').length;
  const overdueBills = bills.filter(b => b.status === 'overdue').length;
  const totalRevenue = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.totalAmount, 0);
  const pendingRevenue = bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.totalAmount, 0);

  if (isPatient) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center mb-6 shadow-lg border border-white/20">
            <CreditCard className="h-12 w-12" style={{ color: primaryColor }} />
          </div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: clinicSettings.textColor }}>Patient Billing</h3>
          <p className="mb-6 text-gray-600">
            View your medical bills and payment history
          </p>
          <div className="space-y-4 max-w-md mx-auto">
            <p className="text-sm text-gray-500">
              • View your current and past bills<br/>
              • Check payment status and due dates<br/>
              • Download invoices and receipts<br/>
              • Contact the clinic for payment questions
            </p>
            <Button 
              variant="outline" 
              onClick={handleContactClinic}
              className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{ 
                borderColor: primaryColor,
                color: primaryColor 
              }}
            >
              Contact Clinic
            </Button>
          </div>
        </div>

        {/* Clinic Info Modal */}
        <ClinicInfoModal 
          isOpen={isClinicModalOpen}
          onClose={() => setIsClinicModalOpen(false)}
          clinicSettings={clinicSettings}
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl" style={{ 
              backgroundColor: primaryColor + '15',
              boxShadow: `0 4px 12px ${primaryColor}30`
            }}>
              <CreditCard className="h-8 w-8" style={{ color: primaryColor }} />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ 
                backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {getPageTitle()}
              </h1>
              <p className="text-gray-600 mt-1">{getPageDescription()}</p>
            </div>
          </div>
          
          <Button 
            onClick={handleCreateBill}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: primaryColor,
              boxShadow: `0 4px 12px ${primaryColor}40`
            }}
          >
            <Plus className="h-4 w-4" />
            <span>New Bill</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
              backgroundColor: primaryColor + '15',
              boxShadow: `0 4px 12px ${primaryColor}30`
            }}>
              <Receipt className="h-5 w-5" style={{ color: primaryColor }} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Total Bills</p>
              <p className="text-2xl font-bold text-gray-800">{totalBills}</p>
            </div>
          </div>
          
          <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
              backgroundColor: secondaryColor + '15',
              boxShadow: `0 4px 12px ${secondaryColor}30`
            }}>
              <Clock className="h-5 w-5" style={{ color: secondaryColor }} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Pending</p>
              <p className="text-2xl font-bold text-gray-800">{pendingBills}</p>
            </div>
          </div>
          
          <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
              backgroundColor: accentColor + '15',
              boxShadow: `0 4px 12px ${accentColor}30`
            }}>
              <CheckCircle className="h-5 w-5" style={{ color: accentColor }} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Paid</p>
              <p className="text-2xl font-bold text-gray-800">{paidBills}</p>
            </div>
          </div>
          
          <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
              backgroundColor: '#f59e0b15',
              boxShadow: '0 4px 12px #f59e0b30'
            }}>
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Overdue</p>
              <p className="text-2xl font-bold text-gray-800">{overdueBills}</p>
            </div>
          </div>

          <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
              backgroundColor: '#10b98115',
              boxShadow: '0 4px 12px #10b98130'
            }}>
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Revenue</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search bills by number, patient, or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
              style={{ 
                '--tw-ring-color': primaryColor 
              } as React.CSSProperties}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48 border-0 bg-white/80 rounded-xl shadow-sm px-3 py-2 text-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
              style={{ 
                '--tw-ring-color': primaryColor 
              } as React.CSSProperties}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-gray-800">Bill Records</h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing {filteredBills.length} of {bills.length} bills
          </p>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: primaryColor }}></div>
            <p className="mt-4 text-gray-500">Loading bills...</p>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No bills found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Get started by creating your first bill"
              }
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button 
                onClick={() => router.push('/dashboard/billing/new')}
                className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: primaryColor,
                  boxShadow: `0 4px 12px ${primaryColor}40`
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Bill
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white/50 border-b border-white/20">
                  <TableHead className="font-semibold text-gray-700">Bill Number</TableHead>
                  <TableHead className="font-semibold text-gray-700">Patient</TableHead>
                  <TableHead className="font-semibold text-gray-700">Doctor</TableHead>
                  <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700">Due Date</TableHead>
                  <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => {
                  const statusConfig = getStatusConfig(bill.status);
                  const dueDate = new Date(bill.dueDate);
                  const isOverdue = dueDate < new Date() && bill.status !== 'paid';
                  
                  return (
                    <TableRow key={bill._id} className="hover:bg-white/50 transition-all duration-200 border-b border-white/20">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ 
                            backgroundColor: primaryColor + '15'
                          }}>
                            <span className="text-xs font-bold" style={{ color: primaryColor }}>
                              {bill.billNumber.slice(-4)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{bill.billNumber}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(bill.createdAt), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {bill.patientId ? (
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ 
                              backgroundColor: secondaryColor + '15'
                            }}>
                              <span className="text-sm font-semibold" style={{ color: secondaryColor }}>
                                {bill.patientId.firstName.charAt(0)}{bill.patientId.lastName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {bill.patientId.firstName} {bill.patientId.lastName}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{bill.patientId.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{bill.patientId.email || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">No patient assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {bill.doctorId ? (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {bill.doctorId.firstName} {bill.doctorId.lastName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">{formatCurrency(bill.totalAmount)}</p>
                          <p className="text-xs text-gray-500">
                            {bill.items.length} items
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="p-2 rounded-xl transition-all duration-300"
                            style={{ 
                              backgroundColor: statusConfig.bgColor,
                              boxShadow: `0 2px 8px ${statusConfig.color}30`
                            }}
                          >
                            {statusConfig.icon}
                          </div>
                          {statusConfig.badge}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
                              {format(dueDate, "MMM d, yyyy")}
                            </span>
                            {isOverdue && (
                              <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                                Overdue
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {format(dueDate, "h:mm a")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleQuickActions('view', bill, e)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleQuickActions('edit', bill, e)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition-all duration-200 hover:scale-105"
                            title="Edit Bill"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleQuickActions('print', bill, e)}
                            className="p-2 rounded-lg text-orange-600 hover:bg-orange-100 transition-all duration-200 hover:scale-105"
                            title="Print Bill"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                          
                          {/* Status Change Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-100 transition-all duration-200 hover:scale-105"
                                title="Change Status"
                              >
                                <Settings className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg rounded-lg p-1">
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(bill._id, 'pending')}
                                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                  bill.status === 'pending' 
                                    ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' 
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                                Mark as Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(bill._id, 'paid')}
                                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                  bill.status === 'paid' 
                                    ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                Mark as Paid
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(bill._id, 'overdue')}
                                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                  bill.status === 'overdue' 
                                    ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                                Mark as Overdue
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(bill._id, 'cancelled')}
                                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                  bill.status === 'cancelled' 
                                    ? 'bg-gray-50 text-gray-700 hover:bg-gray-100' 
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                <XCircle className="h-4 w-4 mr-2 text-gray-600" />
                                Mark as Cancelled
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          <button
                            onClick={(e) => handleQuickActions('delete', bill, e)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition-all duration-200 hover:scale-105"
                            title="Delete Bill"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Clinic Info Modal */}
      <ClinicInfoModal 
        isOpen={isClinicModalOpen}
        onClose={() => setIsClinicModalOpen(false)}
        clinicSettings={clinicSettings}
      />
    </div>
  );
}