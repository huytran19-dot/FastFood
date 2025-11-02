# 🍔 FastFood - Multi-App Restaurant System

A complete food delivery platform with separated apps for customers, restaurant owners, and administrators.

## 🏗️ Architecture

This system consists of **three separate applications**:

1. **User App** (Port 5173) - Customer-facing app for browsing and ordering
2. **Restaurant App** (Port 5175) - Restaurant owner management dashboard
3. **Admin App** (Port 5174) - Admin panel for approving restaurants

## 🚀 Quick Start

### 1. Setup Database
```bash
cd backend
mysql -u root -p food < database-migration.sql
mysql -u root -p food < demo-accounts.sql
cd ..
```

### 2. Start All Apps
```bash
npm run dev
```

### 3. Access Apps
- User App: http://localhost:5173
- Admin App: http://localhost:5174
- Restaurant App: http://localhost:5175
- API: http://localhost:5000

### 4. Login with Demo Accounts
- **Admin**: admin@fastfood.com / admin123
- **Owner (Approved)**: owner@demo.com / owner123
- **Owner (Pending)**: owner2@demo.com / owner123
- **Owner (Rejected)**: owner3@demo.com / owner123
- **Customer**: user@demo.com / user123

## 📚 Documentation

### Getting Started
- **[NEXT_STEPS.md](NEXT_STEPS.md)** - ⭐ START HERE! Complete guide for what to do next
- **[QUICK_START.md](QUICK_START.md)** - Quick commands & demo accounts reference

### Testing & Validation
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Complete testing scenarios (8 scenarios, API tests, checklist)
- **[DATABASE_QUERIES.md](DATABASE_QUERIES.md)** - SQL queries for debugging & development

### Implementation Details
- **[RESTAURANT_APP_GUIDE.md](RESTAURANT_APP_GUIDE.md)** - Restaurant app documentation
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Full setup instructions
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - What was built

## ✨ Features

### Restaurant Owner Flow
1. Register account → role='owner'
2. Register restaurant → status='PENDING'
3. Wait for admin approval
4. Access dashboard when approved

### Smart Routing Guards
- **PENDING**: Owner sees waiting page, cannot access dashboard
- **REJECTED**: Owner sees rejection reason with details
- **APPROVED**: Owner gets full dashboard access

### Admin Approval System
- View all pending restaurants
- Approve with one click
- Reject with reason
- Automatic notifications

## 🛠️ Tech Stack

### Frontend
- React 18.3.1
- Vite 5.4.11
- Tailwind CSS 3.4.17
- React Router 6.28.0
- Radix UI Components

### Backend
- Express 5.1.0
- Sequelize 6.37.7
- MySQL2
- JWT Authentication
- bcryptjs

## 📂 Project Structure

```
FastFood/
├── frontend/
│   ├── web/          # User App (5173)
│   ├── restaurant/   # Restaurant App (5175)
│   └── admin/        # Admin App (5174)
├── backend/
│   ├── src/
│   │   ├── index.js           # Express server
│   │   ├── models/            # Sequelize models
│   │   └── controllers/       # Route controllers
│   ├── database-migration.sql # Schema + admin
│   └── demo-accounts.sql      # Test accounts
└── docs/                      # All .md files
```

## 🎯 Next Development Tasks

### ✅ Completed: User App Cleanup
User app has been cleaned up and now only contains customer features. All restaurant owner features have been moved to the separate restaurant app. See **[USER_APP_CLEANUP.md](USER_APP_CLEANUP.md)** for details.

### Priority 1: Admin Pending Restaurants Page
Create `/restaurants/pending` page in admin app with approve/reject functionality.

### Priority 2: User App Restaurant List
Show only approved restaurants to customers with filtering/search.

### Priority 3: Connect Frontend to Backend API
Update all three apps to use real backend API instead of localStorage mock data.

See **[NEXT_STEPS.md](NEXT_STEPS.md)** for detailed implementation guide.

## 🐛 Troubleshooting

### "Cannot connect to database"
```bash
mysql -u root -p
USE food;
SHOW TABLES;
```

### "Token invalid"
```javascript
// In browser console
localStorage.clear();
```

### "Port already in use"
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

See **[TESTING_GUIDE.md](TESTING_GUIDE.md)** for more solutions.

## 📊 Demo Accounts Summary

| Role | Email | Password | Status | Purpose |
|------|-------|----------|--------|---------|
| Admin | admin@fastfood.com | admin123 | - | Approve/reject restaurants |
| Owner | owner@demo.com | owner123 | ✅ APPROVED | Full dashboard access |
| Owner | owner2@demo.com | owner123 | ⏳ PENDING | Waiting for approval |
| Owner | owner3@demo.com | owner123 | ❌ REJECTED | See rejection reason |
| Customer | user@demo.com | user123 | - | Browse restaurants |

## 🎓 Key Concepts

### Role-Based Authentication
- `user` - Customers (browse & order)
- `owner` - Restaurant owners (manage restaurant)
- `admin` - Administrators (approve restaurants)

### Restaurant Review Status
- `PENDING` - Waiting for admin approval
- `APPROVED` - Active, visible to customers
- `REJECTED` - Not approved, reason provided

### API Endpoints
- `/api/auth/*` - Authentication (login, signup)
- `/api/restaurants/*` - Restaurant CRUD (owner only)
- `/api/admin/restaurants/*` - Approve/reject (admin only)
- `/api/public/restaurants` - List approved (public)

## 📝 Contributing

When making changes:
1. Test with all 5 demo accounts
2. Run full testing checklist
3. Verify database consistency
4. Update relevant documentation

## 📄 License

MIT

---

**Ready to start?** → Read **[NEXT_STEPS.md](NEXT_STEPS.md)** now!