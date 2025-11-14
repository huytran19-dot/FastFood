# Hướng dẫn cài đặt Redis trên Windows

## Cách 1: Sử dụng Docker (Khuyến nghị - Dễ nhất)

### Bước 1: Khởi động Docker Desktop
1. Mở Docker Desktop từ Start Menu
2. Đợi Docker Desktop khởi động hoàn toàn (icon Docker ở system tray không còn loading)

### Bước 2: Chạy Redis container
Mở PowerShell hoặc Command Prompt trong thư mục `backend` và chạy:

```bash
# Nếu container chưa tồn tại
docker run -d -p 6379:6379 --name redis-fastfood redis:latest

# Hoặc nếu container đã tồn tại
docker start redis-fastfood
```

### Bước 3: Kiểm tra Redis đang chạy
```bash
docker ps | findstr redis
```

Nếu thấy `redis-fastfood` trong danh sách, Redis đã chạy thành công!

---

## Cách 2: Sử dụng WSL (Windows Subsystem for Linux)

### Bước 1: Mở WSL terminal
```bash
wsl
```

### Bước 2: Cài đặt Redis
```bash
sudo apt-get update
sudo apt-get install -y redis-server
```

### Bước 3: Khởi động Redis
```bash
sudo service redis-server start
```

### Bước 4: Kiểm tra
```bash
redis-cli ping
```
Nếu trả về `PONG`, Redis đã chạy thành công!

---

## Cách 3: Tải Redis cho Windows (Portable)

1. Tải từ: https://github.com/tporadowski/redis/releases
2. Giải nén và chạy `redis-server.exe`
3. Redis sẽ chạy trên port 6379

---

## Kiểm tra kết nối

Sau khi cài đặt, restart backend server và kiểm tra log:
- ✅ `Redis connected` - Thành công!
- ⚠️ `Redis connection failed` - Kiểm tra lại Redis đã chạy chưa

## Lưu ý

Nếu không cài Redis, code vẫn hoạt động bình thường với **Memory Store** (lưu trong RAM).
Dữ liệu sẽ mất khi restart server, nhưng đủ để test và phát triển.

