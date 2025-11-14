-- Migration: Add drone_id column to orders table
-- Date: 2025-11-15
-- Description: Thêm cột drone_id vào bảng orders để lưu thông tin drone được gán cho đơn hàng
-- Database: fastfood (MySQL 8+)

USE fastfood;

-- =====================================================
-- STEP 1: Add drone_id column to orders table
-- =====================================================
ALTER TABLE orders
ADD COLUMN drone_id INT UNSIGNED NULL COMMENT 'ID của drone được gán để giao đơn hàng này'
AFTER restaurant_id;

-- =====================================================
-- STEP 2: Add foreign key constraint to drones table
-- =====================================================
ALTER TABLE orders
ADD CONSTRAINT `fk_orders_drone` 
FOREIGN KEY (`drone_id`) 
REFERENCES `drones` (`id`) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- =====================================================
-- STEP 3: Add index for better query performance
-- =====================================================
ALTER TABLE orders
ADD INDEX `idx_orders_drone` (`drone_id`);

COMMIT;

