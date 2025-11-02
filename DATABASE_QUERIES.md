# 🗄️ Database Query Reference

Quick reference for common database operations during development and testing.

---

## 📊 Viewing Data

### Check All Demo Accounts
```sql
SELECT 
  id,
  name,
  email,
  role,
  restaurant_id,
  created_at
FROM users 
WHERE email IN (
  'admin@fastfood.com',
  'owner@demo.com',
  'owner2@demo.com',
  'owner3@demo.com',
  'user@demo.com'
)
ORDER BY id;
```

### Check All Restaurants with Owners
```sql
SELECT 
  p.id,
  p.name AS restaurant_name,
  p.review_status,
  p.rejection_reason,
  u.name AS owner_name,
  u.email AS owner_email,
  p.created_at,
  p.reviewed_at
FROM products p
LEFT JOIN users u ON p.owner_id = u.id
ORDER BY p.id;
```

### Check Pending Restaurants Only
```sql
SELECT 
  p.id,
  p.name,
  u.name AS owner_name,
  u.email AS owner_email,
  p.created_at
FROM products p
JOIN users u ON p.owner_id = u.id
WHERE p.review_status = 'PENDING'
ORDER BY p.created_at DESC;
```

### Check Restaurant Status Counts
```sql
SELECT 
  review_status,
  COUNT(*) AS count
FROM products
GROUP BY review_status;
```

---

## ✏️ Updating Data

### Manually Approve a Restaurant
```sql
UPDATE products 
SET 
  review_status = 'APPROVED',
  reviewed_at = NOW(),
  reviewed_by = 1  -- admin user ID
WHERE id = 2;  -- restaurant ID
```

### Manually Reject a Restaurant
```sql
UPDATE products 
SET 
  review_status = 'REJECTED',
  rejection_reason = 'Thiếu giấy phép kinh doanh. Vui lòng bổ sung.',
  reviewed_at = NOW(),
  reviewed_by = 1  -- admin user ID
WHERE id = 3;  -- restaurant ID
```

### Reset Restaurant to Pending
```sql
UPDATE products 
SET 
  review_status = 'PENDING',
  rejection_reason = NULL,
  reviewed_at = NULL,
  reviewed_by = NULL
WHERE id = 2;  -- restaurant ID
```

### Update Restaurant Info
```sql
UPDATE products 
SET 
  name = 'New Restaurant Name',
  description = 'Updated description',
  address = 'New address',
  phone = '0901234567'
WHERE id = 2;
```

### Link User to Restaurant
```sql
UPDATE users 
SET restaurant_id = 1 
WHERE id = 2;  -- user ID
```

---

## 🆕 Creating Data

### Create New Owner User
```sql
INSERT INTO users (name, email, phone, password, role, created_at, updated_at)
VALUES (
  'New Owner',
  'newowner@test.com',
  '0901234567',
  '$2b$10$hash_here',  -- use bcrypt to generate
  'owner',
  NOW(),
  NOW()
);
```

### Create New Restaurant (Pending)
```sql
INSERT INTO products (
  name, 
  description, 
  address, 
  city, 
  phone, 
  opening_time, 
  closing_time, 
  owner_id,
  review_status,
  created_at, 
  updated_at
)
VALUES (
  'Test Restaurant',
  'Test description',
  '123 Test Street',
  'Hanoi',
  '0901234567',
  '08:00:00',
  '22:00:00',
  2,  -- owner user ID
  'PENDING',
  NOW(),
  NOW()
);
```

---

## 🗑️ Deleting Data

### Delete a Restaurant (and unlink owner)
```sql
-- First, unlink users
UPDATE users SET restaurant_id = NULL WHERE restaurant_id = 2;

-- Then delete restaurant
DELETE FROM products WHERE id = 2;
```

### Delete a User (if no restaurant)
```sql
DELETE FROM users WHERE id = 5 AND role = 'user';
```

### ⚠️ Reset All Demo Data
```sql
-- WARNING: This deletes ALL demo accounts and restaurants!
DELETE FROM products WHERE owner_id IN (
  SELECT id FROM users WHERE email LIKE '%demo.com'
);

DELETE FROM users WHERE email LIKE '%demo.com' OR email = 'admin@fastfood.com';

-- Then re-run demo-accounts.sql to restore
```

---

## 🔍 Debugging Queries

### Find User by Email
```sql
SELECT * FROM users WHERE email = 'owner@demo.com';
```

### Find Restaurant by Owner Email
```sql
SELECT p.*, u.email AS owner_email
FROM products p
JOIN users u ON p.owner_id = u.id
WHERE u.email = 'owner2@demo.com';
```

### Check User's Restaurant Status
```sql
SELECT 
  u.name AS user_name,
  u.email,
  u.role,
  p.name AS restaurant_name,
  p.review_status,
  p.rejection_reason
FROM users u
LEFT JOIN products p ON u.restaurant_id = p.id
WHERE u.email = 'owner3@demo.com';
```

### Find Restaurants Reviewed by Admin
```sql
SELECT 
  p.name,
  p.review_status,
  a.name AS reviewed_by_admin,
  p.reviewed_at
FROM products p
LEFT JOIN users a ON p.reviewed_by = a.id
WHERE p.reviewed_by IS NOT NULL
ORDER BY p.reviewed_at DESC;
```

