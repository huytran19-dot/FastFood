-- =====================================================
-- Migration: Add restaurant_id to categories table
-- Description: Convert categories from global to per-restaurant
-- Date: 2025-11-11
-- Database: fastfood (MySQL 8+)
-- =====================================================

USE fastfood;

-- =====================================================
-- STEP 1: Add restaurant_id column to categories table
-- =====================================================
ALTER TABLE categories
ADD COLUMN restaurant_id INT UNSIGNED NULL COMMENT 'ID của nhà hàng sở hữu category này'
AFTER id;

-- =====================================================
-- STEP 2: Set default restaurant_id = 1 for existing categories
-- (Assuming restaurant_id = 1 exists in restaurants table)
-- =====================================================
UPDATE categories
SET restaurant_id = 1
WHERE restaurant_id IS NULL;

-- =====================================================
-- STEP 3: Make restaurant_id NOT NULL after setting defaults
-- =====================================================
ALTER TABLE categories
MODIFY COLUMN restaurant_id INT UNSIGNED NOT NULL COMMENT 'ID của nhà hàng sở hữu category này';

-- =====================================================
-- STEP 4: Drop old unique constraint on name (global)
-- =====================================================
-- Check if index exists before dropping (MySQL doesn't support IF EXISTS in ALTER TABLE)
SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.statistics 
    WHERE table_schema = 'fastfood' 
    AND table_name = 'categories' 
    AND index_name = 'uq_categories_name'
);

SET @drop_index_sql = IF(@index_exists > 0,
    'ALTER TABLE categories DROP INDEX uq_categories_name',
    'SELECT "Index uq_categories_name does not exist, skipping..." AS message'
);

PREPARE stmt FROM @drop_index_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- STEP 5: Add new unique constraint (restaurant_id, name)
-- Each restaurant can have its own categories with unique names
-- =====================================================
ALTER TABLE categories
ADD CONSTRAINT uq_categories_restaurant_name UNIQUE (restaurant_id, name);

-- =====================================================
-- STEP 6: Add foreign key constraint for restaurant_id
-- CASCADE delete: If restaurant is deleted, all its categories are deleted
-- =====================================================
ALTER TABLE categories
ADD CONSTRAINT fk_categories_restaurant
FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- =====================================================
-- STEP 7: Add index for restaurant_id lookup performance
-- =====================================================
ALTER TABLE categories
ADD INDEX idx_categories_restaurant (restaurant_id);

-- =====================================================
-- STEP 8: Add category_id column to menu_items (if not exists)
-- =====================================================
-- Check if column already exists in menu_items model
-- (Based on menu_items.js, category_id already exists, skip this step)

-- =====================================================
-- STEP 9: Add foreign key for menu_items.category_id
-- SET NULL: If category is deleted, menu_item keeps but category_id = NULL
-- =====================================================
ALTER TABLE menu_items
ADD CONSTRAINT fk_menu_items_category
FOREIGN KEY (category_id) REFERENCES categories(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- =====================================================
-- STEP 10: Smart category assignment for existing menu_items
-- Match menu item names to category names using pattern matching
-- =====================================================

-- Create temporary mapping table for category keywords
CREATE TEMPORARY TABLE IF NOT EXISTS temp_category_mapping (
    category_name VARCHAR(100),
    keyword VARCHAR(100)
);

-- Insert common category patterns
INSERT INTO temp_category_mapping (category_name, keyword) VALUES
('Burger', 'burger'),
('Burger', 'hamburger'),
('Pizza', 'pizza'),
('Gà Rán', 'gà'),
('Gà Rán', 'chicken'),
('Cơm', 'cơm'),
('Cơm', 'rice'),
('Mì', 'mì'),
('Mì', 'noodle'),
('Phở', 'phở'),
('Bún', 'bún'),
('Salad', 'salad'),
('Đồ Uống', 'nước'),
('Đồ Uống', 'drink'),
('Đồ Uống', 'juice'),
('Đồ Uống', 'coffee'),
('Đồ Uống', 'tea'),
('Món Tráng Miệng', 'ice cream'),
('Món Tráng Miệng', 'kem'),
('Món Tráng Miệng', 'dessert'),
('Bánh', 'bánh'),
('Snack', 'snack');

-- Update menu_items.category_id based on name pattern matching
-- This uses a subquery to find the best matching category for each menu item
UPDATE menu_items mi
SET category_id = (
    SELECT c.id
    FROM categories c
    WHERE c.restaurant_id = mi.restaurant_id
    AND EXISTS (
        SELECT 1 
        FROM temp_category_mapping tcm
        WHERE tcm.category_name = c.name
        AND LOWER(mi.name) LIKE CONCAT('%', LOWER(tcm.keyword), '%')
    )
    LIMIT 1
)
WHERE category_id IS NULL;

-- Fallback: If no keyword match, try direct name similarity
-- (e.g., "Burger Bò Phô Mai" contains "Burger")
UPDATE menu_items mi
SET category_id = (
    SELECT c.id
    FROM categories c
    WHERE c.restaurant_id = mi.restaurant_id
    AND LOWER(mi.name) LIKE CONCAT('%', LOWER(c.name), '%')
    LIMIT 1
)
WHERE category_id IS NULL;

-- Clean up temporary table
DROP TEMPORARY TABLE IF EXISTS temp_category_mapping;

-- =====================================================
-- VERIFICATION QUERIES (Run manually to check results)
-- =====================================================

-- Check categories with restaurant_id
-- SELECT c.id, c.name, c.restaurant_id, r.name AS restaurant_name
-- FROM categories c
-- JOIN restaurants r ON c.restaurant_id = r.id
-- ORDER BY c.restaurant_id, c.name;

-- Check menu_items with assigned category_id
-- SELECT mi.id, mi.name, mi.category_id, c.name AS category_name, mi.restaurant_id
-- FROM menu_items mi
-- LEFT JOIN categories c ON mi.category_id = c.id
-- WHERE mi.restaurant_id = 1
-- ORDER BY mi.category_id, mi.name;

-- Check menu_items without category (need manual assignment)
-- SELECT mi.id, mi.name, mi.restaurant_id, r.name AS restaurant_name
-- FROM menu_items mi
-- JOIN restaurants r ON mi.restaurant_id = r.id
-- WHERE mi.category_id IS NULL;

-- =====================================================
-- ROLLBACK SCRIPT (If needed)
-- =====================================================
-- Run these commands manually if you need to revert the migration:
-- ALTER TABLE menu_items DROP FOREIGN KEY fk_menu_items_category;
-- ALTER TABLE categories DROP FOREIGN KEY fk_categories_restaurant;
-- ALTER TABLE categories DROP INDEX uq_categories_restaurant_name;
-- ALTER TABLE categories DROP INDEX idx_categories_restaurant;
-- ALTER TABLE categories DROP COLUMN restaurant_id;
-- ALTER TABLE categories ADD CONSTRAINT uq_categories_name UNIQUE (name);
-- UPDATE menu_items SET category_id = NULL;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
