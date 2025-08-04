"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/hooks/use-currency";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
    Plus, 
    Trash2, 
    ArrowLeft, 
    Save, 
    Receipt, 
    Calculator, 
    Calendar,
    User,
    Stethoscope,
    FileText,
    DollarSign,
    Percent,
    AlertCircle
} from "lucide-react";

interface Patient {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface Doctor {
    _id: string;
    firstName: string;
    lastName: string;
}

interface Appointment {
    _id: string;
    dateTime: string;
    patientId?: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    doctorId?: {
        _id: string;
        firstName: string;
        lastName: string;
    };
}

interface BillItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface ClinicSettings {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
}

export default function NewBillPage() {
    const router = useRouter();
    const { format: formatCurrency } = useCurrency();
    const [isLoading, setIsLoading] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [clinicSettings, setClinicSettings] = useState<ClinicSettings>({
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        accentColor: '#10b981',
        backgroundColor: '#ffffff',
        textColor: '#1f2937'
    });

    const [selectedPatient, setSelectedPatient] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [selectedAppointment, setSelectedAppointment] = useState("");
    const [items, setItems] = useState<BillItem[]>([
        { description: "", quantity: 1, unitPrice: 0, total: 0 }
    ]);
    const [tax, setTax] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [dueDate, setDueDate] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        fetchPatients();
        fetchDoctors();
        fetchAppointments();
        fetchClinicSettings();

        // Set default due date to 30 days from now
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 30);
        setDueDate(defaultDueDate.toISOString().split('T')[0]);

        // Pre-populate from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const appointmentId = urlParams.get('appointmentId');
        const patientId = urlParams.get('patientId');
        const doctorId = urlParams.get('doctorId');

