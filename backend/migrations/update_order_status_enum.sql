-- Migration: Update order status ENUM to include all new statuses
-- Date: 2025-11-15
-- Description: Add WAITING_OTP status and ensure all statuses are: PENDING, CONFIRMED, PREPARING, READY, DELIVERING, WAITING_OTP, COMPLETED, CANCELLED

-- Step 1: Modify the orders table to update the status ENUM
ALTER TABLE `orders` 
MODIFY COLUMN `status` 
ENUM('PENDING','CONFIRMED','PREPARING','READY','DELIVERING','WAITING_OTP','COMPLETED','CANCELLED') 
NOT NULL DEFAULT 'PENDING';

-- Verify the change
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'orders' 
AND COLUMN_NAME = 'status';
