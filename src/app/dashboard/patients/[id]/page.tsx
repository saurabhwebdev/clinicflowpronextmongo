"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { EHRTimeline } from "@/components/ui/ehr-timeline";
import { AppointmentList } from "@/components/ui/appointment-list";
import { PrescriptionList } from "@/components/ui/prescription-list";
import { use } from "react";
import type { Usable } from "react";
import { 
  Edit, 
  Save, 
  X, 
  Plus, 
  Calendar, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar as CalendarIcon,
  Heart,
  Pill,
  AlertTriangle,
  ArrowLeft,
  Stethoscope,
  Activity
} from "lucide-react";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  role: string;
  address?: string;
  country?: string;
}

interface ClinicSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  clinicName: string;
}

export default function PatientDetailPage({ params }: { params: Usable<{ id: string }> }) {
  // Unwrap params with React.use()
  const unwrappedParams = use(params);
  const patientId = unwrappedParams.id;
  
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState({
    address: false,
    medicalHistory: false
  });
  
  // Form state for editable fields
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  
  const [medicalHistoryForm, setMedicalHistoryForm] = useState({
    conditions: [] as string[],
    allergies: [] as string[],
    medications: [] as string[]
  });
  
  // New item inputs for medical history lists
  const [newItem, setNewItem] = useState({
    condition: '',
    allergy: '',
    medication: ''
  });

  useEffect(() => {
    fetchPatient();
    fetchClinicSettings();
  }, [patientId]);
  
  // Update form values when patient data is loaded
  useEffect(() => {
    if (patient) {
      setAddressForm({
        street: patient.address || '',
        city: '',
        state: '',
        zipCode: '',
        country: patient.country || ''
      });
      
      setMedicalHistoryForm({
        conditions: [],
        allergies: [],
        medications: []
      });
    }
  }, [patient]);

  const fetchPatient = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/patients/${patientId}`);
      if (!response.ok) throw new Error("Failed to fetch patient");
      const data = await response.json();
      console.log('Individual patient page - Fetched patient data:', data);
      console.log('Individual patient page - Patient dateOfBirth:', data.dateOfBirth);
      setPatient(data);
    } catch (error) {
      toast.error("Failed to fetch patient details");
      router.push("/dashboard/patients");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClinicSettings = async () => {
    try {
              // Fetch clinic settings (now properly handles patients by fetching master admin settings)
      const response = await fetch('/api/clinic-settings');
      if (response.ok) {
        const data = await response.json();
        setClinicSettings(data.settings);
        console.log('Fetched master admin clinic settings for patient detail:', data.settings);
      } else {
        // Fallback to regular clinic settings
        const fallbackResponse = await fetch('/api/clinic-settings');
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          setClinicSettings(data.settings);
          console.log('Fetched fallback clinic settings for patient detail:', data.settings);
        }
      }
    } catch (error) {
      console.error('Error fetching clinic settings:', error);
    }
  };
  
  // Handle address form input changes
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle adding new items to medical history lists
  const handleAddMedicalItem = (type: 'condition' | 'allergy' | 'medication') => {
    if (!newItem[type]) return;
    
    setMedicalHistoryForm(prev => {
      const listKey = `${type}s` as keyof typeof medicalHistoryForm;
      const currentList = Array.isArray(prev[listKey]) ? prev[listKey] : [];
      
      return {
        ...prev,
        [listKey]: [...currentList, newItem[type]]
      };
    });
    
    // Clear the input
    setNewItem(prev => ({
      ...prev,
      [type]: ''
    }));
  };
  
  // Handle removing items from medical history lists
  const handleRemoveMedicalItem = (type: 'conditions' | 'allergies' | 'medications', index: number) => {
    setMedicalHistoryForm(prev => {
      const currentList = Array.isArray(prev[type]) ? prev[type] : [];
      
      return {
        ...prev,
        [type]: currentList.filter((_, i) => i !== index)
      };
    });
  };
  
  // Save address changes
  const saveAddressChanges = async () => {
    if (!patient) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: addressForm
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update address');
      }
      
      const updatedPatient = await response.json();
      setPatient(updatedPatient);
      setEditMode(prev => ({ ...prev, address: false }));
      toast.success('Address updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update address');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Save medical history changes
  const saveMedicalHistoryChanges = async () => {
    if (!patient) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          medicalHistory: medicalHistoryForm
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update medical history');
      }
      
      const updatedPatient = await response.json();
      setPatient(updatedPatient);
      setEditMode(prev => ({ ...prev, medicalHistory: false }));
      toast.success('Medical history updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update medical history');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    console.log('Individual patient page - Calculating age for dateOfBirth:', dateOfBirth, 'Type:', typeof dateOfBirth);
    
    if (!dateOfBirth) {
      console.log('Individual patient page - No dateOfBirth provided');
      return 'N/A';
    }
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    console.log('Individual patient page - Birth date object:', birthDate);
    console.log('Individual patient page - Birth date valid:', !isNaN(birthDate.getTime()));
    
    // Check if the date is valid
    if (isNaN(birthDate.getTime())) {
      console.log('Individual patient page - Invalid date format');
      return 'N/A';
    }
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    console.log('Individual patient page - Calculated age:', age);
    return age;
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: clinicSettings?.primaryColor || '#3b82f6' }}></div>
          <span className="text-lg">Loading patient details...</span>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Patient not found</p>
            <Button 
              onClick={() => router.push("/dashboard/patients")}
              className="mt-4"
            >
              Back to Patients
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const primaryColor = clinicSettings?.primaryColor || '#3b82f6';
  const secondaryColor = clinicSettings?.secondaryColor || '#1e40af';
  const accentColor = clinicSettings?.accentColor || '#10b981';

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/patients")}
              className="hover:bg-white/80 transition-all duration-200 rounded-xl px-4 py-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patients
            </Button>
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            <h1 className="text-4xl font-bold" style={{ 
              backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {patient.firstName} {patient.lastName}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <div 
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={{ 
                backgroundColor: accentColor + '15', 
                color: accentColor,
                boxShadow: `0 2px 8px ${accentColor}20`
              }}
            >
              {patient.role}
            </div>
            <div className="px-4 py-2 rounded-full text-sm font-medium bg-white/80 backdrop-blur-sm border border-white/20 shadow-sm">
              Age: {calculateAge(patient.dateOfBirth) === 'N/A' ? 'N/A' : `${calculateAge(patient.dateOfBirth)} years`}
            </div>
          </div>
        </div>
        
        {/* Patient Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
              backgroundColor: primaryColor + '15',
              boxShadow: `0 4px 12px ${primaryColor}30`
            }}>
              <Mail className="h-5 w-5" style={{ color: primaryColor }} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Email</p>
              <p className="text-sm font-semibold text-gray-800">{patient.email}</p>
            </div>
          </div>
          
          <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
              backgroundColor: secondaryColor + '15',
              boxShadow: `0 4px 12px ${secondaryColor}30`
            }}>
              <Phone className="h-5 w-5" style={{ color: secondaryColor }} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Phone</p>
              <p className="text-sm font-semibold text-gray-800">{patient.phone}</p>
            </div>
          </div>
          
          <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
              backgroundColor: accentColor + '15',
              boxShadow: `0 4px 12px ${accentColor}30`
            }}>
              <CalendarIcon className="h-5 w-5" style={{ color: accentColor }} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Date of Birth</p>
              <p className="text-sm font-semibold text-gray-800">{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
              backgroundColor: '#f59e0b15',
              boxShadow: '0 4px 12px #f59e0b30'
            }}>
              <MapPin className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Location</p>
              <p className="text-sm font-semibold text-gray-800">{patient.country || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="details" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-1">
          <TabsTrigger 
            value="details" 
            className="flex items-center space-x-2 rounded-xl transition-all duration-200 data-[state=active]:shadow-md"
            style={{ 
              '--tw-ring-color': primaryColor,
              '--tw-ring-offset-color': primaryColor 
            } as React.CSSProperties}
          >
            <User className="h-4 w-4" />
            <span>Details</span>
          </TabsTrigger>
          <TabsTrigger 
            value="appointments" 
            className="flex items-center space-x-2 rounded-xl transition-all duration-200 data-[state=active]:shadow-md"
            style={{ 
              '--tw-ring-color': primaryColor,
              '--tw-ring-offset-color': primaryColor 
            } as React.CSSProperties}
          >
            <Calendar className="h-4 w-4" />
            <span>Appointments</span>
          </TabsTrigger>
          <TabsTrigger 
            value="ehr" 
            className="flex items-center space-x-2 rounded-xl transition-all duration-200 data-[state=active]:shadow-md"
            style={{ 
              '--tw-ring-color': primaryColor,
              '--tw-ring-offset-color': primaryColor 
            } as React.CSSProperties}
          >
            <Activity className="h-4 w-4" />
            <span>EHR</span>
          </TabsTrigger>
          <TabsTrigger 
            value="prescriptions" 
            className="flex items-center space-x-2 rounded-xl transition-all duration-200 data-[state=active]:shadow-md"
            style={{ 
              '--tw-ring-color': primaryColor,
              '--tw-ring-offset-color': primaryColor 
            } as React.CSSProperties}
          >
            <FileText className="h-4 w-4" />
            <span>Prescriptions</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-8 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-2xl" style={{ 
                  backgroundColor: primaryColor + '15',
                  boxShadow: `0 4px 12px ${primaryColor}30`
                }}>
                  <User className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
                  <p className="text-sm text-gray-500">Basic patient details and contact information</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</Label>
                    <p className="text-base font-semibold text-gray-800">{patient.firstName} {patient.lastName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</Label>
                    <p className="text-base font-semibold text-gray-800 capitalize">{patient.role}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</Label>
                    <p className="text-base font-semibold text-gray-800">{patient.email}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</Label>
                    <p className="text-base font-semibold text-gray-800">{patient.phone}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date of Birth</Label>
                    <p className="text-base font-semibold text-gray-800">{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Age</Label>
                    <p className="text-base font-semibold text-gray-800">{calculateAge(patient.dateOfBirth) === 'N/A' ? 'N/A' : `${calculateAge(patient.dateOfBirth)} years`}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Address Information Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-8 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl" style={{ 
                    backgroundColor: secondaryColor + '15',
                    boxShadow: `0 4px 12px ${secondaryColor}30`
                  }}>
                    <MapPin className="h-6 w-6" style={{ color: secondaryColor }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Address Information</h3>
                    <p className="text-sm text-gray-500">Patient's residential address</p>
                  </div>
                </div>
                {!editMode.address ? (
                  <button 
                    onClick={() => setEditMode(prev => ({ ...prev, address: true }))}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                    style={{ 
                      backgroundColor: secondaryColor + '15',
                      color: secondaryColor
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2 inline" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setEditMode(prev => ({ ...prev, address: false }))}
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200"
                    >
                      <X className="h-4 w-4 mr-2 inline" />
                      Cancel
                    </button>
                    <button 
                      onClick={saveAddressChanges}
                      disabled={isSaving}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105 disabled:opacity-50"
                      style={{ 
                        backgroundColor: secondaryColor,
                        boxShadow: `0 4px 12px ${secondaryColor}40`
                      }}
                    >
                      <Save className="h-4 w-4 mr-2 inline" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
              <div>
                {!editMode.address ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Street</Label>
                        <p className="text-base font-semibold text-gray-800">{patient.address || "N/A"}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Country</Label>
                        <p className="text-base font-semibold text-gray-800">{patient.country || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 p-6 rounded-2xl" style={{ 
                    backgroundColor: secondaryColor + '08',
                    border: `1px solid ${secondaryColor}20`
                  }}>
                    <div className="space-y-2">
                      <Label htmlFor="street" className="text-sm font-semibold text-gray-700">Street</Label>
                      <Input
                        id="street"
                        name="street"
                        value={addressForm.street}
                        onChange={handleAddressChange}
                        placeholder="Street address"
                        className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                        style={{ 
                          '--tw-ring-color': secondaryColor 
                        } as React.CSSProperties}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-semibold text-gray-700">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={addressForm.city}
                          onChange={handleAddressChange}
                          placeholder="City"
                          className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                          style={{ 
                            '--tw-ring-color': secondaryColor 
                          } as React.CSSProperties}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm font-semibold text-gray-700">State/Province</Label>
                        <Input
                          id="state"
                          name="state"
                          value={addressForm.state}
                          onChange={handleAddressChange}
                          placeholder="State or province"
                          className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                          style={{ 
                            '--tw-ring-color': secondaryColor 
                          } as React.CSSProperties}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zipCode" className="text-sm font-semibold text-gray-700">Zip/Postal Code</Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={addressForm.zipCode}
                          onChange={handleAddressChange}
                          placeholder="Zip or postal code"
                          className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                          style={{ 
                            '--tw-ring-color': secondaryColor 
                          } as React.CSSProperties}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-sm font-semibold text-gray-700">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          value={addressForm.country}
                          onChange={handleAddressChange}
                          placeholder="Country"
                          className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                          style={{ 
                            '--tw-ring-color': secondaryColor 
                          } as React.CSSProperties}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Medical History Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-8 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl" style={{ 
                  backgroundColor: accentColor + '15',
                  boxShadow: `0 4px 12px ${accentColor}30`
                }}>
                  <Stethoscope className="h-6 w-6" style={{ color: accentColor }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Medical History</h3>
                  <p className="text-sm text-gray-500">Patient's medical conditions, allergies, and medications</p>
                </div>
              </div>
              {!editMode.medicalHistory ? (
                <button 
                  onClick={() => setEditMode(prev => ({ ...prev, medicalHistory: true }))}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                  style={{ 
                    backgroundColor: accentColor + '15',
                    color: accentColor
                  }}
                >
                  <Edit className="h-4 w-4 mr-2 inline" />
                  Edit
                </button>
              ) : (
                <div className="flex gap-3">
                  <button 
                    onClick={() => setEditMode(prev => ({ ...prev, medicalHistory: false }))}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200"
                  >
                    <X className="h-4 w-4 mr-2 inline" />
                    Cancel
                  </button>
                  <button 
                    onClick={saveMedicalHistoryChanges}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105 disabled:opacity-50"
                    style={{ 
                      backgroundColor: accentColor,
                      boxShadow: `0 4px 12px ${accentColor}40`
                    }}
                  >
                    <Save className="h-4 w-4 mr-2 inline" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Conditions */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl" style={{ 
                    backgroundColor: '#ef444415',
                    boxShadow: '0 4px 12px #ef444430'
                  }}>
                    <Heart className="h-5 w-5 text-red-500" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Medical Conditions</h4>
                </div>
                {!editMode.medicalHistory ? (
                  <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4">No conditions recorded</div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Input
                        placeholder="Add a condition"
                        value={newItem.condition}
                        onChange={(e) => setNewItem(prev => ({ ...prev, condition: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddMedicalItem('condition')}
                        className="flex-1 border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                        style={{ 
                          '--tw-ring-color': '#ef4444'
                        } as React.CSSProperties}
                      />
                      <button 
                        onClick={() => handleAddMedicalItem('condition')}
                        className="p-2 rounded-xl text-white transition-all duration-200 hover:scale-110"
                        style={{ 
                          backgroundColor: '#ef4444',
                          boxShadow: '0 4px 12px #ef444440'
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {medicalHistoryForm.conditions.length > 0 ? (
                      <div className="space-y-3">
                        {medicalHistoryForm.conditions.map((condition, index) => (
                          <div key={index} className="flex items-center justify-between py-3 px-4 bg-red-50 rounded-xl border border-red-100 hover:bg-red-100/50 transition-all duration-200">
                            <span className="text-sm font-medium text-red-800">{condition}</span>
                            <button 
                              onClick={() => handleRemoveMedicalItem('conditions', index)}
                              className="p-1 rounded-lg hover:bg-red-200 transition-all duration-200"
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4">No conditions added</p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Allergies */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl" style={{ 
                    backgroundColor: '#f59e0b15',
                    boxShadow: '0 4px 12px #f59e0b30'
                  }}>
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Allergies</h4>
                </div>
                {!editMode.medicalHistory ? (
                  <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4">No allergies recorded</div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Input
                        placeholder="Add an allergy"
                        value={newItem.allergy}
                        onChange={(e) => setNewItem(prev => ({ ...prev, allergy: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddMedicalItem('allergy')}
                        className="flex-1 border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                        style={{ 
                          '--tw-ring-color': '#f59e0b'
                        } as React.CSSProperties}
                      />
                      <button 
                        onClick={() => handleAddMedicalItem('allergy')}
                        className="p-2 rounded-xl text-white transition-all duration-200 hover:scale-110"
                        style={{ 
                          backgroundColor: '#f59e0b',
                          boxShadow: '0 4px 12px #f59e0b40'
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {medicalHistoryForm.allergies.length > 0 ? (
                      <div className="space-y-3">
                        {medicalHistoryForm.allergies.map((allergy, index) => (
                          <div key={index} className="flex items-center justify-between py-3 px-4 bg-amber-50 rounded-xl border border-amber-100 hover:bg-amber-100/50 transition-all duration-200">
                            <span className="text-sm font-medium text-amber-800">{allergy}</span>
                            <button 
                              onClick={() => handleRemoveMedicalItem('allergies', index)}
                              className="p-1 rounded-lg hover:bg-amber-200 transition-all duration-200"
                            >
                              <X className="h-4 w-4 text-amber-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4">No allergies added</p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Medications */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl" style={{ 
                    backgroundColor: '#8b5cf615',
                    boxShadow: '0 4px 12px #8b5cf630'
                  }}>
                    <Pill className="h-5 w-5 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Medications</h4>
                </div>
                {!editMode.medicalHistory ? (
                  <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4">No medications recorded</div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Input
                        placeholder="Add a medication"
                        value={newItem.medication}
                        onChange={(e) => setNewItem(prev => ({ ...prev, medication: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddMedicalItem('medication')}
                        className="flex-1 border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                        style={{ 
                          '--tw-ring-color': '#8b5cf6'
                        } as React.CSSProperties}
                      />
                      <button 
                        onClick={() => handleAddMedicalItem('medication')}
                        className="p-2 rounded-xl text-white transition-all duration-200 hover:scale-110"
                        style={{ 
                          backgroundColor: '#8b5cf6',
                          boxShadow: '0 4px 12px #8b5cf640'
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {medicalHistoryForm.medications.length > 0 ? (
                      <div className="space-y-3">
                        {medicalHistoryForm.medications.map((medication, index) => (
                          <div key={index} className="flex items-center justify-between py-3 px-4 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100/50 transition-all duration-200">
                            <span className="text-sm font-medium text-purple-800">{medication}</span>
                            <button 
                              onClick={() => handleRemoveMedicalItem('medications', index)}
                              className="p-1 rounded-lg hover:bg-purple-200 transition-all duration-200"
                            >
                              <X className="h-4 w-4 text-purple-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4">No medications added</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="appointments">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-8 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-2xl" style={{ 
                backgroundColor: primaryColor + '15',
                boxShadow: `0 4px 12px ${primaryColor}30`
              }}>
                <Calendar className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Appointments</h3>
                <p className="text-sm text-gray-500">View and manage patient appointments</p>
              </div>
            </div>
            <div className="flex justify-end mb-6">
              <button 
                onClick={() => router.push(`/dashboard/appointments/new?patientId=${patientId}`)}
                className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: primaryColor,
                  boxShadow: `0 4px 12px ${primaryColor}40`
                }}
              >
                Schedule New Appointment
              </button>
            </div>
            
            <div className="rounded-2xl border border-white/20 bg-white/50 backdrop-blur-sm overflow-hidden">
              <AppointmentList patientId={patientId} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="ehr">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-8 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-2xl" style={{ 
                backgroundColor: secondaryColor + '15',
                boxShadow: `0 4px 12px ${secondaryColor}30`
              }}>
                <Activity className="h-6 w-6" style={{ color: secondaryColor }} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Electronic Health Records</h3>
                <p className="text-sm text-gray-500">View and manage patient health records</p>
              </div>
            </div>
            <div className="flex justify-end mb-6 space-x-4">
              <button 
                onClick={() => router.push(`/dashboard/patients/${patientId}/ehr`)}
                className="px-6 py-3 rounded-xl text-sm font-medium bg-white/80 text-gray-700 hover:bg-white transition-all duration-200 border border-white/20"
              >
                View All Records
              </button>
              <button 
                onClick={() => router.push(`/dashboard/patients/${patientId}/ehr/new`)}
                className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: secondaryColor,
                  boxShadow: `0 4px 12px ${secondaryColor}40`
                }}
              >
                Add New EHR Record
              </button>
            </div>
            
            <div className="rounded-2xl border border-white/20 bg-white/50 backdrop-blur-sm overflow-hidden">
              <EHRTimeline patientId={patientId} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="prescriptions">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-8 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-2xl" style={{ 
                backgroundColor: accentColor + '15',
                boxShadow: `0 4px 12px ${accentColor}30`
              }}>
                <FileText className="h-6 w-6" style={{ color: accentColor }} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Prescriptions</h3>
                <p className="text-sm text-gray-500">View and manage patient prescriptions</p>
              </div>
            </div>
            <div className="flex justify-end mb-6">
              <button 
                onClick={() => router.push(`/dashboard/patients/${patientId}/prescriptions/new`)}
                className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: accentColor,
                  boxShadow: `0 4px 12px ${accentColor}40`
                }}
              >
                Create New Prescription
              </button>
            </div>
            
            <div className="rounded-2xl border border-white/20 bg-white/50 backdrop-blur-sm overflow-hidden">
              <PrescriptionList patientId={patientId} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}