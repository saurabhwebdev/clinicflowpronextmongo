'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, Mail, User, Shield, ArrowRight, Heart, Stethoscope, Sparkles } from 'lucide-react';

// Animated background component
const AnimatedBackground = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number }>>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 0.5 + 0.2,
      }));
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-white/30 to-black/10 backdrop-blur-[1px] animate-pulse"></div>
      
      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.speed}s`,
            animationDelay: `${particle.id * 0.1}s`,
          }}
        />
      ))}
      
      {/* Animated circles */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
    </div>
  );
};

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials');
      } else {
        const session = await getSession();
        
        // Check if user needs to change password
        if (session?.user?.requirePasswordChange) {
          router.push('/auth/change-password');
          return;
        }
        
        // Route based on role
        switch (session?.user?.role) {
          case 'master_admin':
            router.push('/admin');
            break;
          case 'admin':
            router.push('/admin');
            break;
          case 'doctor':
            router.push('/dashboard');
            break;
          case 'patient':
            router.push('/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Left Side - Enhanced Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <AnimatedBackground />
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm animate-bounce" style={{ animationDelay: '0.5s' }}>
                <Heart className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                ClinicFlow
              </h1>
            </div>
            <p className="text-xl text-blue-100 mb-2 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              Healthcare Management System
            </p>
            <p className="text-blue-200 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
              Streamline your clinic operations with our comprehensive healthcare management platform
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm animate-slide-in-left" style={{ animationDelay: '1.1s' }}>
              <div className="p-2 rounded-xl bg-white/20 animate-pulse">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">For Healthcare Providers</h3>
                <p className="text-sm text-blue-200">Manage patients, appointments, and medical records efficiently</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm animate-slide-in-left" style={{ animationDelay: '1.3s' }}>
              <div className="p-2 rounded-xl bg-white/20 animate-pulse" style={{ animationDelay: '0.5s' }}>
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Secure & Compliant</h3>
                <p className="text-sm text-blue-200">HIPAA-compliant platform with enterprise-grade security</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm animate-slide-in-left" style={{ animationDelay: '1.5s' }}>
              <div className="p-2 rounded-xl bg-white/20 animate-pulse" style={{ animationDelay: '1s' }}>
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Patient-Centric</h3>
                <p className="text-sm text-blue-200">Enhanced patient experience with modern healthcare solutions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Enhanced Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        {/* Background decoration for right side */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl animate-float" style={{ animationDuration: '6s' }}></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl animate-float" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
        
        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8 animate-fade-in-down">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 animate-bounce" style={{ animationDelay: '0.3s' }}>
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ClinicFlow
              </h1>
            </div>
            <p className="text-gray-600">Healthcare Management System</p>
          </div>

          <Card className="w-full border-0 shadow-2xl bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
            <CardHeader className="relative pb-8 pt-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-4 shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }}>
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-gray-600 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
                  Sign in to your account to continue
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="relative pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800 rounded-xl animate-shake">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '1.1s' }}>
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all duration-200 h-12 group-hover:bg-white/90"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '1.3s' }}>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                    <span className="text-xs text-gray-500">
                      Contact admin if you need password help
                    </span>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all duration-200 h-12 group-hover:bg-white/90"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in-up" 
                  style={{ animationDelay: '1.5s' }}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4 animate-pulse" />
                    </div>
                  )}
                </Button>
              </form>
              
              <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '1.7s' }}>
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors hover:underline">
                    Create an account
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}