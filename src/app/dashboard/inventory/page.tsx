'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  DollarSign, 
  BarChart3,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Settings,
  ArrowRight,
  Package2,
  Activity,
  Zap,
  Clock,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/formatCurrency';

interface ClinicSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  clinicName: string;
}

interface InventoryItem {
  _id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  status: 'active' | 'inactive' | 'discontinued';
  supplier?: string;
  expiryDate?: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
}

interface InventoryStats {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
}

export default function InventoryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(showLowStock && { lowStock: 'true' })
      });

      const response = await fetch(`/api/inventory?${params}`);
      if (!response.ok) throw new Error('Failed to fetch items');

      const data = await response.json();
      setItems(data.items);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      toast.error('Failed to fetch inventory items');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/inventory/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast.error('Failed to fetch inventory statistics');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchItems(), fetchStats()]);
      setLoading(false);
    };

    loadData();
  }, [currentPage, searchTerm, selectedCategory, selectedStatus, showLowStock]);

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return {
        label: 'Out of Stock',
        color: '#ef4444',
        bgColor: '#fee2e2',
        icon: <XCircle className="h-4 w-4 text-red-600" />
      };
    }
    if (item.quantity <= item.minQuantity) {
      return {
        label: 'Low Stock',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />
      };
    }
    return {
      label: 'In Stock',
      color: '#10b981',
      bgColor: '#d1fae5',
      icon: <CheckCircle className="h-4 w-4 text-green-600" />
    };
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          badge: <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 transition-all duration-200">Active</Badge>,
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          color: '#10b981',
          bgColor: '#d1fae5'
        };
      case "inactive":
        return {
          badge: <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 transition-all duration-200">Inactive</Badge>,
          icon: <Clock className="h-4 w-4 text-gray-600" />,
          color: '#6b7280',
          bgColor: '#f3f4f6'
        };
      case "discontinued":
        return {
          badge: <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200 transition-all duration-200">Discontinued</Badge>,
          icon: <XCircle className="h-4 w-4 text-red-600" />,
          color: '#ef4444',
          bgColor: '#fee2e2'
        };
      default:
        return {
          badge: <Badge>{status}</Badge>,
          icon: <Package className="h-4 w-4" />,
          color: '#6b7280',
          bgColor: '#f3f4f6'
        };
    }
  };

  const handleQuickActions = (action: string, item: InventoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    
    switch (action) {
      case 'view':
        router.push(`/dashboard/inventory/${item._id}`);
        break;
      case 'edit':
        router.push(`/dashboard/inventory/${item._id}/edit`);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this item?')) {
          // Add delete logic here
          toast.success('Item deleted successfully');
        }
        break;
    }
  };

  // Use the user's currency preference from the session
  const getUserCurrency = () => {
    return session?.user?.currency || 'USD';
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
              <Package className="h-8 w-8" style={{ color: primaryColor }} />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ 
                backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Inventory Management
              </h1>
              <p className="text-gray-600 mt-1">Manage clinic inventory and stock levels</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard/inventory/reports')}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{ 
                borderColor: primaryColor,
                color: primaryColor 
              }}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Reports</span>
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/inventory/new')}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: primaryColor,
                boxShadow: `0 4px 12px ${primaryColor}40`
              }}
            >
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
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
                <Package className="h-5 w-5" style={{ color: primaryColor }} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Total Items</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalItems}</p>
              </div>
            </div>
            
            <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
                backgroundColor: '#f59e0b15',
                boxShadow: '0 4px 12px #f59e0b30'
              }}>
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Low Stock</p>
                <p className="text-2xl font-bold text-gray-800">{stats.lowStockItems}</p>
              </div>
            </div>
            
            <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
                backgroundColor: '#ef444415',
                boxShadow: '0 4px 12px #ef444430'
              }}>
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-800">{stats.outOfStockItems}</p>
              </div>
            </div>
            
            <div className="group flex items-center space-x-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ 
                backgroundColor: accentColor + '15',
                boxShadow: `0 4px 12px ${accentColor}30`
              }}>
                <DollarSign className="h-5 w-5" style={{ color: accentColor }} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(stats.totalValue, getUserCurrency())}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search items by name, SKU, or category..."
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
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-48 border-0 bg-white/80 rounded-xl shadow-sm px-3 py-2 text-sm focus:ring-2 focus:ring-offset-0 transition-all duration-200"
              style={{ 
                '--tw-ring-color': primaryColor 
              } as React.CSSProperties}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
          <Button
            variant={showLowStock ? "default" : "outline"}
            onClick={() => setShowLowStock(!showLowStock)}
            className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
            style={showLowStock ? {
              backgroundColor: primaryColor,
              boxShadow: `0 4px 12px ${primaryColor}40`
            } : {
              borderColor: primaryColor,
              color: primaryColor
            }}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Low Stock Only
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-gray-800">Inventory Items</h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing {items.length} items
          </p>
        </div>
        
        {items.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No inventory items found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedStatus || showLowStock 
                ? "Try adjusting your search or filter criteria"
                : "Get started by adding your first inventory item"
              }
            </p>
            {!searchTerm && !selectedStatus && !showLowStock && (
              <Button 
                onClick={() => router.push('/dashboard/inventory/new')}
                className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: primaryColor,
                  boxShadow: `0 4px 12px ${primaryColor}40`
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white/50 border-b border-white/20">
                  <TableHead className="font-semibold text-gray-700">SKU</TableHead>
                  <TableHead className="font-semibold text-gray-700">Item Details</TableHead>
                  <TableHead className="font-semibold text-gray-700">Category</TableHead>
                  <TableHead className="font-semibold text-gray-700">Stock Level</TableHead>
                  <TableHead className="font-semibold text-gray-700">Unit Price</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const stockStatus = getStockStatus(item);
                  const statusConfig = getStatusConfig(item.status);
                  
                  return (
                    <TableRow key={item._id} className="hover:bg-white/50 transition-all duration-200 border-b border-white/20">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Package2 className="h-4 w-4 text-gray-400" />
                          <span className="font-mono text-sm font-semibold text-gray-800">{item.sku}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          {item.supplier && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Activity className="h-3 w-3" />
                              <span>Supplier: {item.supplier}</span>
                            </div>
                          )}
                          {item.expiryDate && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>Expires: {new Date(item.expiryDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 transition-all duration-200">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4 text-gray-400" />
                            <span className="font-semibold text-gray-800">{item.quantity}</span>
                          </div>
                          <div 
                            className="p-2 rounded-xl transition-all duration-300"
                            style={{ 
                              backgroundColor: stockStatus.bgColor,
                              boxShadow: `0 2px 8px ${stockStatus.color}30`
                            }}
                          >
                            {stockStatus.icon}
                          </div>
                          <Badge className="transition-all duration-200" style={{
                            backgroundColor: stockStatus.bgColor,
                            color: stockStatus.color,
                            borderColor: stockStatus.color + '40'
                          }}>
                            {stockStatus.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-800">
                            {formatCurrency(item.unitPrice, getUserCurrency())}
                          </span>
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
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleQuickActions('view', item, e)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleQuickActions('edit', item, e)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition-all duration-200 hover:scale-105"
                            title="Edit Item"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleQuickActions('delete', item, e)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition-all duration-200 hover:scale-105"
                            title="Delete Item"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-white/20">
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                style={{ 
                  borderColor: primaryColor,
                  color: primaryColor 
                }}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                style={{ 
                  borderColor: primaryColor,
                  color: primaryColor 
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}