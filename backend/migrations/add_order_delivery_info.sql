-- Add delivery information columns to orders table
ALTER TABLE orders
  ADD COLUMN delivery_phone VARCHAR(20) NULL,
  ADD COLUMN delivery_name VARCHAR(100) NULL,
  ADD COLUMN note TEXT NULL,
  ADD COLUMN delivery_fee DECIMAL(10,2) NULL DEFAULT 15000;

-- Add transaction number to payments table
ALTER TABLE payments
  ADD COLUMN transaction_no VARCHAR(50) NULL;
