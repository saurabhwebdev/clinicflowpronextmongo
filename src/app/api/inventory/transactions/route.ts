import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const itemId = searchParams.get('itemId');

    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = {};
    if (itemId) {
      filter.itemId = itemId;
    }

    const [transactions, total] = await Promise.all([
      InventoryTransaction.find(filter)
        .populate('itemId', 'name sku')
        .populate('performedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      InventoryTransaction.countDocuments(filter)
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching inventory transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory transactions' },
      { status: 500 }
    );
  }
}