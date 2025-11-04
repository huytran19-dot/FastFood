# Database Configuration

## Setup Instructions

Các file cấu hình database đã được thêm vào `.gitignore` để tránh xung đột giữa các developers.

### Các bước setup:

1. **Copy các file example và đổi tên:**
   ```bash
   cd backend/src/config
   cp config.json.example config.json
   cp config.js.example config.js
   cp db.js.example db.js
   ```

2. **Cập nhật thông tin database của bạn:**
   
   Trong `config.json`:
   ```json
   {
     "development": {
       "username": "your_username",
       "password": "your_password",
       "database": "fastfood",
       "host": "127.0.0.1",
       "port": 3306,
       "dialect": "mysql"
     }
   }
   ```

   Trong `config.js`:
   ```javascript
   module.exports = {
     HOST: "127.0.0.1",
     PORT: 3306,  // hoặc 3307 nếu dùng Docker
     USER: "your_username",
     PASSWORD: "your_password",
     DB: "fastfood",
     dialect: "mysql"
   };
   ```

   Trong `db.js`:
   ```javascript
   const sequelize = new Sequelize('fastfood', 'your_username', 'your_password', {
     host: '127.0.0.1',
     port: 3306,
     dialect: 'mysql'
   });
   ```

3. **mailConfig.js** đã sử dụng environment variables, không cần copy.
   Đảm bảo file `.env` có các biến:
   ```
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_email
   SMTP_PASS=your_password
   ```

## Notes

- ⚠️ **KHÔNG commit** các file `config.json`, `config.js`, `db.js` vào git
- ✅ **CHỈ commit** các file `.example`
- 🔐 Thông tin database nhạy cảm nên lưu trong `.env` hoặc file config local
