'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/formatCurrency';

interface CategoryStat {
  _id: string;
  count: number;
  totalQuantity: number;
  totalValue: number;
}

interface InventoryStats {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  categoryStats: CategoryStat[];
}

export default function InventoryReportsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('category');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast.error('Failed to fetch inventory statistics');
    } finally {
      setLoading(false);
    }
  };

  // Use the user's currency preference from the session
  const getUserCurrency = () => {
    return session?.user?.currency || 'USD';
  };

  const downloadCSV = () => {
    if (!stats) return;

    let csvContent = '';
    
    if (reportType === 'category') {
      // Header
      csvContent = 'Category,Item Count,Total Quantity,Total Value\n';
      
      // Data rows
      stats.categoryStats.forEach(cat => {
        csvContent += `"${cat._id}",${cat.count},${cat.totalQuantity},${cat.totalValue}\n`;
      });
    } else if (reportType === 'summary') {
      // Header
      csvContent = 'Metric,Value\n';
      
      // Data rows
      csvContent += `Total Items,${stats.totalItems}\n`;
      csvContent += `Low Stock Items,${stats.lowStockItems}\n`;
      csvContent += `Out of Stock Items,${stats.outOfStockItems}\n`;
      csvContent += `Total Inventory Value,${stats.totalValue}\n`;
    }
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory-${reportType}-report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/inventory">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Inventory
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Inventory Reports</h1>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={reportType}
            onValueChange={setReportType}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category">
                <div className="flex items-center">
                  <PieChart className="w-4 h-4 mr-2" />
                  By Category
                </div>
              </SelectItem>
              <SelectItem value="summary">
                <div className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Summary
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={downloadCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {stats && reportType === 'category' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Inventory by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Category</th>
                    <th className="text-right p-2">Item Count</th>
                    <th className="text-right p-2">Total Quantity</th>
                    <th className="text-right p-2">Total Value</th>
                    <th className="text-right p-2">% of Value</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.categoryStats.map((cat) => (
                    <tr key={cat._id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{cat._id}</td>
                      <td className="p-2 text-right">{cat.count}</td>
                      <td className="p-2 text-right">{cat.totalQuantity}</td>
                      <td className="p-2 text-right">{formatCurrency(cat.totalValue, getUserCurrency())}</td>
                      <td className="p-2 text-right">
                        {stats.totalValue ? ((cat.totalValue / stats.totalValue) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-gray-50">
                    <td className="p-2">Total</td>
                    <td className="p-2 text-right">{stats.totalItems}</td>
                    <td className="p-2 text-right">-</td>
                    <td className="p-2 text-right">{formatCurrency(stats.totalValue, getUserCurrency())}</td>
                    <td className="p-2 text-right">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {stats && reportType === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Inventory Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-2 border-b">
                  <span className="font-medium">Total Items:</span>
                  <span className="text-xl">{stats.totalItems}</span>
                </div>
                <div className="flex justify-between items-center p-2 border-b">
                  <span className="font-medium">Low Stock Items:</span>
                  <span className="text-xl text-yellow-600">{stats.lowStockItems}</span>
                </div>
                <div className="flex justify-between items-center p-2 border-b">
                  <span className="font-medium">Out of Stock Items:</span>
                  <span className="text-xl text-red-600">{stats.outOfStockItems}</span>
                </div>
                <div className="flex justify-between items-center p-2">
                  <span className="font-medium">Total Inventory Value:</span>
                  <span className="text-xl text-green-600 font-bold">{formatCurrency(stats.totalValue, getUserCurrency())}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Stock Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>In Stock</span>
                    <span>{stats.totalItems - stats.lowStockItems - stats.outOfStockItems}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ 
                        width: `${stats.totalItems ? ((stats.totalItems - stats.lowStockItems - stats.outOfStockItems) / stats.totalItems) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Low Stock</span>
                    <span>{stats.lowStockItems}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-yellow-500 h-2.5 rounded-full" 
                      style={{ 
                        width: `${stats.totalItems ? (stats.lowStockItems / stats.totalItems) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Out of Stock</span>
                    <span>{stats.outOfStockItems}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-red-600 h-2.5 rounded-full" 
                      style={{ 
                        width: `${stats.totalItems ? (stats.outOfStockItems / stats.totalItems) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}