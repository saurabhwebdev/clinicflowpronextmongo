'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Settings, 
  Calendar, 
  Users, 
  LogOut, 
  Home,
  FileText,
  CreditCard,
  BarChart,
  ShieldAlert,
  X,
  Mail,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SimpleHamburger, HamburgerIcon } from '@/components/ui/modern-hamburger';
import { ProfileCard } from '@/components/ui/profile-card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ClinicSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileCardOpen, setProfileCardOpen] = useState(false);
  const [profileCardTimeout, setProfileCardTimeout] = useState<NodeJS.Timeout | null>(null);
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

  // Handle authentication redirect
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      ? name
          .split(' ')
          .map(part => part[0])
          .join('')
          .toUpperCase()
      : 'U';
  };

  const handleSignOut = async () => {
    // Import signOut from next-auth/react and use it properly
    const { signOut } = await import('next-auth/react');
    await signOut({ redirect: false });
    router.push('/auth/signin');
  };

  const handleProfileCardEnter = () => {
    if (profileCardTimeout) {
      clearTimeout(profileCardTimeout);
      setProfileCardTimeout(null);
    }
    setProfileCardOpen(true);
  };

  const handleProfileCardLeave = () => {
    const timeout = setTimeout(() => {
      setProfileCardOpen(false);
    }, 150); // Small delay to allow moving to the card
    setProfileCardTimeout(timeout);
  };

  const getMenuItems = () => {
    const role = session?.user?.role;
    
    // Base items that all users see
    const baseItems = [
      { href: '/dashboard', icon: Home, label: 'Dashboard' },
    ];

    // Role-specific items
    switch (role) {
      case 'master_admin':
      case 'admin':
        return [
          ...baseItems,
          { href: '/dashboard/appointments', icon: Calendar, label: 'Appointments' },
          { href: '/dashboard/patients', icon: Users, label: 'Patients' },
          { href: '/dashboard/inventory', icon: Package, label: 'Inventory' },
          { href: '/dashboard/email', icon: Mail, label: 'Email' },
          { href: '/dashboard/reports', icon: FileText, label: 'Reports' },
          { href: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
        ];
      
      case 'doctor':
        return [
          ...baseItems,
          { href: '/dashboard/appointments', icon: Calendar, label: 'Appointments' },
          { href: '/dashboard/patients', icon: Users, label: 'Patients' },
          { href: '/dashboard/ehr', icon: FileText, label: 'EHR Records' },
          { href: '/dashboard/reports', icon: FileText, label: 'Reports' },
          { href: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
        ];
      
      case 'patient':
        return [
          ...baseItems,
          { href: '/dashboard/appointments', icon: Calendar, label: 'My Appointments' },
          { href: '/dashboard/billing', icon: CreditCard, label: 'My Bills' },
          { href: '/dashboard/patients/settings', icon: Settings, label: 'Clinic Info' },
        ];
      
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  const bottomMenuItems: Array<{ href: string; icon: any; label: string }> = [
    // Removed redundant Profile and Settings items that are already in main menu
  ];

  return (
    <TooltipProvider delayDuration={100}>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div 
          className={`
            fixed top-0 left-0 z-50 h-screen bg-gradient-to-b from-white to-gray-50/50 backdrop-blur-sm border-r 
            transform transition-all duration-500 ease-out
            ${sidebarOpen ? 'w-[280px] translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 lg:w-20'}
            lg:sticky lg:shadow-none
          `}
          style={{ 
            borderColor: clinicSettings.primaryColor + '20',
            background: `linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(249,250,251,0.8) 100%)`
          }}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b bg-white/80 backdrop-blur-sm" style={{ borderColor: clinicSettings.primaryColor + '20' }}>
            <div className="flex items-center">
              <div className={`font-bold text-xl transition-all duration-500 origin-left ${!sidebarOpen && 'lg:scale-90'}`} style={{ color: clinicSettings.primaryColor }}>
                {sidebarOpen ? (
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                      <span className="text-white font-bold text-lg">CF</span>
                    </div>
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ClinicFlow</span>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                    <span className="text-white font-bold text-lg">CF</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden hover:bg-gray-100 rounded-xl transition-all duration-200"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex flex-col h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden">
            {/* Main Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className="flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 group relative hover:shadow-md hover:scale-[1.02]"
                        style={{ 
                          color: clinicSettings.primaryColor + 'CC',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = clinicSettings.primaryColor + '08';
                          e.currentTarget.style.color = clinicSettings.primaryColor;
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = clinicSettings.primaryColor + 'CC';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <div className={`p-1.5 rounded-lg bg-white/50 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300 ${!sidebarOpen && 'lg:mx-auto'}`}>
                          <Icon className="h-5 w-5 min-w-[20px] transition-transform duration-300 group-hover:scale-110" />
                        </div>
                        <span className={`ml-3 font-medium transition-all duration-300 ${!sidebarOpen && 'lg:opacity-0 lg:invisible lg:translate-x-4'}`}>
                          {item.label}
                        </span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="right" 
                      className={`${sidebarOpen && 'lg:hidden'} bg-gray-900 text-white px-3 py-1.5 text-sm rounded-lg shadow-lg border-0`}
                    >
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}

              {/* Admin Panel - Only show for admin/master_admin */}
              {(session?.user?.role === 'master_admin' || session?.user?.role === 'admin') && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/admin"
                      className="flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 group hover:shadow-md hover:scale-[1.02]"
                      style={{ 
                        color: clinicSettings.accentColor + 'CC',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = clinicSettings.accentColor + '08';
                        e.currentTarget.style.color = clinicSettings.accentColor;
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = clinicSettings.accentColor + 'CC';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <div className={`p-1.5 rounded-lg bg-white/50 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300 ${!sidebarOpen && 'lg:mx-auto'}`}>
                        <ShieldAlert className="h-5 w-5 min-w-[20px] transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <span className={`ml-3 font-medium transition-all duration-300 ${!sidebarOpen && 'lg:opacity-0 lg:invisible lg:translate-x-4'}`}>
                        Admin Panel
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right" 
                    className={`${sidebarOpen && 'lg:hidden'} bg-gray-900 text-white px-3 py-1.5 text-sm rounded-lg shadow-lg border-0`}
                  >
                    Admin Panel
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Sidebar Expander - Last menu item */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="flex items-center w-full px-3 py-2.5 rounded-xl transition-all duration-300 group hover:shadow-md hover:scale-[1.02]"
                    style={{ 
                      color: clinicSettings.primaryColor + 'CC',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = clinicSettings.primaryColor + '08';
                      e.currentTarget.style.color = clinicSettings.primaryColor;
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = clinicSettings.primaryColor + 'CC';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                                          <div className={`p-1.5 rounded-lg bg-white/50 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300 ${!sidebarOpen && 'lg:mx-auto'}`}>
                        <HamburgerIcon
                          isOpen={sidebarOpen}
                          color={clinicSettings.primaryColor}
                          size="sm"
                        />
                      </div>
                    <span className={`ml-3 font-medium transition-all duration-300 ${!sidebarOpen && 'lg:opacity-0 lg:invisible lg:translate-x-4'}`}>
                      {sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent 
                  side="right" 
                  className={`${sidebarOpen && 'lg:hidden'} bg-gray-900 text-white px-3 py-1.5 text-sm rounded-lg shadow-lg border-0`}
                >
                  {sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
                </TooltipContent>
              </Tooltip>
            </nav>

            {/* Bottom Navigation */}
            <div className="px-3 py-3 border-t bg-white/60 backdrop-blur-sm" style={{ borderColor: clinicSettings.secondaryColor + '20' }}>
              <div className="space-y-2">
                {bottomMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className="flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 group hover:shadow-md hover:scale-[1.02]"
                          style={{ 
                            color: clinicSettings.secondaryColor + 'CC',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = clinicSettings.secondaryColor + '08';
                            e.currentTarget.style.color = clinicSettings.secondaryColor;
                            e.currentTarget.style.transform = 'translateX(4px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = clinicSettings.secondaryColor + 'CC';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <div className={`p-1.5 rounded-lg bg-white/50 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300 ${!sidebarOpen && 'lg:mx-auto'}`}>
                            <Icon className="h-5 w-5 min-w-[20px] transition-transform duration-300 group-hover:scale-110" />
                          </div>
                          <span className={`ml-3 font-medium transition-all duration-300 ${!sidebarOpen && 'lg:opacity-0 lg:invisible lg:translate-x-4'}`}>
                            {item.label}
                          </span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="right" 
                        className={`${sidebarOpen && 'lg:hidden'} bg-gray-900 text-white px-3 py-1.5 text-sm rounded-lg shadow-lg border-0`}
                      >
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-3 py-2.5 rounded-xl transition-all duration-300 group hover:shadow-md hover:scale-[1.02]"
                      style={{ 
                        color: clinicSettings.accentColor + 'CC',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = clinicSettings.accentColor + '08';
                        e.currentTarget.style.color = clinicSettings.accentColor;
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = clinicSettings.accentColor + 'CC';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div className={`p-1.5 rounded-lg bg-white/50 backdrop-blur-sm shadow-sm group-hover:shadow-md transition-all duration-300 ${!sidebarOpen && 'lg:mx-auto'}`}>
                        <LogOut className="h-5 w-5 min-w-[20px] transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <span className={`ml-3 font-medium transition-all duration-300 ${!sidebarOpen && 'lg:opacity-0 lg:invisible lg:translate-x-4'}`}>
                        Sign Out
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right" 
                    className={`${sidebarOpen && 'lg:hidden'} bg-gray-900 text-white px-3 py-1.5 text-sm rounded-lg shadow-lg border-0`}
                  >
                    Sign Out
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="flex-1 lg:pl-0">
        {/* Top Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b h-16 shadow-sm relative z-40" style={{ borderColor: clinicSettings.primaryColor + '20' }}>
          <div className="flex items-center justify-between h-full px-4">
            <SimpleHamburger
              isOpen={sidebarOpen}
              onClick={() => setSidebarOpen(true)}
              color={clinicSettings.primaryColor}
              size="md"
              className="lg:hidden"
            />

            <div className="flex items-center gap-4 ml-auto">
              <div 
                className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 relative z-50"
                onMouseEnter={handleProfileCardEnter}
                onMouseLeave={handleProfileCardLeave}
              >
                <Avatar className="h-8 w-8" style={{ borderColor: clinicSettings.primaryColor + '30' }}>
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback className="text-sm" style={{ backgroundColor: clinicSettings.primaryColor + '20', color: clinicSettings.primaryColor }}>
                    {getInitials(session?.user?.name || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <div className="font-medium text-sm" style={{ color: clinicSettings.primaryColor }}>{session?.user?.name}</div>
                  <div className="text-xs capitalize" style={{ color: clinicSettings.primaryColor + 'CC' }}>{session?.user?.role}</div>
                </div>
                
                {/* Profile Card */}
                <ProfileCard 
                  isOpen={profileCardOpen}
                  onClose={() => setProfileCardOpen(false)}
                  onMouseEnter={handleProfileCardEnter}
                  onMouseLeave={handleProfileCardLeave}
                  clinicSettings={clinicSettings}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {children}
        </main>
      </div>
      </div>
    </TooltipProvider>
  );
}