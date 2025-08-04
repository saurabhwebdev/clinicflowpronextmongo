'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  User, 
  Users, 
  FileText, 
  CreditCard, 
  BarChart, 
  Activity,
  TrendingUp,
  Shield,
  Settings,
  Database,
  ClipboardList,
  DollarSign,
  Pill,
  Stethoscope,
  Mail,
  Package,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';

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

export default function Dashboard() {
  const { data: session } = useSession();
  const { currency, symbol } = useCurrency();
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>({
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937'
  });
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [systemUptime, setSystemUptime] = useState<SystemUptime | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [isLoadingUptime, setIsLoadingUptime] = useState(false);

  // Fetch clinic settings
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
              textColor: data.settings.textColor || '#1f2937'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching clinic settings:', error);
      }
    };

    fetchClinicSettings();
  }, []);

  // Fetch system health data
  useEffect(() => {
    const fetchSystemHealth = async () => {
      if (session?.user?.role === 'master_admin') {
        setIsLoadingHealth(true);
        try {
          const response = await fetch('/api/health');
          const data = await response.json();
          setSystemHealth(data);
        } catch (error) {
          console.error('Error fetching system health:', error);
          setSystemHealth({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            environment: 'unknown',
            error: 'Failed to fetch system health'
          });
        } finally {
          setIsLoadingHealth(false);
        }
      }
    };

    fetchSystemHealth();
    
    // Refresh system health every 30 seconds for master_admin
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, [session?.user?.role]);

  // Fetch system uptime data
  useEffect(() => {
    const fetchSystemUptime = async () => {
      if (session?.user?.role === 'master_admin') {
        setIsLoadingUptime(true);
        try {
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
      }
    };

    fetchSystemUptime();
    
    // Refresh system uptime every 10 seconds for master_admin
    const interval = setInterval(fetchSystemUptime, 10000);
    return () => clearInterval(interval);
  }, [session?.user?.role]);

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
            value: "1,247",
            change: "+12%",
            changeType: "positive",
            icon: <Users className="h-4 w-4" />,
            description: "Active system users"
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
            value: "856",
            change: "+8%",
            changeType: "positive",
            icon: <Users className="h-4 w-4" />,
            description: "Registered patients"
          },
          {
            title: "Revenue",
            value: `${symbol}45,230`,
            change: "+15%",
            changeType: "positive",
            icon: <DollarSign className="h-4 w-4" />,
            description: "Monthly revenue"
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
            value: "12",
            change: "+3",
            changeType: "positive",
            icon: <Calendar className="h-4 w-4" />,
            description: "Scheduled appointments"
          },
          {
            title: "Patients Seen",
            value: "8",
            change: "+2",
            changeType: "positive",
            icon: <Stethoscope className="h-4 w-4" />,
            description: "Patients treated today"
          },
          {
            title: "Prescriptions",
            value: "15",
            change: "+5",
            changeType: "positive",
            icon: <Pill className="h-4 w-4" />,
            description: "Prescriptions issued"
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

  return (
    <div>
      {/* Welcome Section */}
      <div 
        className="mb-8 p-6 rounded-xl text-white shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${clinicSettings.primaryColor} 0%, ${clinicSettings.secondaryColor} 50%, ${clinicSettings.accentColor} 100%)`
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {session?.user?.name}!
            </h1>
            <p className="text-white/90 text-lg">
              Here's your clinic dashboard overview for today
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${systemHealth?.status === 'healthy' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-white/90">
                  {systemHealth?.status === 'healthy' ? 'System Online' : 'System Issues'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-white/80" />
                <span className="text-white/90">{new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card 
          className="shadow-sm hover:shadow-md transition-shadow border-0"
          style={{
            background: `linear-gradient(135deg, ${clinicSettings.primaryColor}10 0%, ${clinicSettings.primaryColor}20 100%)`,
            borderColor: clinicSettings.primaryColor + '30'
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: clinicSettings.primaryColor }}>Your Role</CardTitle>
            <div className="p-2 rounded-lg" style={{ backgroundColor: clinicSettings.primaryColor }}>
              <User className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize" style={{ color: clinicSettings.primaryColor }}>{session?.user?.role || 'User'}</div>
            <p className="text-xs mt-1" style={{ color: clinicSettings.primaryColor + 'CC' }}>Current system role</p>
          </CardContent>
        </Card>

        <Card 
          className="shadow-sm hover:shadow-md transition-shadow border-0"
          style={{
            background: `linear-gradient(135deg, ${clinicSettings.accentColor}10 0%, ${clinicSettings.accentColor}20 100%)`,
            borderColor: clinicSettings.accentColor + '30'
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: clinicSettings.accentColor }}>Today's Date</CardTitle>
            <div className="p-2 rounded-lg" style={{ backgroundColor: clinicSettings.accentColor }}>
              <Calendar className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: clinicSettings.accentColor }}>{new Date().toLocaleDateString()}</div>
            <p className="text-xs mt-1" style={{ color: clinicSettings.accentColor + 'CC' }}>Current date</p>
          </CardContent>
        </Card>

        <Card 
          className="shadow-sm hover:shadow-md transition-shadow border-0"
          style={{
            background: `linear-gradient(135deg, ${clinicSettings.secondaryColor}10 0%, ${clinicSettings.secondaryColor}20 100%)`,
            borderColor: clinicSettings.secondaryColor + '30'
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: clinicSettings.secondaryColor }}>Currency</CardTitle>
            <div className="p-2 rounded-lg" style={{ backgroundColor: clinicSettings.secondaryColor }}>
              <CreditCard className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: clinicSettings.secondaryColor }}>{symbol} {currency}</div>
            <p className="text-xs mt-1" style={{ color: clinicSettings.secondaryColor + 'CC' }}>Current currency setting</p>
          </CardContent>
        </Card>
      </div>

      {kpis && (
        <Card className="mb-8 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold" style={{ color: clinicSettings.primaryColor }}>Key Performance Indicators</CardTitle>
            <CardDescription className="text-gray-500">
              Role-specific metrics and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpis.map((kpi, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white relative"
                  style={{ 
                    borderColor: clinicSettings.primaryColor + '20',
                    background: `linear-gradient(135deg, ${clinicSettings.primaryColor}05 0%, ${clinicSettings.primaryColor}10 100%)`
                  }}
                >
                  {/* Loading overlay for system health KPIs */}
                  {kpi.isLoading && (
                    <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: clinicSettings.primaryColor + '20' }}>
                      <div style={{ color: clinicSettings.primaryColor }}>
                        {kpi.icon}
                      </div>
                    </div>
                    <Badge 
                      variant={kpi.changeType === 'positive' ? 'default' : kpi.changeType === 'negative' ? 'destructive' : 'secondary'}
                      className="text-xs"
                      style={kpi.changeType === 'positive' ? { backgroundColor: clinicSettings.accentColor } : {}}
                    >
                      {kpi.change}
                    </Badge>
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${kpi.isLive ? 'font-mono' : ''}`} style={{ color: clinicSettings.primaryColor }}>{kpi.value}</h3>
                  <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
                  <p className="text-xs text-gray-500">{kpi.description}</p>
                  
                  {/* Additional info for system health KPIs */}
                  {kpi.status && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${kpi.status === 'healthy' || kpi.status === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className="text-xs text-gray-600 capitalize">{kpi.status}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Live indicator for uptime */}
                  {kpi.isLive && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">LIVE</span>
                    </div>
                  )}
                  
                  {/* Additional uptime statistics */}
                  {kpi.additionalInfo && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Sessions:</span>
                          <span className="font-medium">{kpi.additionalInfo.totalSessions}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Longest:</span>
                          <span className="font-medium">{Math.floor(kpi.additionalInfo.longestSession / (1000 * 60 * 60))}h {Math.floor((kpi.additionalInfo.longestSession % (1000 * 60 * 60)) / (1000 * 60))}m</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Average:</span>
                          <span className="font-medium">{Math.floor(kpi.additionalInfo.averageSession / (1000 * 60 * 60))}h {Math.floor((kpi.additionalInfo.averageSession % (1000 * 60 * 60)) / (1000 * 60))}m</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2" style={{ color: clinicSettings.primaryColor }}>
            <User className="h-5 w-5" />
            Account Overview
          </CardTitle>
          <CardDescription className="text-gray-500">
            Your personal information and account details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Profile Avatar and Basic Info */}
            <div 
              className="flex items-center space-x-4 p-4 rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${clinicSettings.primaryColor}10 0%, ${clinicSettings.secondaryColor}10 100%)`
              }}
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{
                  background: `linear-gradient(135deg, ${clinicSettings.primaryColor} 0%, ${clinicSettings.secondaryColor} 100%)`
                }}
              >
                {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{session?.user?.name}</h3>
                <p className="text-sm text-gray-600">{session?.user?.email}</p>
                <Badge variant="secondary" className="mt-1 capitalize" style={{ backgroundColor: clinicSettings.accentColor + '20', color: clinicSettings.accentColor }}>
                  {session?.user?.role || 'User'}
                </Badge>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: clinicSettings.primaryColor + '10' }}>
                <div className="text-2xl font-bold" style={{ color: clinicSettings.primaryColor }}>Active</div>
                <div className="text-sm text-gray-600">Account Status</div>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: clinicSettings.accentColor + '10' }}>
                <div className="text-2xl font-bold" style={{ color: clinicSettings.accentColor }}>Verified</div>
                <div className="text-sm text-gray-600">Email Status</div>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: clinicSettings.secondaryColor + '10' }}>
                <div className="text-2xl font-bold" style={{ color: clinicSettings.secondaryColor }}>Secure</div>
                <div className="text-sm text-gray-600">Account Security</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button className="flex-1" asChild style={{ backgroundColor: clinicSettings.primaryColor, borderColor: clinicSettings.primaryColor }}>
                <a href="/dashboard/profile">
                  <User className="h-4 w-4 mr-2" />
                  View Complete Profile
                </a>
              </Button>
              <Button variant="outline" className="flex-1" asChild style={{ borderColor: clinicSettings.secondaryColor, color: clinicSettings.secondaryColor }}>
                <a href="/dashboard/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}