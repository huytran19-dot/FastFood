-- Migration: Tạo bảng addresses cho địa chỉ giao hàng của user
-- Date: 2025-11-13
-- Purpose: Quản lý nhiều địa chỉ giao hàng với tọa độ GPS cho drone delivery

USE fastfood;

-- Tạo bảng addresses
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL COMMENT 'ID người dùng',
  `full_name` VARCHAR(100) NOT NULL COMMENT 'Tên người nhận',
  `phone` VARCHAR(20) NOT NULL COMMENT 'Số điện thoại người nhận',
  `address` TEXT NOT NULL COMMENT 'Địa chỉ chi tiết',
  `lat` DECIMAL(9,6) NULL COMMENT 'Vĩ độ (latitude) để drone bay đến',
  `lng` DECIMAL(9,6) NULL COMMENT 'Kinh độ (longitude) để drone bay đến',
  `is_default` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Địa chỉ mặc định (1=yes, 0=no)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_coordinates` (`lat`, `lng`),
  INDEX `idx_default` (`user_id`, `is_default`),
  CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng lưu địa chỉ giao hàng của user';

COMMIT;
