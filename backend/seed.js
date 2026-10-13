/**
 * Database Seed Script
 * 
 * Creates demo data for testing:
 * - 1 admin user
 * - 1 customer user
 * - 1 merchant user + merchant profile
 * - 2 payment methods for the customer
 * - 3 sample transactions
 * - Default platform settings
 * 
 * Run: npm run seed
 * 
 * Demo Credentials:
 *   Admin:    admin@paysecure.com    / admin123
 *   Customer: customer@paysecure.com / customer123
 *   Merchant: merchant@paysecure.com / merchant123
 */
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Merchant = require('./models/Merchant');
const PaymentMethod = require('./models/PaymentMethod');
const Transaction = require('./models/Transaction');
const Settings = require('./models/Settings');

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Starting database seed...\n');

    // Clear existing data
    await User.deleteMany({});
    await Merchant.deleteMany({});
    await PaymentMethod.deleteMany({});
    await Transaction.deleteMany({});
    await Settings.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('admin123', salt);
    const customerHash = await bcrypt.hash('customer123', salt);
    const merchantHash = await bcrypt.hash('merchant123', salt);

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@paysecure.com',
      passwordHash: adminHash,
      role: 'admin',
    });

    const customer = await User.create({
      name: 'John Customer',
      email: 'customer@paysecure.com',
      passwordHash: customerHash,
      role: 'customer',
    });

    const merchantUser = await User.create({
      name: 'Jane Merchant',
      email: 'merchant@paysecure.com',
      passwordHash: merchantHash,
      role: 'merchant',
    });

    console.log('👤 Created users: admin, customer, merchant');

    // Create merchant profile
    const merchant = await Merchant.create({
      businessName: 'TechStore India',
      email: 'merchant@paysecure.com',
      ownerId: merchantUser._id,
      description: 'Electronics and gadgets store',
      status: 'active',
    });

    console.log('🏪 Created merchant: TechStore India');

    // Create payment methods for customer
    const card = await PaymentMethod.create({
      userId: customer._id,
      type: 'card',
      provider: 'Visa',
      last4: '4242',
      nickname: 'My Visa Card',
    });

    const upi = await PaymentMethod.create({
      userId: customer._id,
      type: 'upi',
      provider: 'Google Pay',
      upiId: 'john@okaxis',
      nickname: 'My GPay',
    });

    console.log('💳 Created payment methods: Visa card, Google Pay UPI');

    // Create sample transactions
    const txn1 = await Transaction.create({
      customerId: customer._id,
      merchantId: merchant._id,
      paymentMethodId: card._id,
      amount: 500,
      fee: 10,
      netAmount: 490,
      status: 'success',
      description: 'T-shirt purchase',
    });

    const txn2 = await Transaction.create({
      customerId: customer._id,
      merchantId: merchant._id,
      paymentMethodId: upi._id,
      amount: 1500,
      fee: 30,
      netAmount: 1470,
      status: 'success',
      description: 'Headphones',
    });

    const txn3 = await Transaction.create({
      customerId: customer._id,
      merchantId: merchant._id,
      paymentMethodId: card._id,
      amount: 200,
      fee: 4,
      netAmount: 196,
      status: 'pending',
      description: 'Phone case',
    });

    // Update merchant balance
    merchant.balance = 490 + 1470; // Only successful transactions
    await merchant.save();

    console.log('💰 Created 3 sample transactions');

    // Create default settings
    await Settings.create({
      transactionFeePercentage: 2,
      settlementFrequency: 'daily',
      minimumSettlementAmount: 1000,
    });

    console.log('⚙️  Created default platform settings');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Demo Credentials:');
    console.log('─────────────────────────────────────');
    console.log('Admin:    admin@paysecure.com    / admin123');
    console.log('Customer: customer@paysecure.com / customer123');
    console.log('Merchant: merchant@paysecure.com / merchant123');
    console.log('─────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
