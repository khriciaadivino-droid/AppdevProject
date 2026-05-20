/**
 * Seed Script - Create Test Accounts
 * Run this once to populate the database with test users for different roles
 * 
 * Usage: node seed.js
 */

const sequelize = require('./db');
const User = require('./User');
const bcrypt = require('bcryptjs');

const testAccounts = [
    {
        name: 'John Customer',
        email: 'customer@pawstuff.com',
        password: 'customer123',
        roles: ['ROLE_USER'],
        status: 'active',
    },
    {
        name: 'Maria Santos',
        email: 'maria@pawstuff.com',
        password: 'maria123',
        roles: ['ROLE_USER'],
        status: 'active',
    },
];

const seedDatabase = async () => {
    try {
        console.log('🟡 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connected');

        console.log('🟡 Syncing database...');
        await sequelize.sync({ alter: false });
        console.log('✅ Database synced');

        console.log('🟡 Creating test accounts...');

        for (const account of testAccounts) {
            try {
                // Check if user already exists
                const existingUser = await User.findOne({
                    where: { email: account.email },
                });

                if (existingUser) {
                    console.log(`⏭️ User already exists: ${account.email}`);
                    continue;
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(account.password, 10);

                // Create user
                const user = await User.create({
                    name: account.name,
                    email: account.email,
                    password: hashedPassword,
                    roles: account.roles,
                    status: account.status,
                });

                console.log(
                    `✅ Created: ${account.name} (${account.email}) - Roles: ${account.roles.join(', ')}`
                );
            } catch (error) {
                console.log(
                    `🔴 Error creating ${account.email}: ${error.message}`
                );
            }
        }

        console.log('\n✅ ✅ ✅ Seeding completed! ✅ ✅ ✅\n');
        console.log('📋 TEST ACCOUNTS CREATED:\n');

        console.log('┌─────────────────────────────────────────────────┐');
        console.log('│ 👤 CUSTOMER ACCOUNT                             │');
        console.log('├─────────────────────────────────────────────────┤');
        console.log('│ Email:    customer@pawstuff.com                 │');
        console.log('│ Password: customer123                           │');
        console.log('│ Role:     Customer                              │');
        console.log('│ Access:   Customer Dashboard + Shopping         │');
        console.log('└─────────────────────────────────────────────────┘\n');

        console.log('┌─────────────────────────────────────────────────┐');
        console.log('│ 👤 CUSTOMER ACCOUNT #2                          │');
        console.log('├─────────────────────────────────────────────────┤');
        console.log('│ Email:    maria@pawstuff.com                    │');
        console.log('│ Password: maria123                              │');
        console.log('│ Role:     Customer                              │');
        console.log('│ Access:   Customer Dashboard + Shopping         │');
        console.log('└─────────────────────────────────────────────────┘\n');

        console.log('🚀 Ready to test! Use these credentials to login in the mobile app.\n');

        process.exit(0);
    } catch (error) {
        console.error('🔴 Seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
