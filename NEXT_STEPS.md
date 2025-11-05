# 🎯 Next Steps - What to Do Now

Your FastFood system is **ready for testing**! Here's exactly what to do next.

---

## ✅ What's Complete

- ✅ **Restaurant App** - Full owner management interface (port 5175)
- ✅ **Backend API** - Complete Express server with JWT auth (port 5000)
- ✅ **Database Schema** - Updated with role-based system
- ✅ **Demo Accounts** - 5 test accounts for all scenarios
- ✅ **Documentation** - 5 comprehensive guides

---

## 🚀 Step 1: Setup Database (5 minutes)

### Run These Commands:
```powershell
# Navigate to backend folder
cd backend

# Run migration (creates schema + admin)
mysql -u root -p food < database-migration.sql

# Run demo data (creates 5 test accounts)
mysql -u root -p food < demo-accounts.sql

# Go back to root
cd ..
```

### Verify Database:
```powershell
# Login to MySQL
mysql -u root -p food

# Check demo accounts exist
SELECT name, email, role FROM users;

# Check restaurants exist
SELECT name, review_status FROM products;

# Exit MySQL
exit
```

**Expected Results**:
- 5 users (1 admin, 3 owners, 1 customer)
- 3 restaurants (1 approved, 1 pending, 1 rejected)

---

## 🏃 Step 2: Start All Apps (1 minute)

### Single Command:
```powershell
npm run dev
```

### This Starts:
- ✅ User App on http://localhost:5173
- ✅ Admin App on http://localhost:5174
- ✅ Restaurant App on http://localhost:5175
- ✅ Backend API on http://localhost:5000

**Wait for**: "All apps started successfully!" message

---

## 🧪 Step 3: Test Each Scenario (15 minutes)

### Test 1: Approved Restaurant Owner ✅
```
1. Go to http://localhost:5175/login
2. Login: owner@demo.com / owner123
3. ✅ Should redirect to dashboard
4. ✅ Can navigate to menu, orders, deliveries, profile
5. ✅ Restaurant name shows: "Cơm Tấm Sài Gòn Demo"
```

### Test 2: Pending Restaurant Owner ⏳
```
1. Go to http://localhost:5175/login
2. Login: owner2@demo.com / owner123
3. ✅ Should redirect to /restaurant/pending
4. ✅ Shows "Đang Chờ Duyệt" (yellow badge)
5. ✅ Restaurant: "Phở Hà Nội Authentic"
6. ❌ Cannot access dashboard (guard blocks)
```

### Test 3: Rejected Restaurant Owner ❌
```
1. Go to http://localhost:5175/login
2. Login: owner3@demo.com / owner123
3. ✅ Should redirect to /restaurant/pending
4. ✅ Shows "Bị Từ Chối" (red badge)
5. ✅ Shows rejection reason in red box
6. ✅ Restaurant: "Bánh Mì Không Đạt"
```

### Test 4: Admin Approval Flow 👨‍💼
```
1. Go to http://localhost:5174/login
2. Login: admin@fastfood.com / admin123
3. ⚠️ Admin pending page needs implementation
4. TODO: Will add /restaurants/pending page
```

### Test 5: Customer Browsing 👤
```
1. Go to http://localhost:5173/login
2. Login: user@demo.com / user123
3. ✅ Should only see approved restaurants
4. ❌ Should NOT see pending/rejected ones
5. TODO: Implement restaurant list page
```

---

## 📝 Step 4: Follow Testing Guide

Open `TESTING_GUIDE.md` and follow:
- 8 detailed test scenarios
- API testing with cURL
- Database verification queries
- Testing checklist

---

## 🔧 Step 5: Next Development Tasks

### Priority 1: Admin Pending Restaurants Page

**What**: Create page for admin to approve/reject restaurants

**Where**: `frontend/admin/project/src/pages/PendingRestaurantsPage.jsx`

**Features Needed**:
- List all pending restaurants
- Show owner info, restaurant details
- "Approve" button → calls `POST /api/admin/restaurants/:id/approve`
- "Reject" button → modal with textarea → calls `POST /api/admin/restaurants/:id/reject`
- Success toasts after actions
- Auto-refresh list

