'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/hooks/use-currency';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';

interface BillItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Bill {
  _id: string;
  billNumber: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  doctorId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  appointmentId: {
    _id: string;
    dateTime: string;
  };
  items: BillItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  status: string;
  dueDate: string;
  notes?: string;
}

export default function EditBillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { format: formatCurrency } = useCurrency();

  const [bill, setBill] = useState<Bill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [items, setItems] = useState<BillItem[]>([]);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchBill();
  }, [id]);

  const fetchBill = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/billing/${id}`);
      if (!response.ok) throw new Error('Failed to fetch bill');

      const billData = await response.json();
      setBill(billData);

      // Populate form fields
      setItems(billData.items || []);
      setTax(billData.tax || 0);
      setDiscount(billData.discount || 0);
      setDueDate(billData.dueDate ? new Date(billData.dueDate).toISOString().split('T')[0] : '');
      setNotes(billData.notes || '');
    } catch (error) {
      console.error('Error fetching bill:', error);
      toast.error('Failed to load bill details');
      router.push('/dashboard/billing');
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
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

  const calculateTaxAmount = () => {
    return (calculateSubtotal() * tax) / 100;
  };

  const calculateDiscountAmount = () => {
    return (calculateSubtotal() * discount) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount() - calculateDiscountAmount();
  };

  const handleSave = async () => {
    if (items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error('Please fill in all item details');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/billing/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          tax,
          discount,
          dueDate,
          notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to update bill');

      toast.success('Bill updated successfully');
      router.push(`/dashboard/billing/${id}`);
    } catch (error) {
      console.error('Error updating bill:', error);
      toast.error('Failed to update bill');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-20"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Bill not found</p>
            <Button
              onClick={() => router.push('/dashboard/billing')}
              className="mt-4"
            >
              Back to Billing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Bill {bill.billNumber}</h1>
          <p className="text-gray-600">Modify bill details and items</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bill Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bill Information</CardTitle>
            <CardDescription>Basic bill details (read-only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Patient</Label>
                <Input
                  value={`${bill.patientId?.firstName || 'Unknown'} ${bill.patientId?.lastName || 'Patient'}`}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>Doctor</Label>
                <Input
                  value={`${bill.doctorId?.firstName || 'Unknown'} ${bill.doctorId?.lastName || 'Doctor'}`}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Bill Number</Label>
                <Input
                  value={bill.billNumber}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Input
                  value={bill.status}
                  disabled
                  className="bg-gray-50 capitalize"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or comments..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bill Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Bill Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(calculateSubtotal())}</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Tax (%):</span>
              <Input
                type="number"
                value={tax}
                onChange={(e) => setTax(Number(e.target.value))}
                className="w-20 text-right"
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            <div className="flex justify-between">
              <span>Tax Amount:</span>
              <span>{formatCurrency(calculateTaxAmount())}</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Discount (%):</span>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-20 text-right"
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            <div className="flex justify-between">
              <span>Discount Amount:</span>
              <span>-{formatCurrency(calculateDiscountAmount())}</span>
            </div>

            <hr />

            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{formatCurrency(calculateTotal())}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Bill Items</CardTitle>
              <CardDescription>Edit services, procedures, or products</CardDescription>
            </div>
            <Button type="button" onClick={addItem} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                <div className="md:col-span-2">
                  <Label>Description *</Label>
                  <Input
                    placeholder="Service or item description"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label>Unit Price *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label>Total</Label>
                  <Input
                    value={formatCurrency(item.total)}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}