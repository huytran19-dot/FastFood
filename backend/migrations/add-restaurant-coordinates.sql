-- Migration: Thêm tọa độ (latitude, longitude) cho nhà hàng
-- Date: 2025-11-10
-- Purpose: Tích hợp bản đồ OpenStreetMap

USE fastfood;

-- Thêm cột lat và lng vào bảng restaurants
ALTER TABLE restaurants
  ADD COLUMN lat DECIMAL(9,6) NULL COMMENT 'Vĩ độ (latitude) của nhà hàng',
  ADD COLUMN lng DECIMAL(9,6) NULL COMMENT 'Kinh độ (longitude) của nhà hàng';

-- Thêm index cho tìm kiếm theo tọa độ (tối ưu query geo-spatial)
ALTER TABLE restaurants
  ADD INDEX idx_coordinates (lat, lng);

-- Sample data: Tọa độ một số thành phố lớn ở Việt Nam
-- Hà Nội: 21.0285, 105.8542
-- TP.HCM: 10.8231, 106.6297
-- Đà Nẵng: 16.0544, 108.2022
-- Cần Thơ: 10.0452, 105.7469
-- Hải Phòng: 20.8449, 106.6881

COMMIT;
