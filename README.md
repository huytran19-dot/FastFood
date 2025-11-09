# FastFood - Hệ thống đặt đồ ăn nhanh

Hệ thống quản lý đồ ăn nhanh với 3 ứng dụng: Web người dùng, Dashboard nhà hàng và Admin panel.

## 📁 Cấu trúc dự án

```
FastFood/
├── backend/                 # Node.js + Express + Sequelize + MySQL
│   ├── src/
│   │   ├── routes/         # Định nghĩa API endpoints
│   │   ├── controllers/    # Xử lý request/response
│   │   ├── services/       # Business logic
│   │   ├── models/         # Sequelize models
│   │   └── config/         # Cấu hình DB, email
│   └── .env                # Biến môi trường
│
└── frontend/
    ├── web/                # App người dùng (port 5173)
    ├── restaurant/         # Dashboard nhà hàng (port 5175)
    └── admin/project/      # Admin panel (port 5174)
```

## 🚀 Khởi chạy dự án

### Yêu cầu
- Node.js 16+
- MySQL 8.0+
- npm 

### Bước 1: Cài đặt dependencies

```bash
# Backend
cd backend
npm install

# Frontend Web
cd frontend/web
npm install

# Frontend Restaurant
cd frontend/restaurant
npm install

# Frontend Admin
cd frontend/admin/project
npm install
```

### Bước 2: Cấu hình môi trường

Tạo file `backend/.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=3307
DB_NAME=fastfood
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# SendGrid Email
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Cloudinary (Upload ảnh)
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret

# Server
PORT=5000
```

### Bước 3: Khởi tạo database

```bash
# Import schema từ fastfood-DB.txt vào MySQL
mysql -u root -p fastfood < fastfood-DB.txt
```

### Bước 4: Chạy ứng dụng

```bash
# Terminal 1 - Backend (port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend Web (port 5173)
cd frontend/web
npm run dev

# Terminal 3 - Frontend Restaurant (port 5175)
cd frontend/restaurant
npm run dev

# Terminal 4 - Frontend Admin (port 5174)
cd frontend/admin/project
npm run dev
```

## � Tính năng chính

### 👤 Web người dùng
- Đăng ký/Đăng nhập với xác thực email
- Xem thực đơn và đặt món
- Theo dõi đơn hàng
- Quản lý thông tin cá nhân

### 🍔 Dashboard nhà hàng
- Đăng ký nhà hàng (chờ admin duyệt)
- Quản lý thực đơn
- Xử lý đơn hàng
- Theo dõi giao hàng

### 👨‍💼 Admin panel
- Quản lý người dùng
- Duyệt/Từ chối nhà hàng
- Giám sát hệ thống

## 📚 API Routes

### User Authentication
- `POST /api/auth/register` - Đăng ký người dùng
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/verify-email/:token` - Xác thực email

### Restaurant Authentication
- `POST /api/restaurant-auth/register` - Đăng ký nhà hàng
- `POST /api/restaurant-auth/login` - Đăng nhập nhà hàng

### Admin Authentication
- `POST /api/admin-auth/login` - Đăng nhập admin
- `GET /api/admin-auth/users` - Danh sách users
- `GET /api/admin-auth/restaurants` - Danh sách nhà hàng
- `PUT /api/admin-auth/restaurants/:id/review` - Duyệt nhà hàng

### Upload
- `POST /api/upload` - Upload ảnh lên Cloudinary

## � Tech Stack

### Backend
- **Framework**: Express.js
- **ORM**: Sequelize
- **Database**: MySQL
- **Auth**: bcryptjs + JWT
- **Email**: SendGrid
- **Upload**: Cloudinary

### Frontend
- **Framework**: React 18
- **Build**: Vite 5
- **UI**: Tailwind CSS + Radix UI
- **Routing**: React Router
- **State**: Context API

## � Database Schema

Các bảng chính:
- `users` - Người dùng (email_verified, role_id)
- `restaurants` - Nhà hàng (review_status: PENDING/APPROVED/REJECTED)
- `roles` - Phân quyền (admin/restaurant/user)
- `menu_items` - Thực đơn
- `orders` - Đơn hàng
- `order_items` - Chi tiết đơn hàng
- `deliveries` - Giao hàng
- `drones` - Drone giao hàng
- `payments` - Thanh toán

## 🔧 Cấu hình quan trọng

### Email Verification
- Chỉ áp dụng cho user đăng ký
- Token hết hạn sau 24 giờ
- Gửi qua SendGrid

### Restaurant Approval
- Trạng thái mặc định: PENDING
- Admin có thể APPROVED/REJECTED
- Chỉ nhà hàng được duyệt mới truy cập dashboard

### Upload Images
- Sử dụng Cloudinary
- Cần cấu hình credentials trong .env
- Hỗ trợ jpg, png, jpeg

## 🐛 Debugging

### Backend không khởi động
- Kiểm tra MySQL đã chạy chưa
- Xem file .env có đầy đủ không
- Check log trong terminal

### Frontend không kết nối API
- Backend phải chạy trước (port 5000)
- Kiểm tra CORS settings
- Xem DevTools Console

### Email không gửi được
- Verify SENDGRID_API_KEY
- Check spam folder
- Xem log backend

## 📄 License

MIT
