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
  Package
} from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';

interface ClinicSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
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

  // Role-specific KPIs
  const getRoleKPIs = () => {
    const role = session?.user?.role;
    
    switch (role) {
      case 'master_admin':
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
            value: "98.5%",
            change: "+2.1%",
            changeType: "positive",
            icon: <Activity className="h-4 w-4" />,
            description: "System uptime"
          },
          {
            title: "Security Score",
            value: "A+",
            change: "No change",
            changeType: "neutral",
            icon: <Shield className="h-4 w-4" />,
            description: "Security compliance"
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
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white/90">System Online</span>
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
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {kpis.map((kpi, index) => (
                 <div
                   key={index}
                   className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                   style={{ 
                     borderColor: clinicSettings.primaryColor + '20',
                     background: `linear-gradient(135deg, ${clinicSettings.primaryColor}05 0%, ${clinicSettings.primaryColor}10 100%)`
                   }}
                 >
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
                   <h3 className="text-2xl font-bold mb-2" style={{ color: clinicSettings.primaryColor }}>{kpi.value}</h3>
                   <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
                   <p className="text-xs text-gray-500">{kpi.description}</p>
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