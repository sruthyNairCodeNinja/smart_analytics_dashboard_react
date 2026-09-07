// Seeds an admin user and a starter set of machines.
// Usage: npm run seed
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Machine = require('./models/Machine');

const STARTER_MACHINES = [
  { name: 'CNC Mill 01', type: 'CNC', location: 'Line 1', targetOutput: 120 },
  { name: 'CNC Mill 02', type: 'CNC', location: 'Line 1', targetOutput: 120 },
  { name: 'Conveyor A', type: 'Conveyor', location: 'Line 1', targetOutput: 300 },
  { name: 'Hydraulic Press 01', type: 'Press', location: 'Line 2', targetOutput: 80 },
  { name: 'Robotic Arm 01', type: 'Robotic Arm', location: 'Line 2', targetOutput: 150 },
  { name: 'Packaging Unit 01', type: 'Packaging', location: 'Line 3', targetOutput: 200 },
];

async function seed() {
  await connectDB();

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@smartfactory.io').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'Factory Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
    console.log(`[seed] created admin user: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`[seed] admin user already exists: ${adminEmail}`);
  }

  const existingCount = await Machine.countDocuments();
  if (existingCount === 0) {
    await Machine.insertMany(STARTER_MACHINES);
    console.log(`[seed] created ${STARTER_MACHINES.length} starter machines`);
  } else {
    console.log(`[seed] machines already exist (${existingCount}), skipping`);
  }

  console.log('[seed] done');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
