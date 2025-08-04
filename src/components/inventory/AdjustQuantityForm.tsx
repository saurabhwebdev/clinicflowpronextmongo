import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowDownUp, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface AdjustQuantityFormProps {
  itemId: string;
  currentQuantity: number;
  itemName: string;
  onSuccess: () => void;
}

export default function AdjustQuantityForm({ 
  itemId, 
  currentQuantity, 
  itemName,
  onSuccess 
}: AdjustQuantityFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'in',
    quantity: 1,
    reason: '',
    notes: '',
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate the new quantity based on the transaction type
      const quantityChange = formData.type === 'in' 
        ? formData.quantity 
        : formData.type === 'out' 
          ? -formData.quantity 
          : 0;
          
      const newQuantity = currentQuantity + quantityChange;
      
      // Don't allow negative quantities
      if (newQuantity < 0) {
        toast.error('Cannot reduce quantity below zero');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/inventory/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: newQuantity,
          reason: formData.reason,
          notes: formData.notes
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to adjust quantity');
      }

      toast.success('Quantity adjusted successfully');
      setOpen(false);
      onSuccess();
      
      // Reset form
      setFormData({
        type: 'in',
        quantity: 1,
        reason: '',
        notes: '',
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ArrowDownUp className="w-4 h-4 mr-2" />
          Adjust Quantity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Inventory Quantity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Current quantity for <span className="font-medium">{itemName}</span>: {currentQuantity}
            </p>
          </div>

          <div>
            <Label htmlFor="type">Transaction Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange('type', value)}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">
                  <div className="flex items-center">
                    <Plus className="w-4 h-4 mr-2 text-green-600" />
                    Stock In
                  </div>
                </SelectItem>
                <SelectItem value="out">
                  <div className="flex items-center">
                    <Minus className="w-4 h-4 mr-2 text-red-600" />
                    Stock Out
                  </div>
                </SelectItem>
                <SelectItem value="adjustment">
                  <div className="flex items-center">
                    <ArrowDownUp className="w-4 h-4 mr-2 text-blue-600" />
                    Adjustment
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
              required
            />
          </div>

          <div>
            <Label htmlFor="reason">Reason *</Label>
            <Input
              id="reason"
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              placeholder="e.g., Received new shipment, Used in procedure"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any additional details"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}