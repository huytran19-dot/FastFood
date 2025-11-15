-- Add OTP fields to orders table for delivery verification
-- Run this migration: mysql -u root -p fastfood < backend/migrations/add_otp_to_orders.sql

USE fastfood;

-- Add delivery_otp column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_otp VARCHAR(10) NULL COMMENT 'OTP code for delivery verification',
ADD COLUMN IF NOT EXISTS delivery_otp_verified TINYINT(1) DEFAULT 0 COMMENT 'Whether OTP has been verified (0=No, 1=Yes)',
ADD COLUMN IF NOT EXISTS delivered_at DATETIME NULL COMMENT 'Timestamp when order was delivered';

-- Add WAITING_OTP status to enum if not exists
ALTER TABLE orders 
MODIFY COLUMN status ENUM('PENDING','CONFIRMED','PREPARING','DELIVERING','WAITING_OTP','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING';

-- Create index for faster OTP lookups
CREATE INDEX IF NOT EXISTS idx_orders_otp ON orders(delivery_otp);

SELECT 'Migration completed: OTP fields added to orders table' AS status;

