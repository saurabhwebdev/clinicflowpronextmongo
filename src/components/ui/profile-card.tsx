"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Calendar, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface ProfileCardProps {
  isOpen: boolean;
  onClose: () => void;
  clinicSettings: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

export function ProfileCard({ isOpen, onClose, clinicSettings }: ProfileCardProps) {
  const { data: session } = useSession();
  const router = useRouter();

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
    const { signOut } = await import('next-auth/react');
    await signOut({ redirect: false });
    router.push('/auth/signin');
  };

  const handleProfileClick = () => {
    router.push('/dashboard/profile');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 z-[9999]">
      <Card className="w-80 bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12" style={{ borderColor: clinicSettings.primaryColor + '30' }}>
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback className="text-lg font-semibold" style={{ backgroundColor: clinicSettings.primaryColor + '20', color: clinicSettings.primaryColor }}>
                {getInitials(session?.user?.name || '')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">{session?.user?.name}</h3>
              <Badge 
                variant="secondary" 
                className="capitalize mt-1"
                style={{ 
                  backgroundColor: clinicSettings.primaryColor + '15',
                  color: clinicSettings.primaryColor
                }}
              >
                {session?.user?.role}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* User Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Mail className="h-4 w-4" style={{ color: clinicSettings.primaryColor }} />
              <span>{session?.user?.email}</span>
            </div>
            {session?.user?.phone && (
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Phone className="h-4 w-4" style={{ color: clinicSettings.primaryColor }} />
                <span>{session.user.phone}</span>
              </div>
            )}
            {session?.user?.dateOfBirth && (
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Calendar className="h-4 w-4" style={{ color: clinicSettings.primaryColor }} />
                <span>{new Date(session.user.dateOfBirth).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm"
              onClick={handleProfileClick}
              style={{ 
                color: clinicSettings.primaryColor,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = clinicSettings.primaryColor + '10';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <User className="h-4 w-4 mr-3" />
              View Profile
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-sm"
              onClick={() => router.push('/dashboard/settings')}
              style={{ 
                color: clinicSettings.secondaryColor,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = clinicSettings.secondaryColor + '10';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Settings className="h-4 w-4 mr-3" />
              Settings
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-sm"
              onClick={handleSignOut}
              style={{ 
                color: clinicSettings.accentColor,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = clinicSettings.accentColor + '10';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 