        if (appointmentId) setSelectedAppointment(appointmentId);
        if (patientId) setSelectedPatient(patientId);
        if (doctorId) setSelectedDoctor(doctorId);
    }, []);

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

    const fetchPatients = async () => {
        try {
            const response = await fetch("/api/admin/users?role=patient");
            if (response.ok) {
                const data = await response.json();
                setPatients(data.users || []);
            }
        } catch (error) {
            console.error("Error fetching patients:", error);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await fetch("/api/doctors");
            if (response.ok) {
                const data = await response.json();
                setDoctors(data.doctors || []);
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await fetch("/api/appointments");
            if (response.ok) {
                const data = await response.json();
                setAppointments(data.appointments || []);
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
        }
    };

    const addItem = () => {
        setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: keyof BillItem, value: string | number) => {
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };

        // Recalculate total for this item
        if (field === 'quantity' || field === 'unitPrice') {
            updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
        }

        setItems(updatedItems);
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + item.total, 0);
    };

    const calculateTax = () => {
        return (calculateSubtotal() * tax) / 100;
    };

    const calculateDiscount = () => {
        return (calculateSubtotal() * discount) / 100;
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax() - calculateDiscount();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPatient || !selectedDoctor || !selectedAppointment) {
            toast.error("Please select patient, doctor, and appointment");
            return;
        }

        if (items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
            toast.error("Please fill in all item details");
            return;
        }

        setIsLoading(true);
        try {
            console.log('Submitting bill data:', {
                patientId: selectedPatient,
                doctorId: selectedDoctor,
                appointmentId: selectedAppointment,
                items,
                tax,
                discount,
                dueDate,
                notes,
            });

            const response = await fetch("/api/billing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId: selectedPatient,
                    doctorId: selectedDoctor,
                    appointmentId: selectedAppointment,
                    items,
                    tax,
                    discount,
                    dueDate,
                    notes,
                }),
            });

            console.log('Response status:', response.status);
            const responseData = await response.json();
            console.log('Response data:', responseData);

            if (!response.ok) {
                throw new Error(responseData.details || responseData.error || "Failed to create bill");
            }

            toast.success("Bill created successfully");
            router.push(`/dashboard/billing/${responseData._id}`);
        } catch (error) {
            console.error("Error creating bill:", error);
            toast.error(error instanceof Error ? error.message : "Failed to create bill");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-8 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                className="hover:bg-white/80 transition-all duration-200 rounded-xl px-4 py-2"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                            <div className="flex items-center space-x-3">
                                <div className="p-3 rounded-2xl" style={{ 
                                    backgroundColor: clinicSettings.primaryColor + '15',
                                    boxShadow: `0 4px 12px ${clinicSettings.primaryColor}30`
                                }}>
                                    <Receipt className="h-6 w-6" style={{ color: clinicSettings.primaryColor }} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">Create New Bill</h1>
                                    <p className="text-sm text-gray-500">Generate a new invoice for patient services</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Bill Details */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 rounded-xl" style={{ 
                                        backgroundColor: clinicSettings.secondaryColor + '15',
                                        boxShadow: `0 4px 12px ${clinicSettings.secondaryColor}30`
                                    }}>
                                        <User className="h-5 w-5" style={{ color: clinicSettings.secondaryColor }} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">Bill Details</h3>
                                        <p className="text-sm text-gray-500">Enter the basic information for this bill</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="patient" className="text-sm font-semibold text-gray-700">
                                                Patient *
                                            </Label>
                                            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                                                <SelectTrigger className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200">
                                                    <SelectValue placeholder="Select patient" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-0 shadow-lg">
                                                    {patients.map((patient) => (
                                                        <SelectItem key={patient._id} value={patient._id}>
                                                            {patient.firstName} {patient.lastName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="doctor" className="text-sm font-semibold text-gray-700">
                                                Doctor *
                                            </Label>
                                            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                                                <SelectTrigger className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200">
                                                    <SelectValue placeholder="Select doctor" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-0 shadow-lg">
                                                    {doctors.map((doctor) => (
                                                        <SelectItem key={doctor._id} value={doctor._id}>
                                                            {doctor.firstName} {doctor.lastName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="appointment" className="text-sm font-semibold text-gray-700">
                                            Appointment *
                                        </Label>
                                        <Select value={selectedAppointment} onValueChange={setSelectedAppointment}>
                                            <SelectTrigger className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200">
                                                <SelectValue placeholder="Select appointment" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-0 shadow-lg">
                                                {appointments.map((appointment) => (
                                                    <SelectItem key={appointment._id} value={appointment._id}>
                                                        {appointment.patientId?.firstName || 'Unknown'} {appointment.patientId?.lastName || 'Patient'} - {" "}
                                                        {new Date(appointment.dateTime).toLocaleDateString()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="dueDate" className="text-sm font-semibold text-gray-700">
                                                Due Date
                                            </Label>
                                            <Input
                                                id="dueDate"
                                                type="date"
                                                value={dueDate}
                                                onChange={(e) => setDueDate(e.target.value)}
                                                className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                                            Notes
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Additional notes or comments..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200 resize-none"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bill Items */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 rounded-xl" style={{ 
                                            backgroundColor: clinicSettings.accentColor + '15',
                                            boxShadow: `0 4px 12px ${clinicSettings.accentColor}30`
                                        }}>
                                            <Calculator className="h-5 w-5" style={{ color: clinicSettings.accentColor }} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">Bill Items</h3>
                                            <p className="text-sm text-gray-500">Add services, procedures, or products</p>
                                        </div>
                                    </div>
                                    <Button 
                                        type="button" 
                                        onClick={addItem} 
                                        variant="outline"
                                        className="transition-all duration-200 hover:scale-105"
                                        style={{ 
                                            borderColor: clinicSettings.accentColor,
                                            color: clinicSettings.accentColor
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Item
                                    </Button>
                                </div>
                                
                                <div className="space-y-4">
                                    {items.map((item, index) => (
                                        <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:shadow-md transition-all duration-200">
                                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                                <div className="md:col-span-2 space-y-2">
                                                    <Label className="text-sm font-semibold text-gray-700">Description *</Label>
                                                    <Input
                                                        placeholder="Service or item description"
                                                        value={item.description}
                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                        className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-gray-700">Quantity *</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                                        className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-gray-700">Unit Price *</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                                                        className="border-0 bg-white/80 rounded-xl shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold text-gray-700">Total</Label>
                                                    <Input
                                                        value={formatCurrency(item.total)}
                                                        disabled
                                                        className="bg-gray-50/80 border-0 rounded-xl shadow-sm"
                                                    />
                                                </div>

                                                <div className="flex items-end">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeItem(index)}
                                                        disabled={items.length === 1}
                                                        className="hover:bg-red-50 transition-all duration-200"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Bill Summary */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 rounded-xl" style={{ 
                                        backgroundColor: '#f59e0b15',
                                        boxShadow: '0 4px 12px #f59e0b30'
                                    }}>
                                        <DollarSign className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">Bill Summary</h3>
                                        <p className="text-sm text-gray-500">Financial breakdown</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gray-50/50 rounded-xl">
                                        <span className="text-sm font-medium text-gray-700">Subtotal:</span>
                                        <span className="font-semibold text-gray-900">{formatCurrency(calculateSubtotal())}</span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Tax (%):</span>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    type="number"
                                                    value={tax}
                                                    onChange={(e) => setTax(Number(e.target.value))}
                                                    className="w-20 text-right border-0 bg-white/80 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                />
                                                <Percent className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center p-3 bg-blue-50/50 rounded-xl">
                                            <span className="text-sm font-medium text-blue-700">Tax Amount:</span>
                                            <span className="font-semibold text-blue-900">{formatCurrency(calculateTax())}</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Discount (%):</span>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    type="number"
                                                    value={discount}
                                                    onChange={(e) => setDiscount(Number(e.target.value))}
                                                    className="w-20 text-right border-0 bg-white/80 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                />
                                                <Percent className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center p-3 bg-green-50/50 rounded-xl">
                                            <span className="text-sm font-medium text-green-700">Discount Amount:</span>
                                            <span className="font-semibold text-green-900">-{formatCurrency(calculateDiscount())}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                                            <span className="text-lg font-bold text-gray-900">Total:</span>
                                            <span className="text-xl font-bold" style={{ color: clinicSettings.primaryColor }}>
                                                {formatCurrency(calculateTotal())}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 rounded-xl" style={{ 
                                        backgroundColor: '#10b98115',
                                        boxShadow: '0 4px 12px #10b98130'
                                    }}>
                                        <Save className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
                                        <p className="text-sm text-gray-500">Save or cancel</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        className="w-full justify-start transition-all duration-200 hover:scale-105"
                                        style={{ 
                                            borderColor: '#10b981',
                                            color: '#10b981'
                                        }}
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                    
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full justify-start transition-all duration-200 hover:scale-105"
                                        style={{ 
                                            backgroundColor: clinicSettings.primaryColor,
                                            boxShadow: `0 4px 12px ${clinicSettings.primaryColor}40`
                                        }}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Create Bill
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}