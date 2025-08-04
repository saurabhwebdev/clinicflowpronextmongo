import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import InventoryItem from '@/models/InventoryItem';
import InventoryTransaction from '@/models/InventoryTransaction';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const item = await InventoryItem.findById(params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);

  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory item' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const data = await request.json();
    const currentItem = await InventoryItem.findById(params.id);

    if (!currentItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Track quantity changes
    const quantityChanged = data.quantity !== undefined && data.quantity !== currentItem.quantity;
    const previousQuantity = currentItem.quantity;

    const updatedItem = await InventoryItem.findByIdAndUpdate(
      params.id,
      {
        ...data,
        updatedBy: session.user.id,
        sku: data.sku ? data.sku.toUpperCase() : currentItem.sku
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName')
     .populate('updatedBy', 'firstName lastName');

    // Create transaction if quantity changed
    if (quantityChanged) {
      const quantityDiff = data.quantity - previousQuantity;
      const transaction = new InventoryTransaction({
        itemId: params.id,
        type: quantityDiff > 0 ? 'in' : quantityDiff < 0 ? 'out' : 'adjustment',
        quantity: Math.abs(quantityDiff),
        previousQuantity,
        newQuantity: data.quantity,
        reason: data.reason || 'Manual adjustment',
        notes: data.notes,
        performedBy: session.user.id
      });
      await transaction.save();
    }

    return NextResponse.json(updatedItem);

  } catch (error: any) {
    console.error('Error updating inventory item:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const item = await InventoryItem.findByIdAndDelete(params.id);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Delete related transactions
    await InventoryTransaction.deleteMany({ itemId: params.id });

    return NextResponse.json({ message: 'Item deleted successfully' });

  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}