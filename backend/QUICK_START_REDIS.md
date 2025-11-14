# 🚀 Hướng dẫn nhanh: Khởi động Redis

## Bước 1: Khởi động Docker Desktop
1. Mở **Docker Desktop** từ Start Menu
2. Đợi Docker Desktop khởi động hoàn toàn (icon Docker ở system tray)

## Bước 2: Chạy script
Double-click vào file: **`start-redis-simple.bat`**

Hoặc chạy trong terminal:
```bash
cd backend
start-redis-simple.bat
```

## Bước 3: Kiểm tra
Script sẽ tự động kiểm tra kết nối Redis.

Nếu thấy:
- ✅ `Redis connected successfully!` → Redis đã sẵn sàng!
- ❌ `Redis connection failed` → Kiểm tra Docker Desktop đã chạy chưa

## Lưu ý
- Nếu không cài Redis, code vẫn hoạt động với **Memory Store**
- Dữ liệu sẽ mất khi restart server, nhưng đủ để test

