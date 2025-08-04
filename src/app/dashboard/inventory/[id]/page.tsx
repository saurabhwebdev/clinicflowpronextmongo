'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Trash2, Package, History, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';
import AdjustQuantityForm from '@/components/inventory/AdjustQuantityForm';
import { formatCurrency } from '@/lib/formatCurrency';

interface InventoryItem {
  _id: string;
  name: string;
  description?: string;
  category: string;
  sku: string;
  quantity: number;
  minQuantity: number;
  maxQuantity?: number;
  unitPrice: number;
  supplier?: string;
  supplierContact?: string;
  expiryDate?: string;
  batchNumber?: string;
  location?: string;
  status: 'active' | 'inactive' | 'discontinued';
  lastRestocked?: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  updatedBy?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  _id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  notes?: string;
  reference?: string;
  performedBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export default function InventoryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const itemId = unwrappedParams.id;

  useEffect(() => {
    fetchItem();
    fetchTransactions();
  }, [itemId]);

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/inventory/${itemId}`);
      if (!response.ok) throw new Error('Failed to fetch item');

      const data = await response.json();
      setItem(data);
    } catch (error) {
      toast.error('Failed to fetch inventory item');
      router.push('/dashboard/inventory');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/inventory/transactions?itemId=${itemId}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();
      setTransactions(data.transactions);
    } catch (error) {
      toast.error('Failed to fetch transaction history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/inventory/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');

      toast.success('Item deleted successfully');
      router.push('/dashboard/inventory');
    } catch (error) {
      toast.error('Failed to delete item');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return { label: 'Out of Stock', color: 'destructive', icon: AlertTriangle };
    if (item.quantity <= item.minQuantity) return { label: 'Low Stock', color: 'warning', icon: AlertTriangle };
    return { label: 'In Stock', color: 'success', icon: Package };
  };

  // Use the user's currency preference from the session
  const getUserCurrency = () => {
    return session?.user?.currency || 'USD';
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'in': return 'text-green-600';
      case 'out': return 'text-red-600';
      case 'adjustment': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (loading || !item) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(item);
  const StockIcon = stockStatus.icon;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/inventory">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{item.name}</h1>
            <p className="text-muted-foreground">SKU: {item.sku}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/inventory/${item._id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <AdjustQuantityForm 
            itemId={item._id} 
            currentQuantity={item.quantity} 
            itemName={item.name}
            onSuccess={fetchItem}
          />
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{item.name}</span>
                </div>
                {item.description && (
                  <div className="flex justify-between">
                    <span className="font-medium">Description:</span>
                    <span className="text-right max-w-xs">{item.description}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Category:</span>
                  <span>{item.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">SKU:</span>
                  <span className="font-mono">{item.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                    {item.status}
                  </Badge>
                </div>
                {item.location && (
                  <div className="flex justify-between">
                    <span className="font-medium">Location:</span>
                    <span>{item.location}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stock Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StockIcon className="w-5 h-5" />
                  Stock Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Current Stock:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{item.quantity}</span>
                    <Badge variant={stockStatus.color as any}>
                      {stockStatus.label}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Minimum Quantity:</span>
                  <span>{item.minQuantity}</span>
                </div>
                {item.maxQuantity && (
                  <div className="flex justify-between">
                    <span className="font-medium">Maximum Quantity:</span>
                    <span>{item.maxQuantity}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Unit Price:</span>
                  <span>{formatCurrency(item.unitPrice, getUserCurrency())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Value:</span>
                  <span className="font-bold">
                    {formatCurrency(item.quantity * item.unitPrice, getUserCurrency())}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Supplier Information */}
            {(item.supplier || item.supplierContact) && (
              <Card>
                <CardHeader>
                  <CardTitle>Supplier Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {item.supplier && (
                    <div className="flex justify-between">
                      <span className="font-medium">Supplier:</span>
                      <span>{item.supplier}</span>
                    </div>
                  )}
                  {item.supplierContact && (
                    <div className="flex justify-between">
                      <span className="font-medium">Contact:</span>
                      <span>{item.supplierContact}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.expiryDate && (
                  <div className="flex justify-between">
                    <span className="font-medium">Expiry Date:</span>
                    <span>{format(new Date(item.expiryDate), 'MMM dd, yyyy')}</span>
                  </div>
                )}
                {item.batchNumber && (
                  <div className="flex justify-between">
                    <span className="font-medium">Batch Number:</span>
                    <span>{item.batchNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Created By:</span>
                  <span>{item.createdBy.firstName} {item.createdBy.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Created At:</span>
                  <span>{format(new Date(item.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                </div>
                {item.updatedBy && (
                  <div className="flex justify-between">
                    <span className="font-medium">Last Updated By:</span>
                    <span>{item.updatedBy.firstName} {item.updatedBy.lastName}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No transactions found for this item.
                </p>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium capitalize ${getTransactionTypeColor(transaction.type)}`}>
                            {transaction.type === 'in' ? 'Stock In' : 
                             transaction.type === 'out' ? 'Stock Out' : 'Adjustment'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            by {transaction.performedBy.firstName} {transaction.performedBy.lastName}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {transaction.reason}
                        </p>
                        {transaction.notes && (
                          <p className="text-sm text-muted-foreground italic">
                            Note: {transaction.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${getTransactionTypeColor(transaction.type)}`}>
                          {transaction.type === 'in' ? '+' : transaction.type === 'out' ? '-' : '±'}
                          {transaction.quantity}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.previousQuantity} → {transaction.newQuantity}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}