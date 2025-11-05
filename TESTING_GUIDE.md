# 🏪 Admin Restaurants Page - Hướng dẫn Fix và Test

## Ngày: 2025-11-04

---

## 📊 Tình trạng Database

### Nhà hàng hiện tại trong DB:
```
✅ [1] FastFood - Chủ: Chủ FastFood - Status: APPROVED
✅ [2] Pizza - Chủ: huy trần - Status: APPROVED  
✅ [3] Pizza - Chủ: huy trần - Status: APPROVED
```

**Tổng: 3 nhà hàng, tất cả đã được APPROVED**

---

## 🔧 Những gì đã Fix

### 1. **Error Handling trong fetchData()** ✅

**Vấn đề**: Không có pre-check token và error handling, dẫn đến silent failure

**Giải pháp**:
```javascript
const fetchData = async () => {
  setIsLoading(true);
  try {
    // Pre-check for token
    const token = localStorage.getItem('token') || sessionStorage.getItem('auth');
    if (!token) {
      console.error('⚠️ No token found - redirecting to login');
      showToast('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
      window.location.href = '/login';
      return;
    }

    const [restaurantsData, usersData] = await Promise.all([
      getRestaurants(),
      getUsers()
    ]);
    
    console.log('📊 Fetched restaurants:', restaurantsData);
    console.log('👥 Fetched users:', usersData);
    
    setRestaurants(restaurantsData || []);
    setUsers(usersData || []);
  } catch (error) {
    console.error('❌ Error fetching data:', error);
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      showToast('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
      window.location.href = '/login';
    } else {
      showToast('Lỗi khi tải dữ liệu: ' + error.message, 'error');
    }
  } finally {
    setIsLoading(false);
  }
};
```

### 2. **getOwnerInfo() Function** ✅

**Vấn đề**: Backend trả về `owner` object trong restaurant, nhưng code cũ tìm kiếm trong mảng `users` bằng `owner_id`

**Giải pháp**: Tạo helper function kiểm tra cả 2 trường hợp
```javascript
const getOwnerInfo = (restaurant) => {
  // Backend already includes owner object in restaurant
  if (restaurant.owner) {
    return {
      name: restaurant.owner.full_name || 'N/A',
      email: restaurant.owner.email || 'N/A',
      phone: restaurant.owner.phone || 'N/A'
    };
  }
  
  // Fallback: find in users array
  const owner = users.find(u => u.user_id === restaurant.owner_id);
  return {
    name: owner?.full_name || 'N/A',
    email: owner?.email || 'N/A',
    phone: owner?.phone || 'N/A'
  };
};
```

### 3. **Columns Definition - Hiển thị thông tin chi tiết** ✅

#### Pending Columns:
- ✅ ID nhà hàng
- ✅ Tên nhà hàng
- ✅ Chủ sở hữu (tên + email)
- ✅ SĐT nhà hàng
- ✅ Địa chỉ (address + city)
- ✅ Ngày đăng ký
- ✅ Actions (Duyệt / Từ chối)

#### Approved Columns:
- ✅ ID nhà hàng
- ✅ Tên nhà hàng
- ✅ Chủ sở hữu (tên + email)
- ✅ SĐT nhà hàng
- ✅ Địa chỉ (address + city)
- ✅ **Đánh giá** (rating với ★)
- ✅ Trạng thái (Active/Inactive)
- ✅ Ngày duyệt

#### Rejected Columns:
- ✅ ID nhà hàng
- ✅ Tên nhà hàng
- ✅ Chủ sở hữu (tên + email)
- ✅ SĐT nhà hàng
- ✅ Địa chỉ (address + city)
- ✅ **Lý do từ chối** (màu đỏ)
- ✅ Ngày từ chối

---

## 🧪 Cách Test

### Option 1: Test với HTML file (KHUYẾN NGHỊ)

1. **Mở file test**:
   ```
   frontend/admin/project/test-api.html
   ```
   
2. **Mở trong browser**: 
   - Double-click file hoặc
   - Chuột phải → Open with → Browser

3. **Test flow**:
   - Click "1. Test Login" → Xem token được tạo
   - Click "2. Test Get Users" → Xem danh sách users
   - Click "3. Test Get Restaurants" → Xem bảng nhà hàng đầy đủ

### Option 2: Test với Admin Dashboard

1. **Khởi động Admin Frontend**:
   ```bash
   cd frontend/admin/project
   npm run dev
   ```

2. **Mở browser**: http://localhost:5174

