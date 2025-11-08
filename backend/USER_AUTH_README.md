# User Authentication with Email Verification

## Tổng quan
Hệ thống đăng ký và đăng nhập người dùng với xác thực email sử dụng SendGrid.

## Các tính năng
- ✅ Đăng ký user với email verification
- ✅ Gửi email xác thực qua SendGrid
- ✅ Xác thực email qua token
- ✅ Đăng nhập chỉ cho user đã xác thực email
- ✅ Gửi lại email xác thực
- ✅ Mã hóa mật khẩu với bcrypt
- ✅ JWT token cho authentication

## Migration Database

Chạy migration để thêm các cột email verification vào bảng users:

```sql
-- Chạy file: backend/migrations/add_email_verification_to_users.sql
mysql -u root -p fastfood < backend/migrations/add_email_verification_to_users.sql
```

Hoặc chạy trực tiếp trong MySQL:

```sql
ALTER TABLE `users`
ADD COLUMN `email_verified` TINYINT(1) NOT NULL DEFAULT 0,
ADD COLUMN `email_verification_token` VARCHAR(255) NULL,
ADD COLUMN `email_verification_expires_at` DATETIME NULL,
ADD INDEX `idx_email_verification_token` (`email_verification_token`);
```

## Cấu hình

### 1. Cài đặt package
```bash
npm install @sendgrid/mail bcrypt jsonwebtoken
```

### 2. Cấu hình SendGrid

Lấy API Key từ SendGrid:
1. Đăng ký tài khoản tại https://sendgrid.com/
2. Tạo API Key tại Settings > API Keys
3. Copy API Key và thêm vào file `.env`

### 3. Cập nhật .env
```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@fastfood.vn

# Application URL (for email verification links)
APP_URL=http://localhost:5173

# JWT Secret
JWT_SECRET=your-super-secret-key-change-in-production
```

## API Endpoints

### 1. Đăng ký user (POST /api/auth/register)

**Request:**
```json
{
  "full_name": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0901234567",
  "password": "123456"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
  "data": {
    "id": 1,
    "full_name": "Nguyễn Văn A",
    "email": "user@example.com",
    "phone": "0901234567"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Email đã được sử dụng"
}
```

---

### 2. Xác thực email (GET /api/auth/verify-email?token=xxx)

**Request:**
```
GET /api/auth/verify-email?token=abc123def456...
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Email đã được xác thực thành công. Bạn có thể đăng nhập ngay bây giờ.",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "email_verified": true
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Token xác thực không hợp lệ"
}
```

hoặc

```json
{
  "success": false,
  "message": "Token xác thực đã hết hạn"
}
```

---

### 3. Đăng nhập user (POST /api/auth/user/login)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "full_name": "Nguyễn Văn A",
      "email": "user@example.com",
      "phone": "0901234567"
    }
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "message": "Vui lòng xác thực email trước khi đăng nhập"
}
```

hoặc

```json
{
  "success": false,
  "message": "Email hoặc mật khẩu không đúng"
}
```

---

### 4. Gửi lại email xác thực (POST /api/auth/resend-verification)

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Email xác thực đã được gửi lại"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Email đã được xác thực"
}
```

## Luồng hoạt động

1. **Đăng ký:**
   - User gửi thông tin đăng ký
   - Server tạo user với `email_verified = 0`
   - Server sinh token ngẫu nhiên (32 bytes)
   - Server gửi email chứa link xác thực
   - Token có hiệu lực 24 giờ

2. **Xác thực email:**
   - User click vào link trong email
   - Server kiểm tra token
   - Server cập nhật `email_verified = 1`
   - Xóa token và expiration time

3. **Đăng nhập:**
   - User gửi email + password
   - Server kiểm tra `email_verified = 1`
   - Nếu chưa verify → trả lỗi
   - Nếu đã verify → kiểm tra password → trả JWT token

## Testing

### Test với Postman/Thunder Client

1. **Đăng ký user mới:**
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "full_name": "Test User",
  "email": "test@example.com",
  "phone": "0901234567",
  "password": "123456"
}
```

2. **Kiểm tra email:**
   - Mở email đã đăng ký
   - Click vào link xác thực hoặc copy token từ database

3. **Xác thực email:**
```bash
GET http://localhost:5000/api/auth/verify-email?token=YOUR_TOKEN_HERE
```

4. **Đăng nhập:**
```bash
POST http://localhost:5000/api/auth/user/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456"
}
```

## Lưu ý

- ⚠️ **QUAN TRỌNG:** Chức năng này chỉ dành cho **USER**, không áp dụng cho **ADMIN** và **RESTAURANT OWNER**
- Token xác thực có hiệu lực **24 giờ**
- Mật khẩu tối thiểu **6 ký tự**
- JWT token có hiệu lực **7 ngày**
- Email verification token được hash bằng **crypto.randomBytes(32)**
- Mật khẩu được mã hóa bằng **bcrypt** với salt rounds = 10

## Xử lý lỗi

### SendGrid errors
Nếu SendGrid API key không hợp lệ hoặc email gửi thất bại, server vẫn tạo user nhưng log error. User có thể dùng `/api/auth/resend-verification` để gửi lại email.

### Token expired
Nếu token hết hạn, user phải dùng `/api/auth/resend-verification` để nhận token mới.

## Files đã tạo/sửa

1. **Migration:** `backend/migrations/add_email_verification_to_users.sql`
2. **Model:** `backend/src/models/users.js` (cập nhật)
3. **Service:** `backend/src/services/emailService.js` (mới)
4. **Service:** `backend/src/services/userAuthService.js` (mới)
5. **Controller:** `backend/src/controllers/userAuthController.js` (mới)
6. **Routes:** `backend/src/routes/authRoutes.js` (cập nhật)
7. **Config:** `backend/.env` (cập nhật)
