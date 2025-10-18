# FastFood - Quick Reference

## Start Both Frontend Apps

### Method 1: Single Command (Recommended)
```powershell
# From project root
npm run dev:frontend
```

### Method 2: Separate Terminals
**Terminal 1 - Web App:**
```powershell
cd frontend/web
npm run dev
```

**Terminal 2 - Admin App:**
```powershell
cd frontend/admin/project
npm run dev
```

## Start Everything (Frontend + Backend)
```powershell
npm run dev
```

## Access the Apps
- **Web App**: http://localhost:5173 (customer-facing)
- **Admin App**: http://localhost:5174 (admin dashboard)
- **Backend**: http://localhost:5000 (API)

## Demo Login (Web App)
- Email: `demo@example.com`
- Password: `password123`

## Stop All Apps
Press `Ctrl+C` in the terminal where you ran `npm run dev`