3. **Clear storage và login lại**:
   - F12 → Console:
     ```javascript
     localStorage.clear();
     sessionStorage.clear();
     location.reload();
     ```
   - Login: `admin@fastfood.vn` / `admin1`

4. **Vào trang Nhà hàng**:
   - Click "Nhà hàng" trong sidebar
   - Xem tab "Đã duyệt" → Có 3 nhà hàng
   - Tab "Chờ duyệt" → Empty (vì tất cả đã APPROVED)
   - Tab "Đã từ chối" → Empty (vì chưa có nhà hàng bị reject)

### Option 3: Test bằng PowerShell

```powershell
# 1. Login và lấy token
$token = (Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/login' -Method Post -Body '{"email":"admin@fastfood.vn","password":"admin1"}' -ContentType 'application/json').token

# 2. Get restaurants
$restaurants = Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/restaurants' -Headers @{ Authorization = "Bearer $token" }

# 3. Hiển thị kết quả
$restaurants.restaurants | Format-Table restaurant_id, name, @{L='Owner';E={$_.owner.full_name}}, review_status, rating
```

---

## 📋 Checklist Trước Khi Test

- [x] ✅ Backend đang chạy (port 5000)
- [x] ✅ Database có dữ liệu nhà hàng
- [x] ✅ JWT token format đã được fix (userId, roleId)
- [x] ✅ Admin API endpoints đã có (users, restaurants)
- [x] ✅ Authorization headers đã được thêm vào API client
- [x] ✅ Restaurants page có error handling và logging
- [x] ✅ Columns hiển thị đúng thông tin owner

---

## 🐛 Troubleshooting

### Vấn đề 1: Không thấy nhà hàng nào
**Nguyên nhân**: Token không hợp lệ hoặc không được gửi

**Giải pháp**:
1. Mở DevTools (F12) → Console
2. Xem log: `📊 Fetched restaurants:` và `👥 Fetched users:`
3. Nếu có lỗi 401 → Clear storage và login lại

### Vấn đề 2: Owner hiển thị "N/A"
**Nguyên nhân**: Backend không trả về owner object

**Giải pháp**:
1. Check backend response trong DevTools → Network tab
2. Đảm bảo backend đang dùng code mới (có manually join owner)
3. Restart backend nếu cần

### Vấn đề 3: Tab "Đã duyệt" trống
**Nguyên nhân**: Filter logic không đúng

**Kiểm tra**:
```javascript
// Console
const approvedRestaurants = restaurants.filter(r => r.review_status === 'APPROVED' || r.status === 1);
console.log('Approved:', approvedRestaurants);
```

---

## 📊 Expected Results

### Tab "Chờ duyệt":
```
Không có yêu cầu chờ duyệt
Các nhà hàng mới đăng ký sẽ xuất hiện ở đây để bạn duyệt
```

### Tab "Đã duyệt":
```
| ID | Tên nhà hàng | Chủ sở hữu              | SĐT         | Địa chỉ                    | Đánh giá | Trạng thái | Ngày duyệt  |
|----|--------------|-------------------------|-------------|----------------------------|----------|------------|-------------|
| 1  | FastFood     | Chủ FastFood            | 0911111111  | 123 Trần Hưng Đạo, Hà Nội  | ★ 4.7    | Hoạt động  | 02/11/2025  |
| 2  | Pizza        | huy trần                | 0905046373  | 12, Ngõ 59, Hà Nội         | ★ N/A    | Hoạt động  | 04/11/2025  |
| 3  | Pizza        | huy trần                | 0905046373  | 12, Ngõ 59, Hà Nội         | ★ N/A    | Hoạt động  | 04/11/2025  |
```

### Tab "Đã từ chối":
```
Không có nhà hàng bị từ chối
Các nhà hàng bị từ chối sẽ xuất hiện ở đây
```

---

## 🎯 Next Steps

1. **Test từ chối nhà hàng**:
   - Tạo nhà hàng mới với status PENDING
   - Test nút "Từ chối" với lý do
   - Xem xuất hiện trong tab "Đã từ chối"

2. **Test approve nhà hàng**:
   - Tạo nhà hàng mới với status PENDING
   - Test nút "Duyệt"
   - Xem chuyển sang tab "Đã duyệt"

3. **Test detail modal**:
   - Click vào tên nhà hàng
   - Xem modal hiển thị thông tin đầy đủ

---

**Tất cả đã sẵn sàng để test! 🎉**

Sử dụng file `test-api.html` để test nhanh nhất.
