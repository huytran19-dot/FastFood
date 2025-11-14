# Hướng dẫn chạy Redis cho FastFood Project

## Redis là gì?

Redis là một cơ sở dữ liệu lưu trữ trong bộ nhớ (in-memory database) được sử dụng để cache dữ liệu, giúp ứng dụng chạy nhanh hơn. Trong project này, Redis được dùng để lưu trữ session và cache.

---

## Cách 1: Sử dụng Docker (Khuyến nghị - Dễ nhất) ⭐

### Bước 1: Cài đặt Docker Desktop

1. Tải Docker Desktop từ: https://www.docker.com/products/docker-desktop
2. Cài đặt và khởi động Docker Desktop
3. Đợi Docker Desktop chạy hoàn toàn (icon Docker ở system tray phải xanh)

### Bước 2: Chạy Redis bằng script tự động

Bạn có 3 cách để chạy Redis:

#### Cách A: Sử dụng script đơn giản (Khuyến nghị)
```bash
# Chạy file này trong thư mục backend
start-redis-simple.bat
```

#### Cách B: Sử dụng script PowerShell
```powershell
# Mở PowerShell và chạy:
.\start-redis.ps1
```

#### Cách C: Sử dụng script batch đầy đủ
```bash
start-redis.bat
```

### Bước 3: Kiểm tra Redis đã chạy chưa

Sau khi chạy script, bạn sẽ thấy thông báo:
- ✅ **SUCCESS**: Redis is now running!
- 🔗 Connection: localhost:6379

### Bước 4: Kiểm tra bằng script Node.js

```bash
# Chạy trong thư mục backend
node check-redis.js
```

Nếu thấy:
- ✅ Redis connected successfully!
- ✅ Redis read/write test: PASSED

→ **Redis đã sẵn sàng sử dụng!**

---

## Cách 2: Chạy Redis thủ công bằng Docker

Nếu không muốn dùng script, bạn có thể chạy lệnh trực tiếp:

### Tạo và chạy Redis container lần đầu:

```bash
docker run -d -p 6379:6379 --name redis-fastfood redis:latest
```

### Khởi động lại Redis (nếu đã tạo container trước đó):

```bash
docker start redis-fastfood
```

### Kiểm tra Redis đang chạy:

```bash
docker ps | findstr redis
```

Nếu thấy container `redis-fastfood` trong danh sách → Redis đang chạy!

### Dừng Redis:

```bash
docker stop redis-fastfood
```

### Xóa Redis container (nếu cần):

```bash
docker stop redis-fastfood
docker rm redis-fastfood
```

---

## Cách 3: Cài đặt Redis trực tiếp trên Windows

### Tùy chọn A: Sử dụng WSL (Windows Subsystem for Linux)

1. Cài đặt WSL từ Microsoft Store
2. Mở WSL terminal và chạy:
```bash
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

### Tùy chọn B: Tải Redis for Windows

1. Tải từ: https://github.com/microsoftarchive/redis/releases
2. Giải nén file zip
3. Chạy `redis-server.exe` trong thư mục vừa giải nén

⚠️ **Lưu ý**: Redis for Windows không được cập nhật thường xuyên, nên khuyến nghị dùng Docker.

---

## Cách 4: Không cài Redis (Fallback Mode)

Nếu bạn không muốn cài Redis, code đã được cấu hình để tự động sử dụng **memory store** (lưu trữ trong RAM của Node.js).

⚠️ **Hạn chế**: 
- Dữ liệu sẽ mất khi restart server
- Không phù hợp cho production
- Chỉ nên dùng để test nhanh

---

## Kiểm tra Redis trong Backend Server

Sau khi chạy Redis, khởi động lại backend server và kiểm tra log:

### ✅ Redis đã kết nối thành công:
```
Redis connected
```

### ⚠️ Redis chưa chạy (sẽ dùng memory store):
```
Redis connection failed: connect ECONNREFUSED 127.0.0.1:6379
Using memory store as fallback
```

---

## Troubleshooting (Xử lý lỗi)

### Lỗi: "Docker is not installed or not in PATH"
**Giải pháp**: 
- Cài đặt Docker Desktop
- Đảm bảo Docker Desktop đang chạy (icon ở system tray)

### Lỗi: "Cannot connect to Docker daemon"
**Giải pháp**:
- Khởi động lại Docker Desktop
- Đợi Docker Desktop khởi động hoàn toàn (30-60 giây)

### Lỗi: "Port 6379 is already in use"
**Giải pháp**:
- Kiểm tra xem có Redis khác đang chạy không:
  ```bash
  docker ps | findstr redis
  ```
- Hoặc dừng process đang dùng port 6379

### Lỗi: "Redis connection failed"
**Giải pháp**:
1. Kiểm tra Redis container có đang chạy:
   ```bash
   docker ps | findstr redis-fastfood
   ```
2. Nếu không thấy, khởi động lại:
   ```bash
   docker start redis-fastfood
   ```
3. Nếu container không tồn tại, tạo mới:
   ```bash
   docker run -d -p 6379:6379 --name redis-fastfood redis:latest
   ```

---

## Tóm tắt nhanh (Quick Start)

1. ✅ Cài Docker Desktop
2. ✅ Chạy `start-redis-simple.bat`
3. ✅ Chạy `node check-redis.js` để kiểm tra
4. ✅ Khởi động lại backend server

**Xong! Redis đã sẵn sàng! 🎉**

---

## Thông tin kết nối

- **Host**: localhost (hoặc 127.0.0.1)
- **Port**: 6379
- **Container name**: redis-fastfood
- **Image**: redis:latest

---

## Lệnh hữu ích

```bash
# Xem tất cả container (kể cả đã dừng)
docker ps -a

# Xem log của Redis container
docker logs redis-fastfood

# Vào trong Redis container
docker exec -it redis-fastfood redis-cli

# Test Redis từ command line
docker exec -it redis-fastfood redis-cli ping
# Kết quả: PONG → Redis đang hoạt động tốt
```
