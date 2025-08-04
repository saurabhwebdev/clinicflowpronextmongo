"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Plus, 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  Eye, 
  Trash2, 
  Search,
  Filter,
  UserPlus,
  Edit
} from "lucide-react";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  role: string;
  gender?: 'male' | 'female' | 'other';
}

interface ClinicSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  clinicName: string;
}

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditGenderDialogOpen, setIsEditGenderDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "" as 'male' | 'female' | 'other' | '',
  });

  useEffect(() => {
    fetchPatients();
    fetchClinicSettings();
  }, []);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched patients data:', data.patients);
        console.log('Sample patient dateOfBirth:', data.patients[0]?.dateOfBirth);
        setPatients(data.patients);
      } else {
        console.error('Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
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
        console.log('Fetched master admin clinic settings:', data.settings);
      } else {
        // Fallback to regular clinic settings
        const fallbackResponse = await fetch('/api/clinic-settings');
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          setClinicSettings(data.settings);
          console.log('Fetched fallback clinic settings:', data.settings);
        }
      }
    } catch (error) {
      console.error('Error fetching clinic settings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const patientData = { ...formData };
      
      if (patientData.dateOfBirth) {
        console.log("Submitting patient with date:", patientData.dateOfBirth);
      }
      
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create patient");
      }
      
      setIsAddDialogOpen(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
      });
      toast.success("Patient created successfully");
      fetchPatients();
    } catch (error: any) {
      toast.error(error.message || "Failed to create patient");
      console.error("Patient creation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this patient?")) return;
    
    try {
      const response = await fetch(`/api/patients/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Failed to delete patient");
      
      toast.success("Patient deleted successfully");
      fetchPatients();
    } catch (error) {
      toast.error("Failed to delete patient");
    }
  };

  const handleEditGender = async (patientId: string, gender: 'male' | 'female' | 'other') => {
    try {
      console.log('Updating gender for patient:', patientId, 'to:', gender);
      
      const response = await fetch(`/api/patients/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gender }),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || "Failed to update patient gender");
      }
      
      const updatedPatient = await response.json();
      console.log('Updated patient:', updatedPatient);
      
      toast.success("Patient gender updated successfully");
      setIsEditGenderDialogOpen(false);
      setEditingPatient(null);
      fetchPatients();
    } catch (error) {
      console.error('Error updating gender:', error);
      toast.error("Failed to update patient gender");
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    console.log('Calculating age for dateOfBirth:', dateOfBirth, 'Type:', typeof dateOfBirth);
    
    if (!dateOfBirth) {
      console.log('No dateOfBirth provided');
      return 'N/A';
    }
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    console.log('Birth date object:', birthDate);
    console.log('Birth date valid:', !isNaN(birthDate.getTime()));
    
    // Check if the date is valid
    if (isNaN(birthDate.getTime())) {
      console.log('Invalid date format');
      return 'N/A';
    }
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    console.log('Calculated age:', age);
    return age;
  };

  // Filter patients based on search and filter
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterRole === "all" || patient.role === filterRole;
    
    return matchesSearch && matchesFilter;
  });

  const primaryColor = clinicSettings?.primaryColor || '#3b82f6';
  const secondaryColor = clinicSettings?.secondaryColor || '#1e40af';
  const accentColor = clinicSettings?.accentColor || '#10b981';

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
              <Users className="h-8 w-8" style={{ color: primaryColor }} />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ 
                backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Patients
              </h1>
              <p className="text-gray-600 mt-1">Manage your patient records and information</p>
            </div>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <button 
                className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: primaryColor,
                  boxShadow: `0 4px 12px ${primaryColor}40`
                }}
              >
                <UserPlus className="h-4 w-4" />
                <span>Add Patient</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm rounded-3xl border border-white/20">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Add New Patient</DialogTitle>
                <DialogDescription>
                  Fill in the patient details below to create a new patient record
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6 py-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        required
                        className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                        style={{ 
                          '--tw-ring-color': primaryColor 
                        } as React.CSSProperties}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        required
                        className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                        style={{ 
                          '--tw-ring-color': primaryColor 
                        } as React.CSSProperties}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                      style={{ 
                        '--tw-ring-color': primaryColor 
                      } as React.CSSProperties}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                      style={{ 
                        '--tw-ring-color': primaryColor 
                      } as React.CSSProperties}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-700">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        setFormData({ ...formData, dateOfBirth: e.target.value })
                      }
                      required
                      className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                      style={{ 
                        '--tw-ring-color': primaryColor 
                      } as React.CSSProperties}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">Gender</Label>
                    <Select 
                      value={formData.gender} 
                      onValueChange={(value) => setFormData({ ...formData, gender: value as 'male' | 'female' | 'other' })}
                    >
                      <SelectTrigger className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105 disabled:opacity-50"
                    style={{ 
                      backgroundColor: primaryColor,
                      boxShadow: `0 4px 12px ${primaryColor}40`
                    }}
                  >
                    {isLoading ? "Creating..." : "Create Patient"}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
              backgroundColor: primaryColor + '15',
              boxShadow: `0 4px 12px ${primaryColor}30`
            }}>
              <Users className="h-5 w-5" style={{ color: primaryColor }} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Total Patients</p>
              <p className="text-2xl font-bold text-gray-800">{patients.length}</p>
            </div>
          </div>
          
          <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
              backgroundColor: secondaryColor + '15',
              boxShadow: `0 4px 12px ${secondaryColor}30`
            }}>
              <Mail className="h-5 w-5" style={{ color: secondaryColor }} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Active Records</p>
              <p className="text-2xl font-bold text-gray-800">{patients.filter(p => p.email).length}</p>
            </div>
          </div>
          
          <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
              backgroundColor: accentColor + '15',
              boxShadow: `0 4px 12px ${accentColor}30`
            }}>
              <Phone className="h-5 w-5" style={{ color: accentColor }} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">With Phone</p>
              <p className="text-2xl font-bold text-gray-800">{patients.filter(p => p.phone).length}</p>
            </div>
          </div>
          
          <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
              backgroundColor: '#f59e0b15',
              boxShadow: '0 4px 12px #f59e0b30'
            }}>
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">This Month</p>
              <p className="text-2xl font-bold text-gray-800">
                {patients.filter(p => {
                  const createdDate = new Date(p.dateOfBirth);
                  const now = new Date();
                  return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search patients by name or email..."
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
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-48 border-0 bg-white/80 rounded-xl shadow-sm">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-gray-800">Patient Records</h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing {filteredPatients.length} of {patients.length} patients
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-white/50 border-b border-white/20">
                <TableHead className="font-semibold text-gray-700">Name</TableHead>
                <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                <TableHead className="font-semibold text-gray-700">Age</TableHead>
                <TableHead className="font-semibold text-gray-700">Gender</TableHead>
                <TableHead className="font-semibold text-gray-700">Role</TableHead>
                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient._id} className="hover:bg-white/50 transition-all duration-200 border-b border-white/20">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ 
                        backgroundColor: primaryColor + '15'
                      }}>
                        <span className="text-sm font-semibold" style={{ color: primaryColor }}>
                          {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{patient.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{patient.email}</span>
                      </div>
                      {patient.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{patient.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {calculateAge(patient.dateOfBirth) === 'N/A' ? 'N/A' : `${calculateAge(patient.dateOfBirth)} years`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary" 
                        className="capitalize cursor-pointer hover:opacity-80 transition-all duration-200"
                        style={{ 
                          backgroundColor: patient.gender ? (patient.gender === 'male' ? '#3b82f6' : patient.gender === 'female' ? '#ec4899' : '#8b5cf6') + '15' : '#6b7280' + '15',
                          color: patient.gender ? (patient.gender === 'male' ? '#3b82f6' : patient.gender === 'female' ? '#ec4899' : '#8b5cf6') : '#6b7280'
                        }}
                        onClick={() => {
                          setEditingPatient(patient);
                          setIsEditGenderDialogOpen(true);
                        }}
                      >
                        {patient.gender || 'Not set'}
                      </Badge>
                      <button
                        onClick={() => {
                          setEditingPatient(patient);
                          setIsEditGenderDialogOpen(true);
                        }}
                        className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
                        title="Edit Gender"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className="capitalize"
                      style={{ 
                        backgroundColor: accentColor + '15',
                        color: accentColor
                      }}
                    >
                      {patient.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/dashboard/patients/${patient._id}`)}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(patient._id)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition-all duration-200 hover:scale-105"
                        title="Delete Patient"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredPatients.length === 0 && (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No patients found</h3>
            <p className="text-gray-500">
              {searchTerm || filterRole !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Get started by adding your first patient"
              }
            </p>
          </div>
        )}
      </div>

      {/* Edit Gender Modal */}
      <Dialog open={isEditGenderDialogOpen} onOpenChange={setIsEditGenderDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white/95 backdrop-blur-sm rounded-3xl border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Patient Gender</DialogTitle>
            <DialogDescription>
              Update the gender for {editingPatient?.firstName} {editingPatient?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Current Gender</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">
                    {editingPatient?.gender || 'Not set'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">New Gender</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleEditGender(editingPatient!._id, 'male')}
                    className="p-3 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-center"
                  >
                    <div className="text-blue-600 font-medium">Male</div>
                  </button>
                  <button
                    onClick={() => handleEditGender(editingPatient!._id, 'female')}
                    className="p-3 rounded-lg border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50 transition-all duration-200 text-center"
                  >
                    <div className="text-pink-600 font-medium">Female</div>
                  </button>
                  <button
                    onClick={() => handleEditGender(editingPatient!._id, 'other')}
                    className="p-3 rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 text-center"
                  >
                    <div className="text-purple-600 font-medium">Other</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}