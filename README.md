# 🍔 FastFood - Hệ thống Giao Đồ Ăn Nhanh bằng Drone

> Nền tảng đặt đồ ăn nhanh hiện đại với tính năng giao hàng bằng drone, tracking real-time và thanh toán VNPay.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 Tổng Quan

**FastFood** là hệ thống đặt đồ ăn nhanh full-stack với 3 ứng dụng chính:

| App | Port | Mô tả | Người dùng |
|-----|------|-------|------------|
| **Web Customer** | 5173 | Đặt món, tracking đơn hàng | Khách hàng |
| **Restaurant Dashboard** | 5175 | Quản lý thực đơn, xử lý đơn | Chủ nhà hàng |
| **Admin Panel** | 5174 | Quản trị hệ thống | Admin |
| **Backend API** | 5000 | RESTful API + Socket.IO | Tất cả |

### 🎯 Điểm Khác Biệt

- ✅ **Giao hàng bằng Drone** - Tự động phân công & tracking real-time
- ✅ **Thanh toán VNPay** - Tích hợp cổng thanh toán chính thức
- ✅ **Real-time Updates** - Socket.IO cho tracking đơn hàng
- ✅ **Map Integration** - Goong.io Maps API (Vietnam)
- ✅ **Email Verification** - SendGrid authentication
- ✅ **Image CDN** - Cloudinary upload & delivery
- ✅ **Fallback Cache** - Redis + In-memory store

---

## ✨ Tính Năng Nổi Bật

### 👤 Web Customer (Khách Hàng)

#### Authentication & Profile
- 📧 Đăng ký với xác thực email (SendGrid)
- 🔐 Đăng nhập với JWT token (7 days)
- 🔑 Reset password qua email
- 👤 Quản lý thông tin cá nhân

#### Shopping Experience
- 🔍 Tìm kiếm nhà hàng gần nhất (Geolocation + Haversine)
- 📱 Xem thực đơn theo danh mục
- 🛒 Thêm món vào giỏ hàng
- 💰 Tính tổng tự động, áp dụng khuyến mãi

#### Order & Payment
- 📦 Tạo đơn hàng với địa chỉ giao hàng
- 💳 Thanh toán VNPay (ATM/QR/Visa)
- 📜 Lịch sử đơn hàng với filter
- 🚁 Tracking drone real-time trên map

#### Delivery Tracking
- 🗺️ Xem drone bay trên Leaflet map
- 📍 Cập nhật vị trí mỗi 1 giây
- ⚡ Progress bar + ETA countdown
- 🔋 Hiển thị mức pin drone

---

### 🍔 Restaurant Dashboard (Nhà Hàng)

#### Restaurant Management
- 🏪 Đăng ký nhà hàng (chờ admin duyệt)
- 📸 Upload logo nhà hàng (Cloudinary)
- 🗺️ Đặt vị trí trên map (Goong API)
- ⏰ Cấu hình giờ mở cửa

#### Menu Management
- 📋 Tạo danh mục thực đơn
- 🍕 Thêm/Sửa/Xóa món ăn
- 🖼️ Upload ảnh món ăn (max 5MB)
- 💵 Cập nhật giá & tồn kho
- 🔄 Bật/Tắt món ăn

#### Order Processing
- 🔔 Nhận thông báo đơn mới (Socket.IO)
- ✅ Accept/Reject đơn hàng
- 👨‍🍳 Cập nhật trạng thái nấu ăn
- 📊 Thống kê doanh thu theo ngày/tháng

#### Delivery Management
- 🚁 Xem danh sách drone khả dụng
- 🎯 Phân công đơn hàng cho drone
- ▶️ Bắt đầu giao hàng (simulation)
- 📡 Theo dõi drone real-time
- 🏁 Xác nhận giao hàng thành công

---

### 👨‍💼 Admin Panel (Quản Trị)

#### User Management
- 👥 Danh sách người dùng + phân quyền
- 🚫 Suspend/Activate tài khoản
- 📊 Thống kê user mới theo ngày

#### Restaurant Approval
- 🏪 Duyệt/Từ chối nhà hàng mới
- ✍️ Ghi chú lý do reject
- 📧 Gửi email thông báo kết quả
- 📈 Dashboard nhà hàng đang hoạt động

