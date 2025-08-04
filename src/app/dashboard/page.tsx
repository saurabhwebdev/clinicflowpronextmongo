'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Stethoscope, 
  Pill, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Database, 
  Clock,
  Activity,
  BarChart3,
  FileText,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { useClinicSettings } from '@/hooks/use-clinic-settings';

interface ClinicSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

interface SystemHealth {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  database: 'connected' | 'disconnected';
  environment: string;
  error?: string;
}

interface SystemUptime {
  systemId: string;
  totalUptimeMs: number;
  formattedUptime: string;
  isCurrentlyRunning: boolean;
  lastStartTime: string;
  currentSessionStartTime: string;
  totalSessions: number;
  longestSessionMs: number;
  averageSessionMs: number;
  environment: string;
  version: string;
  lastUpdated: string;
}

interface AdminStats {
  users: {
    total: number;
    change: string;
    changeType: string;
    byRole: Record<string, number>;
    patients: number;
    doctors: number;
    admins: number;
  };
  revenue: {
    monthly: number;
    bills: number;
    appointments: number;
  };
}

interface DoctorStats {
  appointments: {
    today: number;
    total: number;
    completed: number;
    change: string;
    changeType: string;
  };
  patients: {
    total: number;
    seenToday: number;
    change: string;
    changeType: string;
  };
  prescriptions: {
    total: number;
    today: number;
    change: string;
    changeType: string;
  };
  revenue: {
    monthly: number;
    bills: number;
  };
  ehrs: {
    total: number;
  };
}

