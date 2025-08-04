// Script to create the first master admin user
// Run with: node -r dotenv/config src/scripts/create-master-admin.js

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createMasterAdmin() {
  try {
    // Check for MongoDB URI
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('Error: MONGODB_URI environment variable is not set.');
      process.exit(1);
    }

    console.log('Creating master admin user...');
    
    // Get user input
    const firstName = await question('Enter first name: ');
    const lastName = await question('Enter last name: ');
    const email = await question('Enter email: ');
    const password = await question('Enter password (min 8 characters): ');
    
    if (!firstName || !lastName || !email || !password) {
      console.error('Error: All fields are required.');
      process.exit(1);
    }
    
    if (password.length < 8) {
      console.error('Error: Password must be at least 8 characters long.');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      console.error('Error: User with this email already exists.');
      await client.close();
      process.exit(1);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const now = new Date();
    const result = await db.collection('users').insertOne({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'master_admin',
      requirePasswordChange: false,
      createdAt: now,
      updatedAt: now,
    });
    
    console.log('Master admin user created successfully!');
    console.log(`User ID: ${result.insertedId}`);
    console.log(`Email: ${email}`);
    console.log('You can now log in with these credentials.');
    
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('Error creating master admin:', error);
    process.exit(1);
  }
}

function question(query) {
  return new Promise(resolve => {
    rl.question(query, answer => {
      resolve(answer);
    });
  });
}

createMasterAdmin().finally(() => rl.close());