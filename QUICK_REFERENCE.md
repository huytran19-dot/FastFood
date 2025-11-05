# FastFood - Quick Reference Card

## 🚀 Start Commands
```bash
# Start everything
npm run dev

# Or individually:
npm run dev:web          # User App (5173)
npm run dev:restaurant   # Restaurant App (5175)
npm run dev:admin        # Admin App (5174)
npm run dev:backend      # Backend API (5000)
```

## 🌐 URLs
- User App: http://localhost:5173
- **Restaurant App: http://localhost:5175** ⭐ NEW
- Admin App: http://localhost:5174
- Backend API: http://localhost:5000

## 🔐 Demo Accounts

### Admin (http://localhost:5174)
```
Email: admin@fastfood.com
Password: admin123
```

### Restaurant Owners (http://localhost:5175)
```
1. APPROVED (Can access dashboard):
   Email: owner@demo.com
   Password: owner123
   Restaurant: Cơm Tấm Sài Gòn Demo ✅

2. PENDING (Waiting for approval):
   Email: owner2@demo.com
   Password: owner123
   Restaurant: Phở Hà Nội Authentic ⏳

3. REJECTED (Has rejection reason):
   Email: owner3@demo.com
   Password: owner123
   Restaurant: Bánh Mì Không Đạt ❌
```

### Customer (http://localhost:5173)
```
Email: user@demo.com
Password: user123
```

## 📊 User Roles
| Role | App | Description |
|------|-----|-------------|
| **user** | Port 5173 | Customers ordering food |
| **owner** | Port 5175 | Restaurant owners |
| **admin** | Port 5174 | Platform administrators |

## 🛣️ Restaurant App Routes
```
/login                    → Owner login
/register                 → Owner registration
/restaurant/register      → Restaurant info form
/restaurant/pending       → Waiting for approval
/restaurant/dashboard     → Main dashboard (after approval)
/restaurant/menu          → Menu management
/restaurant/orders        → Orders management
/restaurant/deliveries    → Deliveries tracking
/restaurant/profile       → Restaurant profile
```

## 🔄 Restaurant Status Flow
```
1. Owner registers       → role = "owner"
2. Registers restaurant  → review_status = "PENDING"
3. Admin reviews         → Approve or Reject
4. If APPROVED          → Access dashboard
5. If REJECTED          → See rejection reason
```

## 🎯 Smart Guards
```
No restaurant        → /restaurant/register
Status PENDING       → /restaurant/pending
Status REJECTED      → /restaurant/pending (with reason)
Status APPROVED      → /restaurant/dashboard ✅
```

## 📡 Key API Endpoints

### Auth
- `POST /api/auth/login` - Login (all roles)
- `POST /api/auth/signup-user` - Register customer
- `POST /api/auth/signup-owner` - Register owner

### Restaurant
- `POST /api/restaurants` - Create restaurant
- `GET /api/restaurants/mine` - Get owner's restaurant
- `GET /api/public/restaurants` - List approved

### Admin
- `GET /api/admin/restaurants?review_status=PENDING` - List pending
- `POST /api/admin/restaurants/:id/approve` - Approve
- `POST /api/admin/restaurants/:id/reject` - Reject (with reason)

## 🗄️ Database Setup
```bash
# Run migration
mysql -u root -p food < backend/database-migration.sql

# This adds:
- users.role (user/owner/admin)
- users.restaurant_id
- products.owner_id, review_status, etc.
- Admin user account
```

## 🧪 Test Flow
```bash
1. Go to http://localhost:5175/register
2. Register as owner (name, email, phone, password)
3. Fill restaurant form (name, address, city, etc.)
4. See "Chờ duyệt" pending page
5. Admin approves at http://localhost:5174
6. Owner accesses dashboard
```

## 📝 Vietnamese UI Labels
```
Buttons:
- Đăng nhập (Login)
- Đăng ký (Register)
- Duyệt (Approve)
- Từ chối (Reject)

Status:
- Chờ duyệt (Pending)
- Đã duyệt (Approved)
- Bị từ chối (Rejected)

Forms:
- Tên nhà hàng (Restaurant name)
- Địa chỉ (Address)
- Số điện thoại (Phone)
- Giờ mở cửa (Opening time)
```

## 🐛 Troubleshooting

**Port in use:**
```bash
netstat -ano | findstr :5175
taskkill /PID <PID> /F
```

**Cannot find module:**
```bash
cd frontend/restaurant
npm install
```

**Database error:**
```bash
# Check MySQL running
mysql -u root -p

# Verify database exists
SHOW DATABASES;
USE food;
```

**CORS error:**
Backend allows: 5173, 5174, 5175

**Token invalid:**
Clear localStorage and login again

## 📚 Documentation
- `SETUP_GUIDE.md` - Full setup instructions
- `RESTAURANT_APP_GUIDE.md` - Restaurant app details
- `IMPLEMENTATION_SUMMARY.md` - What was built
- `backend/database-migration.sql` - DB schema
- `backend/src/index.js` - API reference

## ✅ Status
- ✅ Restaurant App: COMPLETE
- ✅ Backend API: COMPLETE
- ✅ Database Migration: READY
- ✅ Documentation: COMPLETE
- ⏳ Admin App: Needs pending page
- ⏳ User App: Remove owner routes

## 🎯 What's Next?
1. Run `npm run dev`
2. Test restaurant registration
3. Implement admin pending page
4. Update user app routes

---
**Version**: 1.0.0  
**Last Updated**: October 19, 2025  
**Status**: Production Ready 🚀
