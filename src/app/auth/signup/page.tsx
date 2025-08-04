'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, User, Mail, Lock, Phone, MapPin, Building, FileText, ArrowRight, ArrowLeft, Heart, CheckCircle, ChevronRight } from 'lucide-react';

// Country-currency mapping
const countryCurrencyMap: Record<string, string> = {
  'USA': 'USD',
  'UK': 'GBP',
  'Canada': 'CAD',
  'Australia': 'AUD',
  'India': 'INR',
  'Japan': 'JPY',
  'China': 'CNY',
  'Germany': 'EUR',
  'France': 'EUR',
  'Italy': 'EUR',
  'Spain': 'EUR',
  'Brazil': 'BRL',
  'Mexico': 'MXN',
  'Singapore': 'SGD',
  'South Africa': 'ZAR'
};

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'doctor',
    phone: '',
    address: '',
    country: '',
    currency: '',
    clinicName: '',
    clinicProfile: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // Update currency when country changes
  useEffect(() => {
    if (formData.country && countryCurrencyMap[formData.country]) {
      setFormData(prev => ({
        ...prev,
        currency: countryCurrencyMap[formData.country]
      }));
    }
  }, [formData.country]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone,
          address: formData.address,
          country: formData.country,
          currency: formData.currency,
          clinicName: formData.clinicName,
          clinicProfile: formData.clinicProfile
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/auth/signin?message=Registration successful');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const goBack = () => {
    setStep(step - 1);
  };

  const isStep1Valid = formData.firstName && formData.lastName && formData.email && formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length >= 8;

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Heart className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-bold">Join ClinicFlow</h1>
            </div>
            <p className="text-xl text-purple-100 mb-2">Create your healthcare account</p>
            <p className="text-purple-200">Start your journey with our comprehensive healthcare management platform</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-xl bg-white/20">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Step {step} of 2</h3>
                <p className="text-sm text-purple-200">
                  {step === 1 ? 'Basic account information' : 'Complete your profile'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-xl bg-white/20">
                <Building className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Role: {formData.role}</h3>
                <p className="text-sm text-purple-200">
                  {formData.role === 'doctor' ? 'Healthcare Provider' : 
                   formData.role === 'patient' ? 'Patient' : 'Administrator'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-xl bg-white/20">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Quick Setup</h3>
                <p className="text-sm text-purple-200">Get started in minutes with our streamlined onboarding</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ClinicFlow
              </h1>
            </div>
            <p className="text-gray-600">Healthcare Management System</p>
          </div>

          <Card className="w-full border-0 shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50"></div>
            <CardHeader className="relative pb-6 pt-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-4 shadow-lg">
                  <User className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Create Account</CardTitle>
                <CardDescription className="text-gray-600">
                  {step === 1 ? 'Step 1: Basic Information' : 'Step 2: Complete Profile'}
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="relative pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800 rounded-xl">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {step === 1 ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="firstName"
                            type="text"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            required
                            className="pl-10 border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 transition-all duration-200 h-12"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">Last Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="lastName"
                            type="text"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            required
                            className="pl-10 border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 transition-all duration-200 h-12"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          className="pl-10 border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 transition-all duration-200 h-12"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-sm font-semibold text-gray-700">Role</Label>
                      <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                        <SelectTrigger className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 transition-all duration-200 h-12">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="doctor">Doctor</SelectItem>
                          <SelectItem value="patient">Patient</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          required
                          className="pl-10 pr-10 border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 transition-all duration-200 h-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Password must be at least 8 characters long
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          required
                          className="pl-10 pr-10 border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 transition-all duration-200 h-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          required
                          className="pl-10 border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 transition-all duration-200 h-12"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-semibold text-gray-700">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Textarea
                          id="address"
                          placeholder="Enter your full address..."
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          required
                          className="pl-10 border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 transition-all duration-200 min-h-[80px]"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-sm font-semibold text-gray-700">Country</Label>
                        <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                          <SelectTrigger className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 transition-all duration-200 h-12">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(countryCurrencyMap).map(country => (
                              <SelectItem key={country} value={country}>{country}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="currency" className="text-sm font-semibold text-gray-700">Currency</Label>
                        <Input
                          id="currency"
                          type="text"
                          value={formData.currency}
                          readOnly
                          disabled
                          className="border-0 bg-white/80 rounded-xl shadow-sm h-12"
                        />
                      </div>
                    </div>
                    
                    {formData.role === 'doctor' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="clinicName" className="text-sm font-semibold text-gray-700">Clinic Name</Label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="clinicName"
                              type="text"
                              placeholder="Your Clinic Name"
                              value={formData.clinicName}
                              onChange={(e) => handleInputChange('clinicName', e.target.value)}
                              required={formData.role === 'doctor'}
                              className="pl-10 border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 transition-all duration-200 h-12"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="clinicProfile" className="text-sm font-semibold text-gray-700">Clinic Profile</Label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Textarea
                              id="clinicProfile"
                              placeholder="Describe your clinic, specialties, and services..."
                              value={formData.clinicProfile}
                              onChange={(e) => handleInputChange('clinicProfile', e.target.value)}
                              required={formData.role === 'doctor'}
                              className="pl-10 border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 transition-all duration-200 min-h-[100px]"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
                
                <div className="flex gap-4">
                  {step > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={goBack} 
                      className="flex-1 h-12 border-2 border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl transition-all duration-200"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" 
                    disabled={loading || (step === 1 && !isStep1Valid)}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>{step < 2 ? 'Next Step' : 'Create Account'}</span>
                        {step < 2 ? <ChevronRight className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                      </div>
                    )}
                  </Button>
                </div>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/auth/signin" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                    Sign in
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