export default function Dashboard() {
  const { data: session } = useSession();
  const { settings } = useClinicSettings();
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [systemUptime, setSystemUptime] = useState<SystemUptime | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [doctorStats, setDoctorStats] = useState<DoctorStats | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [isLoadingUptime, setIsLoadingUptime] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingDoctorStats, setIsLoadingDoctorStats] = useState(false);

  // Get currency symbol from user's currency or clinic settings
  const getUserCurrencySymbol = () => {
    const userCurrency = session?.user?.currency || settings?.currency || 'USD';
    switch (userCurrency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR': return '₹';
      case 'CAD': return 'C$';
      case 'AUD': return 'A$';
      default: return '$';
    }
  };

  const symbol = getUserCurrencySymbol();

  // Fetch clinic settings
  useEffect(() => {
    const fetchClinicSettings = async () => {
      try {
        const response = await fetch('/api/clinic-settings');
        if (response.ok) {
          const data = await response.json();
          // Settings are handled by the useClinicSettings hook
        }
      } catch (error) {
        console.error('Error fetching clinic settings:', error);
      }
    };

    fetchClinicSettings();
  }, []);

  // Fetch system health
  useEffect(() => {
    const fetchSystemHealth = async () => {
      try {
        setIsLoadingHealth(true);
        const response = await fetch('/api/health');
        if (response.ok) {
          const data = await response.json();
          setSystemHealth(data);
        }
      } catch (error) {
        console.error('Error fetching system health:', error);
      } finally {
        setIsLoadingHealth(false);
      }
    };

    fetchSystemHealth();
  }, []);

  // Fetch system uptime
  useEffect(() => {
    const fetchSystemUptime = async () => {
      try {
        setIsLoadingUptime(true);
        const response = await fetch('/api/system-uptime');
        if (response.ok) {
          const data = await response.json();
          setSystemUptime(data.data);
        }
      } catch (error) {
        console.error('Error fetching system uptime:', error);
      } finally {
        setIsLoadingUptime(false);
      }
    };

    fetchSystemUptime();
  }, []);

  // Fetch admin stats for master_admin
  useEffect(() => {
    const fetchAdminStats = async () => {
      if (session?.user?.role === 'master_admin') {
        try {
          setIsLoadingStats(true);
          const response = await fetch('/api/admin/stats');
          if (response.ok) {
            const data = await response.json();
            setAdminStats(data.data);
          }
        } catch (error) {
          console.error('Error fetching admin stats:', error);
        } finally {
          setIsLoadingStats(false);
        }
      }
    };

    fetchAdminStats();
  }, [session?.user?.role]);

  // Fetch doctor stats for doctor role
  useEffect(() => {
    const fetchDoctorStats = async () => {
      if (session?.user?.role === 'doctor') {
        try {
          setIsLoadingDoctorStats(true);
          const response = await fetch('/api/doctor/stats');
          if (response.ok) {
            const data = await response.json();
            setDoctorStats(data.data);
          }
        } catch (error) {
          console.error('Error fetching doctor stats:', error);
        } finally {
          setIsLoadingDoctorStats(false);
        }
      }
    };

    fetchDoctorStats();
  }, [session?.user?.role]);

  // Set up polling for real-time updates
  useEffect(() => {
    const fetchSystemUptime = async () => {
      try {
        const response = await fetch('/api/system-uptime');
        if (response.ok) {
          const data = await response.json();
          setSystemUptime(data.data);
        }
      } catch (error) {
        console.error('Error fetching system uptime:', error);
      }
    };

    fetchSystemUptime();
    const interval = setInterval(fetchSystemUptime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Role-specific KPIs
  const getRoleKPIs = () => {
    const role = session?.user?.role;
    
    switch (role) {
      case 'master_admin':
        const healthStatus = systemHealth?.status === 'healthy' ? '98.5%' : '95.2%';
        const healthChange = systemHealth?.status === 'healthy' ? '+2.1%' : '-1.8%';
        const healthChangeType = systemHealth?.status === 'healthy' ? 'positive' : 'negative';
        
        return [
          {
            title: "Total Users",
            value: adminStats?.users?.total?.toLocaleString() || "Loading...",
            change: adminStats?.users?.change || "+0%",
            changeType: adminStats?.users?.changeType || "neutral",
            icon: <Users className="h-4 w-4" />,
            description: "Active system users",
            isLoading: isLoadingStats
          },
          {
            title: "System Health",
            value: healthStatus,
            change: healthChange,
            changeType: healthChangeType,
            icon: systemHealth?.status === 'healthy' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />,
            description: systemHealth?.status === 'healthy' ? "System operational" : "System issues detected",
            status: systemHealth?.status,
            isLoading: isLoadingHealth
          },
          {
            title: "Database Status",
            value: systemHealth?.database === 'connected' ? 'Connected' : 'Disconnected',
            change: systemHealth?.database === 'connected' ? 'Online' : 'Offline',
            changeType: systemHealth?.database === 'connected' ? 'positive' : 'negative',
            icon: <Database className="h-4 w-4" />,
            description: systemHealth?.database === 'connected' ? "Database operational" : "Database connection failed",
            status: systemHealth?.database
          },
          {
            title: "Total System Uptime",
            value: systemUptime?.formattedUptime || 'Loading...',
            change: systemUptime?.isCurrentlyRunning ? 'Live' : 'Stopped',
            changeType: systemUptime?.isCurrentlyRunning ? 'positive' : 'negative',
            icon: <Clock className="h-4 w-4" />,
            description: "Cumulative system uptime",
            isLoading: isLoadingUptime,
            isLive: true,
            additionalInfo: systemUptime ? {
              totalSessions: systemUptime.totalSessions,
              longestSession: systemUptime.longestSessionMs,
              averageSession: systemUptime.averageSessionMs
            } : null
          }
        ];
      
      case 'admin':
        return [
          {
            title: "Total Patients",
            value: adminStats?.users?.patients?.toLocaleString() || "Loading...",
            change: "+8%",
            changeType: "positive",
            icon: <Users className="h-4 w-4" />,
            description: "Registered patients",
            isLoading: isLoadingStats
          },
          {
            title: "Revenue",
            value: `${symbol}${adminStats?.revenue?.monthly?.toLocaleString() || "0"}`,
            change: "+15%",
            changeType: "positive",
            icon: <DollarSign className="h-4 w-4" />,
            description: "Monthly revenue",
            isLoading: isLoadingStats
          },
          {
            title: "Staff Efficiency",
            value: "92%",
            change: "+5%",
            changeType: "positive",
            icon: <TrendingUp className="h-4 w-4" />,
            description: "Staff productivity"
          }
        ];
      
      case 'doctor':
        return [
          {
            title: "Today's Appointments",
            value: doctorStats?.appointments?.today?.toString() || "Loading...",
            change: doctorStats?.appointments?.change || "0",
            changeType: doctorStats?.appointments?.changeType || "neutral",
            icon: <Calendar className="h-4 w-4" />,
            description: "Scheduled appointments",
            isLoading: isLoadingDoctorStats
          },
          {
            title: "Patients Seen",
            value: doctorStats?.patients?.seenToday?.toString() || "Loading...",
            change: doctorStats?.patients?.change || "0",
            changeType: doctorStats?.patients?.changeType || "neutral",
            icon: <Stethoscope className="h-4 w-4" />,
            description: "Patients treated today",
            isLoading: isLoadingDoctorStats
          },
          {
            title: "Prescriptions",
            value: doctorStats?.prescriptions?.today?.toString() || "Loading...",
            change: doctorStats?.prescriptions?.change || "0",
            changeType: doctorStats?.prescriptions?.changeType || "neutral",
            icon: <Pill className="h-4 w-4" />,
            description: "Prescriptions issued today",
            isLoading: isLoadingDoctorStats
          },
          {
            title: "Total Patients",
            value: doctorStats?.patients?.total?.toString() || "Loading...",
            change: "+0",
            changeType: "neutral",
            icon: <Users className="h-4 w-4" />,
            description: "Total patients in your care",
            isLoading: isLoadingDoctorStats
          }
        ];
      
      case 'patient':
        return null; // No KPIs for patients
      
      default:
        return [
          {
            title: "Welcome",
            value: "Dashboard",
            change: "New",
            changeType: "neutral",
            icon: <User className="h-4 w-4" />,
            description: "Get started with your role"
          }
        ];
    }
  };

  const kpis = getRoleKPIs();

  // Role-specific quick actions
  const getQuickActions = () => {
    const role = session?.user?.role;
    
    switch (role) {
      case 'master_admin':
        return [
          {
            title: "User Management",
            description: "Manage all system users",
            icon: <Users className="h-5 w-5" />,
            href: "/admin/users",
            color: "bg-blue-500"
          },
          {
            title: "System Health",
            description: "Monitor system status",
            icon: <Activity className="h-5 w-5" />,
            href: "/admin/health",
            color: "bg-green-500"
          },
          {
            title: "Analytics",
            description: "View detailed reports",
            icon: <BarChart3 className="h-5 w-5" />,
            href: "/admin/analytics",
            color: "bg-purple-500"
          },
          {
            title: "System Settings",
            description: "Configure system options",
            icon: <Settings className="h-5 w-5" />,
            href: "/admin/settings",
            color: "bg-orange-500"
          }
        ];
      
      case 'admin':
        return [
          {
            title: "Patient Management",
            description: "Manage patient records",
            icon: <Users className="h-5 w-5" />,
            href: "/dashboard/patients",
            color: "bg-blue-500"
          },
          {
            title: "Billing",
            description: "Handle billing and payments",
            icon: <DollarSign className="h-5 w-5" />,
            href: "/dashboard/billing",
            color: "bg-green-500"
          },
          {
            title: "Reports",
            description: "Generate reports",
            icon: <FileText className="h-5 w-5" />,
            href: "/dashboard/reports",
            color: "bg-purple-500"
          },
          {
            title: "Settings",
            description: "Manage clinic settings",
            icon: <Settings className="h-5 w-5" />,
            href: "/dashboard/settings",
            color: "bg-orange-500"
          }
        ];
      
      case 'doctor':
        return [
          {
            title: "Appointments",
            description: "View and manage appointments",
            icon: <Calendar className="h-5 w-5" />,
            href: "/dashboard/appointments",
            color: "bg-blue-500"
          },
          {
            title: "Patients",
            description: "Access patient records",
            icon: <Users className="h-5 w-5" />,
            href: "/dashboard/patients",
            color: "bg-green-500"
          },
          {
            title: "Prescriptions",
            description: "Manage prescriptions",
            icon: <Pill className="h-5 w-5" />,
            href: "/dashboard/prescriptions",
            color: "bg-purple-500"
          },
          {
            title: "EHR",
            description: "Electronic Health Records",
            icon: <FileText className="h-5 w-5" />,
            href: "/dashboard/ehr",
            color: "bg-orange-500"
          }
        ];
      
      case 'patient':
        return [
          {
            title: "My Appointments",
            description: "View your appointments",
            icon: <Calendar className="h-5 w-5" />,
            href: "/dashboard/appointments",
            color: "bg-blue-500"
          },
          {
            title: "My Records",
            description: "Access your health records",
            icon: <FileText className="h-5 w-5" />,
            href: "/dashboard/records",
            color: "bg-green-500"
          },
          {
            title: "Prescriptions",
            description: "View your prescriptions",
            icon: <Pill className="h-5 w-5" />,
            href: "/dashboard/prescriptions",
            color: "bg-purple-500"
          },
          {
            title: "Profile",
            description: "Update your profile",
            icon: <User className="h-5 w-5" />,
            href: "/dashboard/profile",
            color: "bg-orange-500"
          }
        ];
      
      default:
        return [];
    }
  };

  const quickActions = getQuickActions();

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p className="text-gray-600">Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {session.user.firstName} {session.user.lastName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{session.user.role}</Badge>
          {systemHealth?.status && (
            <Badge variant={systemHealth.status === 'healthy' ? 'default' : 'destructive'}>
              {systemHealth.status === 'healthy' ? 'System Healthy' : 'System Issues'}
            </Badge>
          )}
        </div>
      </div>

      {/* KPIs */}
      {kpis && kpis.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <div className={`p-2 rounded-full ${kpi.icon ? 'text-gray-600' : ''}`}>
                  {kpi.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpi.isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                  ) : (
                    kpi.value
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge 
                    variant={kpi.changeType === 'positive' ? 'default' : kpi.changeType === 'negative' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {kpi.change}
                  </Badge>
                  {kpi.isLive && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500">Live</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">{kpi.description}</p>
                
                {/* Additional Info for System Uptime */}
                {kpi.additionalInfo && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Sessions:</span>
                        <span className="font-medium">{kpi.additionalInfo.totalSessions}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Longest:</span>
                        <span className="font-medium">{Math.floor(kpi.additionalInfo.longestSession / (1000 * 60 * 60))}h {Math.floor((kpi.additionalInfo.longestSession % (1000 * 60 * 60)) / (1000 * 60))}m</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Avg:</span>
                        <span className="font-medium">{Math.floor(kpi.additionalInfo.averageSession / (1000 * 60 * 60))}h {Math.floor((kpi.additionalInfo.averageSession % (1000 * 60 * 60)) / (1000 * 60))}m</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${action.color} text-white`}>
                        {action.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Role-specific content */}
      {session.user.role === 'master_admin' && adminStats && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">User Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Patients:</span>
                    <span className="font-medium">{adminStats.users.patients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Doctors:</span>
                    <span className="font-medium">{adminStats.users.doctors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Admins:</span>
                    <span className="font-medium">{adminStats.users.admins}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monthly Revenue:</span>
                    <span className="font-medium">{symbol}{adminStats.revenue.monthly.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Bills:</span>
                    <span className="font-medium">{adminStats.revenue.bills}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Appointments:</span>
                    <span className="font-medium">{adminStats.revenue.appointments}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Database:</span>
                    <Badge variant={systemHealth?.database === 'connected' ? 'default' : 'destructive'}>
                      {systemHealth?.database === 'connected' ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Uptime:</span>
                    <span className="font-medium">{systemUptime?.formattedUptime || 'Loading...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Environment:</span>
                    <span className="font-medium">{systemUptime?.environment || 'Unknown'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Doctor-specific content */}
      {session.user.role === 'doctor' && doctorStats && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Practice Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Appointment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Today's Appointments:</span>
                    <span className="font-medium">{doctorStats.appointments.today}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed Today:</span>
                    <span className="font-medium">{doctorStats.appointments.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Appointments:</span>
                    <span className="font-medium">{doctorStats.appointments.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Patient Care</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Patients:</span>
                    <span className="font-medium">{doctorStats.patients.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Patients Seen Today:</span>
                    <span className="font-medium">{doctorStats.patients.seenToday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total EHRs:</span>
                    <span className="font-medium">{doctorStats.ehrs.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Revenue & Prescriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monthly Revenue:</span>
                    <span className="font-medium">{symbol}{doctorStats.revenue.monthly.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Bills:</span>
                    <span className="font-medium">{doctorStats.revenue.bills}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prescriptions Today:</span>
                    <span className="font-medium">{doctorStats.prescriptions.today}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}