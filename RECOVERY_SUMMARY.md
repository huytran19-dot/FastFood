# 🔧 Tóm tắt Khôi phục Các Thay đổi

## Ngày: 2025-11-04

Các file đã được khôi phục sau khi bị skip:

---

## 🔐 1. Backend - JWT Token Format Fix

### File: `backend/src/services/adminAuthServices.js`

**Vấn đề**: Admin login tạo token với format `{id, email, role}` nhưng authMiddleware yêu cầu `{userId, roleId}`

**Giải pháp**: Thay đổi token format để match với authMiddleware

```javascript
// OLD (SAI):
const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role.name },
  SECRET_KEY,
  { expiresIn: '8h' }
);

// NEW (ĐÚNG):
const token = jwt.sign(
  { userId: user.id, roleId: user.role_id, role: user.role.name },
  SECRET_KEY,
  { expiresIn: '7d' }
);
```

---

## 📡 2. Backend - Admin API Endpoints

### File: `backend/src/index.js`

**Thêm mới**:

### GET /api/admin/users
- Trả về danh sách users với role info
- Format: `{user_id, full_name, email, phone, role, created_at, updated_at}`
- Bắt buộc: authMiddleware + roleMiddleware(['admin'])

### GET /api/admin/restaurants  
- Trả về danh sách restaurants với owner info (manually joined)
- Format: `{restaurant_id, owner_id, name, phone, address, city, review_status, reject_reason, owner: {...}}`
- Bắt buộc: authMiddleware + roleMiddleware(['admin'])

### PUT /api/admin/restaurants/:id/approve
- Thay đổi từ POST → PUT
- Duyệt nhà hàng

### PUT /api/admin/restaurants/:id/reject
- Thay đổi từ POST → PUT
- Từ chối nhà hàng với lý do

---

## 🌐 3. Frontend Admin - API Client

### File: `frontend/admin/project/src/api/admin.js`

**Thêm helper function**:

```javascript
function getAuthToken() {
  // Check localStorage first
  const localToken = localStorage.getItem('token');
  if (localToken) return localToken;
  
  // Check sessionStorage
  const sessionAuth = sessionStorage.getItem('auth');
  if (sessionAuth) {
    const auth = JSON.parse(sessionAuth);
    return auth.token;
  }
  
  return null;
}
```

**Cập nhật tất cả API calls** để gửi Authorization header:

- `getUsers()`
- `getRestaurants()`
- `approveRestaurant()`
- `rejectRestaurant()`

```javascript
headers: {
  'Authorization': token ? `Bearer ${token}` : ''
}
```

---

## 🎨 4. Frontend Admin - Restaurants Page

### File: `frontend/admin/project/src/pages/admin/Restaurants.jsx`

**Thêm tab "Đã từ chối"**:

1. **Filter**: 
   ```javascript
   const rejectedRestaurants = restaurants.filter(r => r.review_status === 'REJECTED');
   ```

2. **Columns definition**:
   - restaurant_id
   - name
   - owner
   - phone
   - address
   - **reject_reason** (hiển thị màu đỏ)
   - updated_at (ngày từ chối)

3. **Tab button**:
   - Text: "Đã từ chối"
   - Badge màu đỏ với số lượng
   - Active state: border-bottom màu đỏ

4. **Content rendering**:
   - Thay ternary operator thành nested ternaries
   - Handle 3 tabs: pending, approved, rejected
   - Empty state cho rejected tab

---

## ✅ Kết quả

### Backend
- ✅ JWT token format đã đúng
- ✅ GET /api/admin/users hoạt động
- ✅ GET /api/admin/restaurants trả về đúng format
- ✅ PUT approve/reject hoạt động

### Frontend  
- ✅ Token được gửi trong Authorization header
- ✅ Hỗ trợ đọc token từ cả localStorage và sessionStorage
- ✅ Admin Restaurants page có 3 tabs: Chờ duyệt, Đã duyệt, Đã từ chối
- ✅ Hiển thị lý do từ chối trong rejected tab

---

## 🚀 Cách Sử Dụng

### 1. Khởi động Backend
```bash
cd backend
node src/index.js
```

### 2. Khởi động Admin Frontend
```bash
cd frontend/admin/project
npm run dev
```

### 3. Đăng nhập Admin
- URL: http://localhost:5174
- Email: `admin@fastfood.vn`
- Password: `admin1`

### 4. Test Workflow
1. Vào trang "Nhà hàng"
2. Xem tab "Chờ duyệt" - nhà hàng PENDING
3. Xem tab "Đã duyệt" - nhà hàng APPROVED
4. Xem tab "Đã từ chối" - nhà hàng REJECTED (mới thêm)
5. Từ chối một nhà hàng → xem lý do hiển thị trong tab "Đã từ chối"

---

## ⚠️ Lưu ý

### Token Storage
- Admin frontend có thể lưu token ở localStorage HOẶC sessionStorage
- API client tự động check cả 2 vị trí

### Database
- Cột `rejection_reason` trong table `restaurants` lưu lý do từ chối
- Backend trả về cả `reject_reason` và `rejection_reason` (fallback)

### Browser
Sau khi cập nhật backend, nên:
1. Clear localStorage: `localStorage.clear()`
2. Clear sessionStorage: `sessionStorage.clear()`
3. Đăng nhập lại để lấy token mới với format đúng

---

## 📝 Files Đã Thay Đổi

1. ✅ `backend/src/services/adminAuthServices.js` - JWT token format
2. ✅ `backend/src/index.js` - Admin endpoints (users, restaurants, approve, reject)
3. ✅ `frontend/admin/project/src/api/admin.js` - Authorization headers
4. ✅ `frontend/admin/project/src/pages/admin/Restaurants.jsx` - Rejected tab

---

**Tất cả đã hoàn thành! 🎉**