**API Already Built**:
- ✅ `GET /api/admin/restaurants/pending`
- ✅ `POST /api/admin/restaurants/:id/approve`
- ✅ `POST /api/admin/restaurants/:id/reject`

---

### Priority 2: User App Restaurant List

**What**: Show only approved restaurants to customers

**Where**: `frontend/web/src/app/restaurant/page.jsx`

**Features Needed**:
- Grid of restaurant cards
- Show: name, image, address, city, hours
- Click → go to restaurant detail
- Filter by city
- Search by name

**API Needed** (NOT YET BUILT):
```javascript
// GET /api/public/restaurants
// Returns only restaurants with review_status = 'APPROVED'
```

---

### Priority 3: Clean Up User App

**Remove**:
- Owner registration routes
- Admin routes
- Any owner/admin UI

**Keep Only**:
- Customer login/register
- Restaurant browsing
- Cart
- Checkout
- Order tracking

**Update**:
- Use `/api/auth/signup-user` (not `/api/auth/signup-owner`)

---

## 🐛 If Something Goes Wrong

### Issue: "Cannot connect to database"
```bash
# Check MySQL is running
mysql -u root -p

# Check database exists
SHOW DATABASES;

# Check users table exists
USE food;
SHOW TABLES;
```

### Issue: "Token invalid" or auth issues
```javascript
// Clear localStorage in browser console
localStorage.clear();
// Then login again
```

### Issue: "Port already in use"
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F
```

### Issue: "Restaurant guard not working"
```sql
-- Check restaurant status in database
SELECT id, name, review_status FROM products WHERE id = 1;

-- Should be 'APPROVED' (uppercase)
-- Fix if needed:
UPDATE products SET review_status = 'APPROVED' WHERE id = 1;
```

---

## 📚 Documentation Reference

1. **QUICK_START.md** - Quick commands & demo accounts
2. **TESTING_GUIDE.md** - Complete testing scenarios (58 test cases!)
3. **DATABASE_QUERIES.md** - SQL queries for debugging
4. **SETUP_GUIDE.md** - Full setup instructions
5. **RESTAURANT_APP_GUIDE.md** - Restaurant app documentation
6. **IMPLEMENTATION_SUMMARY.md** - What was built

---

## 🎓 Understanding the System

### Three Separate Apps:

**User App (5173)**:
- For customers
- Browse restaurants, order food
- No admin/owner features

**Restaurant App (5175)**:
- For restaurant owners ONLY
- Register restaurant → Admin approves
- Manage menu, orders, deliveries
- Smart guards based on review_status

**Admin App (5174)**:
- For admins ONLY
- Approve/reject pending restaurants
- System management

### Authentication Flow:

```
1. Owner registers account → role='owner'
2. Owner registers restaurant → review_status='PENDING'
3. Admin approves → review_status='APPROVED'
4. Owner can now access dashboard
```

### Guards Logic:

```javascript
if (!user) → redirect to /login
if (user.role !== 'owner') → redirect to /login
if (!restaurant) → redirect to /restaurant/register
if (restaurant.review_status === 'PENDING') → redirect to /restaurant/pending
if (restaurant.review_status === 'REJECTED') → redirect to /restaurant/pending
if (restaurant.review_status === 'APPROVED') → allow access to dashboard
```

---

## 🎉 You're Ready!

**Current Status**: 
- ✅ Backend API working
- ✅ Restaurant App complete
- ✅ Database schema ready
- ✅ Demo accounts created
- ✅ Documentation complete

**Next Action**:
1. Run database scripts
2. Start apps with `npm run dev`
3. Test with demo accounts
4. Follow TESTING_GUIDE.md
5. Implement admin pending page

---

**Need Help?** 
- Check TESTING_GUIDE.md for troubleshooting
- Check DATABASE_QUERIES.md for SQL fixes
- Check console logs for errors
- Check Network tab for API responses

**Happy Testing! 🚀**
