# FastFood Project - Running Multiple Apps

## Project Structure
```
FastFood/
├── backend/                 # Node.js + Express + Sequelize
├── frontend/
│   ├── admin/project/      # Admin Dashboard (Vite + React)
│   └── web/                # Customer Web App (Vite + React)
└── package.json            # Root package for running all apps
```

## 🚀 Quick Start

### Option 1: Run Everything at Once (Recommended)

1. **Install concurrently (one-time setup)**:
   ```powershell
   npm install
   ```

2. **Run all apps simultaneously**:
   ```powershell
   npm run dev
   ```
   This starts:
   - Web app (usually port 5173 or 5174)
   - Admin app (usually port 5175 or next available)
   - Backend API (port 5000 or as configured)

3. **Run only frontends**:
   ```powershell
   npm run dev:frontend
   ```

### Option 2: Run Apps Individually

**Web App (Customer-facing):**
```powershell
cd frontend/web
npm run dev
```
Access at: http://localhost:5173 (or shown port)

**Admin App:**
```powershell
cd frontend/admin/project
npm run dev
```
Access at: http://localhost:5174 (or shown port)

**Backend API:**
```powershell
cd backend
npm run dev
```
Access at: http://localhost:5000 (or as configured)

### Option 3: Run Specific Combinations

**Both frontends only:**
```powershell
npm run dev:frontend
```

**Web app only:**
```powershell
npm run dev:web
```

**Admin app only:**
```powershell
npm run dev:admin
```

**Backend only:**
```powershell
npm run dev:backend
```

## 📦 Installation

### Install All Dependencies at Once
```powershell
npm run install:all
```

### Install Per App
```powershell
# Web app
cd frontend/web
npm install

# Admin app
cd frontend/admin/project
npm install

# Backend
cd backend
npm install
```

## 🏗️ Building for Production

**Build all:**
```powershell
npm run build:all
```

**Build individually:**
```powershell
npm run build:web
npm run build:admin
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run all apps (web + admin + backend) |
| `npm run dev:frontend` | Run both frontend apps |
| `npm run dev:web` | Run web app only |
| `npm run dev:admin` | Run admin app only |
| `npm run dev:backend` | Run backend only |
| `npm run install:all` | Install dependencies for all apps |
| `npm run build:all` | Build both frontend apps |
| `npm run build:web` | Build web app |
| `npm run build:admin` | Build admin app |

## 🌐 Default Ports

- **Web App**: http://localhost:5173 (or next available)
- **Admin App**: http://localhost:5174 (or next available)
- **Backend API**: http://localhost:5000

> Note: Vite automatically finds the next available port if the default is in use.

## 🗄️ Database Setup

1. **Create the database** (using the provided schema):
   ```sql
   mysql -u root -p < fastfood-DB.txt
   ```

2. **Configure backend** (`backend/src/config/config.json`):
   ```json
   {
     "development": {
       "username": "your_mysql_username",
       "password": "your_mysql_password",
       "database": "fastfood_poc",
       "host": "127.0.0.1",
       "dialect": "mysql"
     }
   }
   ```

## 🎯 Quick Test

After starting all apps:

1. **Web App**: http://localhost:5173
   - Login with: `demo@example.com` / `password123`
   - Browse restaurants, add items to cart

2. **Admin App**: http://localhost:5174
   - Manage restaurants, menu items, orders

3. **Backend API**: http://localhost:5000
   - Test endpoints: http://localhost:5000/api/health

## 🐛 Troubleshooting

**Port already in use:**
- Vite will automatically try the next port
- Or manually kill the process using the port

**Dependencies not found:**
```powershell
npm run install:all
```

**Different node versions:**
- Make sure you're using Node.js 16+ for all apps

**Backend won't start:**
- Check MySQL is running
- Verify database credentials in `backend/src/config/config.json`

## 📝 Notes

- The `concurrently` package allows running multiple npm scripts in parallel
- Each app runs in its own process with separate output
- Use `Ctrl+C` to stop all running processes
- Logs from all apps appear in the same terminal with prefixes
