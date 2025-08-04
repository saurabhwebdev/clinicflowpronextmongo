import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import InventoryItem from '@/models/InventoryItem';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const [
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalValue,
      categoryStats
    ] = await Promise.all([
      InventoryItem.countDocuments({ status: 'active' }),
      InventoryItem.countDocuments({
        status: 'active',
        $expr: { $lte: ['$quantity', '$minQuantity'] }
      }),
      InventoryItem.countDocuments({ status: 'active', quantity: 0 }),
      InventoryItem.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: null,
            totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } }
          }
        }
      ]),
      InventoryItem.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    return NextResponse.json({
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalValue: totalValue[0]?.totalValue || 0,
      categoryStats
    });

  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory statistics' },
      { status: 500 }
    );
  }
}