#### Order Monitoring
- 📦 Xem tất cả đơn hàng
- 🔍 Filter theo trạng thái/ngày
- 💰 Thống kê doanh thu tổng
- 🚁 Giám sát drone hoạt động

#### System Settings
- ⚙️ Cấu hình hệ thống
- 📊 View logs & analytics
- 🗄️ Database backup


---


---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express.js** | 4.18 | Web framework |
| **Sequelize** | 6.35 | ORM for MySQL |
| **MySQL** | 8.0 | Primary database |
| **Redis** | 7.0 | Cache (optional) |
| **Socket.IO** | 4.6 | Real-time communication |
| **JWT** | 9.0 | Authentication |
| **bcryptjs** | 2.4 | Password hashing |
| **Multer** | 1.4 | File upload middleware |
| **Nodemailer** | 6.9 | Email sending |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3 | UI framework |
| **Vite** | 5.0 | Build tool |
| **React Router** | 6.21 | Routing |
| **Tailwind CSS** | 3.4 | Styling |
| **Radix UI** | 1.0 | Component library |
| **Leaflet** | 1.9 | Map rendering |
| **Socket.IO Client** | 4.6 | Real-time client |
| **React Query** | 5.0 | Data fetching |
| **Zustand** | 4.5 | State management |

### External Services

| Service | Purpose | Config Required |
|---------|---------|-----------------|
| **VNPay** | Payment gateway | TMN_CODE, HASH_SECRET |
| **SendGrid** | Email delivery | API_KEY, FROM_EMAIL |
| **Cloudinary** | Image CDN | CLOUD_NAME, API_KEY, SECRET |
| **Goong.io** | Vietnam maps | API_KEY |

---

### Phần Mềm

```
✅ Node.js 18.0.0 trở lên
✅ MySQL 8.0 trở lên
✅ npm 9.0+ hoặc yarn 1.22+
✅ Git 2.30+
⚪ Redis 7.0+ (optional, fallback to memory)
```

---

## 📦 Cài Đặt

### 1. Clone Repository

```bash
git clone https://github.com/huytran19-dot/FastFood.git
cd FastFood
```

### 2. Cài Đặt Backend

```bash
cd backend
npm install
```

**Danh sách dependencies chính:**
```json
{
  "express": "^4.18.2",
  "sequelize": "^6.35.2",
  "mysql2": "^3.6.5",
  "socket.io": "^4.6.0",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "multer": "^1.4.5-lts.1",
  "cloudinary": "^1.41.0",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5"
}
```

### 3. Cài Đặt Frontend Apps

```bash
# Web Customer
cd frontend/web
npm install

# Restaurant Dashboard
cd ../restaurant
npm install

# Admin Panel
cd ../admin/project
npm install
```

---

## ⚙️ Cấu Hình

### 1. Tạo File `.env` trong Backend

```bash
cd backend
copy .env.example .env
# Hoặc trên Linux/Mac: cp .env.example .env
```


### 3. Khởi Tạo Database

```bash
# Import database
mysql -u root -p fastfood < fastfood-DB.txt
```

---

## 🚀 Khởi Chạy

### Development Mode

Mở **4 terminal** và chạy:

```bash
# Terminal 1: Backend API
cd backend
npm run dev
# ✅ Server running on http://localhost:5000

# Terminal 2: Web Customer
cd frontend/web
npm run dev
# ✅ Customer app: http://localhost:5173

# Terminal 3: Restaurant Dashboard
cd frontend/restaurant
npm run dev
# ✅ Restaurant app: http://localhost:5175

# Terminal 4: Admin Panel
cd frontend/admin/project
npm run dev
# ✅ Admin app: http://localhost:5174
```

### Production Build

```bash
# Build Frontend Apps
cd frontend/web
npm run build

cd ../restaurant
npm run build

cd ../admin/project
npm run build

# Start Backend
cd ../../../backend
npm start
```

---



## 🐛 Troubleshooting

### Common Issues

#### "Cannot connect to MySQL"
```bash
# Check MySQL is running
mysql -u root -p

# Verify .env configs
DB_HOST=127.0.0.1
DB_PORT=3307
```

#### "Redis connection refused"
```
⚠️ Redis is optional - app auto-fallback to memory store
```

#### "CORS blocked"
```bash
# Backend .env must include frontend origins
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

---

<div align="center">

[⬆ Back to top](#-fastfood---hệ-thống-giao-đồ-ăn-nhanh-bằng-drone)

</div>
