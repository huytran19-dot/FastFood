-- Migration: Add email verification columns to users table
-- Date: 2025-11-07

ALTER TABLE `users`
ADD COLUMN `email_verified` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Email verification status',
ADD COLUMN `email_verification_token` VARCHAR(255) NULL COMMENT 'Token for email verification',
ADD COLUMN `email_verification_expires_at` DATETIME NULL COMMENT 'Token expiration time',
ADD INDEX `idx_email_verification_token` (`email_verification_token`);

-- Update existing users to have verified email (optional - for existing data)
-- UPDATE `users` SET `email_verified` = 1 WHERE `created_at` < NOW();
