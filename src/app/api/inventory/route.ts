import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import InventoryItem from '@/models/InventoryItem';
import InventoryTransaction from '@/models/InventoryTransaction';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const lowStock = searchParams.get('lowStock') === 'true';

    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    if (lowStock) {
      filter.$expr = { $lte: ['$quantity', '$minQuantity'] };
    }

    const [items, total] = await Promise.all([
      InventoryItem.find(filter)
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      InventoryItem.countDocuments(filter)
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const data = await request.json();
    
    // Create new inventory item
    const inventoryItem = new InventoryItem({
      ...data,
      createdBy: session.user.id,
      sku: data.sku.toUpperCase()
    });

    await inventoryItem.save();

    // Create initial transaction if quantity > 0
    if (data.quantity > 0) {
      const transaction = new InventoryTransaction({
        itemId: inventoryItem._id,
        type: 'in',
        quantity: data.quantity,
        previousQuantity: 0,
        newQuantity: data.quantity,
        reason: 'Initial stock',
        performedBy: session.user.id
      });
      await transaction.save();
    }

    const populatedItem = await InventoryItem.findById(inventoryItem._id)
      .populate('createdBy', 'firstName lastName');

    return NextResponse.json(populatedItem, { status: 201 });

  } catch (error: any) {
    console.error('Error creating inventory item:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}