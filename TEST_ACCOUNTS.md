# 🧪 TEST ACCOUNTS & DASHBOARD GUIDE

This document provides all test accounts and instructions for testing the three role-based dashboards.

---

## 📋 TEST ACCOUNTS

### 👑 **ADMIN ACCOUNT**
```
Email:    admin@pawstuff.com
Password: admin123
Role:     ROLE_ADMIN
```
**Dashboard Access:** Admin Dashboard
**Features:** 
- System Statistics (Total Users, Admins, Staff, Products, Orders, Stock)
- Recent Users List with Roles
- Pet of the Month
- Full System Control

---

### 👔 **STAFF ACCOUNT**
```
Email:    staff@pawstuff.com
Password: staff123
Role:     ROLE_STAFF
```
**Dashboard Access:** Staff Dashboard
**Features:**
- Pending Orders Tracking
- Daily Processed Orders
- Low Stock Alerts
- Recent Orders Table with Status
- Restock Management
- Order Fulfillment Tools

---

### 👤 **CUSTOMER ACCOUNTS**

#### Account #1
```
Email:    customer@pawstuff.com
Password: customer123
Role:     ROLE_USER
```

#### Account #2
```
Email:    maria@pawstuff.com
Password: maria123
Role:     ROLE_USER
```

**Dashboard Access:** Customer Dashboard
**Features:**
- Pet Profiles Management
- Orders Browsing
- Product Catalog
- Inventory Overview
- Pet of the Month
- Best Selling Products

---

## 🚀 SETUP INSTRUCTIONS

### Step 1: Create Test Accounts
Run the seed script to populate the database with test accounts:

```bash
cd C:\Users\kyle\Projects\Divino
node seed.js
```

**Expected Output:**
```
🟡 Connecting to database...
✅ Database connected
🟡 Syncing database...
✅ Database synced
🟡 Creating test accounts...
✅ Created: Admin User (admin@pawstuff.com) - Roles: ROLE_ADMIN
✅ Created: Staff User (staff@pawstuff.com) - Roles: ROLE_STAFF
✅ Created: John Customer (customer@pawstuff.com) - Roles: ROLE_USER
...
```

### Step 2: Start the Backend Server
```bash
node server.js
```

**Expected Output:**
```
🚀 Server running on 0.0.0.0:9000
MongoDB connected or MySQL connected...
```

### Step 3: Start Metro Bundler
```bash
npx react-native start --port 8082 --reset-cache
```

### Step 4: Build and Run App
```bash
npx react-native run-android --port 8082
```

---

## 🧪 TESTING PROCEDURE

### Test 1: Admin Workspace
1. **Login** with `admin@pawstuff.com` / `admin123`
2. **Verify Dashboard Shows:**
   - ✅ Admin Dashboard title
   - ✅ "Admin Workspace" in sidebar
   - ✅ System Statistics (6 cards)
   - ✅ Recent Users List
   - ✅ Pet of the Month
3. **Navigate** to all menu items:
   - Pet Profiles
   - Products
   - Categories
   - Stocks
   - Orders
   - Profile (Admin)

### Test 2: Staff Workspace
1. **Login** with `staff@pawstuff.com` / `staff123`
2. **Verify Dashboard Shows:**
   - ✅ Staff Dashboard title
   - ✅ "Staff Workspace" in sidebar
   - ✅ Today's Metrics (4 cards)
   - ✅ Order Summary (2 cards)
   - ✅ Recent Orders Table
   - ✅ Low Stock Alert with Restock Buttons
3. **Navigate** to menu items:
   - Orders management
   - Inventory/Stocks
   - Profile (Staff)

### Test 3: Customer Workspace
1. **Login** with `customer@pawstuff.com` / `customer123`
2. **Verify Dashboard Shows:**
   - ✅ Customer Dashboard title
   - ✅ "User Workspace" in sidebar
   - ✅ Main Stats (4 cards)
   - ✅ Pet of the Month
   - ✅ Best Selling Product
3. **Test Features:**
   - Browse Pet Profiles
   - Browse Products
   - Browse Categories
   - View Orders
   - Update Profile

### Test 4: Switch Between Accounts
1. **Logout** from current account (Profile → Logout)
2. **Login** with different account
3. **Verify** correct dashboard and workspace displays
4. **Expected:** Smooth transition to appropriate dashboard

---

## 🔧 TROUBLESHOOTING

### Issue: "Network request failed" on login
**Solution:**
```bash
adb reverse tcp:9000 tcp:9000
adb reverse tcp:8082 tcp:8082
```

### Issue: Seed script fails
**Solution:**
1. Ensure `.env` file has correct database connection
2. Check if `User` model table exists
3. Run: `node seed.js` again

### Issue: Can't see admin/staff dashboards
**Solution:**
1. Check user roles in database
2. Clear app cache: `npm start --reset-cache`
3. Restart app and login again

### Issue: Old test data in database
**Solution:**
1. Delete old database entries manually via SQL or
2. Use `seed.js` again (skips existing emails)

---

## 📊 ACCOUNT ROLE HIERARCHY

```
ROLE_ADMIN (Highest)
  ↓
ROLE_STAFF
  ↓
ROLE_USER (Lowest)
```

**Important:** An account can have multiple roles. For example:
- Admin with Staff role: Can access both Admin & Staff dashboards
- Staff with User role: Can access both Staff & User dashboards

---

## ✨ FEATURES TO TEST FOR EACH ROLE

### Admin (👑)
- [ ] View system statistics
- [ ] Manage users (CRUD)
- [ ] View all orders
- [ ] View all staff
- [ ] Access admin analytics
- [ ] Manage all resources

### Staff (👔)
- [ ] View pending orders
- [ ] Process orders
- [ ] Manage inventory
- [ ] Track low stock
- [ ] View recent transactions
- [ ] Access order details

### Customer (👤)
- [ ] Browse pet profiles
- [ ] Browse products
- [ ] View categories
- [ ] Browse orders
- [ ] Update profile
- [ ] View pet of the month

---

## 📱 MOBILE APP FLOW

```
Login Screen
    ↓
Enter Credentials
    ↓
Server Validates & Returns Token + User Role
    ↓
Redux Stores User + Roles
    ↓
Navigation Routes to Correct Dashboard:
    - ROLE_ADMIN → Admin Dashboard
    - ROLE_STAFF → Staff Dashboard
    - ROLE_USER → Customer Dashboard
    ↓
Sidebar Shows Correct Workspace
    ↓
User Can Logout & Switch Accounts
```

---

## 🎯 QUICK START

**One-liner to set everything up:**
```bash
# Terminal 1: Start Backend
node server.js

# Terminal 2: Start Metro
npx react-native start --port 8082 --reset-cache

# Terminal 3: Create accounts & run app
node seed.js && npx react-native run-android --port 8082
```

---

## 💡 TIPS

1. **Always run seed.js once** after database reset
2. **Test logout/login** to verify role-based routing
3. **Check sidebar** to confirm workspace type
4. **Use different devices/emulators** to test multiple accounts simultaneously
5. **Monitor server logs** to see API requests and token validation

---

Generated: May 18, 2026
Updated for: Divino v1.0 - Role-Based Dashboard System
