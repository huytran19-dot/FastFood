# ✅ Both Frontend Apps Are Running!

## Current Status

### Admin App
- **URL**: http://localhost:5173/
- **Status**: ✅ Running
- **Location**: `frontend/admin/project/`

### Web App (Customer)
- **URL**: http://localhost:5174/
- **Status**: ✅ Running
- **Location**: `frontend/web/`

## How It Was Started
```powershell
npm run dev:frontend
```

This command uses `concurrently` to run both apps simultaneously in one terminal.

## Stop Both Apps
Press `Ctrl+C` in the terminal

## Logs
- `[0]` prefix = Web app logs
- `[1]` prefix = Admin app logs

## Quick Access Links

### Admin Dashboard
🔗 http://localhost:5173/
- Manage restaurants
- View orders
- Admin operations

### Customer Web App
🔗 http://localhost:5174/
- Browse restaurants
- Order food
- Track deliveries

**Demo Login:**
- Email: `demo@example.com`
- Password: `password123`

## Alternative: Run Separately

If you prefer separate terminals:

**Terminal 1:**
```powershell
cd frontend/web
npm run dev
```

**Terminal 2:**
```powershell
cd frontend/admin/project
npm run dev
```

## Add Backend

To also run the backend API:
```powershell
# Stop current apps (Ctrl+C), then:
npm run dev
```

This will start all three:
- Web app
- Admin app  
- Backend API
