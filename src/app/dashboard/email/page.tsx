"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Mail, 
  Send, 
  Users, 
  Search,
  Filter,
  Plus,
  Eye,
  File,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Settings,
  MessageSquare,
  FileText,
  Zap,
  Activity,
  Calendar,
  User,
  MoreHorizontal,
  Download,
  RefreshCw,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

interface ClinicSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  clinicName: string;
}

interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  content: string;
  type: 'appointment_reminder' | 'follow_up' | 'general' | 'billing';
  createdAt: string;
  updatedAt: string;
}

interface EmailLog {
  _id: string;
  to: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt: string;
  template?: string;
}

interface EmailStats {
  totalSent: number;
  totalFailed: number;
  totalPending: number;
  successRate: number;
}

export default function EmailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'compose' | 'templates' | 'logs'>('compose');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>({
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    clinicName: 'Clinic'
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
              textColor: data.settings.textColor || '#1f2937',
              clinicName: data.settings.clinicName || 'Clinic'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching clinic settings:', error);
      }
    };

    fetchClinicSettings();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTemplates(), fetchEmailLogs(), fetchStats()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/email/templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to fetch email templates");
    }
  };

  const fetchEmailLogs = async () => {
    try {
      const response = await fetch("/api/email/logs");
      if (response.ok) {
        const data = await response.json();
        setEmailLogs(data);
      }
    } catch (error) {
      console.error("Error fetching email logs:", error);
      toast.error("Failed to fetch email logs");
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/email/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching email stats:", error);
    }
  };

  const filteredLogs = emailLogs.filter(log => {
    const matchesSearch = log.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'sent':
        return {
          badge: <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 transition-all duration-200">Sent</Badge>,
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          color: '#10b981',
          bgColor: '#d1fae5'
        };
      case 'failed':
        return {
          badge: <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200 transition-all duration-200">Failed</Badge>,
          icon: <XCircle className="h-4 w-4 text-red-600" />,
          color: '#ef4444',
          bgColor: '#fee2e2'
        };
      case 'pending':
        return {
          badge: <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 transition-all duration-200">Pending</Badge>,
          icon: <Clock className="h-4 w-4 text-yellow-600" />,
          color: '#f59e0b',
          bgColor: '#fef3c7'
        };
      default:
        return {
          badge: <Badge>{status}</Badge>,
          icon: <Mail className="h-4 w-4" />,
          color: '#6b7280',
          bgColor: '#f3f4f6'
        };
    }
  };

  const getTemplateTypeConfig = (type: string) => {
    switch (type) {
      case 'appointment_reminder':
        return {
          badge: <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 transition-all duration-200">Appointment Reminder</Badge>,
          icon: <Calendar className="h-4 w-4 text-blue-600" />,
          color: '#3b82f6',
          bgColor: '#dbeafe'
        };
      case 'follow_up':
        return {
          badge: <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 transition-all duration-200">Follow Up</Badge>,
          icon: <User className="h-4 w-4 text-purple-600" />,
          color: '#8b5cf6',
          bgColor: '#ede9fe'
        };
      case 'billing':
        return {
          badge: <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200 transition-all duration-200">Billing</Badge>,
          icon: <FileText className="h-4 w-4 text-orange-600" />,
          color: '#f97316',
          bgColor: '#fed7aa'
        };
      case 'general':
        return {
          badge: <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 transition-all duration-200">General</Badge>,
          icon: <MessageSquare className="h-4 w-4 text-gray-600" />,
          color: '#6b7280',
          bgColor: '#f3f4f6'
        };
      default:
        return {
          badge: <Badge>{type.replace('_', ' ')}</Badge>,
          icon: <Mail className="h-4 w-4" />,
          color: '#6b7280',
          bgColor: '#f3f4f6'
        };
    }
  };

  const handleQuickActions = (action: string, item: EmailTemplate | EmailLog, e: React.MouseEvent) => {
    e.stopPropagation();
    
    switch (action) {
      case 'view':
        if ('template' in item) {
          // Email log
          router.push(`/dashboard/email/logs/${item._id}`);
        } else {
          // Email template
          router.push(`/dashboard/email/templates/${item._id}`);
        }
        break;
      case 'edit':
        if (!('template' in item)) {
          router.push(`/dashboard/email/templates/${item._id}/edit`);
        }
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this item?')) {
          // Add delete logic here
          toast.success('Item deleted successfully');
        }
        break;
    }
  };

  const primaryColor = clinicSettings.primaryColor;
  const secondaryColor = clinicSettings.secondaryColor;
  const accentColor = clinicSettings.accentColor;

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
              <Mail className="h-8 w-8" style={{ color: primaryColor }} />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ 
                backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Email Management
              </h1>
              <p className="text-gray-600 mt-1">Send emails to patients and manage communication</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard/email/logs')}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{ 
                borderColor: primaryColor,
                color: primaryColor 
              }}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/email/compose')}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: primaryColor,
                boxShadow: `0 4px 12px ${primaryColor}40`
              }}
            >
              <Send className="h-4 w-4" />
              <span>Send Email</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
                backgroundColor: primaryColor + '15',
                boxShadow: `0 4px 12px ${primaryColor}30`
              }}>
                <Send className="h-5 w-5" style={{ color: primaryColor }} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Total Sent</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalSent}</p>
              </div>
            </div>
            
            <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
                backgroundColor: accentColor + '15',
                boxShadow: `0 4px 12px ${accentColor}30`
              }}>
                <CheckCircle className="h-5 w-5" style={{ color: accentColor }} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-gray-800">{stats.successRate}%</p>
              </div>
            </div>
            
            <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
                backgroundColor: '#f59e0b15',
                boxShadow: '0 4px 12px #f59e0b30'
              }}>
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalPending}</p>
              </div>
            </div>
            
            <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
                backgroundColor: '#ef444415',
                boxShadow: '0 4px 12px #ef444430'
              }}>
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Failed</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalFailed}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-white/80 backdrop-blur-sm p-1 rounded-xl w-fit shadow-sm border border-white/20">
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === 'compose'
                ? 'text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
            style={activeTab === 'compose' ? {
              backgroundColor: primaryColor,
              boxShadow: `0 4px 12px ${primaryColor}40`
            } : {}}
          >
            <Send className="w-4 h-4" />
            <span>Compose</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === 'templates'
                ? 'text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
            style={activeTab === 'templates' ? {
              backgroundColor: primaryColor,
              boxShadow: `0 4px 12px ${primaryColor}40`
            } : {}}
          >
            <File className="w-4 h-4" />
            <span>Templates</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === 'logs'
                ? 'text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
            style={activeTab === 'logs' ? {
              backgroundColor: primaryColor,
              boxShadow: `0 4px 12px ${primaryColor}40`
            } : {}}
          >
            <Eye className="w-4 h-4" />
            <span>Email Logs</span>
          </button>
        </div>
      </div>

      {/* Compose Tab */}
      {activeTab === 'compose' && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-bold text-gray-800">Compose Email</h2>
            <p className="text-sm text-gray-500 mt-1">Send emails to patients individually or in bulk</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <Send className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Individual Email</h3>
                    <p className="text-sm text-gray-600">Send personalized emails to specific patients</p>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push('/dashboard/email/compose')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Compose Email
                </Button>
              </div>

              <div className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 rounded-xl bg-purple-500/20">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Bulk Email</h3>
                    <p className="text-sm text-gray-600">Send emails to multiple patients at once</p>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/dashboard/email/bulk')}
                  className="w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-200"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Bulk Email
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Email Templates</h2>
                <p className="text-sm text-gray-500 mt-1">Manage reusable email templates</p>
              </div>
              <Button 
                onClick={() => router.push('/dashboard/email/templates/new')}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: primaryColor,
                  boxShadow: `0 4px 12px ${primaryColor}40`
                }}
              >
                <Plus className="h-4 w-4" />
                <span>New Template</span>
              </Button>
            </div>
          </div>
          
          {templates.length === 0 ? (
            <div className="p-12 text-center">
              <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No email templates found</h3>
              <p className="text-gray-500 mb-6">Create your first email template to get started</p>
              <Button 
                onClick={() => router.push('/dashboard/email/templates/new')}
                className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: primaryColor,
                  boxShadow: `0 4px 12px ${primaryColor}40`
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/50 border-b border-white/20">
                    <TableHead className="font-semibold text-gray-700">Template Name</TableHead>
                    <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                    <TableHead className="font-semibold text-gray-700">Type</TableHead>
                    <TableHead className="font-semibold text-gray-700">Created</TableHead>
                    <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => {
                    const typeConfig = getTemplateTypeConfig(template.type);
                    
                    return (
                      <TableRow key={template._id} className="hover:bg-white/50 transition-all duration-200 border-b border-white/20">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ 
                              backgroundColor: primaryColor + '15'
                            }}>
                              <File className="h-5 w-5" style={{ color: primaryColor }} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{template.name}</p>
                              <p className="text-xs text-gray-500">Template ID: {template._id.slice(-8)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-gray-800">{template.subject}</p>
                            <p className="text-xs text-gray-500">
                              {template.content.length > 50 ? template.content.substring(0, 50) + '...' : template.content}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="p-2 rounded-xl transition-all duration-300"
                              style={{ 
                                backgroundColor: typeConfig.bgColor,
                                boxShadow: `0 2px 8px ${typeConfig.color}30`
                              }}
                            >
                              {typeConfig.icon}
                            </div>
                            {typeConfig.badge}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {new Date(template.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => handleQuickActions('view', template, e)}
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                              title="View Template"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => handleQuickActions('edit', template, e)}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition-all duration-200 hover:scale-105"
                              title="Edit Template"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => handleQuickActions('delete', template, e)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition-all duration-200 hover:scale-105"
                              title="Delete Template"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Email Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Email Logs</h2>
                <p className="text-sm text-gray-500 mt-1">View the history of sent emails</p>
              </div>
              <Button 
                variant="outline"
                onClick={fetchEmailLogs}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                style={{ 
                  borderColor: primaryColor,
                  color: primaryColor 
                }}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-white/20">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by recipient or subject..."
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
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-48 border-0 bg-white/80 rounded-xl shadow-sm px-3 py-2 text-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                  style={{ 
                    '--tw-ring-color': primaryColor 
                  } as React.CSSProperties}
                >
                  <option value="all">All Status</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No email logs found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "No emails have been sent yet"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/50 border-b border-white/20">
                    <TableHead className="font-semibold text-gray-700">Recipient</TableHead>
                    <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Sent At</TableHead>
                    <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const statusConfig = getStatusConfig(log.status);
                    
                    return (
                      <TableRow key={log._id} className="hover:bg-white/50 transition-all duration-200 border-b border-white/20">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ 
                              backgroundColor: primaryColor + '15'
                            }}>
                              <User className="h-5 w-5" style={{ color: primaryColor }} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{log.to}</p>
                              <p className="text-xs text-gray-500">Email sent</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-gray-800">{log.subject}</p>
                            {log.template && (
                              <p className="text-xs text-gray-500">Template: {log.template}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="p-2 rounded-xl transition-all duration-300"
                              style={{ 
                                backgroundColor: statusConfig.bgColor,
                                boxShadow: `0 2px 8px ${statusConfig.color}30`
                              }}
                            >
                              {statusConfig.icon}
                            </div>
                            {statusConfig.badge}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {new Date(log.sentAt).toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => handleQuickActions('view', log, e)}
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="p-2 rounded-lg text-green-600 hover:bg-green-100 transition-all duration-200 hover:scale-105"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}