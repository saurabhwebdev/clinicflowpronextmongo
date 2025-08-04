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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClinicInfoModal } from "@/components/ui/clinic-info-modal";
import { toast } from "sonner";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  Filter,
  Search,
  ChevronRight,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Receipt,
  Wallet,
  Target,
  Award,
  Zap,
  XCircle
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

interface DoctorRevenue {
  doctorId: string;
  doctorName: string;
  totalRevenue: number;
  totalBills: number;
  paidBills: number;
  pendingBills: number;
  overdueBills: number;
  averageRevenue: number;
  lastMonthRevenue: number;
  thisMonthRevenue: number;
  revenueGrowth: number;
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

interface Appointment {
  _id: string;
  patientId: {
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
  dateTime: string;
  status: string;
  notes?: string;
  createdAt: string;
}

interface PatientAnalytics {
  patientId: string;
  patientName: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  totalRevenue: number;
  averageRevenue: number;
  lastVisit: string;
  daysSinceLastVisit: number;
  appointmentFrequency: number;
  completionRate: number;
  revenuePerVisit: number;
}

interface DoctorPerformance {
  doctorId: string;
  doctorName: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  completionRate: number;
  averagePatientsPerDay: number;
  totalRevenue: number;
  revenuePerAppointment: number;
  patientSatisfaction: number;
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { format: formatCurrency, symbol: currencySymbol } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);
  const [isClinicModalOpen, setIsClinicModalOpen] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorRevenue, setDoctorRevenue] = useState<DoctorRevenue[]>([]);
  const [patientAnalytics, setPatientAnalytics] = useState<PatientAnalytics[]>([]);
  const [doctorPerformance, setDoctorPerformance] = useState<DoctorPerformance[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("30");
  const [activeTab, setActiveTab] = useState("revenue");
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
    fetchAppointments();
  }, []);

  const fetchBills = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/billing");
      if (!response.ok) throw new Error("Failed to fetch bills");
      const result = await response.json();
      setBills(result.bills || []);
      calculateDoctorRevenue(result.bills || []);
    } catch (error) {
      console.error("Error fetching bills:", error);
      toast.error("Failed to load billing data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments");
      if (!response.ok) throw new Error("Failed to fetch appointments");
      const result = await response.json();
      setAppointments(result.appointments || []);
      calculatePatientAnalytics(result.appointments || []);
      calculateDoctorPerformance(result.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointment data");
    }
  };

  const calculateDoctorRevenue = (billsData: Bill[]) => {
    const doctorMap = new Map<string, DoctorRevenue>();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    billsData.forEach(bill => {
      if (!bill.doctorId) return;

      const doctorId = bill.doctorId._id;
      const doctorName = `${bill.doctorId.firstName} ${bill.doctorId.lastName}`;
      const billDate = new Date(bill.createdAt);
      const isLastMonth = billDate >= thirtyDaysAgo && billDate < now;
      const isThisMonth = billDate >= new Date(now.getFullYear(), now.getMonth(), 1);

      if (!doctorMap.has(doctorId)) {
        doctorMap.set(doctorId, {
          doctorId,
          doctorName,
          totalRevenue: 0,
          totalBills: 0,
          paidBills: 0,
          pendingBills: 0,
          overdueBills: 0,
          averageRevenue: 0,
          lastMonthRevenue: 0,
          thisMonthRevenue: 0,
          revenueGrowth: 0
        });
      }

      const doctor = doctorMap.get(doctorId)!;
      doctor.totalRevenue += bill.totalAmount;
      doctor.totalBills += 1;

      if (bill.status === 'paid') {
        doctor.paidBills += 1;
      } else if (bill.status === 'pending') {
        doctor.pendingBills += 1;
      } else if (bill.status === 'overdue') {
        doctor.overdueBills += 1;
      }

      if (isLastMonth) {
        doctor.lastMonthRevenue += bill.totalAmount;
      }
      if (isThisMonth) {
        doctor.thisMonthRevenue += bill.totalAmount;
      }
    });

    // Calculate averages and growth
    doctorMap.forEach(doctor => {
      doctor.averageRevenue = doctor.totalBills > 0 ? doctor.totalRevenue / doctor.totalBills : 0;
      doctor.revenueGrowth = doctor.lastMonthRevenue > 0 
        ? ((doctor.thisMonthRevenue - doctor.lastMonthRevenue) / doctor.lastMonthRevenue) * 100 
        : 0;
    });

    setDoctorRevenue(Array.from(doctorMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue));
  };

  const calculatePatientAnalytics = (appointmentsData: Appointment[]) => {
    const patientMap = new Map<string, PatientAnalytics>();
    const now = new Date();

    appointmentsData.forEach(appointment => {
      if (!appointment.patientId) return;

      const patientId = appointment.patientId._id;
      const patientName = `${appointment.patientId.firstName} ${appointment.patientId.lastName}`;
      const appointmentDate = new Date(appointment.dateTime);
      const daysSinceLastVisit = Math.floor((now.getTime() - appointmentDate.getTime()) / (1000 * 60 * 60 * 24));

      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, {
          patientId,
          patientName,
          totalAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0,
          noShowAppointments: 0,
          totalRevenue: 0,
          averageRevenue: 0,
          lastVisit: appointmentDate.toISOString(),
          daysSinceLastVisit: 0,
          appointmentFrequency: 0,
          completionRate: 0,
          revenuePerVisit: 0
        });
      }

      const patient = patientMap.get(patientId)!;
      patient.totalAppointments += 1;

      if (appointment.status === 'completed') {
        patient.completedAppointments += 1;
      } else if (appointment.status === 'cancelled') {
        patient.cancelledAppointments += 1;
      } else if (appointment.status === 'no-show') {
        patient.noShowAppointments += 1;
      }

      // Update last visit if this appointment is more recent
      if (appointmentDate > new Date(patient.lastVisit)) {
        patient.lastVisit = appointmentDate.toISOString();
        patient.daysSinceLastVisit = daysSinceLastVisit;
      }
    });

    // Calculate additional metrics
    patientMap.forEach(patient => {
      patient.completionRate = patient.totalAppointments > 0 ? (patient.completedAppointments / patient.totalAppointments) * 100 : 0;
      patient.appointmentFrequency = patient.totalAppointments > 0 ? patient.totalAppointments / Math.max(1, patient.daysSinceLastVisit / 30) : 0;
      
      // Calculate revenue from bills
      const patientBills = bills.filter(bill => bill.patientId?._id === patient.patientId);
      patient.totalRevenue = patientBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
      patient.averageRevenue = patientBills.length > 0 ? patient.totalRevenue / patientBills.length : 0;
      patient.revenuePerVisit = patient.completedAppointments > 0 ? patient.totalRevenue / patient.completedAppointments : 0;
    });

    setPatientAnalytics(Array.from(patientMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue));
  };

  const calculateDoctorPerformance = (appointmentsData: Appointment[]) => {
    const doctorMap = new Map<string, DoctorPerformance>();

    appointmentsData.forEach(appointment => {
      if (!appointment.doctorId) return;

      const doctorId = appointment.doctorId._id;
      const doctorName = `${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`;

      if (!doctorMap.has(doctorId)) {
        doctorMap.set(doctorId, {
          doctorId,
          doctorName,
          totalAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0,
          noShowAppointments: 0,
          completionRate: 0,
          averagePatientsPerDay: 0,
          totalRevenue: 0,
          revenuePerAppointment: 0,
          patientSatisfaction: 0
        });
      }

      const doctor = doctorMap.get(doctorId)!;
      doctor.totalAppointments += 1;

      if (appointment.status === 'completed') {
        doctor.completedAppointments += 1;
      } else if (appointment.status === 'cancelled') {
        doctor.cancelledAppointments += 1;
      } else if (appointment.status === 'no-show') {
        doctor.noShowAppointments += 1;
      }
    });

    // Calculate additional metrics
    doctorMap.forEach(doctor => {
      doctor.completionRate = doctor.totalAppointments > 0 ? (doctor.completedAppointments / doctor.totalAppointments) * 100 : 0;
      doctor.averagePatientsPerDay = doctor.totalAppointments > 0 ? doctor.totalAppointments / 30 : 0; // Assuming 30 days
      
      // Calculate revenue from bills
      const doctorBills = bills.filter(bill => bill.doctorId?._id === doctor.doctorId);
      doctor.totalRevenue = doctorBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
      doctor.revenuePerAppointment = doctor.totalAppointments > 0 ? doctor.totalRevenue / doctor.totalAppointments : 0;
      doctor.patientSatisfaction = doctor.completionRate * 0.8 + (doctor.completedAppointments / Math.max(1, doctor.totalAppointments)) * 20; // Mock satisfaction score
    });

    setDoctorPerformance(Array.from(doctorMap.values()).sort((a, b) => b.completionRate - a.completionRate));
  };

  const handleContactClinic = () => {
    setIsClinicModalOpen(true);
  };

  const handleDoctorClick = (doctorId: string) => {
    setSelectedDoctor(selectedDoctor === doctorId ? null : doctorId);
  };

  const handlePatientClick = (patientId: string) => {
    setSelectedPatient(selectedPatient === patientId ? null : patientId);
  };

  const getDoctorBills = (doctorId: string) => {
    return bills.filter(bill => bill.doctorId?._id === doctorId);
  };

  const getPatientAppointments = (patientId: string) => {
    return appointments.filter(appointment => appointment.patientId._id === patientId);
  };

  const getDoctorAppointments = (doctorId: string) => {
    return appointments.filter(appointment => appointment.doctorId?._id === doctorId);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          badge: <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>,
          icon: <Clock className="h-4 w-4 text-yellow-600" />,
          color: '#f59e0b',
          bgColor: '#fef3c7'
        };
      case "paid":
        return {
          badge: <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>,
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          color: '#10b981',
          bgColor: '#d1fae5'
        };
      case "overdue":
        return {
          badge: <Badge className="bg-red-100 text-red-800 border-red-200">Overdue</Badge>,
          icon: <AlertCircle className="h-4 w-4 text-red-600" />,
          color: '#ef4444',
          bgColor: '#fee2e2'
        };
      default:
        return {
          badge: <Badge>{status}</Badge>,
          icon: <Receipt className="h-4 w-4" />,
          color: '#6b7280',
          bgColor: '#f3f4f6'
        };
    }
  };

  const primaryColor = clinicSettings.primaryColor;
  const secondaryColor = clinicSettings.secondaryColor;
  const accentColor = clinicSettings.accentColor;

  // Calculate overall stats
  const totalRevenue = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.totalAmount, 0);
  const totalBills = bills.length;
  const paidBills = bills.filter(b => b.status === 'paid').length;
  const pendingBills = bills.filter(b => b.status === 'pending').length;
  const overdueBills = bills.filter(b => b.status === 'overdue').length;
  const averageRevenue = totalBills > 0 ? totalRevenue / totalBills : 0;

  if (isPatient) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center mb-6 shadow-lg border border-white/20">
            <BarChart3 className="h-12 w-12" style={{ color: primaryColor }} />
          </div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: clinicSettings.textColor }}>Reports & Analytics</h3>
          <p className="mb-6 text-gray-600">
            Access detailed reports and analytics
          </p>
          <div className="space-y-4 max-w-md mx-auto">
            <p className="text-sm text-gray-500">
              • View revenue reports by doctor<br/>
              • Analyze billing trends<br/>
              • Track performance metrics<br/>
              • Generate detailed reports
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
              <BarChart3 className="h-8 w-8" style={{ color: primaryColor }} />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ 
                backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Reports & Analytics
              </h1>
              <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: primaryColor,
                boxShadow: `0 4px 12px ${primaryColor}40`
              }}
            >
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </Button>
          </div>
        </div>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
              backgroundColor: primaryColor + '15',
              boxShadow: `0 4px 12px ${primaryColor}30`
            }}>
              <TrendingUp className="h-5 w-5" style={{ color: primaryColor }} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalRevenue)}</p>
              <div className="flex items-center space-x-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">+12.5%</span>
              </div>
            </div>
          </div>
          
          <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
              backgroundColor: secondaryColor + '15',
              boxShadow: `0 4px 12px ${secondaryColor}30`
            }}>
              <Receipt className="h-5 w-5" style={{ color: secondaryColor }} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Total Bills</p>
              <p className="text-2xl font-bold text-gray-800">{totalBills}</p>
              <div className="flex items-center space-x-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">+8.2%</span>
              </div>
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
              <p className="text-xs font-medium text-gray-500 mb-1">Paid Bills</p>
              <p className="text-2xl font-bold text-gray-800">{paidBills}</p>
              <div className="flex items-center space-x-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">+15.3%</span>
              </div>
            </div>
          </div>

          <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
              backgroundColor: '#f59e0b15',
              boxShadow: '0 4px 12px #f59e0b30'
            }}>
              <Target className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Avg. Revenue</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(averageRevenue)}</p>
              <div className="flex items-center space-x-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">+5.7%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="revenue" className="text-sm font-medium">
            <DollarSign className="h-4 w-4 mr-2" />
            Revenue Analytics
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-sm font-medium">
            <Activity className="h-4 w-4 mr-2" />
            Performance Analytics
          </TabsTrigger>
        </TabsList>

        {/* Revenue Analytics Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Revenue by Doctor</h2>
                <p className="text-gray-600">Detailed breakdown of revenue generated by each doctor</p>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: primaryColor }}></div>
                <p className="mt-4 text-gray-500">Loading reports...</p>
              </div>
            ) : doctorRevenue.length === 0 ? (
              <div className="p-12 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No revenue data found</h3>
                <p className="text-gray-500">Revenue data will appear here once bills are created</p>
              </div>
            ) : (
              <div className="space-y-4">
                {doctorRevenue.map((doctor) => {
                  const doctorBills = getDoctorBills(doctor.doctorId);
                  const isExpanded = selectedDoctor === doctor.doctorId;
                  
                  return (
                    <div key={doctor.doctorId} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 overflow-hidden hover:shadow-lg transition-all duration-300">
                      {/* Doctor Summary Row */}
                      <div 
                        className="p-6 cursor-pointer hover:bg-white/50 transition-all duration-200"
                        onClick={() => handleDoctorClick(doctor.doctorId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ 
                              backgroundColor: primaryColor + '15'
                            }}>
                              <User className="h-6 w-6" style={{ color: primaryColor }} />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">{doctor.doctorName}</h3>
                              <p className="text-sm text-gray-500">{doctor.totalBills} bills • {doctor.paidBills} paid</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Total Revenue</p>
                              <p className="text-xl font-bold text-gray-800">{formatCurrency(doctor.totalRevenue)}</p>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Avg. per Bill</p>
                              <p className="text-lg font-semibold text-gray-800">{formatCurrency(doctor.averageRevenue)}</p>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Growth</p>
                              <div className="flex items-center space-x-1">
                                {doctor.revenueGrowth >= 0 ? (
                                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                                )}
                                <span className={`text-sm font-semibold ${doctor.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {Math.abs(doctor.revenueGrowth).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                {((doctor.paidBills / doctor.totalBills) * 100).toFixed(1)}% Paid
                              </Badge>
                              <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-white/20 bg-gray-50/50">
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                              <div className="bg-white/60 rounded-xl p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium text-gray-700">Paid Bills</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800">{doctor.paidBills}</p>
                                <p className="text-sm text-gray-500">{formatCurrency(doctor.totalRevenue)} total</p>
                              </div>
                              
                              <div className="bg-white/60 rounded-xl p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Clock className="h-4 w-4 text-yellow-600" />
                                  <span className="text-sm font-medium text-gray-700">Pending Bills</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800">{doctor.pendingBills}</p>
                                <p className="text-sm text-gray-500">Awaiting payment</p>
                              </div>
                              
                              <div className="bg-white/60 rounded-xl p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                  <span className="text-sm font-medium text-gray-700">Overdue Bills</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-800">{doctor.overdueBills}</p>
                                <p className="text-sm text-gray-500">Requires attention</p>
                              </div>
                            </div>

                            {/* Recent Bills Table */}
                            <div>
                              <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Bills</h4>
                              <div className="bg-white/60 rounded-xl overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-white/50">
                                      <TableHead className="font-semibold text-gray-700">Bill #</TableHead>
                                      <TableHead className="font-semibold text-gray-700">Patient</TableHead>
                                      <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                      <TableHead className="font-semibold text-gray-700">Date</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {doctorBills.slice(0, 5).map((bill) => {
                                      const statusConfig = getStatusConfig(bill.status);
                                      return (
                                        <TableRow key={bill._id} className="hover:bg-white/50">
                                          <TableCell>
                                            <div className="flex items-center space-x-2">
                                              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ 
                                                backgroundColor: primaryColor + '15'
                                              }}>
                                                <span className="text-xs font-bold" style={{ color: primaryColor }}>
                                                  {bill.billNumber.slice(-4)}
                                                </span>
                                              </div>
                                              <span className="font-medium text-gray-800">{bill.billNumber}</span>
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            {bill.patientId ? (
                                              <span className="text-sm text-gray-700">
                                                {bill.patientId.firstName} {bill.patientId.lastName}
                                              </span>
                                            ) : (
                                              <span className="text-gray-500">No patient</span>
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            <span className="font-semibold text-gray-800">{formatCurrency(bill.totalAmount)}</span>
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex items-center space-x-2">
                                              {statusConfig.icon}
                                              {statusConfig.badge}
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <span className="text-sm text-gray-600">
                                              {format(new Date(bill.createdAt), "MMM d, yyyy")}
                                            </span>
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Performance Analytics Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Patient Analytics */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Patient Analytics</h2>
                  <p className="text-gray-600">Patient engagement and revenue analysis</p>
                </div>
              </div>

              {isLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: primaryColor }}></div>
                  <p className="mt-4 text-gray-500">Loading patient data...</p>
                </div>
              ) : patientAnalytics.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No patient data found</h3>
                  <p className="text-gray-500">Patient analytics will appear here once appointments are created</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {patientAnalytics.slice(0, 5).map((patient) => {
                    const patientAppointments = getPatientAppointments(patient.patientId);
                    const isExpanded = selectedPatient === patient.patientId;
                    
                    return (
                      <div key={patient.patientId} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 overflow-hidden hover:shadow-lg transition-all duration-300">
                        {/* Patient Summary Row */}
                        <div 
                          className="p-6 cursor-pointer hover:bg-white/50 transition-all duration-200"
                          onClick={() => handlePatientClick(patient.patientId)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ 
                                backgroundColor: secondaryColor + '15'
                              }}>
                                <Users className="h-6 w-6" style={{ color: secondaryColor }} />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-800">{patient.patientName}</h3>
                                <p className="text-sm text-gray-500">{patient.totalAppointments} appointments • {patient.completedAppointments} completed</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-6">
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Total Revenue</p>
                                <p className="text-xl font-bold text-gray-800">{formatCurrency(patient.totalRevenue)}</p>
                              </div>
                              
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Completion Rate</p>
                                <p className="text-lg font-semibold text-gray-800">{patient.completionRate.toFixed(1)}%</p>
                              </div>
                              
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Last Visit</p>
                                <p className="text-sm font-semibold text-gray-800">{patient.daysSinceLastVisit} days ago</p>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                  {patient.appointmentFrequency.toFixed(1)}/month
                                </Badge>
                                <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="border-t border-white/20 bg-gray-50/50">
                            <div className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-white/60 rounded-xl p-4">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-gray-700">Completed</span>
                                  </div>
                                  <p className="text-2xl font-bold text-gray-800">{patient.completedAppointments}</p>
                                  <p className="text-sm text-gray-500">Successful visits</p>
                                </div>
                                
                                <div className="bg-white/60 rounded-xl p-4">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-medium text-gray-700">Cancelled</span>
                                  </div>
                                  <p className="text-2xl font-bold text-gray-800">{patient.cancelledAppointments}</p>
                                  <p className="text-sm text-gray-500">Missed opportunities</p>
                                </div>
                                
                                <div className="bg-white/60 rounded-xl p-4">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <AlertCircle className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm font-medium text-gray-700">No Shows</span>
                                  </div>
                                  <p className="text-2xl font-bold text-gray-800">{patient.noShowAppointments}</p>
                                  <p className="text-sm text-gray-500">Requires follow-up</p>
                                </div>
                              </div>

                              {/* Recent Appointments Table */}
                              <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Appointments</h4>
                                <div className="bg-white/60 rounded-xl overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-white/50">
                                        <TableHead className="font-semibold text-gray-700">Date</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Doctor</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Notes</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {patientAppointments.slice(0, 5).map((appointment) => {
                                        const statusConfig = getStatusConfig(appointment.status);
                                        return (
                                          <TableRow key={appointment._id} className="hover:bg-white/50">
                                            <TableCell>
                                              <span className="text-sm text-gray-700">
                                                {format(new Date(appointment.dateTime), "MMM d, yyyy")}
                                              </span>
                                            </TableCell>
                                            <TableCell>
                                              {appointment.doctorId ? (
                                                <span className="text-sm text-gray-700">
                                                  {appointment.doctorId.firstName} {appointment.doctorId.lastName}
                                                </span>
                                              ) : (
                                                <span className="text-gray-500">Not assigned</span>
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex items-center space-x-2">
                                                {statusConfig.icon}
                                                {statusConfig.badge}
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <span className="text-sm text-gray-600">
                                                {appointment.notes || 'No notes'}
                                              </span>
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Doctor Performance */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Doctor Performance</h2>
                  <p className="text-gray-600">Appointment completion and efficiency metrics</p>
                </div>
              </div>

              {isLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: primaryColor }}></div>
                  <p className="mt-4 text-gray-500">Loading doctor data...</p>
                </div>
              ) : doctorPerformance.length === 0 ? (
                <div className="p-12 text-center">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No doctor data found</h3>
                  <p className="text-gray-500">Doctor performance will appear here once appointments are created</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {doctorPerformance.slice(0, 5).map((doctor) => {
                    const doctorAppointments = getDoctorAppointments(doctor.doctorId);
                    const isExpanded = selectedDoctor === doctor.doctorId;
                    
                    return (
                      <div key={doctor.doctorId} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 overflow-hidden hover:shadow-lg transition-all duration-300">
                        {/* Doctor Summary Row */}
                        <div 
                          className="p-6 cursor-pointer hover:bg-white/50 transition-all duration-200"
                          onClick={() => handleDoctorClick(doctor.doctorId)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ 
                                backgroundColor: accentColor + '15'
                              }}>
                                <User className="h-6 w-6" style={{ color: accentColor }} />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-800">{doctor.doctorName}</h3>
                                <p className="text-sm text-gray-500">{doctor.totalAppointments} appointments • {doctor.completedAppointments} completed</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-6">
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Completion Rate</p>
                                <p className="text-xl font-bold text-gray-800">{doctor.completionRate.toFixed(1)}%</p>
                              </div>
                              
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Avg. Patients/Day</p>
                                <p className="text-lg font-semibold text-gray-800">{doctor.averagePatientsPerDay.toFixed(1)}</p>
                              </div>
                              
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Satisfaction</p>
                                <p className="text-lg font-semibold text-gray-800">{doctor.patientSatisfaction.toFixed(1)}%</p>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                  {formatCurrency(doctor.revenuePerAppointment)}
                                </Badge>
                                <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="border-t border-white/20 bg-gray-50/50">
                            <div className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-white/60 rounded-xl p-4">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-gray-700">Completed</span>
                                  </div>
                                  <p className="text-2xl font-bold text-gray-800">{doctor.completedAppointments}</p>
                                  <p className="text-sm text-gray-500">Successful appointments</p>
                                </div>
                                
                                <div className="bg-white/60 rounded-xl p-4">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-medium text-gray-700">Cancelled</span>
                                  </div>
                                  <p className="text-2xl font-bold text-gray-800">{doctor.cancelledAppointments}</p>
                                  <p className="text-sm text-gray-500">Missed appointments</p>
                                </div>
                                
                                <div className="bg-white/60 rounded-xl p-4">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <AlertCircle className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm font-medium text-gray-700">No Shows</span>
                                  </div>
                                  <p className="text-2xl font-bold text-gray-800">{doctor.noShowAppointments}</p>
                                  <p className="text-sm text-gray-500">Patient no-shows</p>
                                </div>
                              </div>

                              {/* Recent Appointments Table */}
                              <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Appointments</h4>
                                <div className="bg-white/60 rounded-xl overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-white/50">
                                        <TableHead className="font-semibold text-gray-700">Date</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Patient</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Notes</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {doctorAppointments.slice(0, 5).map((appointment) => {
                                        const statusConfig = getStatusConfig(appointment.status);
                                        return (
                                          <TableRow key={appointment._id} className="hover:bg-white/50">
                                            <TableCell>
                                              <span className="text-sm text-gray-700">
                                                {format(new Date(appointment.dateTime), "MMM d, yyyy")}
                                              </span>
                                            </TableCell>
                                            <TableCell>
                                              <span className="text-sm text-gray-700">
                                                {appointment.patientId.firstName} {appointment.patientId.lastName}
                                              </span>
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex items-center space-x-2">
                                                {statusConfig.icon}
                                                {statusConfig.badge}
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <span className="text-sm text-gray-600">
                                                {appointment.notes || 'No notes'}
                                              </span>
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Clinic Info Modal */}
      <ClinicInfoModal 
        isOpen={isClinicModalOpen}
        onClose={() => setIsClinicModalOpen(false)}
        clinicSettings={clinicSettings}
      />
    </div>
  );
} 