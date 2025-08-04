'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const categories = [
  'Medications',
  'Medical Supplies',
  'Equipment',
  'Office Supplies',
  'Cleaning Supplies',
  'Personal Protective Equipment',
  'Laboratory Supplies',
  'Other'
];

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
}

export default function EditInventoryItemPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState<InventoryItem>({
    _id: '',
    name: '',
    description: '',
    category: '',
    sku: '',
    quantity: 0,
    minQuantity: 10,
    maxQuantity: undefined,
    unitPrice: 0,
    supplier: '',
    supplierContact: '',
    expiryDate: '',
    batchNumber: '',
    location: '',
    status: 'active'
  });

  useEffect(() => {
    fetchItem();
  }, [params.id]);

  const fetchItem = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`/api/inventory/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch item');

      const data = await response.json();
      
      // Format date for input field if exists
      if (data.expiryDate) {
        const date = new Date(data.expiryDate);
        data.expiryDate = date.toISOString().split('T')[0];
      }
      
      setFormData(data);
    } catch (error) {
      toast.error('Failed to fetch inventory item');
      router.push('/dashboard/inventory');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Add reason field for quantity changes
      const payload = {
        ...formData,
        maxQuantity: formData.maxQuantity ? parseInt(String(formData.maxQuantity)) : undefined,
        reason: formData.quantity !== undefined ? 'Manual update via edit form' : undefined
      };

      const response = await fetch(`/api/inventory/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update item');
      }

      toast.success('Inventory item updated successfully');
      router.push(`/dashboard/inventory/${params.id}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (fetchLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/inventory/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Inventory Item</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Stock & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Stock & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="quantity">Current Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="minQuantity">Minimum Quantity *</Label>
                <Input
                  id="minQuantity"
                  type="number"
                  min="0"
                  value={formData.minQuantity}
                  onChange={(e) => handleChange('minQuantity', parseInt(e.target.value) || 0)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="maxQuantity">Maximum Quantity</Label>
                <Input
                  id="maxQuantity"
                  type="number"
                  min="0"
                  value={formData.maxQuantity || ''}
                  onChange={(e) => handleChange('maxQuantity', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>

              <div>
                <Label htmlFor="unitPrice">Unit Price *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => handleChange('unitPrice', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">Storage Location</Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="e.g., Shelf A-1, Room 101"
                />
              </div>
            </CardContent>
          </Card>

          {/* Supplier Information */}
          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="supplier">Supplier Name</Label>
                <Input
                  id="supplier"
                  value={formData.supplier || ''}
                  onChange={(e) => handleChange('supplier', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="supplierContact">Supplier Contact</Label>
                <Input
                  id="supplierContact"
                  value={formData.supplierContact || ''}
                  onChange={(e) => handleChange('supplierContact', e.target.value)}
                  placeholder="Phone or email"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate || ''}
                  onChange={(e) => handleChange('expiryDate', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="batchNumber">Batch Number</Label>
                <Input
                  id="batchNumber"
                  value={formData.batchNumber || ''}
                  onChange={(e) => handleChange('batchNumber', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Link href={`/dashboard/inventory/${params.id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}