### Check Restaurant with All Related Data
```sql
SELECT 
  p.*,
  u.name AS owner_name,
  u.email AS owner_email,
  a.name AS reviewed_by_admin
FROM products p
JOIN users u ON p.owner_id = u.id
LEFT JOIN users a ON p.reviewed_by = a.id
WHERE p.id = 1;
```

---

## 🔐 Password Management

### Generate Password Hash (use Node.js)
```javascript
// In backend/ directory, run:
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('password123', 10));"
```

### Update User Password
```sql
UPDATE users 
SET password = '$2b$10$NEW_HASH_HERE'
WHERE email = 'owner@demo.com';
```

---

## 📈 Reporting Queries

### Count Users by Role
```sql
SELECT 
  role,
  COUNT(*) AS count
FROM users
GROUP BY role;
```

### Restaurants by City
```sql
SELECT 
  city,
  COUNT(*) AS restaurant_count
FROM products
GROUP BY city
ORDER BY restaurant_count DESC;
```

### Average Review Time
```sql
SELECT 
  AVG(TIMESTAMPDIFF(HOUR, created_at, reviewed_at)) AS avg_hours_to_review
FROM products
WHERE reviewed_at IS NOT NULL;
```

### Pending Restaurants Age
```sql
SELECT 
  name,
  created_at,
  TIMESTAMPDIFF(HOUR, created_at, NOW()) AS hours_pending
FROM products
WHERE review_status = 'PENDING'
ORDER BY hours_pending DESC;
```

---

## 🧪 Test Data Queries

### Create Multiple Test Restaurants
```sql
-- Insert 3 test restaurants
INSERT INTO products (name, description, address, city, phone, opening_time, closing_time, owner_id, review_status, created_at, updated_at)
VALUES 
('Test Restaurant 1', 'Test 1', '1 Test St', 'Hanoi', '0901111111', '08:00', '22:00', 2, 'PENDING', NOW(), NOW()),
('Test Restaurant 2', 'Test 2', '2 Test St', 'HCMC', '0902222222', '09:00', '21:00', 3, 'PENDING', NOW(), NOW()),
('Test Restaurant 3', 'Test 3', '3 Test St', 'Danang', '0903333333', '07:00', '23:00', 4, 'PENDING', NOW(), NOW());
```

### Approve All Pending from Specific City
```sql
UPDATE products 
SET 
  review_status = 'APPROVED',
  reviewed_at = NOW(),
  reviewed_by = 1
WHERE review_status = 'PENDING' 
  AND city = 'Hanoi';
```

---

## 🚨 Emergency Fixes

### Unlock Restaurant for Testing (Approve Any)
```sql
UPDATE products 
SET review_status = 'APPROVED' 
WHERE id = 2;
```

### Reset All Restaurants to Pending
```sql
UPDATE products 
SET 
  review_status = 'PENDING',
  rejection_reason = NULL,
  reviewed_at = NULL,
  reviewed_by = NULL;
```

### Fix Orphaned Restaurants (No Owner)
```sql
-- Find restaurants without owners
SELECT * FROM products WHERE owner_id NOT IN (SELECT id FROM users);

-- Delete orphaned restaurants
DELETE FROM products WHERE owner_id NOT IN (SELECT id FROM users);
```

### Fix Orphaned Restaurant Links in Users
```sql
-- Find users linked to non-existent restaurants
SELECT * FROM users WHERE restaurant_id NOT IN (SELECT id FROM products);

-- Fix by setting to NULL
UPDATE users 
SET restaurant_id = NULL 
WHERE restaurant_id NOT IN (SELECT id FROM products);
```

---

## 📋 Schema Reference

### Users Table Structure
```sql
DESCRIBE users;
-- Columns: id, name, email, phone, password, role, restaurant_id, created_at, updated_at
```

### Products (Restaurants) Table Structure
```sql
DESCRIBE products;
-- Columns: id, name, description, image_url, address, city, phone, 
-- opening_time, closing_time, owner_id, review_status, rejection_reason, 
-- reviewed_at, reviewed_by, created_at, updated_at
```

### Valid Enum Values
```sql
-- users.role:
'user', 'owner', 'admin'

-- products.review_status:
'PENDING', 'APPROVED', 'REJECTED'
```

---

## 💡 Tips

1. **Always use transactions** for multi-table updates:
```sql
START TRANSACTION;
UPDATE users SET restaurant_id = 1 WHERE id = 2;
UPDATE products SET owner_id = 2 WHERE id = 1;
COMMIT;
```

2. **Backup before bulk deletes**:
```bash
mysqldump -u root -p food > backup_$(date +%Y%m%d_%H%M%S).sql
```

3. **Check foreign keys** before deleting:
```sql
SELECT TABLE_NAME, CONSTRAINT_NAME 
FROM information_schema.KEY_COLUMN_USAGE 
WHERE REFERENCED_TABLE_NAME = 'products';
```

4. **Use EXPLAIN** for slow queries:
```sql
EXPLAIN SELECT * FROM products WHERE review_status = 'PENDING';
```

---

**Happy Querying! 🚀**
