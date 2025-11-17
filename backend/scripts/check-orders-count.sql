-- Check orders distribution by restaurant

-- Count total orders
SELECT 'Total Orders' as label, COUNT(*) as count FROM orders;

-- Count orders by restaurant
SELECT 
  restaurant_id,
  COUNT(*) as order_count,
  COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled
FROM orders
GROUP BY restaurant_id
ORDER BY restaurant_id;

-- Show restaurant info
SELECT id, name, owner_id FROM restaurants;

-- Check if restaurant ID 2 has 52 orders
SELECT 
  'Restaurant ID 2' as label,
  COUNT(*) as total_orders
FROM orders 
WHERE restaurant_id = 2;
