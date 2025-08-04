import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    
    // Get the Permission collection
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    const permissionsCollection = db.collection('permissions');
    
    // List all indexes
    const indexes = await permissionsCollection.indexes();
    console.log('Current indexes:', indexes);
    
    // Drop all existing indexes except _id
    const existingIndexes = await permissionsCollection.indexes();
    console.log('Current indexes:', existingIndexes);
    
    for (const index of existingIndexes) {
      if (index.name !== '_id_' && index.name) {
        try {
          await permissionsCollection.dropIndex(index.name);
          console.log(`Dropped index: ${index.name}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.log(`Failed to drop index ${index.name}:`, errorMessage);
        }
      }
    }
    
    // Create the correct compound index
    try {
      await permissionsCollection.createIndex(
        { route: 1, method: 1 }, 
        { unique: true, name: 'route_method_unique' }
      );
      console.log('Created route_method_unique compound index');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('Compound index already exists or failed to create:', errorMessage);
    }
    
    // List indexes again to confirm
    const newIndexes = await permissionsCollection.indexes();
    console.log('New indexes:', newIndexes);
    
    return NextResponse.json({
      message: 'Permission indexes fixed successfully',
      oldIndexes: indexes,
      newIndexes: newIndexes
    });
    
  } catch (error) {
    console.error('Error fixing permission indexes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: `Failed to fix permission indexes: ${errorMessage}` 
    }, { status: 500 });
  }
} 