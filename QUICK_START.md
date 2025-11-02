# FastFood - Quick Reference

## 🚀 Quick Start (3 Steps)

### 1. Setup Database
```powershell
mysql -u root -p food < backend/database-migration.sql
mysql -u root -p food < backend/demo-accounts.sql
```

### 2. Start All Apps
```powershell
npm run dev
```

### 3. Access Applications
- **User App**: http://localhost:5173 (customers)
- **Admin App**: http://localhost:5174 (admin panel)
- **Restaurant App**: http://localhost:5175 (restaurant owners)
- **Backend API**: http://localhost:5000

---

## 🧪 Demo Accounts

### 👨‍💼 Admin
```
URL: http://localhost:5174/login
Email: admin@fastfood.com
Password: admin123
Purpose: Approve/reject restaurants
```

### 🍽️ Restaurant Owners

**Owner 1 - APPROVED** (full access):
```
URL: http://localhost:5175/login
Email: owner@demo.com
Password: owner123
Restaurant: Cơm Tấm Sài Gòn Demo
Status: ✅ Can access dashboard
```

**Owner 2 - PENDING** (waiting approval):
```
URL: http://localhost:5175/login
Email: owner2@demo.com
Password: owner123
Restaurant: Phở Hà Nội Authentic
Status: ⏳ Sees pending page
```

**Owner 3 - REJECTED** (with reason):
```
URL: http://localhost:5175/login
Email: owner3@demo.com
Password: owner123
Restaurant: Bánh Mì Không Đạt
Status: ❌ Sees rejection reason
```

### 👤 Customer
```
URL: http://localhost:5173/login
Email: user@demo.com
Password: user123
Purpose: Browse approved restaurants
```

---

## 📚 Documentation

- **TESTING_GUIDE.md** - Complete testing scenarios & checklist
- **SETUP_GUIDE.md** - Full setup instructions
- **RESTAURANT_APP_GUIDE.md** - Restaurant app documentation
- **IMPLEMENTATION_SUMMARY.md** - What was built

---

## 🛑 Stop All Apps
Press `Ctrl+C` in the terminal where you ran `npm run dev`
